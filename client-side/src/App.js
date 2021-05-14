import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import CreateWallet from './components/create_wallet/create_wallet';
import AccessWallet from './components/access_wallet/access_wallet';
import DashBoard from './components/dashboard/dashboard';
import Navbar from './components/navbar/navbar';
import { useState } from 'react';
import Home from './components/home/home';
import { Box, Container, makeStyles, Typography, Link } from '@material-ui/core';
import SendTransaction from './components/send_transaction/send_transaction';
import WalletTransaction from './components/wallet_transaction/wallet_transaction';
import Explorer from './components/explorer/explorer';
import Block from './components/explorer/block_info';
import Transaction from './components/explorer/tx_info';
import WalletInfo from './components/explorer/wallet_info';


const useStyles = makeStyles((theme) => ({

  footer: {
    borderTop: `1px solid ${theme.palette.divider}`,
    marginTop: theme.spacing(20),
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    [theme.breakpoints.up('sm')]: {
      paddingTop: theme.spacing(6),
      paddingBottom: theme.spacing(6),
    },
  }
}));


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [keyPair, setKeyPair] = useState(null);
  const classes = useStyles();
  return (
    <Router>
      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} setKeyPair={setKeyPair} />

      <div className="App">
        <Switch>
          <Route path='/' exact>
            <Home isLoggedIn={isLoggedIn} />
          </Route>
          <Route path='/createWallet'>
            <CreateWallet isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
          </Route>
          <Route path='/accessWallet'>
            <AccessWallet isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} setKeyPair={setKeyPair} />
          </Route>
          <Route path='/dashboard'>
            <DashBoard isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} keyPair={keyPair} />
          </Route>
          <Route path='/sendTransaction'>
            <SendTransaction isLoggedIn={isLoggedIn} keyPair={keyPair} />
          </Route>
          <Route path='/accountStatistic'>
            <WalletTransaction isLoggedIn={isLoggedIn} keyPair={keyPair} />
          </Route>
          <Route path='/explorer' exact>
            <Explorer isLoggedIn={isLoggedIn} keyPair={keyPair} />
          </Route>
          <Route path='/explorer/block/:index' exact>
            <Block isLoggedIn={isLoggedIn} keyPair={keyPair} />
          </Route>
          <Route path='/explorer/transaction/:id' exact>
            <Transaction isLoggedIn={isLoggedIn} keyPair={keyPair} />
          </Route>
          <Route path='/explorer/address/:address' exact>
            <WalletInfo isLoggedIn={isLoggedIn} keyPair={keyPair} />
          </Route>
        </Switch>
      </div>
      <Container maxWidth="md" component="footer" className={classes.footer}>
        <Box mt={2}>
          <Typography variant="body2" color="textSecondary" align="center">
            {'Copyright © '}
            <Link color="inherit" href="https://localhost:3000">
              MyCoin Wallet
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
          </Typography>
        </Box>
      </Container>
    </Router>
  );
}



export default App;
