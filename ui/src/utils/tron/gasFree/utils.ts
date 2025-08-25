// @ts-ignore
import TronWeb from 'tronweb';
import { getAddress } from 'ethers';

import type { EvmAddress, TronAddress } from './types';

export function toEthAddress(tronAddress: string): EvmAddress {
  return getAddress(`0x${TronWeb.utils.address.toHex(tronAddress).slice(2)}`) as EvmAddress;
}

export function ethToTronAddress(ethAddress: string): TronAddress {
  return TronWeb.utils.address.fromHex(ethAddress) as TronAddress;
}

export function isDef(val: any) {
  return val !== undefined && val !== null;
}
