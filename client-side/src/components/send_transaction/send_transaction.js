import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { makeStyles, Button, TextField } from '@material-ui/core';
import { CheckCircle } from '@material-ui/icons';
import { API_URL } from '../../utils/constant';
import { isValidAddress, publicKeyFromKeyPair, validateAmount } from '../../utils/helper';
import { Balance } from '../dashboard/dashboard';
import { createTransaction } from '../../utils/gen_transaction';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  toolbarIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: 240,
    width: `calc(100% - ${240}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  menuButtonHidden: {
    display: 'none',
  },
  title: {
    flexGrow: 1,
  },
  drawerPaper: {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: 240,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9),
    },
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  fixedHeight: {
    height: 240,
  },
  depositContext: {
    flex: 1,
  },
  smallPadding: {
    // backgroundColor: '#1A96A4',
    padding: '20px'
  },
  shadow: {
    boxShadow: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
    borderRadius: '8px'
  }

}));

export default function SendTransaction({ isLoggedIn, keyPair }) {
  const classes = useStyles();
  const history = useHistory();
  const [balance, setBalance] = useState(-1);
  const [amount, setAmount] = useState(0);
  const [validAmount, setValidAmount] = useState(null);
  const [address, setAddress] = useState("");
  const [validAddress, setValidAddress] = useState(null);
  const publicKey = publicKeyFromKeyPair(keyPair);

  const queryMyBalance = async () => {
    const res = await fetch(`${API_URL}/clientBalance/${publicKey}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    const result = await res.json();
    setBalance(result.balance);
    // setValidAmount(12 > 0);
  }

  useEffect(() => {
    if (!isLoggedIn || keyPair === null) {
      history.push('/accessWallet');
    }
    queryMyBalance();

  }, []);

  const handleAmountChange = (value) => {
    if (balance === 0) {
      return;
    }
    setAmount(value);

    if (validateAmount(balance, value)) {
      setValidAmount(true);
    } else {
      setValidAmount(false);
    }
  }

  const handleAddressChange = (value) => {
    setAddress(value);

    if (isValidAddress(value)) {
      setValidAddress(true);
    } else { setValidAddress(false); }
  }

  const handleSend = async () => {
    handleAddressChange(address);
    handleAmountChange(amount);

    if (validAddress && validAmount) {

      const [res1, res2] = await Promise.all([
        fetch(`${API_URL}/unspentTxOutputs`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }),
        fetch(`${API_URL}/transactionPool`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        })
      ]);
      const [result1, result2] = await Promise.all([res1.json(), res2.json()]);

      try {
        const newTx = createTransaction(keyPair.getPrivate().toString(16), publicKey, +amount, address, result1.unspentTxOutputs, result2.txPool);
        console.log(newTx);
        const res = await fetch(`${API_URL}/clientSendTransaction`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ newTx }),
        });

        if (res.status === 400) {
          const result = await res.json();
          throw Error(result.msg);
        }
        alert('Your transaction is now waiting for authentication. It may take some times.')
      }
      catch (err) {
        alert(err.message);
      }
    } else {
      alert('Can not send coin');
    }
  }

  return (
    <div>
      <Container maxWidth="lg" className={classes.container}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Paper className={`${classes.smallPadding} ${classes.shadow}`} style={{ minHeight: '170px' }}>

              <Typography align="left" variant='h4' color='primary'>
                <b>Send coin</b>
              </Typography>
              <Container component="main" maxWidth="sm" style={{ marginTop: '20px', marginBottom: '20px' }}>
                <Grid container alignItems='center' spacing={6}>
                  <Grid item key={0} sm={11} >
                    <TextField
                      variant="outlined"
                      margin="normal"
                      required
                      fullWidth
                      label="Amount"
                      size='large'
                      type="number"
                      onChange={e => handleAmountChange(e.target.value)}
                      value={amount}
                    />
                    {
                      validAmount !== null ? (
                        validAmount ?
                          <></>
                          :
                          (
                            balance === 0 ?
                              <>
                                <Typography align='left' style={{ color: 'red' }}><i>Not enough balance</i></Typography>
                              </> :
                              <>
                                <Typography align='left' style={{ color: 'red' }}><i>Invalid amount</i></Typography>
                              </>
                          )
                      )
                        :
                        <></>
                    }
                  </Grid>
                  <Grid item key={1} sm={1} >
                    {validAmount ? <CheckCircle color="primary" /> : null}
                  </Grid>
                </Grid>
                <Grid container alignItems='center' spacing={6}>
                  <Grid item key={0} sm={11} >
                    <TextField
                      variant="outlined"
                      margin="normal"
                      required
                      fullWidth
                      label="Receiver address"
                      size='large'
                      onChange={e => handleAddressChange(e.target.value)}
                      value={address}
                    />
                    {
                      validAddress !== null ? (
                        validAddress ?
                          <></>
                          :
                          <Typography align='left' style={{ color: 'red' }}><i>Address is not valid</i></Typography>
                      )
                        :
                        <React.Fragment></React.Fragment>
                    }
                  </Grid>
                  <Grid item key={1} sm={1} >
                    {validAddress ? <CheckCircle color="primary" /> : null}
                  </Grid>
                </Grid>
                <Grid container alignItems='center' spacing={6}>
                  <Grid item key={0} sm={11} >
                    <Button
                      fullWidth
                      variant="contained"
                      color="secondary"
                      className={classes.submit}
                      size='large'
                      onClick={handleSend}
                    >
                      Send
                    </Button>
                  </Grid>
                </Grid>
              </Container>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4} >
            <Paper className={`${classes.smallPadding} ${classes.shadow}`} style={{ minHeight: '170px' }}>
              <Balance balance={balance} queryMyBalance={queryMyBalance} />
            </Paper>
          </Grid>
        </Grid>
        <Grid item xs={12}>

        </Grid>
      </Container>
    </div>
  );
}
