const Block = require("./block");
const { Transaction } = require("./wallet/transaction");
const fs = require('fs');

class Blockchain {

  // blockchain: Block[];
  constructor() {
    const { unspentTxOutputs, txPool, setUnspentTxOutputs } = require('../routes');
    this.setUnspentTxOutputs = setUnspentTxOutputs;
    this.txPool = txPool;

    // đọc file lên
    this.blockchain = [].concat(readBlocksFromLocalStorage());
    // console.log(this.blockchain);

    // const txs = [];
    // this.blockchain.forEach(block => {
    //   block.transactions.forEach(tx => txs.push(tx));
    // })
    // console.log(22, unspentTxOutputs);

    if (this.blockchain.length === 1) {
      setUnspentTxOutputs(Transaction.processTransactions(this.blockchain[0].transactions, unspentTxOutputs, 0));
    }

    this.unspentTxOutputs = unspentTxOutputs;
  }

  static isValidChain = (blockchainToValid) => {

    if (JSON.stringify(blockchainToValid[0]) !== JSON.stringify(Block.generateGenesisBlock())) {
      console.log('invalid genesis block');
      return { validChain: false, newUnspentTxOutputs: null };
    }

    let _unspentTxOutputs = [];

    for (let i = 1; i < blockchainToValid.length; i++) {
      const currentBlock = blockchainToValid[i];
      const previousBlock = blockchainToValid[i - 1];

      if (Block.isValidBlock(currentBlock, previousBlock) === false) {
        return { validChain: false, newUnspentTxOutputs: null };
      }

      _unspentTxOutputs = Transaction.processTransactions(currentBlock.transactions, _unspentTxOutputs, currentBlock.index);

      if (_unspentTxOutputs === null) {
        return { validChain: false, newUnspentTxOutputs: null };
      }
    }

    return { validChain: true, newUnspentTxOutputs: _unspentTxOutputs };
  }

  findBlock = (index) => this.blockchain.find(block => block.index === index);

  findTx = (id) => {

    for (const block of this.blockchain) {
      for (const tx of block.transactions) {
        if (tx.id === id) {
          return { tx, index: block.index };
        }
      }
    }
  }

  /**
   * 
   * where the unspentTxOutputs of this node was updated
   */
  addBlockToChain = (newBlock) => {
    // const { setUnspentTxOutputs } = require('../routes');

    if (Block.isValidBlock(newBlock, this.getLastBlock())) {
      const retVal /** :UnspentTxOutput[] */ = Transaction.processTransactions(newBlock.transactions, this.unspentTxOutputs, newBlock.index);

      if (retVal === null) {
        console.log('block is not valid in terms of transactions');
        return false;
      }

      console.log('block info is valid');
      this.blockchain.push(newBlock);
      this.setUnspentTxOutputs(retVal);
      this.txPool.updateTxPool(this.unspentTxOutputs);
      saveBlocksToLocalStorage(this.blockchain);
      return true;
    }
    console.log('Block info is not valid');
    return false;
  }

  //a way for the unconfirmed transaction to find its way
  //         from the local transaction pool to a block mined by the same node.
  generateNextBlock = (wallet, txPool /** :Transaction[] */) => {

    if (txPool.length === 0) {
      return null;
    }
    const lastBlock = this.getLastBlock();
    const coinbaseTx = wallet.getCoinbaseTx(lastBlock.index + 1);
    const newBlock = Block.generateRawNextBlock(this.getBlockchain(), [coinbaseTx, ...txPool]);
    return newBlock;
  }

  generateNextBlockWithTx = (unspentTxOutputs, wallet, receiverAddress, amount, txPool) => {
    if (typeof receiverAddress !== 'string') {
      throw Error('invalid address type', receiverAddress);
    }
    if (Transaction.isValidAddress(receiverAddress) === false) {
      throw Error('invalid address struct', receiverAddress);
    }
    if (typeof amount !== 'number') {
      throw Error('invalid amount');
    }

    const coinbaseTx = wallet.getCoinbaseTx(this.getLastBlock().index + 1);
    const transaction = wallet.createTx(amount, receiverAddress, unspentTxOutputs, txPool);
    const blockData = [coinbaseTx, transaction];
    const newBlock = Block.generateRawNextBlock(this.getBlockchain(), blockData);
    return newBlock;
  }

  getLastBlock = () => this.blockchain[this.blockchain.length - 1];

  getBlockchain = () => this.blockchain;

  /**
   * longest chain rule: when 2 nodes generate same indiced block, which chain is longer after that will be added to the block chain
   *                     and discard the other one
   * @param {*} newChain: Block[]
   */
  replaceChain = (newChain) => {

    const { setUnspentTxOutputs } = require('../routes').setUnspentTxOutputs;

    if (newChain.length <= this.blockchain.length) {
      console.log('No need to replace chain');
      return false;
    }

    const { validChain, newUnspentTxOutputs } = Blockchain.isValidChain(newChain);
    if (validChain === false) {
      console.log('Received chain is invalid');
      return false;
    }

    console.log("Replacing the current chain with new chain");
    this.blockchain = newChain;
    setUnspentTxOutputs(newUnspentTxOutputs);
    this.txPool.updateTxPool(newUnspentTxOutputs);
    saveBlocksToLocalStorage(newChain);
    return true;
  }
}
const location = 'data_storage/blocks.txt';

const readBlocksFromLocalStorage = () => {

  if (fs.existsSync(location)) {
    const rawData = fs.readFileSync(location, 'utf-8');
    const rawBlocks = JSON.parse(rawData);
    const blocks = Block.parseBlockFromRawObject(rawBlocks);
    return blocks;
  } else {
    const blocks = [Block.generateGenesisBlock()];
    fs.writeFileSync(location, JSON.stringify(blocks));
    return blocks;
  }
}

const saveBlocksToLocalStorage = (blockchain) => {
  fs.writeFileSync(location, JSON.stringify(blockchain));
}

module.exports = Blockchain;