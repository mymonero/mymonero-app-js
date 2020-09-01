// Copyright (c) 2014-2019, MyMonero.com
//
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
//	conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
//	of conditions and the following disclaimer in the documentation and/or other
//	materials provided with the distribution.
//
// 3. Neither the name of the copyright holder nor the names of its contributors may be
//	used to endorse or promote products derived from this software without specific
//	prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
// EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL
// THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
// INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
// STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF
// THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
"use strict"
//
const commonComponents_navigationBarButtons = require('../MMAppUICommonComponents/navigationBarButtons.web')
//
const Views__cssRules = require('../Views/cssRules.web')
const NamespaceName = "ThemeController"
const haveCSSRulesBeenInjected_documentKey = "__haveCSSRulesBeenInjected_"+NamespaceName
function cssRules_generatorFn(context)
{
	const assetsPath = context.crossPlatform_appBundledIndexRelativeAssetsRootPath + (context.crossPlatform_indexContextRelativeAssetsRootPathSuffix || "")
	const cssRules =
	[
		`@font-face {
			font-family: Native-Regular;
			src: url("${assetsPath}Theme/Resources/Native-Regular.otf") format("opentype");
		}`,
		`@font-face {
			font-family: Native-Light;
			src: url("${assetsPath}Theme/Resources/Native-Light.otf") format("opentype");
		}`,
		`@font-face {
			font-family: Native-Bold;
			src: url("${assetsPath}Theme/Resources/Native-Bold.otf") format("opentype");
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
	//
	// Accessors - UI - Metrics - Layout
	TabBarView_thickness()
	{
		const self = this
		return self.context.TabBarView_thickness
	}
	TabBarView_isHorizontalBar()
	{
		const self = this
		return self.context.TabBarView_isHorizontalBar
	}
	//
	// Accessors - UI - Metrics - Fonts
	FontFamily_sansSerif()
	{
		return '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif'
	}
	FontFamily_monospaceLight()
	{
		return 'Native-Light, input, menlo, monospace'
	}
	FontFamily_monospaceRegular()
	{
		return 'Native-Regular, input, menlo, monospace'
	}
	FontFamily_monospaceBold()
	{
		return 'Native, input, menlo, monospace'
	}
	//
	// Accessors - Internal
	_shouldDisableChromeDesktopSpecificTextRendering()
	{
		const self = this
		return 
	}

	//
	// Imperatives - Centralizations of element styling (for, e.g. cross-platform support)
	StyleLayer_FontAsSmallRegularSansSerif(layer)
	{
		const self = this
		layer.style.fontFamily = self.FontFamily_sansSerif()
		layer.style.fontSize = "12px"
		layer.style.fontWeight = "500"
		if (self.context.ThemeController_isMobileBrowser === true) {
			//
		} else { 
			layer.style.webkitFontSmoothing = "subpixel-antialiased" // for chrome browser
			layer.style.letterSpacing = "0.5px"
		}
	}
	StyleLayer_FontAsSmallRegularMonospace(layer)
	{
		const self = this
		if (self.context.ThemeController_isMobileBrowser === true) {
			layer.style.fontFamily = self.FontFamily_monospaceRegular()
			layer.style.fontSize = "11px"
			layer.style.fontWeight = "lighter"
		} else { 
			layer.style.fontFamily = self.FontFamily_monospaceLight()
			layer.style.webkitFontSmoothing = "subpixel-antialiased" // for chrome browser
			layer.style.fontSize = "10px"
			layer.style.letterSpacing = "0.5px"
			if (typeof process !== 'undefined' && process.platform === "linux") {
				layer.style.fontWeight = "700" // surprisingly does not render well w/o this… not linux thing but font size thing. would be nice to know which font it uses and toggle accordingly. platform is best guess for now
			} else {
				layer.style.fontWeight = "300"
			}
		}
	}
	StyleLayer_FontAsMiddlingRegularMonospace(layer)
	{
		const self = this
		layer.style.fontFamily = self.FontFamily_monospaceRegular()
		layer.style.fontSize = "13px"
		layer.style.fontWeight = "normal"
	}
	StyleLayer_FontAsSubMiddlingRegularMonospace(layer)
	{
		const self = this
		layer.style.fontFamily = self.FontFamily_monospaceRegular()
		layer.style.fontSize = "12px"
		layer.style.fontWeight = "normal"
	}
	StyleLayer_FontAsMessageBearingSmallLightMonospace(layer)
	{
		const self = this
		layer.style.fontSize = "11px" // we need this to visually stand out slightly more given how it's used
		if (self.context.ThemeController_isMobileBrowser === true) { 
			layer.style.fontFamily = self.FontFamily_monospaceRegular()
			layer.style.fontWeight = "lighter"
		} else {
			layer.style.fontFamily = self.FontFamily_monospaceLight()
			layer.style.fontWeight = "100" // instead of 500, cause this color, white, is rendered strong
		}
	}
	StyleLayer_FontAsSmallLightMonospace(layer)
	{
		const self = this
		if (self.context.ThemeController_isMobileBrowser === true) { 
			layer.style.fontFamily = self.FontFamily_monospaceRegular()
			layer.style.fontSize = "11px"
			layer.style.fontWeight = "lighter"
		} else {
			layer.style.fontFamily = self.FontFamily_monospaceLight()
			layer.style.fontSize = "10px" // design says 11 but chrome renders too strongly; simulating with 10/0.5/500
			layer.style.letterSpacing = "0.5px"
			layer.style.fontWeight = "100" // instead of 500, cause this color, white, is rendered strong
		}
	}
	StyleLayer_FontAsSmallPillLightMonospace(layer)
	{
		const self = this
		if (self.context.ThemeController_isMobileBrowser === true) { 
			layer.style.fontFamily = self.FontFamily_monospaceRegular()
			layer.style.fontSize = "11px"
			layer.style.fontWeight = "lighter"
		} else {
			layer.style.fontFamily = self.FontFamily_monospaceLight()
			layer.style.fontSize = "10px"
			layer.style.letterSpacing = "0.8px"
			layer.style.fontWeight = "100"
		}
	}
	StyleLayer_FontAsMiddlingBoldSansSerif(layer)
	{
		const self = this
		layer.style.fontFamily = self.context.themeController.FontFamily_sansSerif()
		if (self.context.ThemeController_isMobileBrowser === true) { 
			layer.style.fontSize = "13px"
			layer.style.fontWeight = "bold"
	} else {
			layer.style.fontSize = "12px" // design says 13 but chrome/webkit/electron renders oddly, simulating with…
			layer.style.fontWeight = "500"
			layer.style.letterSpacing = "0.5px"
		}
	}
	StyleLayer_FontAsMiddlingSemiboldSansSerif(layer)
	{
		const self = this
		layer.style.fontFamily = self.context.themeController.FontFamily_sansSerif()
		if (self.context.ThemeController_isMobileBrowser === true) { 
			layer.style.fontSize = "13px"
			layer.style.fontWeight = "600" // semibold desired but "semibold" doesn't apparently work
		} else {
			layer.style.webkitFontSmoothing = "subpixel-antialiased"
			layer.style.fontSize = "12px" // design says 13 but chrome/desktop renders it too large
			layer.style.fontWeight = "400" // semibold desired
			layer.style.letterSpacing = "0.5px"
		}
	}
	StyleLayer_FontAsSmallSemiboldSansSerif(layer)
	{
		const self = this
		layer.style.fontFamily = self.context.themeController.FontFamily_sansSerif()
		if (self.context.ThemeController_isMobileBrowser === true) { 
			layer.style.fontSize = "11px"
			layer.style.fontWeight = "600" // semibold desired but "semibold" doesn't apparently work
		} else {
			layer.style.webkitFontSmoothing = "subpixel-antialiased"
			layer.style.fontSize = "11px"
			layer.style.fontWeight = "400" // semibold desired
			layer.style.letterSpacing = "0.5px"
		}
	}
	StyleLayer_FontAsMiddlingNormalSansSerif(layer)
	{
		const self = this
		layer.style.fontFamily = self.context.themeController.FontFamily_sansSerif()
		layer.style.letterSpacing = "0"
		layer.style.fontSize = "13px"
		if (self.context.ThemeController_isMobileBrowser === true) { 
			layer.style.fontWeight = "normal"
		} else {
			layer.style.webkitFontSmoothing = "subpixel-antialiased"
			layer.style.fontWeight = "300"
		}
	}
	StyleLayer_FontAsMiddlingButtonContentSemiboldSansSerif(
		layer, 
		isContentBrightNotDark
	)
	{
		const self = this
		layer.style.fontFamily = self.context.themeController.FontFamily_sansSerif()
		if (self.context.ThemeController_isMobileBrowser === true) { 
			layer.style.fontSize = "13px"
			layer.style.letterSpacing = "0"
			layer.style.fontWeight = "600"
		} else { // chrome/desktop/electron:
			layer.style.webkitFontSmoothing = "subpixel-antialiased"
			if (isContentBrightNotDark == true) {
				layer.style.fontSize = "12px" // appears slightly too small but 13 is far to big
				layer.style.letterSpacing = "0.5px"
				layer.style.fontWeight = "400"
			} else {
				layer.style.fontSize = "13px" // appears /slightly/ too bug but waygd 
				layer.style.letterSpacing = "0"
				layer.style.fontWeight = "600"
			}
		}
	}
	//
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
