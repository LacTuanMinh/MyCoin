import React, { useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { useHistory } from 'react-router-dom';
import AccountBalanceWalletOutlinedIcon from '@material-ui/icons/AccountBalanceWalletOutlined';
import VpnKeyIcon from '@material-ui/icons/VpnKey';

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

const footers = [
  {
    title: 'Company',
    description: ['Team', 'History', 'Contact us', 'Locations'],
  },
  {
    title: 'Features',
    description: ['Cool stuff', 'Random feature', 'Team feature', 'Developer stuff', 'Another one'],
  },
  {
    title: 'Resources',
    description: ['Resource', 'Resource name', 'Another resource', 'Final resource'],
  },
  {
    title: 'Legal',
    description: ['Privacy policy', 'Terms of use'],
  },
];

export default function Home({ isLoggedIn }) {
  const classes = useStyles();
  const history = useHistory();
  const tiers = [
    {
      title: 'Access wallet',
      buttonText: 'Go on with your wallet',
      buttonVariant: 'outlined',
      onClick: () => {
        history.push('/accessWallet');
      }
    },
    {
      title: 'Create wallet',
      buttonText: 'Let\'s generate your own wallet',
      buttonVariant: 'contained',
      onClick: () => { history.push('/createWallet'); }
    }
  ];

  useEffect(() => {
    if (isLoggedIn) {
      history.push('/dashboard');
    }
  }, [isLoggedIn]);

  return (
    <React.Fragment>
      <CssBaseline />
      <Container maxWidth="sm" component="main" className={classes.heroContent}>
        <Typography component="h1" variant="h2" align="center" color="textPrimary" gutterBottom>
          MyCoin Wallet
        </Typography>
        <Typography variant="h6" align="center" color="textSecondary" component="p">
          MyCoin Wallet is a free, client-side interface helping you interact with the MyCoin blockchain. Our easy-to-use, open-source platform allows you to generate wallets, explore blockchain status, and so much more.
        </Typography>
      </Container>
      {/* End hero unit */}
      <Container maxWidth="md" component="main">
        <Grid container spacing={9} alignItems="flex-start">
          {tiers.map((tier) => (
            // Enterprise card is full width at sm breakpoint
            <Grid item key={tier.title} xs={12} sm={6}>
              <Card className={classes.paper}>
                <CardHeader
                  title={tier.title}
                  titleTypographyProps={{ align: 'center', color: "secondary" }}
                  className={classes.cardHeader}

                />
                <CardContent style={{ margin: '5vw 0' }} >
                  {
                    tier.title === 'Create wallet' ?
                      <AccountBalanceWalletOutlinedIcon style={{ width: '80px', height: '80px' }} color="secondary" /> : <VpnKeyIcon style={{ width: '80px', height: '80px' }} color="secondary" />
                  }
                </CardContent>
                <CardActions>
                  <Button fullWidth variant={tier.buttonVariant} color="secondary" onClick={() => tier.onClick()}>
                    {tier.buttonText}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
      <CssBaseline />
      <Container maxWidth="sm" component="main" className={classes.heroContent}>
        <Typography component="h1" variant="h2" align="center" color="textPrimary" gutterBottom>
          MyCoin Explorer
        </Typography>
        <Typography variant="h6" align="center" color="textSecondary" component="p">
          A Block Explorer and Analytics Platform for MyCoin
         </Typography>
        <Button style={{ marginTop: '15px' }} onClick={() => { history.push('/explorer') }} variant="contained" color='primary'>To explorer</Button>
      </Container>
    </React.Fragment >
  );
}