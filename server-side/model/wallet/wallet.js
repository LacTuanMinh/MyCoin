const { genKeyPair, publicKeyFromPrivateKey } = require("../../utils/helper");
const fs = require('fs');
const { TxInput, TxOutput, Transaction } = require("./transaction");
const { MINING_REWARD } = require("../../logic.config");
const location = 'key_storage/private_key';

class Wallet {
  constructor() {
    if (fs.existsSync(location)) {
      return;
    }
    this.privateKey = genKeyPair().getPrivate().toString();
    fs.writeFileSync(location, this.privateKey);
    console.log(this.privateKey);
  }

  getPublicKeyFromPrivateKey = () => publicKeyFromPrivateKey(this.privateKey);

  getBalance = (unspentTxOutputs) => this.findMyUnspentTxOutputs(unspentTxOutputs).map(uTxO => uTxO.amount).sum();

  findMyUnspentTxOutputs = (unspentTxOutputs) => {
    const address = this.getPublicKeyFromPrivateKey(); // address = public key
    return unspentTxOutputs.filter(uTxO => uTxO.address === address);
  }

  findEnoughUnspentTxOutPuts = (amount, myUnspentTxOutputs) => {
    let sum = 0;
    const chosenTxOutputs = [];

    for (const uTxO in myUnspentTxOutputs) {
      sum += uTxO.amount;
      chosenTxOutputs.push(uTxO);
      if (sum >= amount) {
        return { chosenTxOutputs, change: sum - amount };
      }
    };

    console.log('Not enough coin');
    throw Error('Not enough coin');
  }

  createTxInput = (unspentTxOutput) => {

    const txInput = new TxInput();
    txInput.txOutputIndex = unspentTxOutput.txOutputIndex;
    txInput.txOutputId = unspentTxOutput.txOutputId;
    return txInput;

  }

  createTxOutputs = (receiverAddress, amount, myAddress, change) => {
    const txOutputs = [new TxOutput(receiverAddress, amount)];

    if (change > 0) {
      txOutputs.push(new TxOutput(myAddress, change));
    }

    return txOutputs;
  }

  createTx = (amount, receiverAddress, unspentTxOutputs) => {

    const myAddress = this.getPublicKeyFromPrivateKey();
    const myUnspentTxOutputs = this.findMyUnspentTxOutputs(unspentTxOutputs);
    const { chosenTxOutputs, change } = this.findEnoughUnspentTxOutPuts(amount, myUnspentTxOutputs);

    const unsignedTxInputs = chosenTxOutputs.map(output => this.createTxInput(output)); // : TxInput[]
    const txOutputs = this.createTxOutputs(receiverAddress, amount, myAddress, change);

    const transaction = new Transaction();
    transaction.txInputs = unsignedTxInputs;
    transaction.txOutputs = txOutputs;
    transaction.id = transaction.getTxId();

    transaction.txInputs.forEach(input => {
      input.signature = input.getSignature(transaction, unspentTxOutputs, this.privateKey);
    });

    return transaction;
  }

  getCoinbaseTx = (blockIndex) => {
    const transaction = new Transaction();
    const txInput = new TxInput();
    txInput.signature = ''; // no need in coinbase tx because it does not spend from a UTXO
    txInput.txOutputIndex = blockIndex;
    txInput.txOutputId = ''; // no need

    const txOutput = new TxOutput(this.getPublicKeyFromPrivateKey(), MINING_REWARD);

    transaction.txInputs = [txInput];
    transaction.txOutputs = [txOutput];
    transaction.id = transaction.getTxId();

    return transaction;
  }

  // toString() {
  //   return `Wallet - publicKey: ${this.publicKey.toString()}, balance: ${this.balance}`;
  // }
}

module.exports = { Wallet }