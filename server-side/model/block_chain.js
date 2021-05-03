const { Block } = require('./block');

class Blockchain {

  // private blockchain: Block[];
  constructor() {
    this.blockchain = [Block.generateGenesisBlock()];
  }

  static isValidChain = (blockchainToValid) => {

    if (JSON.stringify(blockchainToValid[0]) !== JSON.stringify(Block.generateGenesisBlock())) {
      return false;
    }

    for (let i = 1; i < blockchainToValid.length; i++) {
      const currentBlock = blockchainToValid[i];
      const previousBlock = blockchainToValid[i - 1];

      if (Block.isValidBlock(currentBlock, previousBlock) === false) {
        return false;
      }
    }

    return true;
  }

  addNewBlock = (data) => {
    const newBlock = Block.generateRawNextBlock(this.getLastBlock(), data);
    this.blockchain.push(newBlock);
    return newBlock;
  }

  generateNextBlockWithTx = (unspentTxOutputs, wallet, receiverAddress, amount) => {
    if (typeof receiverAddress !== 'string') {
      throw Error('invalid address', receiverAddress);
    }
    if (typeof amount !== 'number') {
      throw Error('invalid amount');
    }

    const coinbaseTx = wallet.getCoinbaseTx(this.getLastBlock().index + 1);
    const transaction = wallet.createTx(amount, receiverAddress, unspentTxOutputs);
    const blockData = [coinbaseTx, transaction];

    const newBlock = Block.generateRawNextBlock(this.getLastBlock(), blockData);
    this.blockchain.push(newBlock);
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

    if (Blockchain.isValidChain(newChain) === false) {
      console.log('Received chain is invalid');
      return false;
    }

    console.log("Replacing the current chain with new chain");
    this.blockchain = newChain;
    return true;
  }


}

module.exports = { Blockchain }