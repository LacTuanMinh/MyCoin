const express = require('express');
const Blockchain = require('../model/block_chain');
const router = express.Router();
// const Blockchain = require('../model/block_chain');
const TxPool = require('../model/wallet/transaction_pool');
const Wallet = require('../model/wallet/wallet');
const P2Pserver = require('../utils/p2p_server');

/**
 * Create new blockchain instance
 */
const meCoin = new Blockchain();
const unspentTxOutputs = []; // : UnspentTxOutput[]

/**
 * Create transaction pool
 */
const txPool = new TxPool();

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
  res.send({ blockchain: meCoin.blockchain });
});

router.get('/myUnspentTxOutputs', (req, res) => {
  res.send({ unspentTxOutputs: wallet.findMyUnspentTxOutputs(unspentTxOutputs) });
});

// router.post('/mineRawBlock')
///////////?????????????
// router.post('/mineBlock', (req, res) => {

//   const data = req.body.data;
//   const newBlock = meCoin.addNewBlock(data);
//   p2pserver.syncChain(meCoin);
//   res.redirect('/blocks');
// });

router.post('/mineTransaction', (req, res) => {

  const { address, amount } = req.body;

  try {

    if (address === undefined || amount === undefined) {
      throw Error('invalid address or amount');
    }

    // [coinbase, tx]
    const newBlock = meCoin.generateNextBlockWithTx(unspentTxOutputs, wallet, address, amount, txPool.txsInPool);

    if (meCoin.addBlockToChain(newBlock)) {
      p2pserver.broadcastSyncChain(); // broadcast latest block to other peers
      res.send(newBlock);
    }

  } catch (err) {
    console.log(err.message);
    res.status(400).send({ msg: e.message });
  }
});

/**
 * endpoint for s.o to send coin to another
 * creates a transaction to our local transaction pool,  “preferred” interface when we want to include a new transaction to the blockchain.
 */
router.post('/sendTransaction', (req, res) => {

  const { address, amount } = req.body;
  try {
    if (address === undefined || amount === undefined) {
      throw Error('invalid address or amount');
    }

    // sendTransaction
    const tx = wallet.createTx(amount, address, unspentTxOutputs, txPool);
    txPool.addToTxPool(tx, unspentTxOutputs);
    p2pserver.broadcastSendTxPool();
    res.status(200).send({ newTransaction: tx });

  } catch (err) {
    console.log(err.message);
    res.status(400).send({ msg: e.message });
  }

});

router.get('/transactionPool', (req, res) => {
  res.send({ txPool: txPool.getTxPool() });
})

router.get('/peers', (req, res) => {
  res.send(p2pserver.sockets.map(socket => socket._socket.remoteAddress + ':' + socket._socket.remotePort));
});

router.post('/addPeer', (req, res) => {
  p2pserver.connectToPeers(req.body.peer);
  res.send();
});

router.post('/stopServer', (req, res) => {
  process.exit();
})

p2pserver.listen();

module.exports = { router, txPool, unspentTxOutputs };
