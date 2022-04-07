'use strict'

const TransactionDetailsView = require('../../Wallets/Views/TransactionDetailsView.web')

class JustSentTransactionDetailsView extends TransactionDetailsView {
  constructor (options, context) {
    super(options, context)
  }

  setup () {
    super.setup()
    const self = this
    console.log("Just sent 'transaction'……", self.transaction)
    // TODO: implement the contact on tx here
  }
}
module.exports = JustSentTransactionDetailsView
