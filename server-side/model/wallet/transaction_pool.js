const { Transaction } = require("./transaction");
const fs = require('fs');

class TxPool {

  constructor() {
    this.txsInPool = readPoolFromLocalStorage(); // :Transaction[]
  }

  getTxPool = () => this.txsInPool;

  addToTxPool = (unconfirmedTx /* :Transaction */, unspentTxOutputs /* :UnspentTxOutput[] */) => {

    if (unconfirmedTx.isValidNormalTx(unspentTxOutputs) === false) {
      throw Error('invalid uncornfirmed tx');
    }

    if (this.isValidTxForPool(unconfirmedTx) === false) {
      throw Error();
    }

    this.txsInPool.push(unconfirmedTx);
    savePoolToLocalStorage(this.txsInPool);

  }

  updateTxPool = (unspentTxOutputs) => {
    const invalidTxs = [];
    const hasTxInput = (txInput, _unspentTxOutputs) => {
      const foundTxInput = _unspentTxOutputs.find(uTxO => uTxO.txOutputId === txInput.txOutputId && uTxO.txOutputIndex === txInput.txOutputIndex);
      return foundTxInput !== undefined;
    }

    for (const tx of this.txsInPool) {
      for (const txInput of tx.txInputs) {
        if (hasTxInput(txInput, unspentTxOutputs) === false) {
          invalidTxs.push(tx);
          break;
        }
      }
    }

    if (invalidTxs.length > 0) {
      console.log('removing these tx from pool : ', invalidTxs);
      this.txsInPool = this.txsInPool.filter(tx => !invalidTxs.includes(tx));
      savePoolToLocalStorage(this.txsInPool);
    }
  }

  // check xem tx sắp tới có sẵn trong pool chưa, có rồi trả về false
  isValidTxForPool = (unconfirmedTx /* :Transaction*/) => {
    const arrayOfTxInputsInPool /*:TxIn[]*/ = JSON.parse(JSON.stringify(this.txsInPool.map(tx => tx.txInputs)));
    const txInputsInPool = [];
    arrayOfTxInputsInPool.forEach(txInputs => txInputs.forEach(txInput => txInputsInPool.push(txInput)));

    const containsTxInput = (txInputs, txInput) => {
      // return _.find(txInputsInPool, ((txPoolIn) => {
      //   return txIn.txOutIndex === txPoolIn.txOutIndex && txIn.txOutId === txPoolIn.txOutId;
      // }));
      return txInputs.find(input => txInput.txOutputIndex === input.txOutputIndex && input.txOutputId === txInput.txOutputId);
    };

    for (const txInput of unconfirmedTx.txInputs) {
      if (containsTxInput(txInputsInPool, txInput)) {
        console.log('txIn already been in the txPool');
        return false;
      }
    }
    return true;
  }
}

const location = 'data_storage/pool.txt';

const readPoolFromLocalStorage = () => {

  if (fs.existsSync(location)) {
    const rawData = fs.readFileSync(location, 'utf-8');
    const rawTxs = JSON.parse(rawData);
    const txs = Transaction.parseTxFromRawObject(rawTxs);
    return txs;
  } else {
    const txs = [];
    fs.writeFileSync(location, JSON.stringify(txs));
    return txs;
  }
}

const savePoolToLocalStorage = (txs) => {
  fs.writeFileSync(location, JSON.stringify(txs));
}

module.exports = { TxPool };