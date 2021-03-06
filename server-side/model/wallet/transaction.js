const { verifySignature, keyPairFromPrivateKey, publicKeyFromPrivateKey, byteArrayToHexString } = require("../../utils/helper");
const CryptoJS = require('crypto-js');
const { MINING_REWARD } = require("../../logic_config");

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

  static updateUnspentTxOutputs = (newTransactions, currentUnspentTxOutputs)/* : UnspentTxOutput[]*/ => {

    // retrieve all new unspent transaction outputs from the new block:
    const newUnspentTxOutputs = newTransactions.map((transaction) => {
      return transaction.txOutputs.map((txOutput, index) => new UnspentTxOutput(transaction.id, index, txOutput.address, txOutput.amount));
    }).reduce((a, b) => a.concat(b), []); // : UnspentTxOutput[]

    const consumedTxOuts = newTransactions
      .map((t) => t.txInputs)
      .reduce((a, b) => a.concat(b), [])
      .map((txIn) => new UnspentTxOutput(txIn.txOutputId, txIn.txOutputIndex, '', 0)); // ignore address and amount in this case because we just want to create the 'mock' consumed txOutputs (instead of searching all in the current blockchain)

    const resultingUnspentTxOuts = currentUnspentTxOutputs
      .filter(((uTxO) => !UnspentTxOutput.findUnspentTxOutput(uTxO.txOutputId, uTxO.txOutputIndex, consumedTxOuts))) // filter the unspentTxOutputs hasnt been consumed
      .concat(newUnspentTxOutputs); // join with the new ones

    return resultingUnspentTxOuts;
  }

  static parseUTxOFromRawObject = (rawObject) => {
    const unspentTxOutputs = [];

    for (const rawUTxO of rawObject) {
      const uTxO = Object.assign(new UnspentTxOutput(), rawUTxO);
      unspentTxOutputs.push(uTxO);
    }
    return unspentTxOutputs;
  }
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

    //////ch??a check address format

    if (typeof this.amount !== 'number') {
      console.log('invalid amount type');
      return false;
    }
  }
}

/**
 * provide the information ???where??? the coins are coming from. Each txIn refer to an earlier output, 
 */
class TxInput {
  txOutputId;
  txOutputIndex;
  signature; // signature gives proof that only the user, that has the private-key of the referred public-key ( =address) could have created the transaction.

  getAmountFromReferredUnspentTxOutput = (unspentTxOutputs) => (unspentTxOutputs.find(uTxO => uTxO.txOutputId === this.txOutputId && uTxO.txOutputIndex === this.txOutputIndex)).amount

  isValidTxInputStructure = () => {

    if (typeof this.signature !== 'string') {
      console.log('missing signature');
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

    // console.log(transaction.id, this.txOutputId, this.txOutputIndex, this.signature);

    const referencedUnspentTxOutput =
      unspentTxOutputs.find((uTxO) => uTxO.txOutputId === this.txOutputId && uTxO.txOutputIndex === this.txOutputIndex);

    if (referencedUnspentTxOutput === undefined) {
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
    const signature = key.sign(dataToSign).toDER(); //toHexString(key.sign(dataToSign).toDER());
    return byteArrayToHexString(signature);
  }

  static hasDuplicateTxInput = (txInputs) => {

    // console.log(139, txInputs);
    const values = txInputs.map(input => input.txOutputId + input.txOutputIndex);
    return values.some((value, index) => values.indexOf(value) !== index);
  }
}

class Transaction {

  id;
  txInputs;// TxIn[];
  txOutputs;// TxOut[];
  sender;
  receiver;

  static generateGeneisTx = () => {
    const txInput = new TxInput();
    txInput.signature = '';
    txInput.txOutputId = '';
    txInput.txOutputIndex = 0;

    const txOutput = new TxOutput('049036607fa5240cd0021e06cf8a3cab6837160a4c8bbf99b0d3a1e89f725db2f3379c944d35a1d483a8a1d77db7a291cd32b693a577486079ae508569d1b2d42e', MINING_REWARD);
    const tx = new Transaction();
    tx.txInputs = [txInput];
    tx.txOutputs = [txOutput];
    tx.sender = '';
    tx.receiver = '049036607fa5240cd0021e06cf8a3cab6837160a4c8bbf99b0d3a1e89f725db2f3379c944d35a1d483a8a1d77db7a291cd32b693a577486079ae508569d1b2d42e'
    tx.id = tx.getTxId();
    return tx;
  }

  getTxId() {
    const txInputContent = this.txInputs.map(txInput => txInput.txOutputId + txInput.txOutputIndex).reduce((a, b) => a + b, '');
    const txOutputContent = this.txOutputs.map(txOutput => txOutput.address + txOutput.amount).reduce((a, b) => a + b, '');
    return CryptoJS.SHA256(this.sender + this.receiver + txInputContent + txOutputContent).toString();
  }

  /**
   * 
   * T??? c??c transactions dc truy???n v??o, l???c ra c??c unspentTxOutputs ch??a dc d??ng th???c s???
   */
  static processTransactions = (transactions, unspentTxOutputs, blockIndex) => {

    if (Transaction.isValidBlockTransactions(transactions, unspentTxOutputs, blockIndex) === false) {
      console.log('invalid tx in block ', blockIndex);
      return null;
    }

    // th??m uTxO m???i v??o, x??a uTxO ???? dc s??? d???ng kh???i ds, tr??? v??? 1 list c??c unspentTxOutputs
    return UnspentTxOutput.updateUnspentTxOutputs(transactions, unspentTxOutputs);
  }

  static isValidBlockTransactions = (transactions, unspentTxOutputs, blockIndex) => {
    const coinbaseTx = transactions[0];
    console.log(188, coinbaseTx);

    if (coinbaseTx.isValidCoinbaseTx(blockIndex) === false) {
      console.log('invalid coinbase tx', blockIndex, coinbaseTx);
      return false;
    }

    const arrOfTxInputs = transactions.map(tx => tx.txInputs);
    const allTxInputs = [];
    arrOfTxInputs.forEach(txInputs => txInputs.forEach(txInput => allTxInputs.push(txInput)));

    if (TxInput.hasDuplicateTxInput(allTxInputs)) {
      return false;
    }

    const normalTxs = transactions.slice(1);
    return normalTxs.map(tx => tx.isValidNormalTx(unspentTxOutputs)).includes(false) === false;
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

    const totalTxInputValue = this.txInputs.map(input => input.getAmountFromReferredUnspentTxOutput(unspentTxOutputs)).reduce((a, b) => (a + b), 0);
    const totalTxOutputValue = this.txOutputs.map(output => output.amount).reduce((a, b) => (a + b), 0);

    if (totalTxInputValue !== totalTxOutputValue) {
      console.log('tx output amount not match to tx input ammount');
      return false;
    }

    const isValidAddressInTxOutputs = this.txOutputs.map(txOutput => Transaction.isValidAddress(txOutput.address)).reduce((a, b) => a && b, true);

    if (!isValidAddressInTxOutputs) {
      console.log('tx outputaddress is invalid in tx id: ', this.id);
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
      console.log('invalid inputs struct');
      return false;
    }

    if (!(this.txOutputs instanceof Array)) {
      console.log('transaction output must be instance of array');
      return false;
    }

    if (this.txOutputs.map(txOutput => txOutput.isValidTxOutputStructure()).includes(false)) {
      console.log('invalid tx output struct');
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

  static parseTxFromRawObject = (rawObject) => {
    const txs = [];

    for (const rawTx of rawObject) {
      const inputs = [];
      const outputs = [];

      for (const input of rawTx.txInputs) {
        inputs.push(Object.assign(new TxInput(), input));
      }

      for (const output of rawTx.txOutputs) {
        outputs.push(Object.assign(new TxOutput(), output));
      }

      const tx = new Transaction();
      tx.id = rawTx.id;
      tx.txInputs = inputs;
      tx.txOutputs = outputs;
      tx.sender = rawTx.sender;
      tx.receiver = rawTx.receiver;
      txs.push(tx);
    }

    return txs;
  }

  static isValidAddress = (address) => {
    if (address.length !== 130) {
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

}

module.exports = { Transaction, TxOutput, TxInput, UnspentTxOutput };