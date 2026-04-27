// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @title MnemoRegistry
/// @notice On-chain registry of agent identities and access grants for the Mnemo memory layer.
contract MnemoRegistry {
    struct Agent {
        address owner;
        string vaultManifestHash;
        uint64 registeredAt;
        bool exists;
    }

    mapping(address => Agent) public agents;

    event AgentRegistered(
        address indexed owner,
        string vaultManifestHash,
        uint64 timestamp
    );

    event VaultManifestUpdated(
        address indexed owner,
        string oldHash,
        string newHash
    );

    /// @notice Register a new agent identity for the caller.
    /// @param _vaultManifestHash The 0G Storage hash of the user's vault manifest JSON.

    function registerAgent(string calldata _vaultManifestHash) external {
        require(!agents[msg.sender].exists, "Agent already registered");
        require(bytes(_vaultManifestHash).length > 0, "Manifest hash required");

        agents[msg.sender] = Agent({
            owner: msg.sender,
            vaultManifestHash: _vaultManifestHash,
            registeredAt: uint64(block.timestamp),
            exists: true
        });

        emit AgentRegistered(msg.sender, _vaultManifestHash, uint64(block.timestamp));
    }
}