const express = require('express');
const router = express.Router();
const { Blockchain } = require('../model/block_chain');
const P2Pserver = require('../utils/p2p-server');

/**
 * Create new blockchain instance
 */
const meCoin = new Blockchain();

/**
 * Create instance of P2P server
 */
const p2pserver = new P2Pserver(meCoin);

/**
 * API TO INTERACT WITH THE BLOCKCHAIN
 */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'MeCoin' });
});

router.get('/blocks', (req, res) => {

  // const block1 = Block.generateNextBlock(meCoin.getLastBlock(), {
  //   sender: 'minh',
  //   receiver: 'gia'
  // });
  // meCoin.addNewBlock({
  //   sender: 'minh',
  //   receiver: 'gia'
  // });
  // meCoin.addNewBlock({
  //   sender: 'gia',
  //   receiver: 'minh'
  // });

  console.log(meCoin.blockchain);

  res.status(200).json(meCoin.blockchain);
});

router.post('/mine', (req, res) => {

  const data = req.body.data;
  const newBlock = meCoin.addNewBlock(data);
  p2pserver.syncChain();
  res.redirect('/blocks');
});
// router.get('/peers', (req, res) => {
//   res.send(getSockets().map(( s: any ) => s._socket.remoteAddress + ':' + s._socket.remotePort));
// });
// router.post('/addPeer', (req, res) => {
//   connectToPeers(req.body.peer);
//   res.send();
// });

p2pserver.listen();

module.exports = router;
