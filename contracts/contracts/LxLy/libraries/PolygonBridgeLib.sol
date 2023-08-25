// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.17;

import "../polygonZKEVMContracts/interfaces/IBasePolygonZkEVMGlobalExitRoot.sol";
import "../polygonZKEVMContracts/interfaces/IBridgeMessageReceiver.sol";
import "../polygonZKEVMContracts/interfaces/IPolygonZkEVMBridge.sol";

/**
 * This contract contains the logic to use the message layer of the bridge to send and receive messages
 * to a counterpart contract deployed on another network.
 * Is needed to deploy 1 contract on each layer that inherits this library.
 */
abstract contract PolygonBridgeLib {
    // Zk-EVM Bridge address
    IPolygonZkEVMBridge public immutable polygonZkEVMBridge;

    // Counterpart network
    uint32 public immutable counterpartNetwork;

    /**
     * @param _polygonZkEVMBridge Polygon zkevm bridge address
     * @param _counterpartNetwork Couterpart network
     */
    constructor(
        IPolygonZkEVMBridge _polygonZkEVMBridge,
        uint32 _counterpartNetwork
    ) {
        polygonZkEVMBridge = _polygonZkEVMBridge;
        counterpartNetwork = _counterpartNetwork;
    }

    /**
     * @notice Bridge an asset via the bridge
     * @param destinationAddress Address destination
     * @param amount Amount of tokens
     * @param token Token address, 0 address is reserved for ether
     * @param forceUpdateGlobalExitRoot Indicates if the new global exit root is updated or not
     * @param permitData Raw data of the call `permit` of the token
     */
    function _bridgeAsset(
        address destinationAddress,
        uint256 amount,
        address token,
        bool forceUpdateGlobalExitRoot,
        bytes memory permitData
    ) internal virtual {
        if(token==address(0)){
            polygonZkEVMBridge.bridgeAsset{ value: amount }(
            counterpartNetwork, 
            destinationAddress, 
            amount, 
            token, 
            forceUpdateGlobalExitRoot, 
            permitData);
        }else{
            polygonZkEVMBridge.bridgeAsset(
            counterpartNetwork, 
            destinationAddress, 
            amount, 
            token, 
            forceUpdateGlobalExitRoot, 
            permitData);
        }
 
    }

}
