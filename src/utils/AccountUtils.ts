import BigNumber from 'bignumber.js';
import { TokenBalance } from 'types/AccountTypes';
import { BcdTokenBalance } from 'types/BcdApiTypes';
import { fetchJson } from "./ApiUtils";

export async function fetchAccountTokenBalances(accountAddress: string): Promise<TokenBalance[]> {
  const balances: BcdTokenBalance[] = [];
  let offset = 0;
  let data = await fetchJson(`https://api.better-call.dev/v1/account/mainnet/${accountAddress}/token_balances?sort_by=balance&offset=${offset}`);
  while (data.balances.length > 0) {
    data.balances.forEach((balance: BcdTokenBalance) => {
      balances.push(balance);
    });
    offset += 10;
    data = await fetchJson(`https://api.better-call.dev/v1/account/mainnet/${accountAddress}/token_balances?sort_by=balance&offset=${offset}`);
  }
  return balances.map((bcdBalance) => {
    return {
      address: {
        address: bcdBalance.contract,
        tokenId: new BigNumber(bcdBalance.token_id),
      },
      balance: new BigNumber(bcdBalance.balance).dividedBy(new BigNumber(10).exponentiatedBy(bcdBalance.decimals)),
    }
  });

}