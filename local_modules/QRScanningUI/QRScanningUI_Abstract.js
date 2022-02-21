'use strict'

class QRScanningUI_Abstract {
  constructor (options, context) {
    const self = this
    {
      self.options = options
      self.context = context
    }
  }

  //
  //
  // Runtime - Imperatives - Dialogs - Open
  //
  PresentUIToScanOneQRCodeString (
    fn // (err?, string) -> Void
  ) {
    const self = this
    const errStr = 'Override PresentUIToScanOneQRCodeString in ' + self.constructor.name
    fn(new Error(errStr))
    throw errStr // to break development builds
  }
}
module.exports = QRScanningUI_Abstract
