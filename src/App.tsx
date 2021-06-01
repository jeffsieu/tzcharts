import { Route, BrowserRouter as Router, Switch as RouterSwitch } from 'react-router-dom';

import './App.css';
import { createMuiTheme, ThemeProvider, CssBaseline, Theme, makeStyles, Drawer, Toolbar, useMediaQuery } from '@material-ui/core';
import { TezosPriceProvider } from 'contexts/TezosPrice';
import MainAppBar from 'components/MainAppBar';
import { TezosAccountProvider } from 'contexts/TezosAccount';
import { TokenListProvider } from 'contexts/TokenList';
import { PropsWithChildren, useState } from 'react';
import TokenPage from 'pages/TokenPage';
import HomePage from 'pages/HomePage';
import {blue} from '@material-ui/core/colors';
import AccountBalanceList from 'components/AccountBalanceList';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flexGrow: 1,
  },
}));

export default function App(props: PropsWithChildren<{}>) {
  const classes = useStyles();
  const theme = createMuiTheme({
    palette: {
      type: 'dark',
      primary: blue,
    },
  });

  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const toggleDrawer = () => {
    setDrawerOpen(!isDrawerOpen);
  }
  const isDrawerPersistent = useMediaQuery(theme.breakpoints.up('xl'));
  const drawerVariant = isDrawerPersistent ? 'persistent' : 'temporary';

  return (
    <div className={classes.root}>
      <TezosPriceProvider>
        <TezosAccountProvider>
          <TokenListProvider>
            <Router>
              <ThemeProvider theme={theme}>
                <CssBaseline></CssBaseline>
                  <MainAppBar onRightMenuClick={toggleDrawer}></MainAppBar>
                <Drawer
                  anchor="right"
                  open={isDrawerOpen}
                  variant={drawerVariant}
                  onClose={() => setDrawerOpen(false)}
                  >
                    <Toolbar/>
                  <AccountBalanceList></AccountBalanceList>
                </Drawer>
                <RouterSwitch>
                  <Route exact path="/"><HomePage /></Route>
                  <Route path="/token/:address/:tokenId" children={<TokenPage />}></Route>
                  <Route path="/token/:address" children={<TokenPage />}></Route>
                  {/* <Redirect from="/token/:address" to="/token/:address/0"></Redirect> */}
                </RouterSwitch>
              </ThemeProvider>
            </Router>
          </TokenListProvider>
        </TezosAccountProvider>
      </TezosPriceProvider>
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons"
      rel="stylesheet"></link>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
    </div>
  )
}