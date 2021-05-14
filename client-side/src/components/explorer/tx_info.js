import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { API_URL } from '../../utils/constant';
import { Container, Link, makeStyles, Paper, TableContainer, Typography } from '@material-ui/core';

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

export default function Transaction() {
  const classes = useStyles();
  const txId = useParams().id;
  const [tx, setTx] = useState(null);
  const [blockIndex, setBlockIndex] = useState(0);
  const history = useHistory();

  const queryTx = async (id) => {

    const res = await fetch(`${API_URL}/transactions/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const result = await res.json();
    setTx(result.transaction);
    setBlockIndex(result.blockIndex);
    console.log(result.transaction);
  }

  const redirectToWalletInfo = (address) => {
    history.push(`/explorer/address/${address}`);
  }

  useEffect(() => {
    queryTx(txId);
  }, []);

  return (
    <>
      {
        tx ?
          <Container maxWidth='lg' className={classes.container}>
            <Typography variant='h5' align='left' gutterBottom>Transaction detail</Typography>
            <Paper className={`${classes.shadow}`}>
              <TableContainer >
                <Table >
                  <TableBody style={{ marign: '10px' }}>
                    <TableRow hover style={{ cursor: 'pointer' }}>
                      <TableCell style={{ width: '20%' }}> ID: </TableCell>
                      <TableCell> {tx.id} </TableCell>
                    </TableRow>
                    <TableRow hover style={{ cursor: 'pointer' }}>
                      <TableCell style={{ width: '25%' }} > Status:</TableCell>
                      <TableCell style={{ fontWeight: 'bold', color: '#1A96A4' }}> Successful </TableCell>
                    </TableRow>
                    <TableRow hover style={{ cursor: 'pointer' }}>
                      <TableCell style={{ width: '25%' }} > Block index (block height):</TableCell>
                      <TableCell>
                        <Link onClick={() => { history.push(`/explorer/block/${blockIndex}`) }}>{blockIndex}</Link>
                      </TableCell>
                    </TableRow>
                    <TableRow hover style={{ cursor: 'pointer' }}>
                      <TableCell style={{ width: '25%' }}> Sender: </TableCell>
                      <TableCell><div style={{ overflow: 'hidden' }}>{tx.sender === '' ? 'Coinbase txn' : <Link onClick={() => { redirectToWalletInfo(tx.sender) }}>{tx.sender}</Link>}</div></TableCell>
                    </TableRow>
                    <TableRow hover style={{ cursor: 'pointer' }}>
                      <TableCell style={{ width: '25%' }}> Receiver: </TableCell>
                      <TableCell><Link onClick={() => { redirectToWalletInfo(tx.receiver) }}>{tx.receiver}</Link></TableCell>
                    </TableRow>
                    <TableRow hover style={{ cursor: 'pointer' }}>
                      <TableCell style={{ width: '25%' }}> Amount: </TableCell>
                      <TableCell> {tx.txOutputs.find(output => output.address === tx.receiver).amount} coin(s) </TableCell>
                    </TableRow>

                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Container>
          :
          <></>
      }
    </>
  );
}