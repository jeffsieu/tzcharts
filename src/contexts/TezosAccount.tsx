import BigNumber from "bignumber.js";
import React, { PropsWithChildren, useCallback, useEffect, useState } from "react";
import { AccountInfo } from "@airgap/beacon-sdk";
import { TezosToolkit } from "@taquito/taquito";
import { BeaconWallet } from "@taquito/beacon-wallet";
import { fetchAccountTokenBalances } from "utils/AccountUtils";
import { TokenBalance } from "types/AccountTypes";

type TezosAccount = AccountInfo & {
  balance: BigNumber,
  tokenBalances: TokenBalance[],
}

type TezosAccountInteractions = {
  connectWallet: () => void,
  disconnectWallet: () => void,
  account: TezosAccount | undefined, 
} | null

const rpcUrl: string = 'https://api.tez.ie/rpc/mainnet';
const Tezos = new TezosToolkit(rpcUrl);
const wallet = new BeaconWallet({
  name: 'tzcharts',
});
Tezos.setWalletProvider(wallet);

const TezosAccountContext = React.createContext<TezosAccountInteractions>(null);

function TezosAccountProvider(props: PropsWithChildren<{}>) {
  const [tezosAccount, setTezosAccount] = useState<TezosAccount | undefined>(undefined);

  const loadAccount = async (account: AccountInfo) => {
    const balance = await Tezos.tz.getBalance(account.address);
    const tokenBalances = await fetchAccountTokenBalances(account.address);
    console.log("tokenBalances!");
    console.log(tokenBalances);
    setTezosAccount({
      balance,
      tokenBalances,
      ...account,
    });
  }

  useEffect(() => {
    const fetchWallet = async () => {
      const activeAccount = await wallet.client.getActiveAccount();
      if (activeAccount) {
        loadAccount(activeAccount);
      }
    }
    fetchWallet();
  }, []);

  const connectWallet = useCallback(() => {
    const connectWalletAsync = async () => {
      // Try connecting
      const permissions = await wallet.client.requestPermissions();
      if (permissions) {
        loadAccount(permissions.accountInfo);
      } else {
        console.log('User cancelled');
      }
    }
    connectWalletAsync();
  }, []);

  const disconnectWallet = useCallback(() => {
    const disconnectWalletAsync = async () => {
      // Disconnect wallet
      await wallet.clearActiveAccount();
      setTezosAccount(undefined);
    }
    disconnectWalletAsync()
  }, []);

  return <TezosAccountContext.Provider value={{connectWallet, disconnectWallet, account: tezosAccount}}>
    {props.children}
  </TezosAccountContext.Provider>
}

export { TezosAccountProvider, TezosAccountContext };