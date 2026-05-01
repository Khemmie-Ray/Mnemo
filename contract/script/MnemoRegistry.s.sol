// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Script} from "forge-std/Script.sol";
import {MnemoRegistry} from "../src/MnemoRegistry.sol";
import {MockUSDC} from "../src/MockUSDC.sol";

contract MnemoRegistryScript is Script {
    MnemoRegistry public mnemoregistry;
    MockUSDC public usdc;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        usdc = new MockUSDC();

        mnemoregistry = new MnemoRegistry();

        vm.stopBroadcast();
    }
}
