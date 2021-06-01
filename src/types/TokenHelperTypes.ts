import BigNumber from 'bignumber.js';

type BaseToken = {
  name: string,
  ownerAddress?: string,
  totalSupply?: BigNumber,
  description?: string,
  thumbnailUri?: string,
  symbol: string,
  decimals: number,
}

export type FA12Token = BaseToken & {
  address: FA12TokenAddress,
  type: 'fa12',
}

export type FA2Token = BaseToken & {
  address: FA2TokenAddress,
  type: 'fa2',
}

export type Token = FA12Token | FA2Token;

export type FA12TokenAddress = string;

export type FA2TokenAddress = {
  address: string,
  tokenId: BigNumber,
}

export type TokenAddress = FA12TokenAddress | FA2TokenAddress;

export function getTokenContractAddress(tokenAddress: TokenAddress): string {
  return isFA12TokenAddress(tokenAddress) ? tokenAddress : tokenAddress.address;
}

export function isFA12TokenAddress(address: TokenAddress): address is FA12TokenAddress {
  return !isFA2TokenAddress(address);
}

export function isFA2TokenAddress(address: TokenAddress): address is FA2TokenAddress {
  return (address as any).address !== undefined;
}

export function isTokenAddressEqual(address1: TokenAddress, address2: TokenAddress) {
  if (isFA2TokenAddress(address1) && isFA2TokenAddress(address2)) {
    return isFA2TokenAddressEqual(address1, address2);
  } else if (isFA12TokenAddress(address1) && isFA12TokenAddress(address2)) {
    return address1 === address2;
  } else {
    return false;
  }
}

function isFA2TokenAddressEqual(address1: FA2TokenAddress, address2: FA2TokenAddress) {
  return address1.address === address2.address
          && address1.tokenId.toNumber() === address2.tokenId.toNumber();
}

export type QuipusFA12Token = FA12Token & {
  dexAddress: string,
}

export type QuipusFA2Token = FA2Token & {
  dexAddress: string,
}

export type QuipusToken = QuipusFA12Token | QuipusFA2Token;

export type TokenInfo = {
  name: string,
  symbol: string,
  decimals: number,
  description?: string,
  thumbnailUri?: string,
}

export type QuipusDexData = {
  tokenAddress: string,
  lastUpdateTime: Date,
  tezosPool: BigNumber,
  tokenPool: BigNumber,
}

export type TezosPriceOracle = {
  usd: number,
  timestamp: Date,
}

export type TokenHolder = {
  address: string,
  balance: BigNumber,
}

export type TokenSupplyInfo = {
  circulatingSupply: BigNumber,
  holders: TokenHolder[],
}