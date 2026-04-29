// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MnemoRegistry {
    struct Agent {
        address owner;
        string vaultManifestHash;
        uint64 registeredAt;
        uint64 manifestUpdatedAt;
        bool exists;
    }

    struct AccessGrant {
        bool exists;
        string[] allowedPolicyTypes;
        uint64 grantedAt;
        uint64 expiresAt;
        uint256 nonce;
    }

    mapping(address => Agent) public agents;
    mapping(address => mapping(address => AccessGrant)) public grants;
    address public protocolOwner;
    uint16 public protocolFeeBps = 0;
    uint16 public constant MAX_FEE_BPS = 500;

    event AgentRegistered(
        address indexed owner,
        string vaultManifestHash,
        uint64 timestamp
    );

    event VaultManifestUpdated(
        address indexed owner,
        string oldHash,
        string newHash,
        uint64 timestamp
    );

    event AccessGranted(
        address indexed user,
        address indexed app,
        string[] policyTypes,
        uint64 expiresAt,
        uint256 nonce
    );

    event AccessRevoked(
        address indexed user,
        address indexed app,
        uint256 nonce
    );

    event RecallLogged(
        address indexed user,
        address indexed app,
        string policyType,
        bytes32 queryHash,
        uint256 paymentToUser,
        uint256 paymentToProtocol,
        uint64 timestamp
    );

    event ProtocolFeeUpdated(uint16 oldBps, uint16 newBps);
    event ProtocolOwnershipTransferred(address indexed from, address indexed to);


    error AgentAlreadyExists();
    error AgentDoesNotExist();
    error EmptyManifestHash();
    error EmptyPolicyTypes();
    error AccessNotGranted();
    error AccessExpired();
    error PolicyTypeNotAllowed();
    error TransferFailed();
    error FeeTooHigh();
    error NotProtocolOwner();
    error ZeroAddress();

    modifier onlyProtocolOwner() {
        if (msg.sender != protocolOwner) revert NotProtocolOwner();
        _;
    }

    modifier onlyRegistered(address user) {
        if (!agents[user].exists) revert AgentDoesNotExist();
        _;
    }


    constructor() {
        protocolOwner = msg.sender;
        emit ProtocolOwnershipTransferred(address(0), msg.sender);
    }


    /// @notice Register a new agent identity for the caller.
    /// @param vaultManifestHash The 0G Storage hash of the (initially empty) vault manifest JSON.
    function registerAgent(string calldata vaultManifestHash) external {
        if (agents[msg.sender].exists) revert AgentAlreadyExists();
        if (bytes(vaultManifestHash).length == 0) revert EmptyManifestHash();

        uint64 nowTs = uint64(block.timestamp);

        agents[msg.sender] = Agent({
            owner: msg.sender,
            vaultManifestHash: vaultManifestHash,
            registeredAt: nowTs,
            manifestUpdatedAt: nowTs,
            exists: true
        });

        emit AgentRegistered(msg.sender, vaultManifestHash, nowTs);
    }

    /// @notice Update the manifest pointer when the vault contents change.
    /// @param newHash The 0G Storage hash of the new manifest JSON.
    function updateVaultManifest(
        string calldata newHash
    ) external onlyRegistered(msg.sender) {
        if (bytes(newHash).length == 0) revert EmptyManifestHash();

        Agent storage agent = agents[msg.sender];
        string memory oldHash = agent.vaultManifestHash;
        uint64 nowTs = uint64(block.timestamp);

        agent.vaultManifestHash = newHash;
        agent.manifestUpdatedAt = nowTs;

        emit VaultManifestUpdated(msg.sender, oldHash, newHash, nowTs);
    }

    /// @notice Returns the caller's (or any address's) full agent record.
    function getAgent(address owner) external view returns (Agent memory) {
        return agents[owner];
    }


    /// @notice Grant an app permission to read specific policy types from caller's vault.
    /// @param app          The address of the app (its signer/EOA).
    /// @param policyTypes  Array of policy type strings the app may read (e.g. ["saved_recipients"]).
    /// @param expiresAt    Unix timestamp when access expires; 0 means no expiry.
    /// @dev   Re-granting overwrites the previous grant entirely; nonce increments for event history.
    function grantAccess(
        address app,
        string[] calldata policyTypes,
        uint64 expiresAt
    ) external onlyRegistered(msg.sender) {
        if (app == address(0)) revert ZeroAddress();
        if (policyTypes.length == 0) revert EmptyPolicyTypes();

        AccessGrant storage existing = grants[msg.sender][app];
        uint256 newNonce = existing.nonce + 1;

        delete existing.allowedPolicyTypes;
        for (uint256 i = 0; i < policyTypes.length; i++) {
            existing.allowedPolicyTypes.push(policyTypes[i]);
        }

        existing.exists = true;
        existing.grantedAt = uint64(block.timestamp);
        existing.expiresAt = expiresAt;
        existing.nonce = newNonce;

        emit AccessGranted(msg.sender, app, policyTypes, expiresAt, newNonce);
    }

    /// @notice Revoke an app's access entirely.
    function revokeAccess(address app) external onlyRegistered(msg.sender) {
        AccessGrant storage existing = grants[msg.sender][app];
        if (!existing.exists) revert AccessNotGranted();

        uint256 currentNonce = existing.nonce;
        delete grants[msg.sender][app];

        emit AccessRevoked(msg.sender, app, currentNonce);
    }

    /// @notice Check whether an app currently has access to a given policy type for a user.
    /// @dev    Used by both the contract (in logRecall) and external callers to verify access.
    function hasAccess(
        address user,
        address app,
        string calldata policyType
    ) public view returns (bool) {
        AccessGrant storage g = grants[user][app];
        if (!g.exists) return false;
        if (g.expiresAt != 0 && block.timestamp > g.expiresAt) return false;

        for (uint256 i = 0; i < g.allowedPolicyTypes.length; i++) {
            if (
                keccak256(bytes(g.allowedPolicyTypes[i])) ==
                keccak256(bytes(policyType))
            ) {
                return true;
            }
        }
        return false;
    }

    /// @notice Returns all policy types an app is allowed to read for a user.
    function getAllowedPolicyTypes(
        address user,
        address app
    ) external view returns (string[] memory) {
        return grants[user][app].allowedPolicyTypes;
    }


    /// @notice Log a recall event when an app reads a user's policy. Optionally pays the user.
    /// @param user        The vault owner being read.
    /// @param policyType  The policy type being recalled (must be in the app's allowed list).
    /// @param queryHash   keccak256 fingerprint of the query (privacy-preserving).
    /// @dev   App pays msg.value; user receives the remainder after protocolFeeBps is deducted.
    function logRecall(
        address user,
        string calldata policyType,
        bytes32 queryHash
    ) external payable {
        if (!agents[user].exists) revert AgentDoesNotExist();

        AccessGrant storage g = grants[user][msg.sender];
        if (!g.exists) revert AccessNotGranted();
        if (g.expiresAt != 0 && block.timestamp > g.expiresAt)
            revert AccessExpired();

        bool allowed = false;
        bytes32 policyHash = keccak256(bytes(policyType));
        for (uint256 i = 0; i < g.allowedPolicyTypes.length; i++) {
            if (keccak256(bytes(g.allowedPolicyTypes[i])) == policyHash) {
                allowed = true;
                break;
            }
        }
        if (!allowed) revert PolicyTypeNotAllowed();

        uint256 toProtocol;
        uint256 toUser;
        if (msg.value > 0) {
            toProtocol = (msg.value * protocolFeeBps) / 10_000;
            toUser = msg.value - toProtocol;

            if (toUser > 0) {
                (bool sentUser, ) = payable(user).call{value: toUser}("");
                if (!sentUser) revert TransferFailed();
            }
            if (toProtocol > 0) {
                (bool sentProto, ) = payable(protocolOwner).call{
                    value: toProtocol
                }("");
                if (!sentProto) revert TransferFailed();
            }
        }

        emit RecallLogged(
            user,
            msg.sender,
            policyType,
            queryHash,
            toUser,
            toProtocol,
            uint64(block.timestamp)
        );
    }


    function setProtocolFee(uint16 newBps) external onlyProtocolOwner {
        if (newBps > MAX_FEE_BPS) revert FeeTooHigh();
        uint16 old = protocolFeeBps;
        protocolFeeBps = newBps;
        emit ProtocolFeeUpdated(old, newBps);
    }

    function transferProtocolOwnership(
        address newOwner
    ) external onlyProtocolOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        address old = protocolOwner;
        protocolOwner = newOwner;
        emit ProtocolOwnershipTransferred(old, newOwner);
    }
}
