// import { getCurrentTimestamp, calculateHash } from '../helper';
// import { Block } from './block';
const { getCurrentTimestamp, isValidBlockStructure } = require('../helper');
const { Block } = require('./block');

class Blockchain {

  // private blockchain: Block[];
  constructor() {
    this.blockchain = [this.generateFirstBlock()];
  }

  generateFirstBlock = () => new Block(0, getCurrentTimestamp(), 'Hello, world!', '0');

  generateNextBlock = (data) => {
    const lastBlock = this.getLastBlock();

    const nextIndex = lastBlock.index + 1;
    const nextTimestamp = getCurrentTimestamp();
    const nextData = JSON.stringify(data);
    const previousHash = lastBlock.hash;

    return new Block(nextIndex, nextTimestamp, nextData, previousHash);
  }

  addNewBlock = (newBlock) => {
    if (isValidBlockStructure(newBlock) === false)
      return false;
    this.blockchain.push(newBlock);
    return true;
  }

  getLastBlock = () => this.blockchain[this.blockchain.length - 1];

  getBlockchain = () => this.blockchain;
}

module.exports = { Blockchain }