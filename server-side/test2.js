const CryptoJS = require('crypto-js');
const { calculateHash } = require('./utils/helper');

const hash = calculateHash(8, '000cca62f4b54576c782f436421515dab7c44b4fad1985ed4810d537ab82be4a', 1620956678083,
  JSON.stringify([
    {
      "id": "7143edf0f94505fe7f176f09acc5bfe04f7e52990afdfc61355f39d67447ccf9",
      "txInputs": [
        {
          "txOutputId": "",
          "txOutputIndex": 8,
          "signature": ""
        }
      ],
      "txOutputs": [
        {
          "address": "04aca1084845ae160c366790c0e4ac5f5ac86e513db039fbc3490a1d71a7b45c4e4268462351b688d2487cae832f8c86aaac653bcbef1e0fbe4c7ce715952a4a90",
          "amount": 50
        }
      ],
      "sender": "",
      "receiver": "04aca1084845ae160c366790c0e4ac5f5ac86e513db039fbc3490a1d71a7b45c4e4268462351b688d2487cae832f8c86aaac653bcbef1e0fbe4c7ce715952a4a90"
    },
    {
      "id": "9ecbddbf494ecb4b100a070eaec33233384c84766bb63482a2e1cda6fe318974",
      "txInputs": [
        {
          "txOutputId": "f7f4d23ea2231cbe97b5aabd17811df5a67c774d018372b1bae6964a7854544e",
          "txOutputIndex": 0,
          "signature": "3045022058e6b26eefec0be68d4252f0632e54644e583539422b4f4610305aa7807c3888022100dbff3db1dd7a65b3ee63735a27a4f2c85f5897c3e8229b7c18359aee68a8e26c"
        },
        {
          "txOutputId": "df78bfaba73ffc167285b881b328041d65233439293142c2ca0eb6cf5b4358a9",
          "txOutputIndex": 0,
          "signature": "3045022058e6b26eefec0be68d4252f0632e54644e583539422b4f4610305aa7807c3888022100dbff3db1dd7a65b3ee63735a27a4f2c85f5897c3e8229b7c18359aee68a8e26c"
        }
      ],
      "txOutputs": [
        {
          "address": "0493f5f4ca03c83f64fa1feee90e5df923047477e2446cdc4032a4e7aec0857d6d399f596eb5f6891d759eb1dd7b1438abfe71564e6b24df536304d617362e3a73",
          "amount": 15
        },
        {
          "address": "04aca1084845ae160c366790c0e4ac5f5ac86e513db039fbc3490a1d71a7b45c4e4268462351b688d2487cae832f8c86aaac653bcbef1e0fbe4c7ce715952a4a90",
          "amount": 45
        }
      ],
      "sender": "04aca1084845ae160c366790c0e4ac5f5ac86e513db039fbc3490a1d71a7b45c4e4268462351b688d2487cae832f8c86aaac653bcbef1e0fbe4c7ce715952a4a90",
      "receiver": "0493f5f4ca03c83f64fa1feee90e5df923047477e2446cdc4032a4e7aec0857d6d399f596eb5f6891d759eb1dd7b1438abfe71564e6b24df536304d617362e3a73"
    }
  ]), 3, 7126);

console.log(hash);