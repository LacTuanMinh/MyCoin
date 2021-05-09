const { calculateHash, getCurrentTimestamp } = require('../utils/helper');
const { DIFFICULTY, MINE_RATE } = require('../logic_config');
const { Transaction } = require('./wallet/transaction');
class Block {
  // public index: number;
  // public timestamp: number;
  // public data: Transaction[];
  // public previousHash: string;
  // public hash: string;

  constructor(index, timestamp, transactions, previousHash, difficulty, nonce, hash) {
    this.index = index;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.difficulty = difficulty;
    this.nonce = nonce;
    this.hash = hash;
  }

  static generateGenesisBlock = () => {
    const index = 0;
    const timestamp = 0;
    const transactions = [Transaction.generateGeneisTx()];
    const previousHash = '';
    const nonce = 0;
    return new Block(index, timestamp, transactions, previousHash, 0, nonce, calculateHash(index, previousHash, timestamp, transactions, DIFFICULTY, nonce));
  }

  static generateRawNextBlock = (lastBlock, data) => { // to mine block by proof of work
    const nextIndex = lastBlock.index + 1;
    let nextTimestamp;
    const nextData = data;
    const previousHash = lastBlock.hash;
    let difficulty = lastBlock.difficulty;
    let nonce = -1;
    let hash;

    // here is the proof of work
    do {
      nonce++;
      nextTimestamp = getCurrentTimestamp();
      difficulty = Block.getAdjustDifficulty(lastBlock, nextTimestamp);
      hash = calculateHash(nextIndex, previousHash, nextTimestamp, nextData, difficulty, nonce)
    } while (hash.substring(0, difficulty) !== '0'.repeat(difficulty));

    return new Block(nextIndex, nextTimestamp, nextData, previousHash, difficulty, nonce, hash);
  }

  static isValidBlock = (currentBlock, previousBlock) => {

    // console.log(1);
    if (Block.isValidBlockStructure(currentBlock) === false) {
      console.log('invalid block structure');
      return false;
    }
    console.log(previousBlock);
    console.log(currentBlock);
    console.log(calculateHash(previousBlock.index + 1, previousBlock.hash, currentBlock.timestamp, currentBlock.transactions, 0));
    if (currentBlock.hash !==
      calculateHash(previousBlock.index + 1, previousBlock.hash, currentBlock.timestamp, currentBlock.transactions, currentBlock.difficulty, currentBlock.nonce)) {
      console.log('invalid hash');
      return false;
    }

    // console.log(3);
    if (currentBlock.previousHash !== previousBlock.hash) {
      console.log('invlaid prev hash');
      return false;
    }

    console.log('valid block');
    return true;
  }

  static isValidBlockStructure = (block) => {
    // console.log(69, block.transactions.map(tx => tx.isValidNormalTxStructure()).reduce((a, b) => (a && b), true));
    return (
      typeof block.index === 'number' &&
      typeof block.timestamp === 'number' &&  //&&
      typeof block.previousHash === 'string' && typeof block.difficulty === 'number' &&
      typeof block.nonce === 'number' && typeof block.hash === 'string'
    )
  };

  /**
   * return a new adjusted difficulty, have to continuously call this function each time we generate a new hash. Since the timestamp will also change when we generate a new hash
   * @param {*} lastBlock 
   * @param {*} currentTime 
   */
  static getAdjustDifficulty(lastBlock, currentTime) {
    let difficulty = lastBlock.difficulty;
    difficulty = lastBlock.timestamp + MINE_RATE > currentTime ? difficulty + 1 : difficulty - 1;
    return difficulty;
  }

  static parseBlockFromRawObject = (rawObject) => {
    const blocks = [];

    for (const rawBlock of rawObject) {
      const transactions = Transaction.parseTxFromRawObject(rawBlock.transactions);
      const aBlock = Object.assign(new Block(), rawBlock);
      aBlock.transactions = transactions;
      blocks.push(aBlock);

    }
    return blocks;
  }
}

module.exports = Block;