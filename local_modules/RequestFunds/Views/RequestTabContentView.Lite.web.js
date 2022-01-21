'use strict'

const RequestTabContentView_Base = require('./RequestTabContentView_Base.web')
const RequestsDownloadAppEmptyScreenView = require('./RequestsDownloadAppEmptyScreenView.Lite.web')

class RequestTabContentView extends RequestTabContentView_Base {
  constructor (options, context) {
    super(options, context)
  }

  setup () {
    const self = this
    super.setup() // we must call on super
    //
    const view = new RequestsDownloadAppEmptyScreenView({}, self.context)
    self.SetStackViews(
      [
        view
      ]
    )
  }
}
module.exports = RequestTabContentView
