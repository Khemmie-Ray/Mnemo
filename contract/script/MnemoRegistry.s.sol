// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Script} from "forge-std/Script.sol";
import {MnemoRegistry} from "../src/MnemoRegistry.sol";

contract MnemoRegistryScript is Script {
    MnemoRegistry public mnemoregistry;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        mnemoregistry = new MnemoRegistry();

        vm.stopBroadcast();
    }
}
