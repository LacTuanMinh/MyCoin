const WebSocket = require('ws');
const config = require('../application_properties.json');
const Block = require('../model/block');
const { Transaction, TxInput, TxOutput } = require('../model/wallet/transaction');
const { unspentTxOutputs, txPool } = require('../routes');
const p2p_port = process.env.P2P_PORT || config.P2P_PORT;
const peers = process.env.PEERS ? process.env.PEERS.split(',') : []; // PEERS = ws://localhost:5002 P2P_PORT=5001 HTTP_PORT=3001 npm run dev

const MessageType = {
  QUERY_LATEST: 0,
  QUERY_ALL: 1,
  RESPONSE_BLOCKCHAIN: 2,
  QUERY_TRANSACTION_POOL: 3,
  RESPONSE_TRANSACTION_POOL: 4
}

class P2Pserver {

  constructor(blockchain) {
    this.blockchain = blockchain;  // new Blockchain()
    this.sockets = [];
  }

  // create a new p2p server and connections
  listen() {
    const server = new WebSocket.Server({ port: p2p_port });

    // event listener and a callback function for any new connection
    // on any new connection the current instance will send the current chain
    // to the newly connected peer
    server.on('connection', (socket) => { this.initConnection(socket) }); /// đăng ký sẵn đợi ngta connect vảo

    // to connect to the peers that we have specified
    // this.connectToPeers();

    console.log(`Listening for peer to peer connection on port : ${p2p_port}`);
  }

  // after making connection to a socket
  initConnection(socket) {
    console.log("Socket connected");

    // push the socket to the socket array
    this.sockets.push(socket);

    // register a message event listener to the socket
    this.messageHandler(socket);
    this.errorHandler(socket);

    this.queryLastBlock(socket);

    // setTimeout(() => {
    // broadcast(queryTransactionPoolMsg());
    // }, 500);
    this.broadcastQueryTxPool();
  }

  connectToPeers(peer) {

    //connect to each available peer
    // peers.forEach(peer => { // mình connect với ngta
    const socket = new WebSocket(peer);      // create a socket for each available peer

    // 'open event listner' is emitted when a connection is established.
    // saving the socket in the array after established
    socket.on('open', () => { this.initConnection(socket) });
    // });
  }

  errorHandler(socket) {

    const closeConnection = (socket) => {
      console.log('connection failed to peer: ' + socket.url);
      this.sockets.splice(this.sockets.indexOf(socket), 1);
    };
    socket.on('close', () => closeConnection(socket));
    socket.on('error', () => closeConnection(socket));
  }

  messageHandler(socket) {

    socket.on('message', message => {//on recieving a message execute a callback function

      const data = JSON.parse(message);

      switch (data.type) {
        case MessageType.RESPONSE_BLOCKCHAIN:
          const rawBlocks = JSON.parse(data.data);
          const receivedBlocks = Block.parseBlockFromRawObject(rawBlocks);//parse go here

          // handle received blockchain
          this.handleBlockchainResponse(receivedBlocks);
          break;
        case MessageType.RESPONSE_TRANSACTION_POOL:
          const rawTxs = JSON.parse(data.data);
          const receivedTxs = Transaction.parseTxFromRawObject(rawTxs); // Transaction[] //// parse raw object into list of transaction

          // handle received transaction
          for (const tx of receivedTxs) {
            try {
              txPool.addToTxPool(tx, unspentTxOutputs);
              this.broadcastSendTxPool();
            } catch (err) {
              console.log(err.message);
              //probably already have it in our pool
            }
          }
          break;
        case MessageType.QUERY_ALL:
          this.sendChain(socket);
          break;
        case MessageType.QUERY_LATEST:
          this.sendLastBlock(socket);
          break;
        case MessageType.QUERY_TRANSACTION_POOL:
          this.sendTxPool();
          break;
      }
    });
  }

  /**
   * 
   * use with query all
   */
  sendChain(socket) {
    socket.send(JSON.stringify({
      type: MessageType.RESPONSE_BLOCKCHAIN,
      data: JSON.stringify(this.blockchain.getBlockchain())
    }));
  }

  /**
   * 
   * use with query latest 
   */
  sendLastBlock(socket) {
    socket.send(JSON.stringify({
      type: MessageType.RESPONSE_BLOCKCHAIN,
      data: JSON.stringify([this.blockchain.getLastBlock()]) // last block chính là block vừa thêm bên mecoin.addBlockToChain
    }));
  }

  /**
   * 
   * use with query tx pool
   */
  sendTxPool(socket) {
    socket.send(JSON.stringify({
      type: MessageType.RESPONSE_TRANSACTION_POOL,
      data: JSON.stringify(txPool.txsInPool)
    }));
  }

  /**
   * sync the chain whenever a new block is added to the blockchain
   * 119
   */
  broadcastSyncChain() {
    this.sockets.forEach(socket => {
      this.sendLastBlock(socket);
    });
  }

  /**
   * send tx to others node when mine new txs
   * also: type: MessageType.RESPONSE_TRANSACTION_POOL,
   * 187
   */
  broadcastSendTxPool() {
    this.sockets.forEach(socket => {
      this.sendTxPool(socket);
    });
  }

  /**
   * process block chain received from other node
   * type: MessageType.RESPONSE_BLOCKCHAIN,
   * 143
   */
  handleBlockchainResponse(receivedBlocks /** :Block[] */) {

    if (receivedBlocks.length === 0) {
      console.log('received blockchain length == 0');
      return;
    }

    const receivedLastBlock = receivedBlocks[receivedBlocks.length - 1];

    if (Block.isValidBlockStructure(receivedLastBlock) === false) {
      console.log('invalid block structure', receivedLastBlock);
      return;
    }

    const localLastBlock = this.blockchain.blockchain.getLastBlock();

    if (receivedLastBlock.index > localLastBlock.index) {
      console.log('need to update local blockchain', 'local index:' + localLastBlock.index, 'peer index: ' + receivedLastBlock.index);

      if (localLastBlock.hash === receivedLastBlock.previousHash) {  // lệch nhau 1 block

        if (this.blockchain.addBlockToChain(receivedLastBlock)) { // return true mean add successfully AND unspentTxOutputs was updated
          this.broadcastSyncChain(); // lại broadcast cho peer khác
        }

        return;
      }

      if (receivedBlocks.length === 1) {
        console.log('We have to query the whole chain from our peer'); // you ---<ask peer>---> peer -----<base on your socket re-send>---> you
        // broadcast(queryAllMsg());  /// not implemented yet
        this.broadcastQueryChain();
        return;
      }

      console.log('received blockchain is longer than local blockchain');

      if (this.blockchain.replaceChain(receivedBlocks)) {
        this.broadcastSyncChain();
      }

    } else {
      console.log('received blockchain is not longer than local blockchain. Do nothing');
    }
  }

  /**
   * query all blockchain from other peer
   */
  broadcastQueryChain() {
    this.sockets.forEach(socket => {
      socket.send(JSON.stringify({
        type: MessageType.QUERY_ALL,
        data: null
      }));
    });
  }

  /**
   * query last block from other peer
   */
  queryLastBlock(socket) {
    socket.send(JSON.stringify({
      type: MessageType.QUERY_LATEST,
      data: null
    }));
  }

  broadcastQueryTxPool() {
    this.sockets.forEach(socket => {
      socket.send(JSON.stringify({
        type: MessageType.QUERY_TRANSACTION_POOL,
        data: null
      }));
    });
  }
}

module.exports = P2Pserver;