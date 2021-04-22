const { getCurrentTimestamp } = require("../helper");

class Transaction {
  constructor(sender, receiver, amount) {
    this.sender = sender;
    this.receiver = receiver;
    this.amount = amount;
    this.timestamp = getCurrentTimestamp();
  }
}

module.exports = { Transaction };