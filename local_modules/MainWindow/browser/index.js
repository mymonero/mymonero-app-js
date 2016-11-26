"use strict"

function test()
{
	const tooltips_utils = require('../../Tooltips/tooltips_utils')
	const testKey = "creatingWallet__mnemonicString"
	var tooltipTextString = undefined;
	try {
		tooltipTextString = tooltips_utils.TooltipTextStringForKey(testKey)
	} catch (e) {
		console.error("❌  Failed to get tooltip for key " + testKey + " with error: " + e)
		return
	}
	console.log("✅  Tooltip for key " + testKey + " is '" + tooltipTextString + "'")
}
test()
