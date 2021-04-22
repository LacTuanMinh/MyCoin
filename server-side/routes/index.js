const express = require('express');
const router = express.Router();
const { Blockchain } = require('../model/block_chain');

const meCoin = new Blockchain();

router.get('/', function (req, res, next) {
  res.render('index', { title: 'MeCoin' });
});

router.get('/blocks', (req, res) => {
  const block1 = meCoin.generateNextBlock({
    sender: 'minh',
    receiver: 'gia'
  });
  meCoin.addNewBlock(block1);
  const block2 = meCoin.generateNextBlock({
    sender: 'gia',
    receiver: 'minh'
  })
  meCoin.addNewBlock(block2);

  console.log(meCoin.blockchain);

  res.status(200).end();
});

// router.get('/blocks', (req, res) => {
//   res.send(getBlockchain());
// });
// router.post('/mineBlock', (req, res) => {
//   const newBlock: Block = generateNextBlock(req.body.data);
//   res.send(newBlock);
// });
// router.get('/peers', (req, res) => {
//   res.send(getSockets().map(( s: any ) => s._socket.remoteAddress + ':' + s._socket.remotePort));
// });
// router.post('/addPeer', (req, res) => {
//   connectToPeers(req.body.peer);
//   res.send();
// });

module.exports = router;
