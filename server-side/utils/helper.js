const CryptoJS = require('crypto-js');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const uuidV1 = require('uuid/v1');

module.exports = {
  getCurrentTimestamp: _ => Date.now(),

  calculateHash: (index, prevHash, timestamp, data, difficulty, nonce) => CryptoJS.SHA256(index + prevHash + timestamp + JSON.stringify(data) + difficulty + nonce).toString(),

  genKeyPair: () => ec.gekenKeyPair(),

  keyFromPrivate: (privateKey) => ec.keyFromPrivate(privateKey, 'hex'),

  genUUID: () => uuidV1(),

  verifySignature: (publicKey, signature, dataHash) => ec.keyFromPublic(publicKey, 'hex').verify(dataHash, signature),
}