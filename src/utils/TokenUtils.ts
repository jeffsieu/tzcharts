import BigNumber from 'bignumber.js';
import { QuipusFA2Token, FA2TokenAddress, Token, QuipusDexData, TokenInfo, TezosPriceOracle, QuipusFA12Token, FA12Token, FA2Token, isFA12TokenAddress, TokenAddress, getTokenContractAddress, TokenSupplyInfo, TokenHolder, QuipusToken } from 'types/TokenHelperTypes';
import { QuipusFactoryAddress, TzktQuipusToken, TzktQuipusFA2Token, TzktQuipusFA12Token, TzktTokenStorage, TzktQuipusFactoryStorage, TzktContractStorage, TzktContract, TzktQuipusDexStorage, TzktSingleTokenMetadata, TzktTokenInfo, TokenInfoRaw, isIPFSTokenInfo, TzktTezosPriceOracleStorage, TzktTzip, QuipusDexDataHistory } from 'types/TzktApiTypes';
import { fetchJson } from './ApiUtils';

const priceOracleAddress = 'KT19kgnqC5VWoxktLRdRUERbyUPku9YioE8W';

const tzktUrl = 'https://api.tzkt.io/v1/';

const quipusFA12FactoryAddress = 'KT1Lw8hCoaBrHeTeMXbqHPG4sS4K1xn7yKcD';
const quipusFA2FactoryAddress = 'KT1SwH9P1Tx8a58Mm6qBExQFTcy2rwZyZiXS';

async function fetchQuipusFactoryTokens(factoryAddress: QuipusFactoryAddress): Promise<TzktQuipusToken[]> {
  const fa2FactoryStorage = await fetchQuipusFactoryStorage(factoryAddress);
  const tokenToDexArray = await fetchBigMapKeys(fa2FactoryStorage.token_to_exchange);
  const tTokens: TzktQuipusFA2Token[] = tokenToDexArray.map((data) => {
    // Key is token address, value is dex address
    return {
      address: data.key,
      dexAddress: data.value,
    }
  });
  return tTokens;
}

async function fetchQuipusFA12Tokens(): Promise<QuipusFA12Token[]> {
  const tTokens: TzktQuipusFA12Token[] = await fetchQuipusFactoryTokens(quipusFA12FactoryAddress) as TzktQuipusFA12Token[];
  const allTokens = await Promise.all(tTokens.map(async (tToken: TzktQuipusFA12Token) => {
    const token = await fetchToken(tToken.address) as FA12Token;
    if (!token) {
      return null;
    }
    return {
      ...token,
      dexAddress: tToken.dexAddress,
    };
  }));
  const tokens = allTokens.filter((token) => token != null) as QuipusFA12Token[];
  return tokens;
}

async function fetchQuipusFA2Tokens(): Promise<QuipusFA2Token[]> {
  const tTokens: TzktQuipusFA2Token[] = await fetchQuipusFactoryTokens(quipusFA2FactoryAddress) as TzktQuipusFA2Token[];
  const allTokens = await Promise.all(tTokens.map(async (tToken: TzktQuipusFA2Token) => {
    const tokenAddress: FA2TokenAddress = {
      address: tToken.address.address,
      tokenId: new BigNumber(tToken.address.nat),
    }
    const token = await fetchToken(tokenAddress) as FA2Token;
    if (!token) {
      return null;
    }
    return {
      ...token,
      dexAddress: tToken.dexAddress,
    };
  }));
  const tokens = allTokens.filter((token) => token != null) as QuipusFA2Token[];
  return tokens;
}

async function fetchTokenContractStorage(tokenAddress: string): Promise<TzktTokenStorage> {
  return await fetchContractStorage(tokenAddress) as TzktTokenStorage;
}

async function fetchQuipusFactoryStorage(factoryAddress: string): Promise<TzktQuipusFactoryStorage> {
  return await fetchContractStorage(factoryAddress) as TzktQuipusFactoryStorage;
}

async function fetchContractStorage(contractAddress: string, level?: number): Promise<TzktContractStorage> {
  return await fetchJson(tzktUrl + `contracts/${contractAddress}/storage` + (level !== undefined ? `?level=${level}` : ''));
}

async function fetchContractStorageHistory(contractAddress: string, count: number): Promise<any> {
  return await fetchJson(tzktUrl + `contracts/${contractAddress}/storage/history?limit=${count}`);
}

async function fetchContract(contractAddress: string): Promise<TzktContract> {
  return await fetchJson(tzktUrl + `contracts/${contractAddress}`);
}

async function fetchToken(address: TokenAddress): Promise<Token | undefined> {
  try {
    const type = isFA12TokenAddress(address) ? 'fa12' : 'fa2';
    const contractAddress = getTokenContractAddress(address);
    const getTokenInfo = async() => {
      const tokenInfo = await fetchTokenInfo(address);
      if (tokenInfo)
        return tokenInfo;
      else {
        const { alias } = await fetchContract(contractAddress);
        if (!alias)
          return undefined;
        return {
          name: alias,
          symbol: alias,
          decimals: 0,
        };
      }
    };
    const tokenInfoOrUndefined = await getTokenInfo();
    if (!tokenInfoOrUndefined) {
      return undefined;
    }
    const tokenInfo: TokenInfo = tokenInfoOrUndefined;
    const tokenContractStorage = await fetchTokenContractStorage(contractAddress);
    const contractOwner: string = tokenContractStorage.admin
      ? ((tokenContractStorage.admin as any).admin ?? tokenContractStorage.admin)
      : undefined;

    const totalSupply = tokenContractStorage?.assets?.total_supply
      ? getTokenAmount(new BigNumber(tokenContractStorage?.assets?.total_supply), tokenInfo.decimals)
      : undefined;

        if (address ==='shitstain')
    console.log("i reached here");
  
    return {
      ownerAddress: contractOwner,
      totalSupply: totalSupply,
      address,
      type,
      ...tokenInfo,
    } as Token
  } catch (e) {
    return undefined;
  }
}

async function fetchCurrentTokenPriceInTezos(token: QuipusToken): Promise<BigNumber> {
  const data = await fetchDexData(token.address, token.dexAddress);
  const priceInTezos = data.tezosPool.dividedBy(data.tokenPool);
  return priceInTezos;
}

function getQuipusDexDataFromStorage(storage: TzktQuipusDexStorage, tokenDecimals: number) {
  const { last_update_time, token_address, token_pool, tez_pool } = storage.storage;
  const lastUpdateTime = new Date(last_update_time);
  const tokenAddress = token_address;
  const tokenPool = getTokenAmount(new BigNumber(token_pool), tokenDecimals);
  const tezosPool = getTezosAmount(new BigNumber(tez_pool));

  return {
    lastUpdateTime,
    tokenAddress,
    tokenPool,
    tezosPool,
  };
}

// Helper functions
export async function fetchTokenDecimals(address: TokenAddress): Promise<number> {
  const data = await fetchTokenInfo(address);
  return data?.decimals ?? 0;
}

async function fetchDexData(address: TokenAddress, dexAddress: string): Promise<QuipusDexData> {
  const decimals = await fetchTokenDecimals(address);
  console.log("decimals: " + decimals);
  const rawData = await fetchContractStorage(dexAddress) as TzktQuipusDexStorage;
  return getQuipusDexDataFromStorage(rawData, decimals);
}

async function fetchDexDataHistory(dexAddress: string): Promise<QuipusDexDataHistory> {
  const history = await fetchContractStorageHistory(dexAddress, 1000) as QuipusDexDataHistory;
  return history;
}

function hasTokenInfoProperty(metadata: TzktSingleTokenMetadata): metadata is { value: { token_info: TzktTokenInfo } } {
  return (metadata.value as any).token_info !== undefined;
}

async function fetchTokenInfo(address: TokenAddress): Promise<TokenInfo | null> {
  let contractAddress: string;
  let tokenId: string;
  if (isFA12TokenAddress(address)) {
    contractAddress = address;
    tokenId = '0';
  } else {
    contractAddress = address.address;
    tokenId = address.tokenId.toString();
  }

  const data: TzktSingleTokenMetadata = await fetchJson(tzktUrl + `contracts/${contractAddress}/bigmaps/token_metadata/keys/${tokenId}`);

  if (!data || !data.value) {
    return null;
  }

  const tzktTokenInfo: TzktTokenInfo = hasTokenInfoProperty(data) ? data.value.token_info : 
      ((data.value as any).map ?? (data.value as any).token_metadata_map);

  let tokenInfoRaw: TokenInfoRaw;
  let tokenInfo: TokenInfo;

  if (isIPFSTokenInfo(tzktTokenInfo)) {
    // ipfs://something
    const rawIPFSUrl = tryHexToString(tzktTokenInfo[''])!;
    // There is a token with some extra chars in front of "ipfs://"
    const cleanedIPFSUrl = rawIPFSUrl.substring(rawIPFSUrl.indexOf('ipfs://'));
    const ipfsUrl = cleanedIPFSUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
   
    tokenInfo = await fetchJson(ipfsUrl) as TokenInfo;
  } else {
    tokenInfoRaw = tzktTokenInfo;
    tokenInfo = {
      name: hexToString(tokenInfoRaw.name)!,
      symbol: hexToString(tokenInfoRaw.symbol)!,
      decimals: parseInt(hexToString(tokenInfoRaw.decimals)!),
      description: hexToString(tokenInfoRaw.description),
      thumbnailUri: hexToString(tokenInfoRaw.thumbnailUri),
    }
  }

  // Process IPFS thumbnail URI if applicable
  if (tokenInfo.thumbnailUri?.startsWith('ipfs://')) {
    tokenInfo.thumbnailUri = tokenInfo.thumbnailUri!.replace('ipfs://', 'https://ipfs.io/ipfs/');
  }

  return tokenInfo;
}

async function fetchTokenSupplyInfo(address: TokenAddress): Promise<TokenSupplyInfo> {
  const contractAddress = getTokenContractAddress(address);
  const tokenId = isFA12TokenAddress(address) ? 0 : address.tokenId;

  // A map from holder (address string) to balance (numerical string)
  const holderToBalanceMap = await fetchJson(`https://api.better-call.dev/v1/contract/mainnet/${contractAddress}/tokens/holders?token_id=${tokenId}`);
  const holders = Object.entries<string>(holderToBalanceMap).map(([key, value]) => {
    return {
      address: key,
      balance: new BigNumber(value),
    } as TokenHolder;
  })

  const circulatingSupply: BigNumber = Object.values<string>(holderToBalanceMap)
        .map((number) => new BigNumber(number))
        .reduce((prev, curr) => {
          return prev.plus(curr);
        }, new BigNumber(0));

  return {
    holders,
    circulatingSupply,
  };
}

async function fetchBigMapKeys(id: number): Promise<any[]> {
  const bigMap = await fetchJson(tzktUrl + `bigmaps/${id}/keys`);
  return bigMap;
}

async function fetchTezosPriceInUsd(level?: number): Promise<TezosPriceOracle> {
  const data = await fetchContractStorage(priceOracleAddress, level) as TzktTezosPriceOracleStorage;
  const usdPrice = new BigNumber(data.nat_0).toNumber() / 100; // Price oracle stores price multiplied by 100
  const timestamp = new Date(data.timestamp)
  return {
    usd: usdPrice,
    timestamp,
  }
}

async function fetchTzips(address: string): Promise<TzktTzip[]> {
  const data = await fetchContract(address);
  return data.tzips;
}

function tryHexToString(hexString: string) {
  try {
    return hexToString(hexString);
  } catch (e) {
    return hexString;
  }
}

function hexToString(hexString: string | undefined): string | undefined {
  if (hexString === undefined) return undefined; 
  return Buffer.from(hexString, 'hex').toString();
}

function getTezosAmount(amount: BigNumber): BigNumber {
  return getTokenAmount(amount, 6);
}

function getTokenAmount(amount: BigNumber, decimals: number): BigNumber {
  return new BigNumber({
    s: amount.s,
    e: (amount.e ?? 0) - decimals,
    c: amount.c,
    _isBigNumber: true,
  });
}

export { fetchToken, fetchCurrentTokenPriceInTezos, fetchTokenSupplyInfo, fetchDexData, fetchTezosPriceInUsd, fetchQuipusFA12Tokens, fetchQuipusFA2Tokens, fetchTzips, fetchDexDataHistory, getQuipusDexDataFromStorage };
