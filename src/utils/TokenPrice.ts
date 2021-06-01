import { TokenAddress } from "types/TokenHelperTypes";
import { fetchDexDataHistory, fetchTezosPriceInUsd, fetchTokenDecimals, getQuipusDexDataFromStorage } from "./TokenUtils";

export type Candlestick = {
  time: string,
  open: number,
  close: number,
  high: number,
  low: number,
}


export type PriceDataPoint = {
  time: number,
  value: number,
};

export async function fetchPriceHistoryData(address: TokenAddress, dexAddress: string): Promise<PriceDataPoint[]> {
  const decimals = await fetchTokenDecimals(address);
  const history = await fetchDexDataHistory(dexAddress);
  return await Promise.all(history.map(async (transaction) => {
    const storage = getQuipusDexDataFromStorage(transaction.value, decimals);
    const { tokenPool, tezosPool } = storage;
    const tokenPrice = tezosPool.dividedBy(tokenPool);
    const blockLevel = transaction.level;
    const tezosPriceAtTransaction = await fetchTezosPriceInUsd(blockLevel);
    const tokenPriceUsd = tokenPrice.multipliedBy(tezosPriceAtTransaction.usd);
    return {
      time: +storage.lastUpdateTime / 1000,
      value: tokenPriceUsd.toNumber(),
    }
  }));
}
