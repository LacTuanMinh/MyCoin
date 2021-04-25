const WebSocket = require('ws');
const config = require('../application.properties.json');
const p2p_port = process.env.P2P_PORT || config.P2P_PORT;
const peers = process.env.PEERS ? process.env.PEERS.split(',') : []; // PEERS = ws://localhost:5002 P2P_PORT=5001 HTTP_PORT=3001 npm run dev


class P2Pserver {

  constructor(blockchain) {
    this.blockchain = blockchain;
    this.sockets = [];
  }

  // create a new p2p server and connections
  listen() {
    // create the p2p server with port as argument
    const server = new WebSocket.Server({ port: p2p_port });

    // event listener and a callback function for any new connection
    // on any new connection the current instance will send the current chain
    // to the newly connected peer
    server.on('connection', (socket) => { this.connectSocket(socket) }); /// đăng ký sẵn đợi ngta connect vảo

    // to connect to the peers that we have specified
    this.connectToPeers();

    console.log(`Listening for peer to peer connection on port : ${p2p_port}`);
  }

  // after making connection to a socket
  connectSocket(socket) {
    console.log("Socket connected");

    // push the socket to the socket array
    this.sockets.push(socket);

    // register a message event listener to the socket
    this.messageHandler(socket);

    // on new connection, send the blockchain chain to the peer
    this.sendChain(socket);
  }

  connectToPeers() {

    //connect to each available peer
    peers.forEach(peer => { // mình chủ động đi connect với ngta
      // create a socket for each available peer
      const socket = new WebSocket(peer);

      // 'open event listner' is emitted when a connection is established.
      // saving the socket in the array after established
      socket.on('open', () => { this.connectSocket(socket) });
    });
  }

  messageHandler(socket) {

    socket.on('message', message => {//on recieving a message execute a callback function
      const data = JSON.parse(message);
      this.blockchain.replaceChain(data.chain);
    });
  }

  sendChain(socket) {
    socket.send(JSON.stringify({
      // type: MESSAGE_TYPE.chain,
      chain: this.blockchain.blockchain
    }));
  }

  /**
   * sync the chain whenever a new block is added to the blockchain
   * 
   */
  syncChain() {
    this.sockets.forEach(socket => {
      this.sendChain(socket);
    });
  }
}

module.exports = P2Pserver;