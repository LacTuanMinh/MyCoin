import React, { useEffect, useState } from 'react';
import Link from '@material-ui/core/Link';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { publicKeyFromKeyPair } from '../../utils/helper';
import { useHistory } from 'react-router-dom';
import { Container, Grid, IconButton, Paper, TableContainer, TablePagination, Typography } from '@material-ui/core';
import { API_URL } from '../../utils/constant';
import { Refresh } from '@material-ui/icons';
import { Balance } from '../dashboard/dashboard';


const useStyles = makeStyles((theme) => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  shadow: {
    boxShadow: '0 4px 8px 5px rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
    borderRadius: '8px'
  },
  paper: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    overflowX: 'auto',
  },
  tableHeader: {
    fontWeight: 'bolder',
    fontSize: '17px',
    textAlign: 'center',
    padding: '10px',
    // backgroundColor: 'bal',
    // color: 'white'
  },
  tableBody: {
    textAlign: 'center',
    fontSize: '15px',
    padding: '8px'
  },
  smallPadding: {
    // backgroundColor: '#1A96A4',
    padding: '20px'
  },
}));

export default function WalletTransaction({ isLoggedIn, keyPair }) {
  const classes = useStyles();
  const publicKey = publicKeyFromKeyPair(keyPair);
  const history = useHistory();
  const [txs, setTxs] = useState([]);
  // const [txsInPool, setTxsInPool] = useState([]);
  const [selectedTx, setSelectedTx] = useState(null);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [balance, setBalance] = useState(-1);

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

  const queryMyTxs = async () => {
    const res = await fetch(`${API_URL}/clientTransactions/${publicKey}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    if (res.status === 400) {
      const result = await res.json();
      alert(result.msg);
      return;
    }

    const result = await res.json();
    // setTxs(result.txs);
    // setTxsInPool(result.txsInPool);
    const allTxs = []
    result.txsInPool.reverse().forEach(tx => {
      const type = (tx.sender === publicKey ? 'Send' : 'Receive');
      const amount = tx.txOutputs.find(output => output.address === tx.receiver).amount;

      allTxs.push({
        tx: tx,
        status: 'Pending',
        type: type,
        amount: amount
      });
    });

    result.txs.reverse().forEach(tx => {
      const type = tx.sender === '' ? 'Reward mining' : (tx.sender === publicKey ? 'Send' : 'Receive');
      const amount = type === '' ? tx.txOutputs[0].amount : tx.txOutputs.find(output => output.address === tx.receiver).amount;

      allTxs.push({
        tx: tx,
        status: 'Successful',
        type: type,
        amount: amount
      });
    });

    setTxs(allTxs);
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  useEffect(() => {
    if (!isLoggedIn || keyPair === null) {
      history.push('/accessWallet');
      return;
    }

    queryMyBalance();
    queryMyTxs();
  }, []);

  return (
    <Container className={classes.container}>
      <Grid container spacing={5}>
        <Grid item xs={12} md={7}>
          <Typography className={classes.container} color="primary" align="left" variant="h5">Your transactions
            <IconButton onClick={() => { queryMyTxs(); queryMyBalance(); }} size='small'>
              <Refresh />
            </IconButton>
          </Typography>
          <Paper className={`${classes.shadow}`}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell key={1} className={classes.tableHeader} style={{ width: "30%" }}>ID</TableCell>
                    <TableCell key={2} className={classes.tableHeader} style={{ width: "20%" }}>Type</TableCell>
                    <TableCell key={3} className={classes.tableHeader} style={{ width: "20%" }}>Amount</TableCell>
                    <TableCell key={4} className={classes.tableHeader} >Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {
                    txs.length === 0 ?
                      <TableRow key={0}>
                        <TableCell colSpan={4} align='center'>No record found</TableCell>
                      </TableRow>
                      :
                      txs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((tx, index) => {
                        return (
                          <TableRow
                            hover key={index} selected={selectedTx === index}
                            onClick={() => setSelectedTx(index)}
                          >
                            <TableCell className={classes.tableBody}>{tx.tx.id.slice(0, 20).concat('...')}</TableCell>
                            <TableCell className={classes.tableBody}>{tx.type}</TableCell>
                            <TableCell className={classes.tableBody}>{tx.amount}</TableCell>
                            <TableCell className={classes.tableBody} style={{ fontWeight: 'bold', color: (tx.status === 'Successful' ? '#1A96A4' : '#355c7d') }}>{tx.status}</TableCell>
                          </TableRow>

                        )
                      })}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[10, 25, 100]}
              component="div"
              count={txs.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onChangePage={handleChangePage}
              onChangeRowsPerPage={handleChangeRowsPerPage}
              style={{ backgroundColor: '#f1f3f4' }}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          {
            selectedTx !== null ?
              <div>
                <Typography className={classes.container} color="primary" align="left" variant="h5">Transaction detail</Typography>
                <Paper className={`${classes.shadow}`}>
                  <TableContainer >
                    <Table >
                      <TableBody style={{ marign: '10px' }}>
                        <TableRow hover>
                          <TableCell style={{ width: '20%' }}> ID: </TableCell>
                          <TableCell><Link style={{ cursor: 'pointer' }} onClick={() => { history.push(`/explorer/transaction/${txs[selectedTx].tx.id}`) }}> {txs[selectedTx].tx.id} </Link>  </TableCell>
                        </TableRow>
                        <TableRow hover>
                          <TableCell style={{ width: '20%' }}> Sender: </TableCell>
                          <TableCell>
                            {/* <div style={{ overflow: 'hidden' }}> */}
                            {txs[selectedTx].tx.sender === '' ? 'Coinbase txn' : (txs[selectedTx].tx.sender === publicKey ? txs[selectedTx].tx.sender : <Link style={{ cursor: 'pointer' }} onClick={() => { history.push(`/explorer/address/${txs[selectedTx].tx.sender}`) }}>{txs[selectedTx].tx.sender}</Link>)}
                            {/* </div> */}
                          </TableCell>
                        </TableRow>
                        <TableRow hover>
                          <TableCell style={{ width: '20%' }}> Receiver: </TableCell>
                          <TableCell>
                            {(txs[selectedTx].tx.receiver === publicKey ? txs[selectedTx].tx.receiver : <Link style={{ cursor: 'pointer' }} onClick={() => { history.push(`/explorer/address/${txs[selectedTx].tx.receiver}`) }}>{txs[selectedTx].tx.receiver}</Link>)}
                          </TableCell>
                        </TableRow>
                        <TableRow hover>
                          <TableCell style={{ width: '20%' }}> Type: </TableCell>
                          <TableCell> {txs[selectedTx].type} </TableCell>
                        </TableRow>
                        <TableRow hover>
                          <TableCell style={{ width: '20%' }}> Amount: </TableCell>
                          <TableCell> {txs[selectedTx].amount} </TableCell>
                        </TableRow>
                        <TableRow hover>
                          <TableCell style={{ width: '250px' }}> Status:</TableCell>
                          <TableCell> {txs[selectedTx].status} </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </div>
              :
              <></>
          }
          <Paper className={`${classes.smallPadding} ${classes.shadow}`} style={{ marginTop: '20px' }}>
            <Balance balance={balance} queryMyBalance={queryMyBalance} />
          </Paper>
        </Grid>

      </Grid>
    </Container >
  );
}