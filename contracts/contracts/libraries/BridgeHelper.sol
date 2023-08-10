// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

library BridgeUtil {
    function addressToBytes32(address addr) public pure returns (bytes32) {
        return bytes32(uint256(uint160(addr)));
    }
    function bytes32ToAddress(bytes32 _buf) public pure returns (address) {
        return address(uint160(uint256(_buf)));
    }
}