import BigNumber from "bignumber.js";
import { Box, Container } from "@material-ui/core"
import { useHistory, useParams } from "react-router";
import SearchBar from "components/SearchBar";
import TokenDetails from "components/TokenDetails";
import { getTokenContractAddress, isFA12TokenAddress, TokenAddress } from "types/TokenHelperTypes";
import React, { useEffect, useMemo } from "react";
import { fetchTzips } from "utils/TokenUtils";
import { TokenSupplyInfoProvider } from "contexts/TokenSupplyInfo";

type TokenPageParams = {
  address: string,
  tokenId?: string,
}

export default function TokenPage() {
  const { address, tokenId } = useParams<TokenPageParams>();
  // const history = useHistory();
  const tokenAddress: TokenAddress = useMemo(() => {
    return tokenId !== undefined ? {
      address,
      tokenId: new BigNumber(tokenId),
    } : address;
  }, [address, tokenId]);

  // useEffect(() => {
  //   // Verify that the tokenAddress is valid
  //   fetchTzips(getTokenContractAddress(tokenAddress)).then((tzips) => {
  //     console.log("fetched");
  //     if (!tzips) {
  //       return false;
  //     }
  //     if (isFA12TokenAddress(tokenAddress)) {
  //       if (!tzips.includes('fa12')) {
  //         // May be actually fa2
  //         history.push(`/${tokenAddress}/0`);
  //         return false;
  //       }
  //     } else {
  //       if (!tzips.includes('fa2')) {
  //         return false;
  //       }
  //     }
  //     return true;
  //   }, (reason: any) => {
  //     return false;
  //   });
  // }, [address, tokenId, tokenAddress, history]);



  return <Container>
    <Box marginY={2}>
      <SearchBar currentTokenAddress={tokenAddress}></SearchBar>
    </Box>

    <TokenSupplyInfoProvider address={tokenAddress}>
      <TokenDetails address={tokenAddress}></TokenDetails>
    </TokenSupplyInfoProvider>
  </Container>
}