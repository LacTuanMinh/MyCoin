import { ec } from 'elliptic';
const EC = new ec('secp256k1');

export const validatePass = (pass) => pass.length >= 9 && pass.match(/^(?=.*?\d)(?=.*?[a-zA-Z])[a-zA-Z\d]+$/);

export const isValidAddress = (address) => {
  if (address.length !== 130) {
    console.log(address);
    console.log('invalid public key length');
    return false;
  } else if (address.match('^[a-fA-F0-9]+$') === null) {
    console.log('public key must contain only hex characters');
    return false;
  } else if (!address.startsWith('04')) {
    console.log('public key must start with 04');
    return false;
  }
  return true;
};

export const keyPairFromPrivateKey = (privateKey) => EC.keyFromPrivate(privateKey, 'hex');

export const publicKeyFromPrivateKey = (privateKey) => EC.keyFromPrivate(privateKey, 'hex').getPublic().encode('hex');

export const publicKeyFromKeyPair = (keyPair) => keyPair ? keyPair.getPublic().encode('hex') : null;

export const validateAmount = (balance, amount) => amount > 0 && amount <= balance;

export const byteArrayToHexString = (byteArray) => Array.from(byteArray, (byte) => {
  return ('0' + (byte & 0xFF).toString(16)).slice(-2);
}).join('');