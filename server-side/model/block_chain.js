const { unspentTxOutputs, txPool } = require("../routes");
const Block = require("./block");
const { Transaction } = require("./wallet/transaction");

class Blockchain {

  // private blockchain: Block[];
  constructor() {
    this.blockchain = [Block.generateGenesisBlock()];
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

  /**
   * 
   * where the unspentTxOutputs of this node was updated
   */
  addBlockToChain = (newBlock) => {

    if (Block.isValidBlock(newBlock, this.getLastBlock())) {
      const retVal /** :UnspentTxOutput[] */ = Transaction.processTransactions(newBlock.transactions, unspentTxOutputs, newBlock.index);

      if (retVal === null) {
        console.log('block is not valid in terms of transactions');
        return false;
      }

      this.blockchain.push(newBlock);
      unspentTxOutputs = retVal;
      txPool.updateTxPool(unspentTxOutputs);
      return true;
    }

    return false;
  }

  //a way for the unconfirmed transaction to find its way
  //         from the local transaction pool to a block mined by the same node.
  generateNextBlock = (wallet, txPool /** :Transaction[] */) => {

    const lastBlock = this.getLastBlock();
    const coinbaseTx = wallet.getCoinbaseTx(lastBlock.index + 1);

    const newBlock = Block.generateRawNextBlock(lastBlock, [coinbaseTx, ...txPool]);
    return newBlock;
  }

  generateNextBlockWithTx = (unspentTxOutputs, wallet, receiverAddress, amount, txPool) => {
    if (typeof receiverAddress !== 'string') {
      throw Error('invalid address', receiverAddress);
    }
    if (typeof amount !== 'number') {
      throw Error('invalid amount');
    }

    const coinbaseTx = wallet.getCoinbaseTx(this.getLastBlock().index + 1);
    const transaction = wallet.createTx(amount, receiverAddress, unspentTxOutputs, txPool);
    const blockData = [coinbaseTx, transaction];
    const newBlock = Block.generateRawNextBlock(this.getLastBlock(), blockData);
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

    if (newChain.length <= this.blockchain.length) {
      console.log('No need to replace chain');
      return false;
    }

    // if (Blockchain.isValidChain(newChain) === false) {
    //   console.log('Received chain is invalid');
    //   return false;
    // }

    // console.log("Replacing the current chain with new chain");
    // this.blockchain = newChain;
    // return true;

    const { validChain, newUnspentTxOutputs } = Blockchain.isValidChain(newChain);
    if (validChain === false) {
      console.log('Received chain is invalid');
      return false;
    }

    console.log("Replacing the current chain with new chain");
    this.blockchain = newChain;
    unspentTxOutputs = newUnspentTxOutputs;
    txPool.updateTxPool(newUnspentTxOutputs);
    return true;
  }
}

module.exports = Blockchain;