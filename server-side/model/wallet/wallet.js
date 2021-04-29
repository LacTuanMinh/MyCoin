const { INITIAL_BALANCE } = require("../../logic.config");
const { genKeyPair } = require("../../utils/helper");

class Wallet {
  constructor() {
    this.balance = INITIAL_BALANCE;
    this.keyPair = genKeyPair();
    this.publicKey = this.keyPair.getPublic().encode('hex');
  }

  toString() {
    return `Wallet - publicKey: ${this.publicKey.toString()}, balance: ${this.balance}`;
  }
}