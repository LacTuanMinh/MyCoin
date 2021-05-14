import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { API_URL } from '../../utils/constant';
import { Container, Grid, Link, makeStyles, Paper, TableContainer, Typography } from '@material-ui/core';
import moment from 'moment'
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

export default function Block() {
  const classes = useStyles();
  const index = useParams().index;
  const [block, setBlock] = useState(null);
  const history = useHistory();
  const queryBlock = async (id) => {

    const res = await fetch(`${API_URL}/blocks/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const result = await res.json();
    setBlock(result.block);
  }

  const redirectToWalletInfo = (address) => {
    history.push(`/explorer/address/${address}`);
  }

  useEffect(() => {
    queryBlock(index);
  }, []);

  return (
    <>
      {
        block ?
          <>
            <Container maxWidth='lg' className={classes.container}>
              <Typography variant='h5' align='left' gutterBottom>Block detail #{index}</Typography>
              <Paper className={`${classes.shadow}`}>
                <TableContainer >
                  <Table >
                    <TableBody style={{ marign: '10px', cursor: 'pointer' }} >
                      <TableRow hover>
                        <TableCell style={{ width: '20%' }}> Block height (index): </TableCell>
                        <TableCell> {block.index}</TableCell>
                      </TableRow>
                      <TableRow hover>
                        <TableCell style={{ width: '20%' }} > Timestamp: </TableCell>
                        <TableCell > {block.timestamp} - {moment(block.timestamp).format('DD/MM/YYYY hh:mm:ss A')} GMT+7 - {moment(block.timestamp).startOf('minutes').fromNow()} </TableCell>
                      </TableRow>
                      <TableRow hover>
                        <TableCell style={{ width: '20%' }}> Difficulty: </TableCell>
                        <TableCell>{block.difficulty}</TableCell>
                      </TableRow>
                      <TableRow hover>
                        <TableCell style={{ width: '20%' }}> Nonce: </TableCell>
                        <TableCell>{block.nonce}</TableCell>
                      </TableRow>
                      <TableRow hover>
                        <TableCell style={{ width: '20%' }} > Hash:</TableCell>
                        <TableCell>
                          {block.hash}
                        </TableCell>
                      </TableRow>
                      <TableRow hover>
                        <TableCell style={{ width: '20%' }} > Previous hash:</TableCell>
                        <TableCell>
                          {block.previousHash}
                        </TableCell>
                      </TableRow>
                      <TableRow hover>
                        <TableCell style={{ width: '20%' }}> Miner: </TableCell>
                        <TableCell><Link onClick={() => { redirectToWalletInfo(block.transactions[0].receiver) }}>{block.transactions[0].receiver}</Link></TableCell>
                      </TableRow>
                      <TableRow hover>
                        <TableCell style={{ width: '20%' }}> Total transaction: </TableCell>
                        <TableCell> {block.transactions.length} </TableCell>
                      </TableRow>

                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Container>
            <Container className={classes.cardGrid} maxWidth="lg">
              <Grid container>
                <Grid item xs={12} md={7}>

                  <Paper className={`${classes.shadow}`}>
                    <Typography align="left" variant='h6' style={{ padding: '20px' }}>Transaction in block</Typography>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow selected>
                            <TableCell key={1} className={classes.tableHeader} style={{ width: "25%" }}>ID</TableCell>
                            <TableCell key={2} className={classes.tableHeader} style={{ width: "20%" }}>Amount</TableCell>
                            <TableCell key={3} className={classes.tableHeader} style={{ width: "35%" }}>Address</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {
                            block.transactions.length === 0 ?
                              <TableRow key={0}>
                                <TableCell colSpan={5} align='center'>No record found</TableCell>
                              </TableRow>
                              :
                              block.transactions.map((tx, index) => {
                                return (
                                  <TableRow
                                    hover key={index} style={{ cursor: 'pointer' }}
                                  >
                                    <TableCell className={classes.tableBody}>
                                      <Link onClick={() => { history.push(`/explorer/transaction/${tx.id}`) }}>{tx.id.slice(0, 20).concat('...')}</Link>
                                    </TableCell>
                                    <TableCell className={classes.tableBody}>{tx.sender === '' ? tx.txOutputs[0].amount : tx.txOutputs.find(output => output.address === tx.receiver).amount}</TableCell>
                                    <TableCell className={classes.tableBody} >
                                      <div>
                                        From: {tx.sender === '' ? 'Coinbase txn' : <Link onClick={() => { redirectToWalletInfo(tx.sender) }}>{tx.sender.slice(0, 20).concat('...')}</Link>}
                                      </div>
                                      <div>
                                        To: <Link onClick={() => { redirectToWalletInfo(tx.receiver) }}>{tx.receiver.slice(0, 20).concat('...')}</Link>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                )
                              })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>

                </Grid>
              </Grid>
            </Container>
          </>
          :
          <></>
      }
    </>
  );
}