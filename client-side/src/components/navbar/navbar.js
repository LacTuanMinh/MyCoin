import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import { Button } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import SideBar from './sidebar';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

export default function Navbar({ isLoggedIn, setIsLoggedIn, setKeyPair }) {
  const classes = useStyles();
  const history = useHistory();
  const [open, setOpen] = useState(false);
  const [location, setLocation] = useState(-1);

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          {
            isLoggedIn ?
              <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu" onClick={() => { setOpen(true) }}>
                <MenuIcon />
              </IconButton>
              :
              <></>
          }

          <Typography variant="h6" className={classes.title} align="left" style={{ cursor: 'pointer' }}
            onClick={() => {
              setLocation(-1);

              if (isLoggedIn) {
                history.push('/dashboard');
              } else {
                history.push('/');
              }
            }}>
            MyCoin Wallet
          </Typography>
          {
            isLoggedIn ?
              <Button color="inherit" variant="outlined" onClick={() => {
                setKeyPair(null);
                setIsLoggedIn(false);
                setLocation(-1)
                history.push('/accessWallet');
              }}>
                Log out
              </Button>
              :
              <Button color="inherit" variant="outlined" onClick={() => {
                history.push('/accessWallet');
              }}>
                Login
              </Button>
          }
        </Toolbar>
      </AppBar>
      <SideBar open={open} setOpen={setOpen} location={location} setLocation={setLocation} history={history} />
    </div >
  );
}
