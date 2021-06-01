import BigNumber from "bignumber.js";
import { Box, ListItem, ListItemText, Typography } from "@material-ui/core";
import { TezosAccountContext } from "contexts/TezosAccount";
import { TokenListContext } from "contexts/TokenList";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { isTokenAddressEqual, QuipusToken, TokenAddress } from "types/TokenHelperTypes";
import { fetchCurrentTokenPriceInTezos } from "utils/TokenUtils";
import { formatUsdAmount } from "utils/TokenFormatter";
import { TezosPriceContext } from "contexts/TezosPrice";


type QuipusTokenWithBalance = QuipusToken & {
  balance: BigNumber,
}

type TokenPrices = Map<TokenAddress, BigNumber>;

function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined;
}

export default function AccountBalanceList() {
  const tokenList = useContext(TokenListContext);
  const accountInteractions = useContext(TezosAccountContext);
  const tezosPrice = useContext(TezosPriceContext);
  const [tokenPrices, setTokenPrices] = useState<TokenPrices>();
  const { account } = accountInteractions!;

  const tokens = useMemo(() => {
    if (account && tokenList) {
      const tokens = account.tokenBalances.map((tokenBalance) => {
        const tokenAddress = tokenBalance.address;
        console.log(tokenList);
        console.log(tokenAddress);
        const token = tokenList.find((token) => isTokenAddressEqual(token.address, tokenAddress));
        if (token) {
          return {
            ...token,
            balance: tokenBalance.balance,
          } as QuipusTokenWithBalance;
        } else {
          return null;
        }
      })
      .filter(notEmpty);
      return tokens as QuipusTokenWithBalance[];
    } else {
      return undefined;
    }
  }, [account, tokenList]);

  // Load token prices
  useEffect(() => {
    if (account && tokenList) {
      setTokenPrices(undefined);
      const fetchTokenPrices = async () => {
        const tokenPrices = new Map<TokenAddress, BigNumber>();
        await Promise.all(tokenList.map(async (token) => {
          const tokenPriceInTezos = await fetchCurrentTokenPriceInTezos(token);
          tokenPrices.set(token.address, tokenPriceInTezos);
        }));
        setTokenPrices(tokenPrices);
      }
      fetchTokenPrices();
    } else {
      setTokenPrices(undefined);
    }

  }, [account, tokenList]);

  return <Box alignItems="center">
    {
      tokens ?
        <Box>
          <Box padding={2}>
            <Typography variant="h6">
              Balances
            </Typography>
          </Box>
          {tokens.map((token) => {
            const tokenBalance = token.balance.toString();
            let secondaryText: string;
            if (tokenPrices?.has(token.address) && tezosPrice) {
              secondaryText = formatUsdAmount(tokenPrices.get(token.address)!.multipliedBy(tezosPrice)) + ` (${tokenBalance})`;
            } else {
              secondaryText = tokenBalance;
            }


            return <ListItem key={JSON.stringify(token.address)}>
              <ListItemText
                primary={token?.name}
                secondary={secondaryText}
              />
            </ListItem>
          })}
        </Box>
      : <Box padding={4}>
        <Typography variant="h6">
          Connect wallet to show balances
        </Typography>
      </Box>
    }
  </Box>
}