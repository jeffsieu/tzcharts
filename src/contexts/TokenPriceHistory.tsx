import { fetchPriceHistoryData, PriceDataPoint } from "utils/TokenPrice";
import React, { PropsWithChildren, useEffect, useState } from "react";
import { TokenAddress } from "types/TokenHelperTypes";

const TokenPriceHistoryContext = React.createContext<PriceDataPoint[]>([]);

type TokenPriceHistoryProviderProps = {
  address: TokenAddress,
  dexAddress: string,
}

function TokenPriceHistoryProvider(props: PropsWithChildren<TokenPriceHistoryProviderProps>) {
  const [priceHistory, setPriceHistory] = useState<PriceDataPoint[]>([]);

  useEffect(() => {
    fetchPriceHistoryData(props.address, props.dexAddress).then((priceHistory) => {
      setPriceHistory(priceHistory);
    });
  }, [props.address, props.dexAddress]);

  return <TokenPriceHistoryContext.Provider value={priceHistory}>
    {props.children}
  </TokenPriceHistoryContext.Provider>
}

export { TokenPriceHistoryProvider, TokenPriceHistoryContext };