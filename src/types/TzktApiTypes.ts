export type QuipusFactoryAddress = string;

export type TzktFA2TokenAddress = {
  address: string,
  nat: string,
}

// TOKENS
export type TzktQuipusFA2Token = {
  address: TzktFA2TokenAddress,
  dexAddress: string,
}

export type TzktQuipusFA12Token = {
  address: string,
  dexAddress: string,
}
export type TzktQuipusToken = TzktQuipusFA12Token | TzktQuipusFA2Token;

export type TzktContractStorage = {
  metadata: BigMapAddress,
}

export type TzktQuipusFactoryStorage = TzktContractStorage & {
  token_to_exchange: BigMapAddress,
}

export type TzktAlias = {
  name?: string,
  address?: string,
}

export type BigMapAddress = number;

export type ContractMetadata = BigMap;

export type BigMap = {
  active: boolean,
  contract?: TzktAlias,
}

export type TzktContract = {
  type: 'user' | 'delegate' | 'contract' | 'empty',
  tzips: TzktTzip[],
  alias: string,
  address: string,
  creator: {
    alias?: string,
    address: string,
  },
}

export type TzktTokenStorage = TzktContractStorage & {
  admin: {
    admin?: string,
  } | string,
  assets?: {
    total_supply: string,
  },
}

export type TzktQuipusDexStorage = TzktContractStorage & {
  storage: {
    last_update_time: string,
    tez_pool: string,
    token_pool: string,
    token_address: string,
  }
}

export type TzktTezosPriceOracleStorage = TzktContractStorage & {
  nat_0: string, //xtzusd
  nat_1: string, //usdchf
  nat_2: string, //xtzchf
  timestamp: string,
}

export type TzktSingleTokenMetadata = {
  value: {
    map: TzktTokenInfo,
  } | {
    token_info: TzktTokenInfo,
  }
}

export type TzktTokenMetadata = TzktSingleTokenMetadata[];

export type TzktTokenInfo = TokenInfoRaw | IPFSTokenInfo;

export type TokenInfoRaw = {
  name?: string,
  symbol: string,
  decimals: string,
  description?: string,
  thumbnailUri?: string,
}

export type IPFSTokenInfo = {
  "": string,
}

export function isIPFSTokenInfo(tokenInfo: TzktTokenInfo) : tokenInfo is IPFSTokenInfo {
  return (tokenInfo as any)[""] !== undefined;
}

export type TzktTzip = 'fa12' | 'fa2';


export type QuipusDexDataHistory = QuipusDexTransaction[];

export type QuipusDexTransaction = {
  level: number,
  timestamp: string,
  operation: {
    hash: string,
    parameter: {
      value: {
        // some stuff
      },
    },
  },
  value: TzktQuipusDexStorage,
}
