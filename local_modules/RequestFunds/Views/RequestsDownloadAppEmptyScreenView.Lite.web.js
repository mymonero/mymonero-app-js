'use strict'

const View = require('../../Views/View.web')
const commonComponents_emptyScreens = require('../../MMAppUICommonComponents/emptyScreens.web')

class RequestsDownloadAppEmptyScreenView extends View {
  constructor (options, context) {
    super(options, context)
    //
    const self = this
    self.layer.style.width = '100%'
    self.layer.style.height = '100%'
    //
    const view = new View({}, self.context)
    const layer = view.layer
    layer.style.marginTop = '56px'
    layer.style.marginLeft = '16px'
    layer.style.width = 'calc(100% - 32px)'
    layer.style.height = 'calc(100% - 56px - 15px)'
    //
    const emptyStateMessageContainerView = commonComponents_emptyScreens.New_EmptyStateMessageContainerView(
      '👇',
      "To make Monero Requests,<br/><a href=\"https://mymonero.com\" target=\"_blank\" style='color: #11bbec; cursor: pointer; -webkit-user-select: none; text-decoration: none;'>download the app</a>.",
      self.context,
      0,
      0
    )
    view.addSubview(emptyStateMessageContainerView)
    self.addSubview(view)
  }

  //
  // Runtime - Accessors - Navigation
  Navigation_Title () {
    return 'Receive Monero'
  }
}
module.exports = RequestsDownloadAppEmptyScreenView
