import { Button, Container, Grid, Link, makeStyles, TextField, Typography } from '@material-ui/core';
import React, { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import { isValidAddress, keyPairFromPrivateKey, publicKeyFromPrivateKey, validatePass } from '../../utils/helper';
import CryptoJs from 'crypto-js';

const useStyles = makeStyles((theme) => ({
  '@global': {
    ul: {
      margin: 0,
      padding: 0,
      listStyle: 'none',
    },
  },
  appBar: {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  toolbar: {
    flexWrap: 'wrap',
  },
  toolbarTitle: {
    flexGrow: 1,
  },
  link: {
    margin: theme.spacing(1, 1.5),
  },
  heroContent: {
    padding: theme.spacing(8, 0, 6),
  },
  cardHeader: {
    backgroundColor:
      theme.palette.type === 'light' ? theme.palette.grey[200] : theme.palette.grey[700],
  },
  cardPricing: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'baseline',
    marginBottom: theme.spacing(2),
  },
  paper: {
    boxShadow: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
  }
}));

export default function AccessWallet({ isLoggedIn, setIsLoggedIn, setKeyPair }) {
  const classes = useStyles();
  const history = useHistory();
  const [target, setTarget] = useState(null);
  const [validPassword, setValidPassword] = useState(null);
  const [validTarget, setValidTarget] = useState(null);
  const [password, setPassword] = useState("");// minhkhtn123
  const hiddenFileInput = useRef(null);

  useEffect(() => {
    if (isLoggedIn) {
      history.push('/dashboard');
    }
  }, [isLoggedIn]);

  const handleUpload = (e) => {
    // alert('cx')
    hiddenFileInput.current.click();
  }

  const handleChange = event => {
    // alert('cmm')
    const fileUploaded = event.target.files[0];
    setTarget(fileUploaded);
    setValidTarget(true);
  };

  const handlePasswordChange = (value) => {
    setPassword(value);
    if (validatePass(value)) {
      setValidPassword(true);
    } else {
      setValidPassword(false);
    }
  }

  const handleAccess = () => {

    if (target === null) {
      setValidTarget(false);
      return;
    }
    if (validatePass(password) === false) {
      setValidPassword(false);
      return;
    }

    const handleFile = (e) => {
      const content = e.target.result;
      console.log(content);

      try {
        const decryptedContent = CryptoJs.AES.decrypt(content, password).toString(CryptoJs.enc.Utf8);


        const privateKey = decryptedContent.substring(0, decryptedContent.indexOf('/'));
        const _password = decryptedContent.substring(decryptedContent.indexOf('/') + 1);

        console.log(decryptedContent, '*', privateKey, '*', _password);

        if (password !== _password) {
          alert('Password to decrypt the keystore file is incorrect')
          return;
        }
        const keyPair = keyPairFromPrivateKey(privateKey);
        const publicKey = keyPair.getPublic().encode('hex');
        console.log(publicKey);

        if (isValidAddress(publicKey) === false) {

          alert('Keystore file is not valid in term of private key');
          return;
        }
        setKeyPair(keyPair);
        setIsLoggedIn(true);
        console.log(keyPair.getPrivate().toString(16));
        history.push('/dashboard');
      } catch (err) {
        console.log(err.message);
      }
    }

    const reader = new FileReader();

    reader.onloadend = handleFile;

    reader.readAsText(target);
  }

  return (
    <Container maxWidth='lg' component="main" className={classes.heroContent}>
      <Typography component="h3" variant="h4" align="center" color="textPrimary" gutterBottom>
        Access MyCoin Wallet
      </Typography>

      <Container component="main" maxWidth="sm" style={{ marginTop: '60px' }}>
        <Grid container alignItems='center' spacing={6}>
          <Grid item key={0} sm={11} >
            <Button
              fullWidth
              variant="outlined"
              color="primary"
              size='large'
              className={classes.submit}
              onClick={handleUpload}
            >
              Upload keystore file
            </Button>
            {
              validTarget !== null ? (
                validTarget ?
                  <></>
                  :
                  <Typography align='left' style={{ color: 'red' }}><i>Please choose a file</i></Typography>
              )
                :
                <></>
            }
            <input type="file" style={{ display: 'none' }} ref={hiddenFileInput} onChange={handleChange} />
          </Grid>
          <Grid item key={1} sm={1} >
            {target ? <CheckCircleIcon color="primary" /> : null}
          </Grid>
        </Grid>
        <Grid container alignItems='center' spacing={6}>
          <Grid item key={0} sm={11} >
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              label="Password to encrypt private key"
              type="password"
              size='medium'
              onChange={e => handlePasswordChange(e.target.value)}
              value={password}
            />
            {
              validPassword !== null ? (
                validPassword ?
                  <></>
                  :
                  <Typography align='left' style={{ color: 'red' }}><i>Password is not valid</i></Typography>
              )
                :
                <React.Fragment></React.Fragment>
            }
          </Grid>
          <Grid item key={1} sm={1} >
            {validPassword ? <CheckCircleIcon color="primary" /> : null}
          </Grid>
        </Grid>
        <Grid container alignItems='center' spacing={6}>
          <Grid item key={0} sm={11} >
            <Button
              fullWidth
              variant="contained"
              color="secondary"
              // className={classes.s}
              size='large'
              onClick={handleAccess}
            >
              Access Wallet
            </Button>
            <Typography align="left" color="textSecondary" component="p" style={{ marginTop: '20px' }}>
              <Link onClick={() => { history.push('/createWallet') }} href="" variant="body1" >
                Don't have a wallet?
              </Link>
            </Typography>
          </Grid>
        </Grid>
      </Container>

    </Container >
  );
}