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
const View = require('../Views/View.web')
const commonComponents_cssRules = require('./cssRules.web')
//
const NamespaceName = "walletMnemonicBox"
const haveCSSRulesBeenInjected_documentKey = "__haveCSSRulesBeenInjected_"+NamespaceName
document[haveCSSRulesBeenInjected_documentKey] = false
const cssRules =
[
	`.mnemonic-container {
		background: #1D1B1D;
		box-shadow: inset 0 1px 0 0 #161416, 0 0.5px 0 0 rgba(56, 54, 56, 0.5);
		border-radius: 5px;
		margin: 0 auto 23px auto;
	}`,
	`.mnemonic-container a {
		cursor: default;
	}`,
	`.mnemonic-pill,
	 .mnemonic-pill--is-pressed {
		color: white;
		text-decoration: none;
		text-transform: uppercase;
		font-size: 11px;
		font-family: native, input, menlo, monspace;
		letter-spacing: 0.05rem;
		font-weight: 400;
		background: #383638;
		padding: 0.25rem 0.5rem;
		margin: 0.25rem;
		border-radius: 3px;
		box-shadow: inset 0 0.5px 0 0 #494749, 0 0.5px 1px 0 #161416;
		transition: all 0.1s ease-out;
	}`,
	`.mnemonic-pill:hover,
	 .mnemonic-pill--is-pressed:hover {
		background: #494749;
		box-shadow: inset 0 0.5px 0 0 #5A585A, 0 0.5px 1px 0 #161416;
		transition: all 0.1s ease-out;
	}`,
	`.mnemonic-pill--is-pressed,
	 .mnemonic-pill--is-pressed--is-pressed {
		color: #1D1B1D;
		background: #1D1B1D;
		box-shadow: inset 0 1px 0 0 #161416, 0 0.5px 0 0 rgba(56, 54, 56, 0.5);
	}`,
	`.mnemonic-pill--is-pressed:hover,
	 .mnemonic-pill--is-pressed--is-pressed:hover {
		color: #1D1B1D;
		background: #1D1B1D;
		box-shadow: inset 0 1px 0 0 #161416, 0 0.5px 0 0 rgba(56, 54, 56, 0.5);
	}`
]
function __injectCSSRules_ifNecessary()
{
	commonComponents_cssRules.InjectCSSRules_ifNecessary(haveCSSRulesBeenInjected_documentKey, cssRules)
}
//
function New_MnemonicTextDisplayView(mnemonicString, context)
{
	__injectCSSRules_ifNecessary()
	//
	const view = new View({}, context)
	const layer = view.layer
	layer.className = "mnemonic-container"
	const padding_h = 36
	layer.style.minHeight = `${128 - 2*padding_h}px`
	layer.style.padding = `${padding_h}px 24px`
	layer.style.width = `calc(100% - ${2*16}px - ${2*24}px)`
	layer.style.wordBreak = "break-word"
	layer.style.lineHeight = "22px"
	layer.style.fontSize = "13px"
	layer.style.webkitUserSelect = "all" // allow selection here
	layer.style.fontFamily = context.themeController.FontFamily_monospace()
	layer.innerHTML = mnemonicString
	//
	return view
}
exports.New_MnemonicTextDisplayView = New_MnemonicTextDisplayView
//
function New_MnemonicConfirmation_SelectedWordsView(mnemonicString, context)
{
	__injectCSSRules_ifNecessary()
	//
	const view = new View({}, context)
	const layer = view.layer
	layer.className = "mnemonic-container"
	const padding_h = 24
	layer.style.minHeight = `${128 - 2*padding_h}px`
	layer.style.padding = `${padding_h}px 24px`
	layer.style.width = `calc(100% - ${2*16}px - ${2*24}px)`
	//
	return view
}
exports.New_MnemonicConfirmation_SelectedWordsView = New_MnemonicConfirmation_SelectedWordsView