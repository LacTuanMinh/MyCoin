import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { IconButton } from '@material-ui/core';
import { ChevronLeft, Equalizer, LocationSearching, Receipt } from '@material-ui/icons';

const drawerWidth = '20vw';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerContainer: {
    overflow: 'auto',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
}));

export default function SideBar({ open, setOpen, location, setLocation, history }) {
  const classes = useStyles();

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleSelect = (value) => {
    setLocation(value);
    switch (value) {
      case 0: history.push('/sendTransaction'); break;
      case 1: history.push('/accountStatistic'); break;
      case 2: history.push('/explorer'); break;
    }
    handleDrawerClose();
  }

  return (
    // <div className={classes.root}>

    <Drawer
      open={open}
      className={classes.drawer}
      anchor='left'
      variant="temporary"
      classes={{
        paper: classes.drawerPaper,
      }}
      onClose={handleDrawerClose}
    >
      <div className={classes.drawerHeader}>
        <IconButton onClick={handleDrawerClose}>
          <ChevronLeft />
        </IconButton>
      </div>
      {/* <Toolbar /> */}
      <div className={classes.drawerContainer}>
        <List>
          <ListItem button key={0} selected={location === 0} onClick={() => { handleSelect(0) }}>
            <ListItemIcon><Receipt /> </ListItemIcon>
            <ListItemText primary={'Send transation'} />
          </ListItem>
          <ListItem button key={1} selected={location === 1} onClick={() => { handleSelect(1) }}>
            <ListItemIcon><Equalizer /> </ListItemIcon>
            <ListItemText primary={'Account statistic'} />
          </ListItem>
        </List>
        <Divider />
        <List>
          <ListItem button key={0} selected={location === 2} onClick={() => { handleSelect(2) }}>
            <ListItemIcon> <LocationSearching /> </ListItemIcon>
            <ListItemText primary={'MyCoin explorer'} />
          </ListItem>
        </List>
      </div>
    </Drawer>

    // </div>
  );
}
