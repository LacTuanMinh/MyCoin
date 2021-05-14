const express = require('express');
const router = express.Router();
const fs = require('fs');
// const Block = require('../model/block');
const Blockchain = require('../model/block_chain');
const { Transaction, UnspentTxOutput } = require('../model/wallet/transaction');
const { TxPool } = require('../model/wallet/transaction_pool');
const { Wallet, getBalance } = require('../model/wallet/wallet');
const P2Pserver = require('../utils/p2p_server');

/**
 * Create transaction pool
 */
const txPool = new TxPool();

/**
 * Create new blockchain instance
 */
const unspentTxOutputs = (() => {

  const location = 'data_storage/unspentTxOutputs.txt';

  if (fs.existsSync(location)) {
    const rawData = fs.readFileSync(location, 'utf-8');
    const rawUTxOs = JSON.parse(rawData);
    const uTxOs = UnspentTxOutput.parseUTxOFromRawObject(rawUTxOs);
    return uTxOs;
  } else {
    const uTxOs = [];
    fs.writeFileSync(location, JSON.stringify(uTxOs));
    return uTxOs;
  }

})(); // : UnspentTxOutput[]


const setUnspentTxOutputs = (newUnspentTxOutputs) => {
  unspentTxOutputs.length = 0;
  unspentTxOutputs.push(...newUnspentTxOutputs);
  fs.writeFileSync('data_storage/unspentTxOutputs.txt', JSON.stringify(unspentTxOutputs))
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
//*
router.get('/blocks', (req, res) => {
  console.log(meCoin.blockchain);
  return res.send({ blockchain: meCoin.blockchain });
});
//*
router.get('/blocks/:index', (req, res) => {
  console.log(meCoin.findBlock(+req.params.index));
  return res.send({
    block: meCoin.findBlock(+req.params.index)
  });
});
//*
router.get('/transactions/:id', (req, res) => {
  const result = meCoin.findTx(req.params.id)
  return res.send({
    transaction: result.tx,
    blockIndex: result.index
  });
});

// show information about a specific address X
// router.get('/address/:address', (req, res) => {
//   const _unspentTxOutputs = unspentTxOutputs.find(uTxO => uTxO.address === req.params.address);
//   return res.send({ unspentTxOutputs: _unspentTxOutputs });
// });
// router.get('/myUnspentTxOutputs', (req, res) => {
//   return res.send({ unspentTxOutputs: wallet.findMyUnspentTxOutputs(unspentTxOutputs) });
// });


// router.get('/balance', (req, res) => {
//   return res.send({ balance: wallet.getBalance(unspentTxOutputs) });
// });

// router.get('/address', (req, res) => {
//   return res.send({ address: wallet.getPublicKeyFromPrivateKey() });
// });

//* lấy tx trong pool ra
router.post('/mineBlock', (req, res) => {

  console.log('txPool: ', txPool);
  const newBlock = meCoin.generateNextBlock(wallet, txPool.txsInPool);

  if (meCoin.addBlockToChain(newBlock)) {

    p2pserver.broadcastSyncChain();
    return res.status(201).send({ newBlock });
  }

  return res.status(400).send({ msg: 'data not valid' });
});

// gửi coin lên, sau đó tạo block để mine [coinbase, tx]
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
 * endpoint for miner to send coin to another
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
    res.status(400).send({ msg: err.message });
  }

});

//*
router.get('/transactionPool', (req, res) => {
  res.send({ txPool: txPool.getTxPool() });
})
//*
router.get('/peers', (req, res) => {
  res.send(p2pserver.sockets.map(socket => socket._socket.remoteAddress + ':' + socket._socket.remotePort));
});
//*
router.post('/addPeer', (req, res) => {
  p2pserver.connectToPeers(req.body.peer);
  res.send();
});

router.post('/stopServer', (req, res) => {
  process.exit();
});

//* client section

router.get('/clientBalance/:address', (req, res) => {

  try {

    const balance = getBalance(req.params.address, unspentTxOutputs);
    return res.status(200).send({ balance });

  } catch (err) {

    console.log(err);
    return res.status(400).send({ msg: err.message });
  }
});

router.get('/unspentTxOutputs', (req, res) => {
  return res.send({ unspentTxOutputs: unspentTxOutputs });
});

//front-end của Dapps gửi tx tới~   CÓ KHẢ NĂNG LOGIC SẼ CODE LẠI NHƯ sendTransaction
router.post('/clientSendTransaction', (req, res) => {

  const rawTx = req.body.newTx;// transaction

  try {

    if (rawTx === null) {
      throw Error('missing transaction');
    }

    const newTx = Transaction.parseTxFromRawObject([rawTx])[0];
    console.log(newTx);
    txPool.addToTxPool(newTx, unspentTxOutputs);
    p2pserver.broadcastSendTxPool();

    res.status(200).send({ newTx });

  } catch (err) {
    console.log(err.message);
    return res.status(400).send({ msg: err.message });
  }
});

router.get('/clientTransactions/:address', (req, res) => {

  const address = req.params.address;

  if (!Transaction.isValidAddress(address)) {
    return res.status(400).send({ msg: 'Invalid address' });
  }

  const txs = [];
  const txsInPool = []

  meCoin.blockchain.forEach(block => {
    block.transactions.forEach(tx => {
      if (tx.sender === address || tx.receiver === address) {
        txs.push(tx);
      }
    });
  });

  txPool.txsInPool.forEach(tx => {
    if (tx.sender === address || tx.receiver === address) {
      txsInPool.push(tx);
    }
  })
  console.log(txs, txsInPool);
  return res.status(200).send({ txs, txsInPool });
})

p2pserver.listen();

module.exports = { router };
