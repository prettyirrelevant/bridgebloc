// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";

import "./interfaces/IMessageTransmitter.sol";
import "./interfaces/ITokenMessenger.sol";
import "./interfaces/IAvaxSwapRouter.sol";
import "./libraries/BridgeHelper.sol";

contract CrossChainBridge is BridgeUtil {
    struct SupportedToken {
        address token;
        uint24 fee;
    }

    uint32 public immutable CCTP_DOMAIN;

    ISwapRouter public immutable swapRouter;
    IAvaxSwapRouter public immutable avaxSwapRouter;
    IERC20 public immutable usdcToken;
    ITokenMessenger public immutable tokenMessenger;
    IMessageTransmitter public immutable messageTransmitter;

    mapping(address => SupportedToken) public supportedTokens;
    mapping(address => bool) public bridgeAdmins;

    event BridgeDepositReceived(
        address indexed from,
        address indexed recipient,
        uint32 sourceChain,
        uint32 destinationChain,
        uint64 nonce,
        uint256 amount,
        address sourceToken,
        address destinationToken
    );
    event BridgeWithdrawalMade(
        address indexed recipient,
        uint64 nonce,
        uint256 amount,
        address indexed token
    );

    constructor(
        SupportedToken[] memory _supportedTokens,
        address swapRouterAddr,
        address usdcTokenAddr,
        address tokenMessengerAddr,
        address messageTransmitterAddr,
        uint32 domain
    ) {
        for (uint256 i = 0; i < _supportedTokens.length; i++) {
            require(
                _supportedTokens[i].token != address(0),
                "Invalid Supported Token"
            );
            supportedTokens[_supportedTokens[i].token] = _supportedTokens[i];
        }
        swapRouter = ISwapRouter(swapRouterAddr);
        avaxSwapRouter = IAvaxSwapRouter(swapRouterAddr);
        usdcToken = IERC20(usdcTokenAddr);
        tokenMessenger = ITokenMessenger(tokenMessengerAddr);
        messageTransmitter = IMessageTransmitter(messageTransmitterAddr);
        CCTP_DOMAIN = domain;
        bridgeAdmins[msg.sender] = true;
    }

    modifier onlyAdmin() {
        require(bridgeAdmins[msg.sender], "Not Permitted");
        _;
    }

    function performSwap(
        address _tokenIn,
        address _tokenOut,
        address _recipient,
        uint256 amount
    ) internal returns (uint256 amountOut) {
        // Approve UNISWAP Router to spend token
        TransferHelper.safeApprove(_tokenIn, address(swapRouter), amount);
        // Swap The token for USDC
        if (CCTP_DOMAIN == 1) {
            IAvaxSwapRouter.ExactInputSingleParams
                memory params = IAvaxSwapRouter.ExactInputSingleParams({
                    tokenIn: _tokenIn,
                    tokenOut: _tokenOut,
                    fee: supportedTokens[_tokenIn].fee,
                    recipient: _recipient,
                    amountIn: amount,
                    amountOutMinimum: 0,
                    sqrtPriceLimitX96: 0
                });
            amountOut = avaxSwapRouter.exactInputSingle(params);
        } else {
            ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
                .ExactInputSingleParams({
                    tokenIn: _tokenIn,
                    tokenOut: _tokenOut,
                    fee: supportedTokens[_tokenIn].fee,
                    recipient: _recipient,
                    deadline: block.timestamp,
                    amountIn: amount,
                    amountOutMinimum: 0,
                    sqrtPriceLimitX96: 0
                });
            amountOut = swapRouter.exactInputSingle(params);
        }
    }

    /**
     * @notice Deposit an amount of a supported token to the bridge
     * @param amount Amount of tokens to be deposited to the bridge
     * @param sourceToken The supported token address to be deposited
     * @param destinationToken The supported token on the destination chain that the user receives
     * @param recipient The address to receive the destination token on the destination chain
     * @param destinationDomain CCTP Domain identifier of the destination chain
     * @param destinationContract Address of the contract on the destination chain where cctp sends the token
     */
    function deposit(
        uint256 amount,
        address sourceToken,
        address destinationToken,
        uint32 destinationDomain,
        address recipient,
        address destinationContract
    ) public returns (uint64) {
        require(
            supportedTokens[sourceToken].token != address(0),
            "Source Token not supported"
        );
        require(
            supportedTokens[destinationToken].token != address(0),
            "Destination Token not supported"
        );
        // Transfer the token from the caller to the bridge contract
        TransferHelper.safeTransferFrom(
            sourceToken,
            msg.sender,
            address(this),
            amount
        );
        uint256 amountOut = amount;

        if (sourceToken != address(usdcToken)) {
            amountOut = performSwap(
                sourceToken,
                address(usdcToken),
                address(this),
                amount
            );
        }

        // Approve Token Messenger to Spend the swapped amount
        TransferHelper.safeApprove(
            address(usdcToken),
            address(tokenMessenger),
            amountOut
        );
        // Move the USDC To CCTP Contract
        uint64 nonce = tokenMessenger.depositForBurn(
            amountOut,
            destinationDomain,
            addressToBytes32(destinationContract),
            address(usdcToken)
        );
        emit BridgeDepositReceived(
            msg.sender,
            recipient,
            CCTP_DOMAIN,
            destinationDomain,
            nonce,
            amountOut,
            sourceToken,
            destinationToken
        );
        return nonce;
    }

    /**
     * @notice Method to add token to the list of supported tokens. Only admin can call this method
     * @param token Address of the token
     * @param fee UNISWAP Fee TIER for swaps
     */
    function addToken(address token, uint24 fee) public onlyAdmin {
        require(token != address(0), "Invalid token address");
        SupportedToken storage newToken = supportedTokens[token];
        newToken.token = token;
        newToken.fee = fee;
    }

    /**
     * @notice Method to remove token from the list of supported tokens. Only admin can call this method
     * @param _token Address of the token
     */
    function removeToken(address _token) public onlyAdmin {
        require(_token != address(0), "Invalid token address");
        SupportedToken storage token = supportedTokens[_token];
        token.token = address(0);
        token.fee = 0;
    }

    /**
     * @notice Method to add admin to the bridge contract
     * @param _admin Address of the admin
     */
    function addAdmin(address _admin) public onlyAdmin {
        require(_admin != address(0), "Invalid Address");
        bridgeAdmins[_admin] = true;
    }

    /**
     * @notice Method to remove admin to the bridge contract
     * @param _admin Address of the admin
     */
    function removeAdmin(address _admin) public onlyAdmin {
        require(_admin != address(0), "Invalid Address");
        bridgeAdmins[_admin] = false;
    }

    /**
     * @notice Method to recieve tokens and transfer to the recipient on the destination chain. Only a contract admin can call this method
     * @param message cctp contract message from source chain
     * @param signature attestation from cctp attestation API for the message
     * @param nonce message nonce from cctp contract
     * @param amount Amount of destination token to be sent to recipient
     * @param destinationToken Token on the recipient receives
     * @param recipientAddress address of the recipient
     */
    function sendToRecipient(
        bytes calldata message,
        bytes calldata signature,
        uint64 nonce,
        uint256 amount,
        address destinationToken,
        address recipientAddress
    ) public onlyAdmin {
        require(
            messageTransmitter.receiveMessage(message, signature),
            "Receive Message Failed"
        );
        uint256 amountOut = amount;
        if (destinationToken != address(usdcToken)) {
            amountOut = performSwap(
                address(usdcToken),
                destinationToken,
                recipientAddress,
                amount
            );
        } else {
            usdcToken.transfer(recipientAddress, amountOut);
        }
        emit BridgeWithdrawalMade(
            recipientAddress,
            nonce,
            amountOut,
            destinationToken
        );
    }

    /**
     * @notice Method to withdraw USDC Fees. Only a contract admin can call this method
     * @param amount Amount of destination token to be sent to recipient
     */
    function withdraw(
        uint256 amount
    ) public onlyAdmin {
        TransferHelper.safeTransfer(address(usdcToken), msg.sender, amount);
    }
}
