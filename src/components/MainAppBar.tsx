import BigNumber from "bignumber.js";
import { AppBar, Box, Toolbar, Typography, Link, Avatar, Button, makeStyles, IconButton } from "@material-ui/core";
import { formatUsdAmount } from "utils/TokenFormatter";
import { TezosPriceContext } from "contexts/TezosPrice";
import { TezosAccountContext } from "contexts/TezosAccount";
import { useContext } from "react";

type MainAppBarProps = {
  onRightMenuClick: () => void,
}

const formatBalance = (mutezBalance: BigNumber) => {
  return mutezBalance.dividedBy(1000000).toFixed(2) + ' tez';
}

const formatUserAddress = (address: string) => {
  return address.substring(0, 5) + '...';
}

const useStyles = makeStyles((theme) => ({
  spacer: {
    flexGrow: 1,
  },
  small: {
    width: theme.spacing(4),
    height: theme.spacing(4),
  },
  onPrimary: {
    color: theme.palette.text.primary,
  },
  tezosPriceContainer: {
    display: 'flex',
    alignItems: 'center',
    '& > *' : {
      marginRight: theme.spacing(1),
    }
  },
}));


export default function MainAppBar(props: MainAppBarProps) {
  const classes = useStyles();
  const tezosPrice = useContext(TezosPriceContext);
  const accountInteractions = useContext(TezosAccountContext);
  const { account, connectWallet, disconnectWallet } = accountInteractions!;
  let walletButtonText;
  if (account) {
    walletButtonText = 'Connected ' + formatUserAddress(account.address);
  } else {
    walletButtonText = 'Connect wallet';
  }

  const onWalletButtonClick = account ? disconnectWallet : connectWallet;

  return <AppBar position="static" style={{zIndex: 1400, position: 'relative'}}>
    <Toolbar>
      <Link variant="h6" component="a" href="/" className={classes.onPrimary}>
        tzcharts
      </Link>
      {
        tezosPrice && <Box marginLeft={2} className={classes.tezosPriceContainer}>
          <Avatar className={classes.small} src="https://mediashower.com/img/E8D195B2-8D67-11E8-8E97-AF63B8ECBBBA/tezos_600x.jpg"></Avatar>
          <Typography variant="body1">
            {formatUsdAmount(new BigNumber(tezosPrice))}
          </Typography>
        </Box>
      }
      <span className={classes.spacer}></span>
      <IconButton
        color="inherit"
        aria-label="open drawer"
        onClick={props.onRightMenuClick}
        edge="start"
      >
        <span className="material-icons">menu</span>
      </IconButton>
      {account && (
        <Typography variant='body1'>
          {formatBalance(account.balance)}
        </Typography>
      )}
      <Button variant={account ? "outlined" : "contained"} color="default"
        onClick={onWalletButtonClick}>{walletButtonText}</Button>
    </Toolbar>
  </AppBar>
}