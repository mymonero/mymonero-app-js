// Copyright (c) 2014-2017, MyMonero.com
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
const cssRules =
[
	`@font-face {
		font-family: Native-Regular;
		src: url("${__dirname}/Resources/Native-Regular.otf") format("opentype");
	}`,
	`@font-face {
		font-family: Native-Light;
		src: url("${__dirname}/Resources/Native-Light.otf") format("opentype");
	}`,
	`@font-face {
		font-family: Native-Bold;
		src: url("${__dirname}/Resources/Native-Bold.otf") format("opentype");
	}`,
]
function __injectCSSRules_ifNecessary() { Views__cssRules.InjectCSSRules_ifNecessary(haveCSSRulesBeenInjected_documentKey, cssRules) }

//
class ThemeController
{
	constructor(options, context)
	{
		const self = this
		self.options = options
		self.context = context
		__injectCSSRules_ifNecessary()
	}
	//
	//
	// Accessors - UI - Metrics - Layout
	//
	TabBarView_thickness()
	{
		return 79
	}
	//
	//
	// Accessors - UI - Metrics - Fonts
	//
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
	//
	// Delegation/Accessors/Protocol - Navigation Bar View - Buttons - Back button
	//
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
