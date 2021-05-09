const CryptoJS = require('crypto-js');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const uuidV1 = require('uuid').v1;

module.exports = {
  getCurrentTimestamp: _ => Date.now(),

  calculateHash: (index, prevHash, timestamp, data, difficulty, nonce) => CryptoJS.SHA256(index + prevHash + timestamp + JSON.stringify(data) + difficulty + nonce).toString(),

  genKeyPair: () => ec.genKeyPair(),

  keyPairFromPrivateKey: (privateKey) => ec.keyFromPrivate(privateKey, 'hex'),

  publicKeyFromPrivateKey: (privateKey) => ec.keyFromPrivate(privateKey, 'hex').getPublic().encode('hex'),

  genUUID: () => uuidV1(),

  verifySignature: (publicKey, signature, dataHash) => ec.keyFromPublic(publicKey, 'hex').verify(dataHash, signature), ///keyFromPublic(publicKey, 'hex').verify(dataHash, signature),

  byteArrayToHexString: (byteArray) => Array.from(byteArray, (byte) => {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join(''),
}