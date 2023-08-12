// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";

import "./libraries/PolygonBridgeLib.sol";
import "./interfaces/WETH.sol";

contract RollupBridge is PolygonBridgeLib {
    using SafeERC20 for IERC20;
      /**
     * @param _polygonZkEVMBridge Polygon zkevm bridge address
     * @param _counterpartNetwork Couterpart network
     */

    ISwapRouter public immutable swapRouter;
    IWETH public immutable WETH;
    constructor(
        IPolygonZkEVMBridge _polygonZkEVMBridge,
        uint32 _counterpartNetwork,
        address swapRouterAddr,
        address wethAddr
    )
         PolygonBridgeLib(
            _polygonZkEVMBridge,
            _counterpartNetwork
        )
    {
        swapRouter = ISwapRouter(swapRouterAddr);
        WETH = IWETH(wethAddr);
    }



   /**
     * @notice Send a message to the bridge that contains the destination address and the token amount
     * The parent contract should implement the receive token protocol and afterwards call this function
     * @param destinationAddress Address destination that will receive the tokens on the other network
     * @param amount Token amount
     * @param token Token address of token sent, 0 address is reserved for ether
     * @param forceUpdateGlobalExitRoot Indicates if the global exit root is updated or not
     */
    function bridgeToken(
        address destinationAddress,
        uint256 amount,
        address token,
        bool forceUpdateGlobalExitRoot
    ) external payable {
        if( _tokenOut == address(0)){
            require( msg.value == amount , "msg value not equal to amount" );
        }else{
            //transfer from sender to this contract and 
            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
            _beforeBridging(token, amount);  
        }
       _bridgeAsset(destinationAddress, amount, token, forceUpdateGlobalExitRoot, bytes(""));
    }


    //approve bridge to spend for this contract
    function _beforeBridging(address token,uint256 amount) internal{
       IERC20(token).approve(address(polygonZkEVMBridge), amount);
    }



   /**
     * @notice Swaps then bridges the token to the destination chain
     * The parent contract should implement the receive token protocol and afterwards call this function
     * @param _tokenIn Token address of token sent, 0 address is reserved for ether
     * @param _tokenOut Token address of token sent, 0 address is reserved for ether
     * @param destinationAddress Address destination that will receive the tokens on the other network
     * @param amount Token amount
     * @param forceUpdateGlobalExitRoot Indicates if the global exit root is updated or not
     */
    function swapAndBridge(address _tokenIn, address _tokenOut, address destinationAddress, uint256 amount,uint256 _fee, bool forceUpdateGlobalExitRoot)external payable {
        require(_tokenIn != _tokenOut,"input and output tokens are equal.");
        address swapInputToken = _tokenIn;
        address swapOutputToken = _tokenOut;
        if(_tokenIn == address(0)){
            require(msg.value == amount,"msg value not equal to amount");
            WETH.deposit{ value : amount }();
            swapInputToken = address(WETH);
        }
        if(_tokenOut == address(0)){
            swapOutputToken=address(WETH);
        }
        uint256 amountOut = performSwap(swapInputToken, swapOutputToken, address(this), amount, _fee);
        if(_tokenOut == address(0)){
            WETH.withdraw(amountOut);
        }else{
            _beforeBridging(token, amount);
        }
        _bridgeAsset(destinationAddress, amountOut, _tokenOut, forceUpdateGlobalExitRoot, bytes(""));
    }



    function performSwap(address _tokenIn, address _tokenOut, address _recipient, uint256 amount,uint256 _fee) internal returns (uint256 amountOut) {
            // Approve UNISWAP Router to spend token
            IERC20(_tokenIn).safeTransferFrom(msg.sender, address(this), amount);
            IERC20(_tokenIn).safeApprove(address(swapRouter), amount);
            // Swap The token for USDC
            ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
                tokenIn: _tokenIn,
                tokenOut: _tokenOut,
                fee: _fee,
                recipient: _recipient,
                deadline: block.timestamp,
                amountIn: amount,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            });
            amountOut = swapRouter.exactInputSingle(params);
    }

}