import { zeroAddress } from 'viem';

export const evmAddressToBytes32 = (address?: string): `0x${string}` =>
  `0x000000000000000000000000${address ? address.replace('0x', '') : zeroAddress.replace('0x', '')}`;
