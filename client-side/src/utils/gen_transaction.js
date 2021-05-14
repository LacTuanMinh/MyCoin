import { byteArrayToHexString, keyPairFromPrivateKey, publicKeyFromPrivateKey } from "./helper";
import CryptoJS from 'crypto-js';

class TxOutput {
  constructor(address, amount) {
    this.address = address;
    this.amount = amount;
  }
}

const findUnspentTxOutput = (transactionId, index, unspentTxOutputs /* : UnspentTxOutput[] */) =>
  unspentTxOutputs.find((uTxO) => uTxO.txOutputId === transactionId && uTxO.txOutputIndex === index);

class TxInput {
  txOutputId;
  txOutputIndex;
  signature;

  getSignature(transaction, unspentTxOutputs, privateKey) {
    // const txInput = transaction.txInputs[txInputIndex];
    const dataToSign = transaction.id; //only the txId will be signed
    const referencedUnspentTxOutput /*: UnspentTxOutput */
      = findUnspentTxOutput(this.txOutputId, this.txOutputIndex, unspentTxOutputs);

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
}

class Transaction {

  id;
  txInputs;// TxIn[];
  txOutputs;// TxOut[];
  sender;
  receiver;

  getTxId() {
    const txInputContent = this.txInputs.map(txInput => txInput.txOutputId + txInput.txOutputIndex).reduce((a, b) => a + b, '');
    const txOutputContent = this.txOutputs.map(txOutput => txOutput.address + txOutput.amount).reduce((a, b) => a + b, '');
    return CryptoJS.SHA256(this.sender + this.receiver + txInputContent + txOutputContent).toString();
  }
}

const filterTxPoolTxs = (unspentTxOutputs, transactionPool)/*: UnspentTxOut[]*/ => {

  console.log(transactionPool);
  const arrayOfTxInputsInPool /*:TxInput[]*/ = JSON.parse(JSON.stringify(transactionPool.map(tx => tx.txInputs)));
  console.log(arrayOfTxInputsInPool);
  const txInputsInPool = [];
  arrayOfTxInputsInPool.forEach(txInputs => txInputs.forEach(txInput => txInputsInPool.push(txInput)));
  const removable /*: UnspentTxOut[]*/ = [];

  for (const unspentTxOutput of unspentTxOutputs) {

    const txInput = txInputsInPool.find(input => input.txOutputIndex === unspentTxOutput.txOutputIndex && input.txOutputId === unspentTxOutput.txOutputId);

    console.log('filter: ', txInput);

    if (txInput !== undefined) {
      removable.push(unspentTxOutput);
    }
  }

  return unspentTxOutputs.filter(uTxO => !removable.includes(uTxO)); // _.without(unspentTxOutputs, ...removable);
};

const findEnoughUnspentTxOutPuts = (amount, myUnspentTxOutputs) => {
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

export const createTransaction = (privateKey, publicKey, amount, receiverAddress, unspentTxOutputs, txPool /** :TxPool */) => {

  console.log(24, 'tx pool: ', txPool instanceof Array, unspentTxOutputs instanceof Array);
  const myUnspentTxOutputs = unspentTxOutputs.filter(uTxO => uTxO.address === publicKey);
  const myUnspentTxOutputsNotReferedInPool = filterTxPoolTxs(myUnspentTxOutputs, txPool);
  const { chosenUnspentTxOutputs, change } = findEnoughUnspentTxOutPuts(amount, myUnspentTxOutputsNotReferedInPool);
  const unsignedTxInputs = chosenUnspentTxOutputs.map(uTxO => createTxInput(uTxO)); // : TxInput[]
  // const myAddress = this.getPublicKeyFromPrivateKey();
  const txOutputs = createTxOutputs(receiverAddress, amount, publicKey, change);

  const transaction = new Transaction();
  transaction.txInputs = unsignedTxInputs;
  transaction.txOutputs = txOutputs;
  transaction.sender = publicKey;
  transaction.receiver = receiverAddress;
  transaction.id = transaction.getTxId();

  transaction.txInputs.forEach(input => {
    input.signature = input.getSignature(transaction, unspentTxOutputs, privateKey);
  });

  return transaction;
}

const createTxInput = (unspentTxOutput) => {

  const txInput = new TxInput();
  txInput.txOutputIndex = unspentTxOutput.txOutputIndex;
  txInput.txOutputId = unspentTxOutput.txOutputId;
  return txInput;

}

const createTxOutputs = (receiverAddress, amount, myAddress, change) => {
  const txOutputs = [new TxOutput(receiverAddress, amount)];

  if (change > 0) {
    txOutputs.push(new TxOutput(myAddress, change));
  }

  return txOutputs;
}