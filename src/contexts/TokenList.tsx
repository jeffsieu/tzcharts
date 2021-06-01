import BigNumber from "bignumber.js";
import { fetchQuipusFA12Tokens, fetchQuipusFA2Tokens } from "utils/TokenUtils";
import React, { PropsWithChildren, useEffect, useState } from "react";
import { QuipusToken } from "types/TokenHelperTypes";

const TokenListContext = React.createContext<QuipusToken[] | undefined>(undefined);

const debugTokenList: QuipusToken[] = [
  {
    ownerAddress: 'kTABCDEFGHI',
    totalSupply: new BigNumber(100000000),
    name: 'Crunch',
    symbol: 'CRUNCH',
    decimals: 5,
    address: 'KT1BHCumksALJQJ8q8to2EPigPW6qpyTr7Ng',
    type: 'fa12',
    dexAddress: 'KT1RRgK6eXvCWCiEGWhRZCSVGzhDzwXEEjS4',
  }
]

function TokenListProvider(props: PropsWithChildren<{}>) {
  const [tokens, setTokens] = useState<QuipusToken[] | undefined>(undefined);

  useEffect(() => {
    const fetchTokens = async() => { 
      const fa12Tokens = await fetchQuipusFA12Tokens();
      const fa2Tokens = await fetchQuipusFA2Tokens();
      const tokens = [
        ...fa12Tokens,
        ...fa2Tokens,
      ];
      setTokens(tokens);
    };
    fetchTokens();
    // setTokens(debugTokenList);
  }, []);

  return <TokenListContext.Provider value={tokens}>
    {props.children}
  </TokenListContext.Provider>
}

export { TokenListProvider, TokenListContext };