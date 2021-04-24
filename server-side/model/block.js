const { calculateHash, getCurrentTimestamp } = require('../utils/helper');
class Block {
  // public index: number;
  // public timestamp: number;
  // public data: Transaction[];
  // public previousHash: string;
  // public hash: string;

  constructor(index, timestamp, transactions, previousHash) {
    this.index = index;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.hash = calculateHash(index, previousHash, timestamp, transactions, 0);
  }

  static generateFirstBlock() { return new Block(0, 0, 'Hello, world!', '0'); }

  static generateNextBlock = (lastBlock, data) => { // to mine block
    const nextIndex = lastBlock.index + 1;
    const nextTimestamp = getCurrentTimestamp();
    const nextData = JSON.stringify(data);
    const previousHash = lastBlock.hash;

    return new Block(nextIndex, nextTimestamp, nextData, previousHash);
  }

  static isValidBlock = (currentBlock, previousBlock) => {

    // console.log(1);
    if (Block.isValidBlockStructure(currentBlock) === false) {
      return false;
    }
    // console.log(2);
    if (currentBlock.hash !== calculateHash(currentBlock.index, currentBlock.previousHash, currentBlock.timestamp, currentBlock.transactions, 0)) {
      return false;
    }
    // console.log(3);
    if (currentBlock.previousHash !== previousBlock.hash) {
      return false;
    }

    return true;
  }

  static isValidBlockStructure = (block) => (typeof block.index === 'number' && typeof block.hash === 'string' && typeof block.previousHash === 'string' && typeof block.timestamp === 'number' && typeof block.transactions === 'string');

}

module.exports = { Block };