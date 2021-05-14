// const MyClass = require('./test2');

// const array1 = [];
// module.exports = { array1 }


// const a = new MyClass();

// a.pushAndPrint();

// console.log(array1);

// const name = 'minh';

// module.exports = { name }
// a.pushAndPrint();
// console.log(array1);

// return;






























// // class TxInput {
// //   constructor(outputId, outputIndex, sig) { this.outputId = outputId; this.outputIndex = outputIndex; this.sig = sig; }

// const Block = require("./model/block");
// const { TxInput, TxOutput, Transaction } = require("./model/wallet/transaction");
// const { getCurrentTimestamp } = require("./utils/helper");


// // }
// // class TxOutput {
// //   constructor(addr, amount) { this.addr = addr; this.amount = amount; }
// // }
// // class Transaction {
// //   constructor(id, txInputs, txOutputs) { this.id = id; this.txInputs = txInputs; this.txOutputs = txOutputs; }
// // }
// const i1 = new TxInput();
// const i2 = new TxInput();
// const i3 = new TxInput();
// const i4 = new TxInput();
// i1.signature = '123ddw'
// i1.txOutputId = '111'
// i1.txOutputIndex = 0

// i2.signature = 'csdcsdc'
// i2.txOutputId = '223'
// i2.txOutputIndex = 1

// i3.signature = 'vsdv vr'
// i3.txOutputId = 888
// i3.txOutputIndex = 0

// i4.signature = '12gerg5g3ddw'
// i4.txOutputId = 889
// i4.txOutputIndex = 1
// const inputs = [i1, i2];
// const outputs = [new TxOutput('154', 45), new TxOutput('152', 5)];

// const inputs2 = [i3, i4];
// const outputs2 = [new TxOutput('154', 5), new TxOutput('152', 5)];
// const t1 = new Transaction();
// t1.id = '11q2w2'; t1.txInputs = inputs; t1.txOutputs = outputs;
// const t2 = new Transaction();
// t2.id = '22r4t5'; t2.txInputs = inputs2; t2.txOutputs = outputs2;
// const txs = [t1, t2];
// // console.log(txs);

// const raw = JSON.parse(JSON.stringify(txs));

// // console.log(raw);
// const target = [];
// for (const rawTx of raw) {

//   const inputs = [];
//   const outputs = [];
//   for (const input of rawTx.txInputs) {
//     inputs.push(Object.assign(new TxInput(), input));
//   }
//   for (const output of rawTx.txOutputs) {
//     outputs.push(Object.assign(new TxOutput(), output));
//   }

//   const tx = new Transaction();
//   tx.id = rawTx.id;
//   tx.txInputs = inputs;
//   tx.txOutputs = outputs;

//   target.push(tx);
// }

// // target.forEach(tx => console.log(tx));
// // console.log(JSON.stringify({ a: undefined, b: 1 }));
// // console.log(JSON.stringify(target), JSON.stringify(txs));

// const first = Block.generateGenesisBlock();
// const block = new Block(2, getCurrentTimestamp(), txs, first.hash, first.difficulty, 123, 46666666666666);

// const block_chain = [first, block];
// const copy = block_chain;
// console.log(block_chain);
// // const rawChain = JSON.parse(JSON.stringify(block_chain));
// copy[1].hash = 'cmm';
// console.log(block_chain);

// const myChain = [];
// console.log(myChain[myChain.length - 1]);;
