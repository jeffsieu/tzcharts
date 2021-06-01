import { IconButton, InputAdornment, makeStyles, TextField, Typography } from '@material-ui/core';
import { Autocomplete, AutocompleteChangeReason, AutocompleteRenderInputParams } from '@material-ui/lab';
import { TokenListContext } from 'contexts/TokenList';
import { matchSorter } from 'match-sorter';
import React, { useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { isTokenAddressEqual, QuipusToken, getTokenContractAddress, isFA12TokenAddress, TokenAddress } from '../types/TokenHelperTypes';

type SearchBarProps = {
  currentTokenAddress: TokenAddress | null,
}

const useStyles = makeStyles((theme) => ({
  hintColor: {
    color: theme.palette.text.hint,
  },
}));

function SearchBar(props: SearchBarProps) {
  const history = useHistory();
  const tokenList = useContext(TokenListContext);
  const classes = useStyles();
  const [query, setQuery] = useState('');

  const onSearchToken = (token: QuipusToken) => {
    if (isFA12TokenAddress(token.address)) {
      history.push(`/token/${token.address}`)
    } else {
      history.push(`/token/${token.address.address}/${token.address.tokenId}`);
    }
  }

  const onSearchAddress = (address: string) => {
    history.push(`/token/${address}`);
  }

  const formPreventDefault = (event: any) =>{
    event.preventDefault();
    onSearchAddress(query);
  }

  const onTextChange = (event: React.ChangeEvent<{}>, value: string | QuipusToken | null, reason: AutocompleteChangeReason) => {
    if (reason === 'select-option') {
      const token = value as QuipusToken;
      onSearchToken(token);
    } else {
      setQuery(value as string);
    }
  }

  return <form onSubmit={formPreventDefault}>
     <Autocomplete
      freeSolo
      autoHighlight
      autoSelect
      loading={tokenList === undefined}
      options={tokenList ?? []}
      groupBy={
        (option) => {
          return isFA12TokenAddress(option.address) ? 'FA1.2 Tokens' : 'FA2';
        }
      }
      getOptionLabel={(quipusToken: QuipusToken) => quipusToken.name ?? query}
      getOptionSelected={(quipusToken: QuipusToken) => {
        if (quipusToken.address && props.currentTokenAddress) {
          return isTokenAddressEqual(quipusToken.address, props.currentTokenAddress);
        } else {
          return false;
        }
      }}
      style={{ width: '100%' }}
      onChange={onTextChange}
      // value={query}
      filterOptions={
        (options, { inputValue }) => {
          const fa12Tokens = options.filter((token) => token.type === 'fa12');
          const fa2Tokens = options.filter((token) => token.type === 'fa2');
          const sortedFA12Tokens = matchSorter(fa12Tokens, inputValue, {
            keys: ['name', {threshold: matchSorter.rankings.EQUAL, key: 'address'}],
          });
          const sortedFA2Tokens = matchSorter(fa2Tokens, inputValue, {
            keys: ['name', {threshold: matchSorter.rankings.EQUAL, key: 'address.address'}],
          });

          return [
            ...sortedFA12Tokens,
            ...sortedFA2Tokens,
          ];
        }
      }
      renderOption={(option: QuipusToken, { selected }) => (
        <div>
          <Typography variant="subtitle1">
            {option.name}
          </Typography>
          <Typography variant="subtitle2">
            {getTokenContractAddress(option.address)}
          </Typography>
        </div>
      )}
      renderInput={(params: AutocompleteRenderInputParams) =>
        <TextField
          {...params}
          variant="outlined"
          placeholder="Search by contract name or address..."
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <IconButton className={classes.hintColor}>
                  <span className="material-icons">search</span>

                </IconButton>
              </InputAdornment>
            )
          }}
        />
      }
    />
  </form>
}


export default SearchBar;
