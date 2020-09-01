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
const Views__cssRules = require('../Views/cssRules.web')
//
const SizeClasses =
{
	Large48: "large-48",
	Large43: "large-43",
	Medium32: "medium-32",
}
exports.SizeClasses = SizeClasses
//
const NamespaceName = "walletIcons"
const haveCSSRulesBeenInjected_documentKey = "__haveCSSRulesBeenInjected_"+NamespaceName
const cssRules =
[
	// set bg clr on .walletIcon and .walletIcon > span
	`.walletIcon {
	  position: relative;
	  background-repeat: no-repeat;
	  background-position: center;
	}`,
	//
	// size classes
	// large-48
	`.walletIcon.${SizeClasses.Large48} {
	  width: 48px;
	  height: 48px;
	  background-size: 48px 48px;
	}`,
	// large-43
	`.walletIcon.${SizeClasses.Large43} {
	  width: 43px;
	  height: 43px;
	  background-size: 43px 43px;
	}`,
	// medium-32
	`.walletIcon.${SizeClasses.Medium32} {
	  width: 32px;
	  height: 32px;
	  background-size: 32px 32px;
	}`
]
function __injectCSSRules_ifNecessary()
{
	Views__cssRules.InjectCSSRules_ifNecessary(haveCSSRulesBeenInjected_documentKey, cssRules)
}
//
function New_WalletIconLayer(context, optl_sizeClass)
{
	var sizeClass = optl_sizeClass || SizeClasses.Large48
	const assetsPath = context.crossPlatform_appBundledIndexRelativeAssetsRootPath + (context.ThemeController_rootPathSuffixPrefixingPathToFontFiles || "")
	//
	__injectCSSRules_ifNecessary()
	//
	const div = document.createElement("div")
	div.classList.add("walletIcon")
	div.classList.add(sizeClass)
	//
	div.ConfigureWithHexColorString = function(to_hexColorString)
	{
		const to_hexColorString_sansPound = to_hexColorString.substring(1, to_hexColorString.length)
		div.style.backgroundImage = `url(${assetsPath}MMAppUICommonComponents/Resources/wallet-${to_hexColorString_sansPound}@3x.png)`
	}
	//
	return div
}
exports.New_WalletIconLayer = New_WalletIconLayer