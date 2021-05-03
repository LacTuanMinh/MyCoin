class TxPool {
  unconfirmedTxs = []; // :Transaction[]

  getTxPool = () => this.unconfirmedTxs;

  addToTxPool = (unconfirmedTx /* :Transaction */, unspentTxOutputs /* :UnspentTxOutput[] */) => {

    if (unconfirmedTx.isValidNormalTx(unspentTxOutputs) === false) {
      throw Error('invalid uncornfirmed tx');
    }
    /////xem lại
    if (this.isValidTxForPool(unconfirmedTx) === false) {
      throw Error('invalid unconfirmed tx');
    }

    this.unconfirmedTxs.push(unconfirmedTx)
  }

  isValidTxForPool = (unconfirmedTx /* :Transaction*/) => {
    const arrayOfTxInputs /*:TxIn[]*/ = this.unconfirmedTxs.map(tx => tx.txInputs);
    const txInputsInPool = [];
    arrayOfTxInputs.forEach(txInputs => txInputs.forEach(txInput => txInputsInPool.push(txInput)));

    const containsTxInput = (txInputs, txInput) => {
      return _.find(txInputsInPool, ((txPoolIn) => {
        return txIn.txOutIndex === txPoolIn.txOutIndex && txIn.txOutId === txPoolIn.txOutId;
      }));
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