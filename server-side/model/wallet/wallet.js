const { genKeyPair, publicKeyFromPrivateKey, keyPairFromPrivateKey } = require("../../utils/helper");
const fs = require('fs');
const CryptoJS = require('crypto-js');
const { TxInput, TxOutput, Transaction } = require("./transaction");
const { MINING_REWARD } = require("../../logic_config");
const location = process.env.KEY_LOCATION;
const password = process.env.PASSWORD;

class Wallet {
  constructor() {

    if (fs.existsSync(location)) {
      console.log('exist key');
      const content = fs.readFileSync(location, 'utf-8');
      const decryptedContent = CryptoJS.AES.decrypt(content, password).toString(CryptoJS.enc.Utf8);
      const _password = decryptedContent.substring(decryptedContent.indexOf('/') + 1);

      if (password !== _password) {
        throw Error('password not correct');
      }

      const privateKey = decryptedContent.substring(0, decryptedContent.indexOf('/'));
      const keyPair = keyPairFromPrivateKey(privateKey);
      const publicKey = keyPair.getPublic().encode('hex');

      console.log(privateKey, publicKey);
      if (!Transaction.isValidAddress(publicKey)) {
        throw Error('Keystore file is not valid in term of private key');
      }

      this.privateKey = privateKey;
      console.log(this.privateKey);
      return;
    }

    const keyPair = genKeyPair();
    console.log(keyPair.getPublic().encode('hex'));
    const encryptedPrivKey = CryptoJS.AES.encrypt(keyPair.getPrivate().toString(16) + '/' + password, password).toString();

    fs.writeFileSync(location, encryptedPrivKey);
    this.privateKey = keyPair.getPrivate().toString(16);
    console.log(this.privateKey);
  }

  getPublicKeyFromPrivateKey = () => publicKeyFromPrivateKey(this.privateKey);

  getBalance = (unspentTxOutputs) => this.findMyUnspentTxOutputs(unspentTxOutputs).map(uTxO => uTxO.amount).reduce((a, b) => a + b, 0);

  findMyUnspentTxOutputs = (unspentTxOutputs) => {
    const address = this.getPublicKeyFromPrivateKey(); // address = public key
    return unspentTxOutputs.filter(uTxO => uTxO.address === address);
  }

  findEnoughUnspentTxOutPuts = (amount, myUnspentTxOutputs) => {
    // console.log(30, myUnspentTxOutputs);
    let sum = 0;
    const chosenUnspentTxOutputs = [];

    for (const uTxO of myUnspentTxOutputs) {
      sum += uTxO.amount;
      chosenUnspentTxOutputs.push(uTxO);
      if (sum >= amount) {
        return { chosenUnspentTxOutputs, change: sum - amount };
      }
    };

    console.log('Not enough coin');
    throw Error('You have not enough coin or your coin is waiting in pool for previous transaction');
  }

  // lọc ra unspent tx outputs đang dc refer bởi txs trong pool
  filterTxPoolTxs = (unspentTxOutputs, transactionPool)/*: UnspentTxOut[]*/ => {

    console.log(49, transactionPool);
    const arrayOfTxInputsInPool /*:TxInput[]*/ = JSON.parse(JSON.stringify(transactionPool.txsInPool.map(tx => tx.txInputs)));
    console.log(51, arrayOfTxInputsInPool);
    const txInputsInPool = [];
    arrayOfTxInputsInPool.forEach(txInputs => txInputs.forEach(txInput => txInputsInPool.push(txInput)));

    const removable /*: UnspentTxOut[]*/ = [];
    for (const unspentTxOutput of unspentTxOutputs) {
      // const txIn = _.find(txIns, (aTxIn: TxIn) => {
      //   return aTxIn.txOutIndex === unspentTxOutput.txOutIndex && aTxIn.txOutId === unspentTxOutput.txOutId;
      // });

      const txInput = txInputsInPool.find(input => input.txOutputIndex === unspentTxOutput.txOutputIndex && input.txOutputId === unspentTxOutput.txOutputId);

      console.log('filter: ', txInput);

      if (txInput !== undefined) {
        removable.push(unspentTxOutput);
      }
    }

    return unspentTxOutputs.filter(uTxO => !removable.includes(uTxO)); // _.without(unspentTxOutputs, ...removable);
  };

  createTx = (amount, receiverAddress, unspentTxOutputs, txPool /** :TxPool */) => {

    console.log(73, 'tx pool: ', txPool, unspentTxOutputs);
    const myUnspentTxOutputs = this.findMyUnspentTxOutputs(unspentTxOutputs);
    const myUnspentTxOutputsNotReferedInPool = this.filterTxPoolTxs(myUnspentTxOutputs, txPool);
    const { chosenUnspentTxOutputs, change } = this.findEnoughUnspentTxOutPuts(amount, myUnspentTxOutputsNotReferedInPool);
    const unsignedTxInputs = chosenUnspentTxOutputs.map(uTxO => this.createTxInput(uTxO)); // : TxInput[]
    const myAddress = this.getPublicKeyFromPrivateKey();
    const txOutputs = this.createTxOutputs(receiverAddress, amount, myAddress, change);

    const transaction = new Transaction();
    transaction.txInputs = unsignedTxInputs;
    transaction.txOutputs = txOutputs;
    transaction.sender = myAddress;
    transaction.receiver = receiverAddress;
    transaction.id = transaction.getTxId();

    transaction.txInputs.forEach(input => {
      input.signature = input.getSignature(transaction, unspentTxOutputs, this.privateKey);
    });

    return transaction;
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

  getCoinbaseTx = (blockIndex) => {
    const myAddress = this.getPublicKeyFromPrivateKey();
    const transaction = new Transaction();
    const txInput = new TxInput();
    txInput.signature = ''; // no need in coinbase tx because it does not spend from a UTXO
    txInput.txOutputIndex = blockIndex;
    txInput.txOutputId = ''; // no need

    const txOutput = new TxOutput(myAddress, MINING_REWARD);

    transaction.txInputs = [txInput];
    transaction.txOutputs = [txOutput];
    transaction.sender = '';
    transaction.receiver = myAddress;
    transaction.id = transaction.getTxId();

    return transaction;
  }

  // toString() {
  //   return `Wallet - publicKey: ${this.publicKey.toString()}, balance: ${this.balance}`;
  // }
}
const getBalance = (address, unspentTxOutputs) => {
  if (Transaction.isValidAddress(address) === false) {
    throw Error('invalid address');
  }
  return findUnspentTxOutputs(address, unspentTxOutputs).map(uTxO => uTxO.amount).reduce((a, b) => a + b, 0)
};

const findUnspentTxOutputs = (address, unspentTxOutputs) => {
  return unspentTxOutputs.filter(uTxO => uTxO.address === address);
}

module.exports = { Wallet, getBalance, findUnspentTxOutputs }