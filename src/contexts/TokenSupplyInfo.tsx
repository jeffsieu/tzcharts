import { fetchTokenSupplyInfo } from "utils/TokenUtils";
import React, { PropsWithChildren, useEffect, useState } from "react";
import { TokenAddress, TokenSupplyInfo } from "types/TokenHelperTypes";

const TokenSupplyInfoContext = React.createContext<TokenSupplyInfo | undefined>(undefined);

type TokenSupplyInfoProviderProps = {
  address: TokenAddress,
}

function TokenSupplyInfoProvider(props: PropsWithChildren<TokenSupplyInfoProviderProps>) {
  const [tokenSupplyInfo, setTokenSupplyInfo] = useState<TokenSupplyInfo | undefined>(undefined);

  useEffect(() => {
    fetchTokenSupplyInfo(props.address).then((tokenSupplyInfo) => {
      setTokenSupplyInfo(tokenSupplyInfo);
    });
  }, [props.address]);

  return <TokenSupplyInfoContext.Provider value={tokenSupplyInfo}>
    {props.children}
  </TokenSupplyInfoContext.Provider>
}

export { TokenSupplyInfoProvider, TokenSupplyInfoContext };