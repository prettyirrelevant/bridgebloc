// SPDX-License-Identifier: AGPL-3.0

pragma solidity 0.8.17;

/**
 * @dev Define interface for erc20 wrapped
 */
interface IWETH {
    event  Deposit(address indexed dst, uint wad);

    event  Withdrawal(address indexed src, uint wad);

    function deposit() external payable;

    function withdraw(uint256 wad) external;
}
