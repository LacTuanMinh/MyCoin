const CryptoJS = require('crypto-js');
const { Blockchain } = require('./model/block_chain');

module.exports = {
  getCurrentTimestamp: _ => Math.floor(Date.now() / 1000),

  calculateHash: (index, prevHash, timestamp, data, nonce) => CryptoJS.SHA256(index + prevHash + timestamp + JSON.stringify(data) + nonce).toString(),

  isValidChain: (blockchainToValid) => {

    if (JSON.stringify(blockchainToValid[0]) !== JSON.stringify(Blockchain.generateFirstBlock())) {
      return false;
    }

    for (let i = 1; i < blockchainToValid.length; i++) {
      const currentBlock = blockchainToValid[i];
      const previousBlock = blockchainToValid[i - 1];

      if (currentBlock.hash !== calculateHash(currentBlock.index, currentBlock.previousHash, currentBlock.timestamp, currentBlock.data)) {
        return false;
      }
      if (currentBlock.previousHash !== previousBlock.hash)
        return false;
    }
    return true;
  },

  isValidBlockStructure: (block) => (typeof block.index === 'number' && typeof block.hash === 'string' && typeof block.previousHash === 'string' && typeof block.timestamp === 'number' && typeof block.data === 'string'),
}