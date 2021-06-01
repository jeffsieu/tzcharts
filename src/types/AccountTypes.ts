import BigNumber from 'bignumber.js';
import { TokenAddress } from "./TokenHelperTypes";

export type TokenBalance = {
  address: TokenAddress,
  balance: BigNumber,
}