
// class MyClass {
//   constructor() {
//     const { array1 } = require("./test");
//     this.array1 = array1
//   }

//   pushAndPrint() {
//     const name = require('./test').name;
//     this.array1.push(1, 2, 3, name);
//   }

// }

// module.exports = MyClass;

const CryptoJs = require('crypto-js');

const enc = CryptoJs.AES.encrypt('cmm', '0210');
const plain = CryptoJs.AES.decrypt(enc, '0210');
console.log(plain.toString(CryptoJs.enc.Utf8));