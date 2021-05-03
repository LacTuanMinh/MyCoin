const { verifySignature, keyPairFromPrivateKey, publicKeyFromPrivateKey } = require("../../utils/helper");
const CryptoJS = require('crypto-js');
const { MINING_REWARD } = require("../../logic.config");

class UnspentTxOutput {
  txOutputId;
  txOutputIndex;
  address;
  amount;

  constructor(txOutputId, txOutputIndex, address, amount) {
    this.txOutputId = txOutputId;
    this.txOutputIndex = txOutputIndex;
    this.address = address;
    this.amount = amount;
  }

  static findUnspentTxOutput = (transactionId, index, unspentTxOutputs /* : UnspentTxOutput[] */) =>
    unspentTxOutputs.find((uTxO) => uTxO.txOutputId === transactionId && uTxO.txOutputIndex === index) /*: UnspentTxOutput */;

}

class TxOutput {
  constructor(address, amount) {
    this.address = address;
    this.amount = amount;
  }

  isValidTxOutputStructure = () => {

    if (typeof this.address !== 'string') {
      console.log('invalid address type');
      return false;
    }

    //////chưa check address format

    if (typeof this.amount !== 'number') {
      console.log('invalid amount type');
      return false;
    }
  }
}

/**
 * provide the information “where” the coins are coming from. Each txIn refer to an earlier output, 
 */
class TxInput {
  txOutputId;
  txOutputIndex;
  signature; // signature gives proof that only the user, that has the private-key of the referred public-key ( =address) could have created the transaction.

  getAmountFromReferredUnspentTxOutput = (unspentTxOutputs) => (unspentTxOutputs.find(uTxO => uTxO.txOutputId === this.txOutputId && uTxO.txOutputIndex === this.txOutputIndex)).amount

  isValidTxInputStructure = () => {

    if (typeof this.signature !== 'string') {
      console.log('tx input is missing');
      return false;
    }

    if (typeof this.txOutputId !== 'string') {
      console.log('invalid unspent output tx id type');
      return false;
    }

    if (typeof this.txOutputIndex !== 'number') {
      console.log('invalid refferd index type');
      return false;
    }

    return true;
  }

  isValidTxInput = (transaction, unspentTxOutputs) => {

    console.log(transaction.id, this.txOutputId, this.txOutputIndex, this.signature);

    const referencedUnspentTxOutput =
      unspentTxOutputs.find((uTxO) => uTxO.txOutputId === this.txOutputId && uTxO.txOutputIndex === txIn.txOutputIndex);

    if (referencedUnspentTxOutput === null) {
      console.log('transaction input not refered any unspent tx output');
      return false;
    }

    // important part that check the sender have authority to use the correct referred unspent tx output
    if (!verifySignature(referencedUnspentTxOutput.address, this.signature, transaction.id)) {
      console.log('incorrect signature', this.signature);
      return false;
    }

    return true;
  }

  getSignature(transaction, unspentTxOutputs, privateKey) {
    // const txInput = transaction.txInputs[txInputIndex];
    const dataToSign = transaction.id; //only the txId will be signed
    const referencedUnspentTxOutput /*: UnspentTxOutput */
      = UnspentTxOutput.findUnspentTxOutput(this.txOutputId, this.txOutputIndex, unspentTxOutputs);

    if (referencedUnspentTxOutput === null) {
      console.log('refered tx output not found');
      throw Error('refered tx output not found');
    }

    const referedAddress = referencedUnspentTxOutput.address;

    if (referedAddress !== publicKeyFromPrivateKey(privateKey)) {
      console.log('refering an unspent tx output not belong to this private key');
      throw Error('refering an unspent tx output not belong to this private key');
    }

    const key = keyPairFromPrivateKey(privateKey);
    const signature = key.sign(dataToSign); //toHexString(key.sign(dataToSign).toDER());
    return signature;
  }
}

class Transaction {

  id;
  txInputs;// TxIn[];
  txOutputs;// TxOut[];

  getTxId() {
    const txInputContent = this.txInputs.map(txInput => txInput.txOutputId + txInput.txOutputIndex).reduce((a, b) => a + b, '');
    const txOutputContent = this.txOutputs.map(txOutput => txOutput.address + txOutput.amount).reduce((a, b) => a + b, '');
    return CryptoJS.SHA256(txInputContent + txOutputContent);
  }


  static updateUnspentTxOutputs = (transactions, currentUnspentTxOutputs)/* : UnspentTxOutput[]*/ => {

    // retrieve all new unspent transaction outputs from the new block (transactions):
    const newUnspentTxOutputs = transactions.map((transaction) => {
      return transaction.txOutputs.map((txOutput, index) => new UnspentTxOutput(transaction.id, index, txOutput.address, txOutput.amount));
    }).reduce((a, b) => a.concat(b), []); // : UnspentTxOutput[]

    const consumedTxOuts = transactions
      .map((t) => t.txIns)
      .reduce((a, b) => a.concat(b), [])
      .map((txIn) => new UnspentTxOut(txIn.txOutId, txIn.txOutIndex, '', 0)); // ignore address and amount in this case because we just want to create the 'mock' consumed txOutputs (instead of searching all in the current blockchain)

    const resultingUnspentTxOuts = currentUnspentTxOutputs
      .filter(((uTxO) => !findUnspentTxOut(uTxO.txOutId, uTxO.txOutIndex, consumedTxOuts))) // filter the unspentTxOutputs hasnt been consumed
      .concat(newUnspentTxOutputs); // join with the new ones

    return resultingUnspentTxOuts;
  }

  isValidNormalTx = (unspentTxOutputs) => {
    console.log('normal tx ', this.id);

    if (this.isValidNormalTxStructure() === false) {
      return false;
    }

    if (this.getTxId() !== this.id) {
      console.log('invalid tx id', this.id);
      return false;
    }

    if (this.txInputs.map(txInput => txInput.isValidTxInput(this, unspentTxOutputs)).includes(false)) {
      return false;
    }

    const totalTxInputValue = () => this.txInputs.map(input => input.getAmountFromReferredUnspentTxOutput(unspentTxOutputs)).reduce((a, b) => (a + b), 0);
    const totalTxOutputValue = () => this.txOutputs.map(output => output.amount).reduce((a, b) => (a + b), 0);

    if (totalTxInputValue !== totalTxOutputValue) {
      console.log('tx output not match to tx input ammount');
      return false;
    }

    return true;
  }

  isValidNormalTxStructure = () => {

    if (typeof this.id !== 'string') {// undefined
      console.log('Missing tx id');
      return false;
    }

    if (!(this.txInputs instanceof Array)) {
      console.log('transaction input must be instance of array');
      return false;
    }
    if (this.txInputs.map(txInput => txInput.isValidTxInputStructure()).includes(false)) {
      return false;
    }

    if (!(this.txOutputs instanceof Array)) {
      console.log('transaction output must be instance of array');
      return false;
    }

    if (this.txOutputs.map(txOutput => txOutput.isValidTxOutputStructure()).includes(false)) {
      return false;
    }
    return true;
  }

  isValidCoinbaseTx = (blockIndex) => {

    if (this.getTxId() !== this.id) {
      console.log('invalid tx id', this.id);
      return false;
    }

    if (this.txInputs.length !== 1) {
      console.log('coinbase tx must have 1 tx input length that contain block index');
      return false;
    }

    if (this.txInputs[0].txOutputIndex !== blockIndex) {
      console.log('coinbase tx input index not match order of block');
      return false;
    }

    if (this.txOutputs.length !== 1) {
      console.log('coinbase tx output must contain only 1 output possessed by the miner (miner\'s address)');
      return false;
    }

    if (this.txOutputs[0].amount !== MINING_REWARD) {
      console.log('coinbase amount not match to minging reward', this.txOutputs[0].amount);
      return false;
    }

    return true;
  }


}

module.exports = { Transaction, TxOutput, TxInput, UnspentTxOutput };