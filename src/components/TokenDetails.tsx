import { useContext, useEffect, useState } from "react";

import BigNumber from 'bignumber.js';

import { Avatar, Box, Chip, makeStyles, Theme, Typography } from "@material-ui/core";
import { fetchDexData, fetchToken } from "../utils/TokenUtils";
import { isTokenAddressEqual, QuipusDexData, Token, TokenAddress, getTokenContractAddress, isFA12TokenAddress, QuipusToken } from "../types/TokenHelperTypes";
import { formatAmount, formatUsdAmount } from "../utils/TokenFormatter";
import { TezosPriceContext } from "contexts/TezosPrice";
import { TokenListContext } from "contexts/TokenList";
import { TokenPriceHistoryProvider } from "contexts/TokenPriceHistory";
import TokenPriceChart from "components/TokenPriceChart";
import { TokenSupplyInfoContext } from "contexts/TokenSupplyInfo";
import Alert from "@material-ui/lab/Alert";

type TokenProps = {
  address: TokenAddress,
}

const viewOnQuipuSwap = (address: TokenAddress) => {
  const url = isFA12TokenAddress(address)
    ? `https://quipuswap.com/swap?from=tez&to=${address}`
    : `https://quipuswap.com/swap?from=tez&to=${address.address}_${address.tokenId}`;
  window.open(url, '_blank');
}

const viewOnTzkt = (address: TokenAddress) => {
  const contractAddress = getTokenContractAddress(address);
  const url = `https://tzkt.io/${contractAddress}`;
  window.open(url, '_blank');
}

const useStyles = makeStyles((theme: Theme) => ({
  price: {
    color: theme.palette.primary.light,
    textAlign: 'right',
  },
  primary: {
    color: theme.palette.primary.light,
  },
  big: {
    width: theme.spacing(8),
    height: theme.spacing(8),
  },
  chipContainer: {
    '& > *': {
      marginRight: theme.spacing(1),
    },
  },
  details: {
    '& > *': {
      marginTop: theme.spacing(2),
      marginRight: theme.spacing(4),
      display: 'inline-block',
    },
  },
}));

function TokenDetails(props: TokenProps) {
  const classes = useStyles();

  const [token, setToken] = useState<Token | null | undefined>(undefined);
  const [quipusToken, setQuipusToken] = useState<QuipusToken | null | undefined>(undefined);
  const [dexData, setDexData] = useState<QuipusDexData | null | undefined>(undefined);

  const tezosPrice = useContext(TezosPriceContext);
  const tokenList = useContext(TokenListContext);
  const tokenSupplyInfo = useContext(TokenSupplyInfoContext);
  const formatTokenAmount = (amount: BigNumber, token: { decimals?: number, symbol?: string }) => {
    return formatAmount(amount, token.decimals ?? 0) + ' ' + token.symbol;
  }

  let tezosPerToken: BigNumber;
  let liquidityUsd: BigNumber | undefined = undefined;
  let fullyDilutedMarketCapTezos: BigNumber | null = null;
  let fullyDilutedMarketCapUsd: BigNumber | null = null;
  let tokenPriceUsd: BigNumber = new BigNumber(0);
  if (token && dexData) {
    const tezosPool = dexData.tezosPool;
    const tokenPool = dexData.tokenPool;

    tezosPerToken = tezosPool.dividedBy(tokenPool);

    if (tezosPrice) {
      liquidityUsd = tezosPool.multipliedBy(tezosPrice).multipliedBy(2);
      tokenPriceUsd = tezosPerToken.multipliedBy(tezosPrice);
    }
    if (token.totalSupply) {
      fullyDilutedMarketCapTezos = token.totalSupply.multipliedBy(tokenPriceUsd);
      if (tezosPrice) {
        fullyDilutedMarketCapUsd = fullyDilutedMarketCapTezos.multipliedBy(tezosPrice);
      }
    }
  }

  const copyContractAddress = () => {
    navigator.clipboard.writeText(getTokenContractAddress(props.address));
  }

  useEffect(() => {
    setToken(undefined);
    setQuipusToken(undefined);
    setDexData(undefined);
    const loadTokenDetails = async (address: TokenAddress) => {
      // Load details about the token
      const token = await fetchToken(address);
      setToken(token ?? null);
      if (token && tokenList) {
        const quipusToken = tokenList.find((quipusToken) => isTokenAddressEqual(quipusToken.address, address));
        setQuipusToken(quipusToken);
        if (quipusToken) {
          const dexData = await fetchDexData(quipusToken.address, quipusToken.dexAddress);
          setDexData(dexData);
        } else {
          setDexData(null);
        }
      } else {
        setQuipusToken(null);
        setDexData(null);
      }
    }
    loadTokenDetails(props.address);
  }, [props.address, tokenList]);
  return <div>
    {
      token ? (
        <div>
          <Box display="flex">
            <Avatar className={classes.big} alt={token.name} src={token.thumbnailUri} style={{ backgroundColor: 'white' }} />
            <Box style={{ flex: 1, marginLeft: 16 }}>
              <Typography variant="h4" component="span">
                {token.name} ({token.symbol})
                      </Typography>
              <Typography variant="h6">
                {token.description}
              </Typography>
            </Box>
          </Box>
          <Box marginY={1} className={classes.chipContainer}>
            <Chip
              label={token.type === "fa12" ? 'FA1.2 Token' : 'FA2 Token'}
              variant="outlined"
            />
            <Chip
              icon={<span className="material-icons">content_copy</span>}
              label="Copy contract address"
              variant="outlined"
              onClick={copyContractAddress}
            />
            <Chip
              icon={<span className="material-icons">open_in_new</span>}
              label="View on tzkt.io"
              variant="outlined"
              onClick={() => viewOnTzkt(props.address)}
            />
            <Chip
              icon={<span className="material-icons">open_in_new</span>}
              label="View on QuipuSwap"
              variant="outlined"
              onClick={() => viewOnQuipuSwap(props.address)}
            />
          </Box>
          <Box marginTop={2}>
            <Alert severity="warning" variant="outlined">
              Prices calculated from balances in QuipusSwap liquidity pool. May be incorrect.
            </Alert>
          </Box>
          <Box className={classes.details}>
            <Box>
              <Typography variant="h6">
                Price:
              </Typography>
              <Typography variant="body1" className={classes.price}>
                {formatUsdAmount(tokenPriceUsd, true)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6">
                Market cap
              </Typography>
              <Typography variant="body1">
                {tokenSupplyInfo ? formatUsdAmount(tokenSupplyInfo.circulatingSupply.multipliedBy(tokenPriceUsd)) : 'Unknown'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6">
                Liquidity
              </Typography>
              <Typography variant="body1">
                {liquidityUsd ? formatUsdAmount(liquidityUsd) : 'Unknown'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6">
                Max supply
            </Typography>
              <Typography variant="body1">
                {token.totalSupply ? formatTokenAmount(token.totalSupply, { decimals: 0, symbol: token.symbol }) : 'Unknown'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6">
                Market cap (fully diluted)
              </Typography>
              <Typography variant="body1">
                {fullyDilutedMarketCapUsd ? formatUsdAmount(fullyDilutedMarketCapUsd) : 'Unknown'}
              </Typography>
            </Box>
          </Box>
          {
            quipusToken?.dexAddress &&
            <Box marginTop={2}>
              <TokenPriceHistoryProvider address={quipusToken.address} dexAddress={quipusToken.dexAddress}>
                <Typography variant="h6">
                  Chart
                </Typography>
                <TokenPriceChart></TokenPriceChart>
              </TokenPriceHistoryProvider>
            </Box>
          }
        </div>
      ) : (
        token === null
          ? <Alert severity="error">
            No token found at ${getTokenContractAddress(props.address)}
          </Alert>
          : <h3>Loading...</h3>
      )
    }
  </div >
}

export default TokenDetails;