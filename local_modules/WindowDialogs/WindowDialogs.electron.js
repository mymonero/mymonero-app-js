'use strict'

const WindowDialogs_Abstract = require('./WindowDialogs_Abstract')

class WindowDialogs extends WindowDialogs_Abstract {
  constructor (options, context) {
    super(options, context)
  }

  //
  //
  // Runtime - Imperatives - Dialogs
  //
  PresentQuestionAlertDialogWith (
    title,
    message,
    okButtonTitle,
    cancelButtonTitle,
    fn // (err?, didChooseYes?) -> Void
  ) {
    const self = this
    const remote = require('electron').remote
    const dialog = remote.dialog
    const electronWindow = remote.getCurrentWindow()
    const options =
		{
		  type: 'question',
		  buttons: [okButtonTitle, cancelButtonTitle],
		  title: title,
		  message: message
		}
    const clickedButtonIdx = dialog.showMessageBoxSync(
      electronWindow,
      options
    )
    const didChooseYes = clickedButtonIdx === 0
    fn(null, didChooseYes)
  }
}
module.exports = WindowDialogs
