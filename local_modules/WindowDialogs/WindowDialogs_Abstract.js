"use strict"

class WindowDialogs_Abstract
{
	constructor(options, context)
	{
		const self = this
		{
			self.options = options
			self.context = context
		}
	}
	//
	//
	// Runtime - Imperatives - Dialogs
	//
	PresentQuestionAlertDialogWith(
		title,
		message,
		okButtonTitle,
		cancelButtonTitle,
		fn // (err?, didChooseYes?) -> Void
	) {
		const self = this
		const errStr = "Override PresentQuestionAlertDialogWith in " + self.constructor.name
		fn(new Error(errStr))
		throw errStr // to break development builds
	}
}
module.exports = WindowDialogs_Abstract
