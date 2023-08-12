// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";

import "./interfaces/IMessageTransmitter.sol";
import "./interfaces/ITokenMessenger.sol";
import "./libraries/BridgeHelper.sol";

contract CrossChainBridge {

    uint32 public immutable CCTP_DOMAIN;

    ISwapRouter public immutable swapRouter;
    IERC20 public immutable usdcToken;
    ITokenMessenger public immutable tokenMessenger;
    IMessageTransmitter public immutable messageTransmitter;

    mapping(address => bool) public isSupportedToken;
    mapping(address => uint256) public tokenFee;
    mapping(address => bool) public bridgeAdmins;

    event BridgeDepositReceived(uint32 sourceChain, uint32 destinationChain, uint64 nonce, uint256 amount, address indexed from, address indexed recipient, address destinationToken);
    event Withdrawal(address indexed recipient, uint64 nonce, uint256 amount, address token);

    constructor(address[] memory supportedTokens, address swapRouterAddr, address usdcTokenAddr, address tokenMessengerAddr, address messageTransmitterAddr, uint32 domain) {
        for (uint256 i = 0; i < supportedTokens.length; i++) {
            isSupportedToken[supportedTokens[i]] = true;
        }

        swapRouter = ISwapRouter(swapRouterAddr);
        usdcToken = IERC20(usdcTokenAddr);
        tokenMessenger = ITokenMessenger(tokenMessengerAddr);
        messageTransmitter = IMessageTransmitter(messageTransmitterAddr);
        CCTP_DOMAIN = domain;
        bridgeAdmins[msg.sender] = true;
    }

    modifier onlyAdmin(){
        require(bridgeAdmins[msg.sender], "Not Permitted");
        _;
    }

    function performSwap(address _tokenIn, address _tokenOut, address _recipient, uint256 amount) internal returns (uint256 amountOut) {
        // Approve UNISWAP Router to spend token
        TransferHelper.safeApprove(_tokenIn, address(swapRouter), amount);
        // Swap The token for USDC
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
            tokenIn: _tokenIn,
            tokenOut: _tokenOut,
            fee: tokenFee[token],
            recipient: _recipient,
            deadline: block.timestamp,
            amountIn: amount,
            amountOutMinimum: 0,
            sqrtPriceLimitX96: 0
        });
        amountOut = swapRouter.exactInputSingle(params);
    }
    
    function deposit(uint256 amount, address token, uint32 destinationDomain, address recipient, address destinationToken, address recipientAddress) public returns (uint64) {
        require(isSupportedToken[token], "Token not supported");
        // Transfer the token from the caller to the bridge contract
        TransferHelper.safeTransferFrom(token, msg.sender, address(this), amount);
        uint256 amountOut = amount;

        address usdcAddress = address(usdcToken);
        if (token != usdcAddress) {
            amountOut = performSwap(token, usdcAddress, address(this), amount);
        }

        // Approve Token Messenger to Spend the swapped amount
        TransferHelper.safeApprove(address(usdcToken), address(tokenMessenger), amountOut);
        // Move the USDC To CCTP Contract
        uint64 nonce = tokenMessenger.depositForBurn(amountOut, destinationDomain, BridgeUtil.addressToBytes32(recipientAddress), address(usdcToken));
        emit BridgeDepositReceived(CCTP_DOMAIN, destinationDomain, nonce, amountOut, msg.sender, recipient, destinationToken);
        return nonce;
    }

    function addToken(address token,uint256 fee) public onlyAdmin {
        isSupportedToken[token] = true;
        tokenFee[token] = fee;
    }

    function addAdmin(address _admin) public onlyAdmin {
        bridgeAdmins[_admin] = true;
    }

    function sendToRecipient(bytes calldata message, bytes calldata signature, uint64 nonce, uint256 amount, address destinationToken, address recipientAddress) public onlyAdmin {
        require(messageTransmitter.receiveMessage(message, signature), "Receive Message Failed");
        uint256 amountOut = amount;
        if (destinationToken != address(usdcToken)) {
            amountOut = performSwap(address(usdcToken), destinationToken, recipientAddress, amount);
        } else {
            usdcToken.transfer(recipientAddress, amountOut);
        }
        emit BridgeWithdrawalMade(recipientAddress, nonce, amountOut, destinationToken);
    }
}