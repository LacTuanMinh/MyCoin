import React, { useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Link from '@material-ui/core/Link';
import { useHistory } from 'react-router-dom';
import { CardHeader, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField } from '@material-ui/core';
import { API_URL } from '../../utils/constant';
import moment from 'moment';
import { Refresh } from '@material-ui/icons';
import { Autocomplete } from '@material-ui/lab';

const useStyles = makeStyles((theme) => ({
  icon: {
    marginRight: theme.spacing(2),
  },
  heroContent: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(8, 0, 6),
  },
  heroButtons: {
    marginTop: theme.spacing(4),
  },
  cardGrid: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  cardMedia: {
    paddingTop: '56.25%', // 16:9
  },
  cardContent: {
    flexGrow: 1,
  },
  footer: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(6),
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
  shadow: {
    boxShadow: '0 4px 8px 5px rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
    borderRadius: '8px'
  },
}));

const cards = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export default function Explorer({ isLoggedIn, keyPair }) {
  const classes = useStyles();
  const history = useHistory();
  const [input, setInput] = useState("");
  const [validInput, setValidInput] = useState(null);
  const [txs, setTxs] = useState([]);
  const [txPage, setTxPage] = useState(0);
  const [txRowsPerPage, setTxRowsPerPage] = useState(5);
  const [blocks, setBlocks] = useState([]);
  const [blockPage, setBlockPage] = useState(0);
  const [blockRowsPerPage, setBlockRowsPerPage] = useState(5);
  const [txPool, setTxPool] = useState([]);
  const handleInputChange = (value) => {
    setInput(value);
    if (value.trim().length === 0) {
      setValidInput(false);
    } else {
      setValidInput(true)
    }
  }

  const handleChangePage = (event, newPage) => {
    setTxPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setTxRowsPerPage(+event.target.value);
    setTxPage(0);
  };
  const handleChangeBlockPage = (event, newPage) => {
    setBlockPage(newPage);
  };

  const handleChangeBlockRowsPerPage = (event) => {
    setBlockRowsPerPage(+event.target.value);
    setBlockPage(0);
  };

  const handleSearch = () => {

  }

  const queryAll = async () => {
    const [res1, res2] = await Promise.all([
      fetch(`${API_URL}/blocks`, {
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
    ]);// :Block[]

    const [result1, result2] = await Promise.all([res1.json(), res2.json()]);
    const blocks = result1.blockchain;

    const txs = [];
    blocks.forEach(block => {
      block.transactions.forEach(tx => { txs.push(tx) });
    });

    setBlocks(blocks.reverse());
    setTxPool(result2.txPool);
    setTxs(result2.txPool.concat(txs.reverse()));// { successTxs: txs.reverse(), pendingTxs: result2.txPool });
  }

  const redirectToWalletInfo = (address) => {
    history.push(`/explorer/address/${address}`);
  }

  useEffect(() => {
    // if (!isLoggedIn || keyPair === null) {
    //   history.push('/accessWallet');
    // }
    queryAll();

  }, []);
  return (
    <React.Fragment>
      <CssBaseline />
      <main>
        {/* Hero unit */}
        <div className={classes.heroContent}>
          <Container maxWidth="md">
            <Typography component="h1" variant="h2" align="center" color="textPrimary" gutterBottom>
              MyCoin Explorer <IconButton onClick={queryAll}><Refresh style={{ width: '60px', height: '60px' }} /></IconButton>
            </Typography>

            <Grid container spacing={5} alignItems="center">
              <Grid item xs={12} md={9}>
                <Autocomplete
                  freeSolo
                  options={txs.map(tx => 'Txn id: ' + tx.id).concat(blocks.map(block => 'Block index: ' + block.index)).concat(blocks.map(block => 'Block hash: ' + block.hash))}
                  renderInput={(params) => <TextField
                    {...params}
                    variant="outlined"
                    margin="dense"
                    required
                    fullWidth
                    label="Search by block hash or transaction id"
                    size='small'
                  // onChange={e => handleInputChange(e.target.value)}
                  // value={input}
                  />}
                />


              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  color="secondary"
                  // className={classes.submit}
                  size='medium'
                  onClick={handleSearch}
                >
                  Search
                </Button>
              </Grid>
            </Grid>
          </Container>

          {/* LATEST TRANSACTION */}
          <Container className={classes.cardGrid} maxWidth="md">
            <Paper className={`${classes.shadow}`}>
              <Typography align="left" variant='h6' style={{ padding: '20px' }}>Latest transaction</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow selected>
                      <TableCell key={1} className={classes.tableHeader} style={{ width: "25%" }}>ID</TableCell>
                      <TableCell key={2} className={classes.tableHeader} style={{ width: "20%" }}>Amount</TableCell>
                      <TableCell key={3} className={classes.tableHeader} style={{ width: "35%" }}>Address</TableCell>
                      <TableCell key={4} className={classes.tableHeader} >Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {
                      txs.length === 0 ?
                        <TableRow key={0}>
                          <TableCell colSpan={5} align='center'>No record found</TableCell>
                        </TableRow>
                        :
                        txs.slice(txPage * txRowsPerPage, txPage * txRowsPerPage + txRowsPerPage).map((tx, index) => {
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

                              {
                                txPool.includes(tx) ?
                                  <TableCell className={classes.tableBody} style={{ fontWeight: 'bold', color: '#355c7d' }}> Pending </TableCell>
                                  :
                                  <TableCell className={classes.tableBody} style={{ fontWeight: 'bold', color: '#1A96A4' }}>Successful</TableCell>
                              }

                            </TableRow>
                          )
                        })}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 15, 50]}
                component="div"
                count={txs.length}
                rowsPerPage={txRowsPerPage}
                page={txPage}
                onChangePage={handleChangePage}
                onChangeRowsPerPage={handleChangeRowsPerPage}
                style={{ backgroundColor: '#f1f3f4' }}
              />
            </Paper>
          </Container>

          {/* LATEST BLOCK */}
          <Container maxWidth="md">
            <Paper className={`${classes.shadow}`}>
              <Typography align="left" variant='h6' style={{ padding: '20px' }}>Latest block</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow selected>
                      <TableCell key={1} className={classes.tableHeader} style={{ width: "15%" }}>Index</TableCell>
                      <TableCell key={2} className={classes.tableHeader} style={{ width: "25%" }}>Mined at</TableCell>
                      <TableCell key={3} className={classes.tableHeader} style={{ width: "30%" }}>Miner</TableCell>
                      <TableCell key={4} className={classes.tableHeader} >Hash</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {
                      blocks.length === 0 ?
                        <TableRow key={0}>
                          <TableCell colSpan={4} align='center'>No record found</TableCell>
                        </TableRow>
                        :
                        blocks.slice(blockPage * blockRowsPerPage, blockPage * blockRowsPerPage + blockRowsPerPage).map((block, index) => {
                          return (
                            <TableRow
                              hover key={index}
                              style={{ cursor: 'pointer' }}
                            >
                              <TableCell className={classes.tableBody}>
                                <Link onClick={() => { history.push(`/explorer/block/${block.index}`) }} >{block.index}</Link>
                              </TableCell>
                              <TableCell className={classes.tableBody}>{moment(block.timestamp).format('DD/MM/YYYY hh:mm:ss A')} GMT+07</TableCell>
                              <TableCell className={classes.tableBody} >
                                <Link onClick={() => { redirectToWalletInfo(block.transactions[0].receiver) }}>
                                  {block.transactions[0].receiver.slice(0, 20).concat('...')}</Link>
                              </TableCell>
                              <TableCell className={classes.tableBody} /*style={{ fontWeight: 'bold', color: '#1A96A4' }}*/>{block.hash.slice(0, 20).concat('...')}</TableCell>
                            </TableRow>
                          )
                        })}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 15, 50]}
                component="div"
                count={blocks.length}
                rowsPerPage={blockRowsPerPage}
                page={blockPage}
                onChangePage={handleChangeBlockPage}
                onChangeRowsPerPage={handleChangeBlockRowsPerPage}
                style={{ backgroundColor: '#f1f3f4' }}
              />
            </Paper>
          </Container>
        </div>
      </main>
    </React.Fragment>
  );
}