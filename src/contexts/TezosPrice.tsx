import { fetchTezosPriceInUsd } from "utils/TokenUtils";
import React, { PropsWithChildren, useEffect, useState } from "react";

const TezosPriceContext = React.createContext<number | undefined>(undefined);

function TezosPriceProvider(props: PropsWithChildren<{}>) {
  const [tezosPrice, setTezosPrice] = useState<number | undefined>(undefined);

  useEffect(() => {
    fetchTezosPriceInUsd().then((price) => {
      setTezosPrice(price.usd);
    });
  }, []);

  return <TezosPriceContext.Provider value={tezosPrice}>
    {props.children}
  </TezosPriceContext.Provider>
}

export { TezosPriceProvider, TezosPriceContext };