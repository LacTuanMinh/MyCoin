import { makeStyles, Tooltip } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Badge from '@material-ui/core/Badge';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Link from '@material-ui/core/Link';
import MenuIcon from '@material-ui/icons/Menu';
import { FileCopy, Refresh, Title } from '@material-ui/icons';
import { API_URL } from '../../utils/constant';
import { publicKeyFromKeyPair } from '../../utils/helper';

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
    boxShadow: '2px 3px 6px rgba(0,0,0,0.16), 2px 3px 6px rgba(0,0,0,0.23)',
    borderRadius: '8px'
  }

}));

export default function DashBoard({ isLoggedIn, setIsLoggedIn, keyPair }) {
  const classes = useStyles();
  const history = useHistory();
  const [balance, setBalance] = useState(-1);
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
  }

  useEffect(() => {
    if (!isLoggedIn || keyPair === null) {
      history.push('/accessWallet');
    }
    queryMyBalance();

  }, []);

  return (
    <div>
      <Container maxWidth="lg" className={classes.container}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper className={`${classes.smallPadding} ${classes.shadow}`} style={{ minHeight: '170px' }}>
              <Address publicKey={publicKey} />
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

function Address({ publicKey }) {
  const handleCopyAddress = () => {
    let textArea = document.createElement("textarea");
    textArea.value = publicKey;

    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      const msg = successful ? 'successful' : 'unsuccessful';
      console.log('Fallback: Copying text command was ' + msg);
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
    }

    document.body.removeChild(textArea);
  }
  return (
    <React.Fragment >
      <Typography component="h2" variant="h6" color="primary" align='left'>
        Your wallet address
      </Typography>
      <Typography component="p" color='textSecondary' style={{ wordWrap: 'break-word', textAlign: 'left' }}>
        {publicKey}
      </Typography>
      <div style={{ marginTop: '15px', textAlign: 'right' }}>
        <Tooltip title='Copy address' placement='bottom'>
          <IconButton onClick={handleCopyAddress}>
            <FileCopy />
          </IconButton>
        </Tooltip>
      </div>
    </React.Fragment>
  );
}

export function Balance({ balance, queryMyBalance }) {
  const classes = useStyles();

  return (
    <React.Fragment >
      <Typography component="h2" variant="h6" color="primary" align='left'>
        Total balance
      </Typography>
      <Typography component="p" variant="h4" color='textSecondary' style={{ wordWrap: 'break-word', textAlign: 'left' }}>
        {balance} coin(s)
      </Typography>
      <div style={{ marginTop: '70px', textAlign: 'right' }}>
        <Tooltip title='Refresh balance' placement='bottom'>
          <IconButton onClick={queryMyBalance}>
            <Refresh />
          </IconButton>
        </Tooltip>
      </div>
    </React.Fragment>
  );
}
