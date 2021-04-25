const CryptoJS = require('crypto-js');
const lookupTable = {
  '0': '0000', '1': '0001', '2': '0010', '3': '0011', '4': '0100',
  '5': '0101', '6': '0110', '7': '0111', '8': '1000', '9': '1001',
  'a': '1010', 'b': '1011', 'c': '1100', 'd': '1101',
  'e': '1110', 'f': '1111'
};
module.exports = {
  getCurrentTimestamp: _ => Date.now(),

  calculateHash: (index, prevHash, timestamp, data, difficulty, nonce) => CryptoJS.SHA256(index + prevHash + timestamp + JSON.stringify(data) + difficulty + nonce).toString(),

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