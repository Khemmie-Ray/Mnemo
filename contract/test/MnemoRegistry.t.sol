// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {MnemoRegistry} from "../src/MnemoRegistry.sol";

contract MnemoRegistryTest is Test {
    MnemoRegistry public registry;
    
    address public owner = address(1);
    address public user = address(2);
    address public app = address(3);
    
    string constant INITIAL_HASH = "bafybeicg7...vault1";
    string constant UPDATED_HASH = "bafybeidk2...vault2";

    function setUp() public {
        vm.prank(owner);
        registry = new MnemoRegistry();
    }

    // --- Agent Registration Tests ---

    function test_RegisterAgent() public {
        vm.prank(user);
        
        vm.expectEmit(true, false, false, true);
        emit MnemoRegistry.AgentRegistered(user, INITIAL_HASH, uint64(block.timestamp));
        
        registry.registerAgent(INITIAL_HASH);

        MnemoRegistry.Agent memory agent = registry.getAgent(user);
        assertEq(agent.owner, user);
        assertEq(agent.vaultManifestHash, INITIAL_HASH);
        assertTrue(agent.exists);
    }

    function test_RevertIf_RegisterTwice() public {
        vm.startPrank(user);
        registry.registerAgent(INITIAL_HASH);
        
        vm.expectRevert(MnemoRegistry.AgentAlreadyExists.selector);
        registry.registerAgent(INITIAL_HASH);
        vm.stopPrank();
    }

    // --- Access Control & Permissions ---

    function test_GrantAndCheckAccess() public {
        vm.startPrank(user);
        registry.registerAgent(INITIAL_HASH);

        string[] memory policies = new string[](2);
        policies[0] = "poetry_index";
        policies[1] = "marginalia_notes";

        registry.grantAccess(app, policies, uint64(block.timestamp + 1 days));
        vm.stopPrank();

        assertTrue(registry.hasAccess(user, app, "poetry_index"));
        assertTrue(registry.hasAccess(user, app, "marginalia_notes"));
        assertFalse(registry.hasAccess(user, app, "prose_index"));
    }

    // --- Financial Logic: logRecall ---

    function test_LogRecallWithPayments() public {
        // 1. Setup Agent and Grant Access
        vm.prank(user);
        registry.registerAgent(INITIAL_HASH);
        
        vm.startPrank(user);
        string[] memory policies = new string[](1);
        policies[0] = "lost_manuscripts";
        registry.grantAccess(app, policies, 0); // No expiry
        vm.stopPrank();

        // 2. Set Protocol Fee (5%)
        vm.prank(owner);
        registry.setProtocolFee(500); // 500 BPS = 5%

        // 3. App logs recall and pays 1 ETH
        uint256 payment = 1 ether;
        vm.deal(app, payment);
        
        uint256 userBalanceBefore = user.balance;
        uint256 ownerBalanceBefore = owner.balance;

        vm.prank(app);
        registry.logRecall{value: payment}(user, "lost_manuscripts", keccak256("query1"));

        // 4. Verify distribution (95% to User, 5% to Protocol Owner)
        assertEq(user.balance, userBalanceBefore + 0.95 ether);
        assertEq(owner.balance, ownerBalanceBefore + 0.05 ether);
    }

    function test_RevertIf_AccessExpired() public {
        vm.prank(user);
        registry.registerAgent(INITIAL_HASH);

        vm.startPrank(user);
        string[] memory policies = new string[](1);
        policies[0] = "expiring_text";
        registry.grantAccess(app, policies, uint64(block.timestamp + 100));
        vm.stopPrank();

        skip(101);

        vm.prank(app);
        vm.expectRevert(MnemoRegistry.AccessExpired.selector);
        registry.logRecall(user, "expiring_text", keccak256("query1"));
    }
}