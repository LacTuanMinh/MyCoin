const express = require('express');
const router = express.Router();
const { Blockchain } = require('../model/block_chain');
const { UnspentTxOutput } = require('../model/wallet/transaction');
const { Wallet } = require('../model/wallet/wallet');
const P2Pserver = require('../utils/p2p-server');
const
/**
 * Create new blockchain instance
 */
const meCoin = new Blockchain();
const unspentTxOutputs = []; // : UnspentTxOutput[]
/**
 * Create instance of P2P server
 */
const p2pserver = new P2Pserver(meCoin);
/**
 * Create the wallet
 */
const wallet = new Wallet();

/**
 * API TO INTERACT WITH THE BLOCKCHAIN
 */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'MeCoin' });
});

router.get('/blocks', (req, res) => {
  console.log(meCoin.blockchain);
  res.status(200).json(meCoin.blockchain);
});
///////////?????????????
router.post('/mineBlock', (req, res) => {

  const data = req.body.data;
  const newBlock = meCoin.addNewBlock(data);
  p2pserver.syncChain();
  res.redirect('/blocks');
});

router.post('/mineTransaction', (req, res) => {

  const { address, amount } = req.body;
  const newBlock = meCoin.generateNextBlockWithTx(unspentTxOutputs, wallet, address, amount);

  try {
    p2pserver.syncChain();
    res.redirect('/blocks');
  } catch (err) {
    console.log(err.message);
    res.status(400).send(e.message);
  }

});

// router.

// router.get('/peers', (req, res) => {
//   res.send(getSockets().map(( s: any ) => s._socket.remoteAddress + ':' + s._socket.remotePort));
// });
// router.post('/addPeer', (req, res) => {
//   connectToPeers(req.body.peer);
//   res.send();
// });

p2pserver.listen();

module.exports = router;
