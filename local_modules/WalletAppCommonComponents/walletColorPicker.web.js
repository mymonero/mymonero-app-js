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
const commonComponents_walletIcons = require('./walletIcons.web')
const commonComponents_cssRules = require('./cssRules.web')
//
// CSS rules
const NamespaceName = "walletColorPicker"
const haveCSSRulesBeenInjected_documentKey = "__haveCSSRulesBeenInjected_"+NamespaceName
document[haveCSSRulesBeenInjected_documentKey] = false
const cssRules =
[
	`.oneOfN-walletColorPicker{
		margin-left: -9px;
	}`,
	// set bg clr on .walletIcon and .walletIcon > span
	`.oneOfN-walletColorPicker li {
		position: relative;
		left: 0;
		top: 0;
		background:#383638;
		box-shadow:0 0 1px 0 #161416, inset 0 .5px 0 0 #494749;
		border-radius:5px;
		width:88px;
		height:88px;
		display: inline-block;
		margin: 0 0 5px 9px;
	}`,
	`.oneOfN-walletColorPicker li .walletIcon {
		position: absolute;
		top: 20px;
		left: 20px;
		z-index: 0;
	}`,
	`.oneOfN-walletColorPicker li label {
		position: absolute;
		top: 0px;
		left: 0px;
		width: 88px;
		height: 88px;
		z-index: 1;
	}`,
	`.oneOfN-walletColorPicker li input {
		position: absolute;
		top: 0px;
		left: 0px;
		width: 88px;
		height: 88px;
		z-index: 3;
		visibility: hidden;
	}`,
	`.oneOfN-walletColorPicker li .selectionIndicator {
		position: absolute;
		top: 0px;
		left: 0px;
		width: 80px;
		height: 80px;
		z-index: 2;
		border-radius: 5px;
	}`,
	`.oneOfN-walletColorPicker li input:checked ~ .selectionIndicator {
		border: 4px solid #00c6ff;
	}`,
]
function __injectCSSRules_ifNecessary()
{
	commonComponents_cssRules.InjectCSSRules_ifNecessary(haveCSSRulesBeenInjected_documentKey, cssRules)
}
//
function New_1OfN_WalletColorPickerInputView(context, selectHexColorString_orUndefForDefault)
{
	const walletsListController = context.walletsListController
	const hexColorStrings = walletsListController.All_SwatchHexColorStrings()
	const numberOf_hexColorStrings = hexColorStrings.length
	var selectHexColorString = null
	{
		if (typeof selectHexColorString_orUndefForDefault !== 'undefined') {
			selectHexColorString = selectHexColorString_orUndefForDefault
		} else {
			const alreadyInUseHexStrings = walletsListController.GivenBooted_SwatchesInUse()
			var aFree_hexColorString = null;
			for (let i = 0 ; i < numberOf_hexColorStrings ; i++) {
				const this_hexColorString = hexColorStrings[i]
				if (alreadyInUseHexStrings.indexOf(this_hexColorString) === -1) {
					aFree_hexColorString = this_hexColorString
					break
				}				
			}
			if (aFree_hexColorString !== null) {
				selectHexColorString = aFree_hexColorString
			} else {
				selectHexColorString = hexColorStrings[0] // just use the first one - all are already in use
			}
		}
	}
	//
	__injectCSSRules_ifNecessary()
	//
	const View = require('../Views/View.web')
	const view = new View({ tag: "ul" }, context)
	const fieldName = view.View_UUID()
	const ul = view.layer
	ul.className = "oneOfN-walletColorPicker"
	ul.style.listStyleType = "none"
	hexColorStrings.forEach(
		function(hexColorString, i)
		{
			const li = document.createElement("li")
			{
				const div = commonComponents_walletIcons.New_WalletIconLayer(
					hexColorString
				)
				li.appendChild(div)
			}
			const label = document.createElement("label")
			li.appendChild(label)
			{
				const input = document.createElement("input")
				input.type = "radio"
				input.name = fieldName
				input.id = input.name + "__" + hexColorString
				if (hexColorString === selectHexColorString) {
					input.checked = "checked"
				}
				label.appendChild(input) // append to label to get clickable
			}
			{ // selection indicator layer - must be /after/ input for sibling CSS to work
				const div = document.createElement("div")
				div.className = "selectionIndicator"
				label.appendChild(div) // append to label to make sibling of radio input f orCSS
			}
			ul.appendChild(li)
		}
	)
	view.Component_Value = function()
	{
		var inputs = document.getElementsByName(fieldName) // fieldName is unique
		const numberOf_inputs = inputs.length // should be same as numberOf_hexColorStrings
		for (var i = 0; i < numberOf_inputs ; i++) {
			const input = inputs[i]
		    if (input.checked) {
				return input.value
		    }
		}
		throw "Didn't find a selected wallet swatch color."
		return undefined
	}
	return view
}
exports.New_1OfN_WalletColorPickerInputView = New_1OfN_WalletColorPickerInputView

