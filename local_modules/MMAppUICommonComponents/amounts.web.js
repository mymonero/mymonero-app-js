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
// const View = require('../Views/View.web')
const Views__cssRules = require('../Views/cssRules.web')
//
const commonComponents_tables = require('./tables.web')
const commonComponents_forms = require('./forms.web')
const commonComponents_ccySelect = require('./ccySelect.web')
//
const monero_config = require('../mymonero_core_js/monero_utils/monero_config')
//
const NamespaceName = "Forms.Amounts"
const haveCSSRulesBeenInjected_documentKey = "__haveCSSRulesBeenInjected_"+NamespaceName
const cssRules =
[
	// `.form_field .field_value {
	// 	-webkit-font-smoothing: subpixel-antialiased;
	// }`,
	// `.form_field .field_value::-webkit-input-placeholder  {
	// 	-webkit-font-smoothing: subpixel-antialiased;
	// 	color: #6B696B;
	// }`
]
function __injectCSSRules_ifNecessary() { Views__cssRules.InjectCSSRules_ifNecessary(haveCSSRulesBeenInjected_documentKey, cssRules) }
//
function New_AmountInputFieldPKG(
	context,
	optl__enterPressed_fn
)
{ // -> {} // Experimental 'pkg' style return… maybe refactor into View later
	const enterPressed_fn = optl__enterPressed_fn ? optl__enterPressed_fn : function() {}
	//
	let amountInput_baseW = 98
	let selectLayer_w = 40
	//
	const div = commonComponents_forms.New_fieldContainerLayer()
	div.style.position = "relative" // to have layout reset origin of any position=absolute items
	div.style.left = "0"
	div.style.top = "0"
	let container_padding_h = 22
	div.style.padding = `7px ${container_padding_h}px 0 ${container_padding_h}px`
	//
	const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("AMOUNT", context)
	div.appendChild(labelLayer)
	// ^ block
	const valueLayer = commonComponents_forms.New_fieldValue_textInputLayer(context, {
		placeholderText: "00.00"
	})
	// not going to set `pattern` attribute because it can't support periods
	// not going to set type="number" because it inserts commas, etc
	valueLayer.style.textAlign = "right"
	valueLayer.float = "left" // because we want it to be on the same line as the "XMR" label
	valueLayer.style.display = "inline-block" // so we can have the XMR label on the right
	valueLayer.style.width = amountInput_baseW+"px"
	let paddingRight = valueLayer.Component_default_padding_h() + selectLayer_w
	valueLayer.style.paddingRight = paddingRight+"px" // make room for the currency select
	valueLayer.addEventListener("keyup", function(e)
	{
		let keyCode = e.which || e.keyCode
		let code = e.code
		if (code == "Enter" || code == "Return" || keyCode === 13) {
			enterPressed_fn()
			return
		}
		let mutable_candidate_valueLayer_value = valueLayer.value
		{ // positive digits only
			mutable_candidate_valueLayer_value = mutable_candidate_valueLayer_value.replace(/[^0-9\.]/g,'')
		}
		{ // only one period max
			let components = mutable_candidate_valueLayer_value.split('.')
			if (components.length > 2) {
				// truncate
				mutable_candidate_valueLayer_value = components[0] + "." + components[1] 
			}
		}
		{ // disallow input which is toooo long. some values are out of spec
			let longestKnown_coinUnitPlaces = monero_config.coinUnitPlaces
			let maxText_length = longestKnown_coinUnitPlaces + 2 + 1 
			// ^-- I figure 14 numerals is a pretty good upper bound guess for inputs no matter what the currency… I might be wrong…
			if (mutable_candidate_valueLayer_value.length > maxText_length) {
				mutable_candidate_valueLayer_value = mutable_candidate_valueLayer_value.substr(0, maxText_length)
			}
		}
		//
		let final_value = mutable_candidate_valueLayer_value
		if (valueLayer.value != final_value) {
			valueLayer.value = final_value // this seems janky but it seems like the only sane way to support copy-paste, other keys, etc 
		}
	})
	div.appendChild(valueLayer)
	valueLayer.Component_ScrollIntoViewInFormContainerParent = function()
	{ // this could also be called on window resize
		const this_layer = this
		commonComponents_forms._shared_scrollConformingElementIntoView(this_layer)
	}
	if (context.CommonComponents_Forms_scrollToInputOnFocus == true) {
		valueLayer.addEventListener(
			"focus",
			function()
			{
				valueLayer.Component_ScrollIntoViewInFormContainerParent()
			}
		)
	}
	//
	// Currency picker
	// TODO: move these into class + css rules
	let selectLayer_left = container_padding_h + amountInput_baseW + 2*valueLayer.Component_default_padding_h() + 1.5
	let selectLayer_h = valueLayer.Component_default_h() + 0.5
	let ccySelectLayer = commonComponents_ccySelect.new_selectLayer()
	{
		context.themeController.StyleLayer_FontAsSmallSemiboldSansSerif(ccySelectLayer)
		//
		// TODO: move these into class + css rules
		//
		let selectLayer = ccySelectLayer
		// selectLayer.style.textAlign = "center"
		// selectLayer.style.textAlignLast = "center"
		selectLayer.style.textIndent = "8px" // looks /slightly/ worse but textAlign* didn't work in Safari
		// selectLayer.style.outline = "none" // actually going to leave outline enabled for now for accessibility purposes 
		selectLayer.style.color = "#DFDEDF"
		selectLayer.style.backgroundColor = "rgba(80, 74, 80, 0.55)"
		selectLayer.style.position = "absolute"
		selectLayer.style.left = selectLayer_left+"px" // b/c it does not include the currency select padding and is therefore the origin.x of the select element
		selectLayer.Component_default_top = function() { return 24 }
		selectLayer.style.top = selectLayer.Component_default_top()+"px" // is this constant much too fragile?
		selectLayer.style.width = selectLayer_w+"px"
		selectLayer.style.height =selectLayer_h+"px"
		selectLayer.style.border = "0"
		selectLayer.style.padding = "0"
		selectLayer.style.borderRadius = "0"
		selectLayer.style.webkitAppearance = "none" // apparently necessary in order to activate the following style.border…Radius
		let cornerRadius = 4
		selectLayer.style.borderTopRightRadius = cornerRadius+"px"
		selectLayer.style.borderBottomRightRadius = cornerRadius+"px"
		selectLayer.style.borderBottomLeftRadius = "0px"
		selectLayer.style.borderTopLeftRadius = "0px"
	}
	div.appendChild(ccySelectLayer)
	//
	//
	const effectiveAmountLabelLayer = commonComponents_forms.New_fieldTitle_labelLayer(
		"", 
		context
	)
	effectiveAmountLabelLayer.style.display = "inline-block"
	effectiveAmountLabelLayer.style.margin = "0 0 0 8px"
	effectiveAmountLabelLayer.style.verticalAlign = "middle"
	effectiveAmountLabelLayer.style.color = "#8D8B8D"
	context.themeController.StyleLayer_FontAsSubMiddlingRegularMonospace(effectiveAmountLabelLayer)
	div.appendChild(effectiveAmountLabelLayer)
	//
	div.appendChild(commonComponents_tables.New_clearingBreakLayer())
	
	return {
		containerLayer: div,
		labelLayer: labelLayer,
		valueLayer: valueLayer,
		ccySelectLayer: ccySelectLayer,
		effectiveAmountLabelLayer: effectiveAmountLabelLayer
	}
}
exports.New_AmountInputFieldPKG = New_AmountInputFieldPKG