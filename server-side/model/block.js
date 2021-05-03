const { calculateHash, getCurrentTimestamp } = require('../utils/helper');
const { DIFFICULTY, MINE_RATE } = require('../logic.config');
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

  static generateGenesisBlock() { return new Block(0, 0, 'Hello, world!', '0', DIFFICULTY, 0, '123546879'); }

  //////////////////////
  static generateRawNextBlock = (lastBlock, data) => { // to mine block
    const nextIndex = lastBlock.index + 1;
    let nextTimestamp;
    const nextData = JSON.stringify(data);
    const previousHash = lastBlock.hash;
    let difficulty = lastBlock.difficulty;
    let nonce = -1;
    let hash;

    do {
      nonce++;
      nextTimestamp = getCurrentTimestamp();
      difficulty = Block.getAdjustDifficulty(lastBlock, nextTimestamp);
      hash = calculateHash(nextIndex, nextTimestamp, nextData, previousHash, difficulty, nonce)
    } while (hash.substring(0, difficulty) !== '0'.repeat(difficulty));

    return new Block(nextIndex, nextTimestamp, nextData, previousHash, difficulty, nonce, hash);
  }

  // static generateNextBlockWithTx = (lastBlock, unspentTxOutputs, wallet, receiverAddress, amount) => {
  //   if (typeof receiverAddress !== 'string') {
  //     throw Error('invalid address', receiverAddress);
  //   }
  //   if (typeof amount !== 'number') {
  //     throw Error('invalid amount');
  //   }

  //   const coinbaseTx = wallet.getCoinbaseTx(lastBlock.index + 1);
  //   const transaction = wallet.createTx(amount, receiverAddress, unspentTxOutputs);
  //   const blockData = [coinbaseTx, transaction];

  //   return Block.generateRawNextBlock(lastBlock, blockData);
  // }

  ////////////
  static isValidBlock = (currentBlock, previousBlock) => {

    // console.log(1);
    if (Block.isValidBlockStructure(currentBlock) === false) {
      return false;
    }
    // console.log(2);
    // if (currentBlock.hash !== calculateHash(currentBlock.index, currentBlock.previousHash, currentBlock.timestamp, currentBlock.transactions, 0)) {
    //   return false;
    // }
    if (currentBlock.hash !== calculateHash(previousBlock.index + 1, previousBlock.hash, currentBlock.timestamp, currentBlock.transactions, 0)) {
      return false;
    }

    // console.log(3);
    if (currentBlock.previousHash !== previousBlock.hash) {
      return false;
    }

    return true;
  }

  ////////////
  static isValidBlockStructure = (block) => (typeof block.index === 'number' && typeof block.timestamp === 'number' && typeof block.transactions === 'string' &&
    typeof block.previousHash === 'string' && typeof block.difficulty === 'number' && typeof block.nonce === 'number' && typeof block.hash === 'string'
  );

  ////////////////////////////////
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



}

module.exports = { Block };