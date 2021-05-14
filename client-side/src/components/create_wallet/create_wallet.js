import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import AccountBalanceWalletOutlinedIcon from '@material-ui/icons/AccountBalanceWalletOutlined';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import { List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CheckIcon from '@material-ui/icons/Check';
import CryptoJs from 'crypto-js';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import { keyPairFromPrivateKey, publicKeyFromPrivateKey, validatePass } from '../../utils/helper';

const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  shadow: {
    boxShadow: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
    borderRadius: '8px'
  }
}));

const warnings = [
  'Password must be 9 characters at least (contain both letter and number)',
  'You should note down your password, there is NO WAY TO RESET YOUR PASSWORD because we don\'t keep anything about your wallet',
  'Your Keystore File should be safely and confidentially kept in your computer, you may lose your balance if this file is leaked',
  'You will need this Password + Keystore File to unlock your wallet'
];

export default function CreateWallet({ isLoggedIn, setIsLoggedIn }) {
  const history = useHistory();
  const classes = useStyles();
  const [validPassword, setValidPassword] = useState(null);
  const [password, setPassword] = useState("");//minhkhtn123
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      history.push('/dashboard');
    }
  }, [isLoggedIn]);

  const handlePasswordChange = (value) => {
    setPassword(value);
    if (validatePass(value)) {
      setValidPassword(true);
    } else {
      setValidPassword(false);
    }
  }

  const handleGenKeyStoreFile = () => {
    if (validatePass(password) === false) {
      setValidPassword(false);
      return;
    }

    const keyPair = ec.genKeyPair('hex');

    console.log(keyPair.getPrivate().toString(16), '*', keyPair.getPublic().encode('hex'));

    const encryptedPrivKey = CryptoJs.AES.encrypt(keyPair.getPrivate().toString(16) + '/' + password, password);

    // const privateK = CryptoJs.AES.decrypt(
    //   encrypted, password
    // ).toString(CryptoJs.enc.Utf8);


    // console.log(publicKeyFromPrivateKey(privateK));


    // console.log(plain);
    const element = document.createElement("a");
    const textFile = new Blob([encryptedPrivKey], { type: 'text/plain' });
    element.href = URL.createObjectURL(textFile);
    element.download = "keystore";
    document.body.appendChild(element);
    element.click();

    setOpenDialog(true);
  }

  return (
    <React.Fragment>
      <Container maxWidth="md" component="main" style={{ marginTop: '5vw' }}>
        <Grid container alignItems='flex-start' spacing={6}>
          <Grid item key={0} sm={12} md={6} >
            <Container component="main" maxWidth="sm" style={{ marginBottom: '40px' }}>
              <div className={classes.paper} >
                <Avatar className={classes.avatar}>
                  <AccountBalanceWalletOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                  Generate new wallet
                </Typography>
                <form className={classes.form} noValidate>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    label="Password to encrypt private key"
                    type="password"
                    id="password"
                    onChange={e => handlePasswordChange(e.target.value)}
                    value={password}
                  />
                  {
                    validPassword !== null ? (
                      validPassword ?
                        <Typography align='left' style={{ color: 'green' }}><i>Password is valid</i></Typography>
                        :
                        <Typography align='left' style={{ color: 'red' }}><i>Password is not valid</i></Typography>
                    )
                      :
                      <React.Fragment></React.Fragment>
                  }
                  <Button
                    fullWidth
                    variant="contained"
                    color="secondary"
                    className={classes.submit}
                    onClick={handleGenKeyStoreFile}
                  >
                    Generate keystore file
                  </Button>
                  <Grid container>
                    <Grid item>
                      <Link onClick={() => { history.push('/accessWallet') }} href="" variant="body2">
                        {"Already have an acount? Access wallet"}
                      </Link>
                    </Grid>
                  </Grid>
                </form>
              </div>
            </Container>
          </Grid>
          <Grid item key={1} sm={12} md={6} className={classes.shadow}>
            <Container component="main" maxWidth="lg" style={{ margin: '40px 0' }}>
              <Typography variant="h5" className={classes.title}>
                Please read carefully before continue
              </Typography>
              <div >
                <List dense={false}>
                  {warnings.map((warning, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={warning}
                      />
                    </ListItem>
                  )
                  )}
                </List>
              </div>
            </Container>
          </Grid>
        </Grid>
      </Container>
      <SuccessAlertDialog open={openDialog} setOpen={setOpenDialog} />
    </React.Fragment>
  );
}

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function SuccessAlertDialog({ open, setOpen }) {

  const history = useHistory();

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle id="alert-dialog-slide-title">{"Generate your wallet successfully"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            You need to use this keystore file to unlock your wallet in the next step.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { history.push('/accessWallet') }} color="primary">
            <b>Now unlock your wallet</b>
          </Button>
        </DialogActions>
      </Dialog>
    </div >
  );
}