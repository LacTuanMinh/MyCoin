const CryptoJS = require('crypto-js');
const lookupTable = {
  '0': '0000', '1': '0001', '2': '0010', '3': '0011', '4': '0100',
  '5': '0101', '6': '0110', '7': '0111', '8': '1000', '9': '1001',
  'a': '1010', 'b': '1011', 'c': '1100', 'd': '1101',
  'e': '1110', 'f': '1111'
};
module.exports = {
  getCurrentTimestamp: _ => Date.now(),

  calculateHash: (index, prevHash, timestamp, data, nonce) => CryptoJS.SHA256(index + prevHash + timestamp + JSON.stringify(data) + nonce).toString(),

  hexToBinary: (hashInHex) => {
    let result = '';

    for (let i = 0; i < hashInHex.length; i = i + 1) {
      if (lookupTable[hashInHex[i]]) {
        result += lookupTable[hashInHex[i]];
      } else {
        return null;
      }
    }
    return result;
  }
}

// const getCurrentTimestamp = () => Date.now();

// const calculateHash = (index, prevHash, timestamp, data, nonce) => CryptoJS.SHA256(index + prevHash + timestamp + JSON.stringify(data) + nonce).toString();

// const isValidChain = (blockchainToValid) => {

//   // if (JSON.stringify(blockchainToValid[0]) !== JSON.stringify(Block.generateFirstBlock())) {
//   //   return false;
//   // }

//   for (let i = 1; i < blockchainToValid.length; i++) {
//     const currentBlock = blockchainToValid[i];
//     const previousBlock = blockchainToValid[i - 1];

//     if (module.exports.isValidBlock(currentBlock, previousBlock) === false) {
//       return false;
//     }
//   }

//   return true;
// };

// const isValidBlock = (currentBlock, previousBlock) => {

//   // console.log(1);
//   if (module.exports.isValidBlockStructure(currentBlock) === false) {
//     return false;
//   }
//   // console.log(2);
//   if (currentBlock.hash !== module.exports.calculateHash(currentBlock.index, currentBlock.previousHash, currentBlock.timestamp, currentBlock.transactions, 0)) {
//     return false;
//   }
//   // console.log(3);
//   if (currentBlock.previousHash !== previousBlock.hash) {
//     return false;
//   }

//   return true;
// };

// const isValidBlockStructure = (block) => (typeof block.index === 'number' && typeof block.hash === 'string' && typeof block.previousHash === 'string' && typeof block.timestamp === 'number' && typeof block.transactions === 'string');

// const hexToBinary = (hashInHex) => {
//   let result = '';

//   for (let i = 0; i < hashInHex.length; i = i + 1) {
//     if (lookupTable[hashInHex[i]]) {
//       result += lookupTable[hashInHex[i]];
//     } else {
//       return null;
//     }
//   }
//   return result;
// }

// module.exports = {
//   getCurrentTimestamp, calculateHash, hexToBinary, isValidBlock, isValidBlockStructure, isValidChain
// }