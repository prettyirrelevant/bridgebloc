// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";

import "./libraries/PolygonBridgeLib.sol";
import "./interfaces/WETH.sol";

contract RollupETHBridge is PolygonBridgeLib, Ownable {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;


    struct SupportedDestinationToken {
        address sourceAddr;
        address destinationAddr;
        uint24 swapFee;
        uint256 claimFeePercentage;
        uint256 maxClaimFeeAmount;
    }

    ISwapRouter public immutable swapRouter;
    IWETH public immutable WETH;
    uint256 public BASIS_POINT=10000;

    mapping(address=> SupportedDestinationToken) public supportedDestinationTokens;

    event BridgeAsset(
        uint32 destinationNetwork,
        uint256 amount,
        address indexed recipient,
        address indexed sourceToken,
        address indexed destinationToken
    );

    /**
     * @param _polygonZkEVMBridge Polygon zkevm bridge address
     * @param _counterpartNetwork Couterpart network
     * @param swapRouterAddr Address of the v3 router used for swap
     * @param wethAddr Couterpart network
     */
    constructor(
        SupportedDestinationToken[] memory _supportedTokens,
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
         for (uint256 i = 0; i < _supportedTokens.length; i++) {
            require(_supportedTokens[i].claimFeePercentage < BASIS_POINT,'Invalid token deposited');
            supportedDestinationTokens[_supportedTokens[i].destinationAddr] = _supportedTokens[i];
        }
        swapRouter = ISwapRouter(swapRouterAddr);
        WETH = IWETH(wethAddr);
    }


    function withdraw(address token,uint256 amount,address recipient)public onlyOwner{
        if(token==address(0)){
          (bool sent, ) =  payable(recipient).call{value: amount}("");
          require(sent, "Failed to send Ether");
        }else{
            IERC20(token).safeTransfer(recipient,amount);
        }
    }

    function addToken(address destinationToken,SupportedDestinationToken memory tokenData )external onlyOwner returns(bool) {
        require(tokenData.claimFeePercentage < BASIS_POINT,'Invalid claimFee');
        SupportedDestinationToken storage newToken = supportedDestinationTokens[destinationToken];
        newToken.sourceAddr=tokenData.sourceAddr;
        newToken.destinationAddr=tokenData.destinationAddr;
        newToken.claimFeePercentage=tokenData.claimFeePercentage;
        newToken.maxClaimFeeAmount=tokenData.maxClaimFeeAmount;
        newToken.swapFee=tokenData.swapFee;
        return true;
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
        uint256 claimFeePercentage,
        uint256 maxClaimFeeAmount,
        bool forceUpdateGlobalExitRoot
    ) internal {
        if( token == address(0)){
            require( msg.value == amount , "msg value not equal to amount" );
        }else{
            //transfer from sender to this contract and 
            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
            _beforeBridging(token, amount);  
        }
        uint256 fee= amount.mul(claimFeePercentage).div(BASIS_POINT);
        if(fee>maxClaimFeeAmount){
            fee=maxClaimFeeAmount;
        }
       _bridgeAsset(destinationAddress, amount.sub(fee), token, forceUpdateGlobalExitRoot, bytes(""));
    }

    //approve bridge to spend for this contract
    function _beforeBridging(address token,uint256 amount) internal{
       IERC20(token).approve(address(polygonZkEVMBridge), amount);
    }


       /**
     * @notice Send a message to the bridge that contains the destination address and the token amount
     * The parent contract should implement the receive token protocol and afterwards call this function
     * @param amount Token amount
     * @param sourceToken Token address of token sent on this network, 0 address is reserved for ether 
     * @param destinationToken Token address of token to be received  on destination network, 0 address is reserved for ether
     * @param recipient Address destination that will receive the tokens on the other network
     * @param forceUpdateGlobalExitRoot Indicates if the global exit root is updated or not
     */
    function bridge(uint256 amount,address sourceToken,address destinationToken,address recipient,bool forceUpdateGlobalExitRoot) public payable{
        if(destinationToken!=address(0)){
            require(supportedDestinationTokens[destinationToken].claimFeePercentage>uint256(0),"Destination Token not supported");  
        }   
        SupportedDestinationToken memory supportedDestinationToken=supportedDestinationTokens[destinationToken];
        if(sourceToken==supportedDestinationToken.sourceAddr){
            bridgeToken(recipient, amount, sourceToken, supportedDestinationToken.claimFeePercentage,supportedDestinationToken.maxClaimFeeAmount, forceUpdateGlobalExitRoot);
        }else{
            swapAndBridge(sourceToken, supportedDestinationToken.sourceAddr, recipient, amount, supportedDestinationToken.swapFee,supportedDestinationToken.claimFeePercentage,supportedDestinationToken.maxClaimFeeAmount, forceUpdateGlobalExitRoot);
        }
       emit BridgeAsset(counterpartNetwork, amount, recipient, sourceToken, destinationToken);
    }


   /**
     * @notice Swaps then bridges the token to the destination chain
     * The parent contract should implement the receive token protocol and afterwards call this function
     * @param _tokenIn Token address of token sent, 0 address is reserved for ether on current network
     * @param _tokenOut Token address of token sent, 0 address is reserved for ether on current network
     * @param destinationAddress Address destination that will receive the tokens on the other network
     * @param amount Token amount
     * @param forceUpdateGlobalExitRoot Indicates if the global exit root is updated or not
     */
    function swapAndBridge(address _tokenIn, address _tokenOut, address destinationAddress, uint256 amount,uint24 _fee, uint256 claimFeePercentage,
        uint256 maxClaimFeeAmount,bool forceUpdateGlobalExitRoot)internal  {
        require(_tokenIn != _tokenOut,"input and output tokens are equal.");
        address swapInputToken = _tokenIn;
        address swapOutputToken = _tokenOut;
        if(_tokenIn == address(0)){
            require(msg.value == amount,"msg value not equal to amount");
            WETH.deposit{ value : amount }();
            swapInputToken = address(WETH);
        }else{
            IERC20(_tokenIn).safeTransferFrom(msg.sender, address(this), amount);
        }
        if(_tokenOut == address(0)){
            swapOutputToken=address(WETH);
        }
        uint256 amountOut = performSwap(swapInputToken, swapOutputToken, address(this), amount, _fee);
        if(_tokenOut == address(0)){
            WETH.withdraw(amountOut);
        }else{
            _beforeBridging(_tokenOut, amount);
        }
        uint256 fee= amount.mul(claimFeePercentage).div(BASIS_POINT);
        if(fee>maxClaimFeeAmount){
            fee=maxClaimFeeAmount;
        }
        _bridgeAsset(destinationAddress, amountOut.sub(fee), _tokenOut, forceUpdateGlobalExitRoot, bytes(""));
    }



    function performSwap(address _tokenIn, address _tokenOut, address _recipient, uint256 amount,uint24 _fee) internal returns (uint256 amountOut) {
            // Approve UNISWAP Router to spend token
            IERC20(_tokenIn).safeApprove(address(swapRouter), amount);
            // Swap The token for USDC
            ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
                tokenIn: _tokenIn,
                tokenOut: _tokenOut,
                fee:_fee,
                recipient: _recipient,
                deadline: block.timestamp,
                amountIn: amount,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            });
            amountOut = swapRouter.exactInputSingle(params);
    }

    receive() external payable{}

    fallback() external payable{}

}