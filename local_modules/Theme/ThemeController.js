"use strict"

const commonComponents_navigationBarButtons = require('../MMAppUICommonComponents/navigationBarButtons.web')

const Views__cssRules = require('../Views/cssRules.web')
const NamespaceName = "ThemeController"
const haveCSSRulesBeenInjected_documentKey = "__haveCSSRulesBeenInjected_"+NamespaceName
function cssRules_generatorFn(context)
{
	const cssRules =
	[
		`@font-face {
			font-family: Native-Regular;
			src: url(../../Theme/Resources/Native-Regular.otf") format("opentype");
		}`,
		`@font-face {
			font-family: Native-Light;
			src: url("../../Theme/Resources/Native-Light.otf") format("opentype");
		}`,
		`@font-face {
			font-family: Native-Bold;
			src: url("../../Theme/Resources/Native-Bold.otf") format("opentype");
		}`,
	]
	return cssRules
}
function __injectCSSRules_ifNecessary(context) 
{
	Views__cssRules.InjectCSSRules_ifNecessary(
		haveCSSRulesBeenInjected_documentKey, 
		cssRules_generatorFn,
		context
	)
}

//
class ThemeController
{
	constructor(options, context)
	{
		const self = this
		self.options = options
		self.context = context
		__injectCSSRules_ifNecessary(context)
	}

	// Delegation/Accessors/Protocol - Navigation Bar View - Buttons - Back button
	NavigationBarView__New_back_leftBarButtonView(clicked_fn)
	{
		const self = this
		const view = commonComponents_navigationBarButtons.New_LeftSide_BackButtonView(self.context)
		const layer = view.layer
		layer.addEventListener(
			"click",
			function(e)
			{
				e.preventDefault()
				if (view.isEnabled !== false) { // button is enabled
					clicked_fn()
				}
				return false
			}
		)
		return view
	}
}
module.exports = ThemeController
