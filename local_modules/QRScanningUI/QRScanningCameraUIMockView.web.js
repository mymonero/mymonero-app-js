"use strict"

const View = require('../Views/View.web')
const commonComponents_navigationBarButtons = require('../MMAppUICommonComponents/navigationBarButtons.web')

class QRScanningCameraUIMockView extends View
{
	constructor(options, context)
	{
		super(options, context)
		const self = this
		self.cancelButtonTapped_fn = options.cancelButtonTapped_fn
	}
	//
	// Runtime - Accessors - Navigation
	Navigation_Title()
	{
		return "Scan QR Code"
	}
	Navigation_New_LeftBarButtonView()
	{
		const self = this
		const view = commonComponents_navigationBarButtons.New_LeftSide_CancelButtonView(self.context)
		const layer = view.layer
		layer.addEventListener(
			"click",
			function(e)
			{
				e.preventDefault()
				self.options.cancelButtonTapped_fn()
				return false
			}
		)
		return view
	}
}
module.exports = QRScanningCameraUIMockView
