const express = require('express');
const Block = require('../model/block');
const Blockchain = require('../model/block_chain');
const router = express.Router();
const TxPool = require('../model/wallet/transaction_pool');
const Wallet = require('../model/wallet/wallet');
const P2Pserver = require('../utils/p2p_server');

/**
 * Create transaction pool
 */
const txPool = new TxPool();

/**
 * Create new blockchain instance
 */
const unspentTxOutputs = []; // : UnspentTxOutput[]

const setUnspentTxOutputs = (newUnspentTxOutputs) => {
  unspentTxOutputs.length = 0;
  unspentTxOutputs.push(...newUnspentTxOutputs);
}

module.exports = { txPool, setUnspentTxOutputs, unspentTxOutputs }

const meCoin = new Blockchain();

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
  return res.send({ blockchain: meCoin.blockchain });
});

router.get('/blocks/:hash', (req, res) => {
  return res.send({
    block: meCoin.findBlock(req.params.hash)
  });
});

router.get('/transactions/:id', (req, res) => {
  return res.send({
    transaction: meCoin.findBlock(req.params.hash)
  });
});

// show information about a specific address
router.get('/address/:address', (req, res) => {
  const _unspentTxOutputs = unspentTxOutputs.find(uTxO => uTxO.address === req.params.address);
  return res.send({ unspentTxOutputs: _unspentTxOutputs });
});

router.get('/myUnspentTxOutputs', (req, res) => {
  return res.send({ unspentTxOutputs: wallet.findMyUnspentTxOutputs(unspentTxOutputs) });
});


//front-end của Dapps gửi tx tới~   CÓ KHẢ NĂNG LOGIC SẼ CODE LẠI NHƯ sendTransaction
router.post('/mineRawBlock', (req, res) => {

  const data = req.body.data;// transaction or transaction[]

  try {
    if (data === null) {
      throw Error('missing transactions');
    }

    const newBlock = Block.generateRawNextBlock(meCoin.getLastBlock(), data);

    if (meCoin.addBlockToChain(newBlock)) {
      p2pserver.broadcastSyncChain(); // broadcast latest block to other peers
      return res.status(201).send({ newBlock });
    }

    throw Error('data not valid');

  } catch (err) {
    console.log(err.message);
    return res.status(400).send({ msg: err.message });
  }
});


// lấy tx trong pool ra
router.post('/mineBlock', (req, res) => {

  const newBlock = meCoin.generateNextBlock(wallet, txPool.txsInPool);

  if (meCoin.addBlockToChain(newBlock)) {

    p2pserver.broadcastSyncChain();
    return res.status(201).send({ newBlock });
  }

  return res.status(400).send({ msg: 'data not valid' });
});

router.get('/balance', (req, res) => {
  return res.send({ balance: wallet.getBalance() });
});

router.get('/address', (req, res) => {
  return res.send({ address: wallet.getPublicKeyFromPrivateKey() });
});

// [coinbase, tx]
router.post('/mineTransaction', (req, res) => {

  const { address, amount } = req.body;

  try {

    if (address === undefined || amount === undefined) {
      throw Error('invalid address or amount');
    }
    const newBlock = meCoin.generateNextBlockWithTx(
      unspentTxOutputs, wallet, address, amount, txPool.txsInPool
    );
    if (meCoin.addBlockToChain(newBlock)) {
      p2pserver.broadcastSyncChain(); // broadcast latest block to other peers
      return res.status(201).send({ newBlock });
    }

    throw Error('data not valid');
  } catch (err) {
    console.log(err);
    return res.status(400).send({ msg: err.message });
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
    console.log(157, err.message);
    res.status(400).send({ msg: err.message });
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

module.exports = { router };
