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
const commonComponents_forms = require('./forms.web')
//
const NamespaceName = "contactPicker_Lite" 
const haveCSSRulesBeenInjected_documentKey = "__haveCSSRulesBeenInjected_"+NamespaceName
const cssRules =
[
]
function __injectCSSRules_ifNecessary() { Views__cssRules.InjectCSSRules_ifNecessary(haveCSSRulesBeenInjected_documentKey, cssRules) }
//
function New_contactPickerLayer_Lite(
	context,
	placeholderText, 
	didFinishTypingInInput_fn // ((event) -> Void)?
) //  -> Component (which is just a customized DOM element obj)
{ // NOTE: You must be able (the interface must exist) to call Component_TearDown when you're done with this component to comply with the Full contact picker
	__injectCSSRules_ifNecessary()
	//
	const containerLayer = document.createElement("div")
	containerLayer.classList.add(NamespaceName)
	containerLayer.style.position = "relative"
	containerLayer.style.width = "100%"
	containerLayer.style.webkitUserSelect = "none" // disable selection
	containerLayer.style.MozUserSelect = "none"
	containerLayer.style.msUserSelect = "none"
	containerLayer.style.userSelect = "none"
	//
	const inputLayer = _new_inputLayer(placeholderText, context)
	containerLayer.ContactPicker_inputLayer = inputLayer // so it can be accessed by consumers who want to check if the inputLayer is empty on their submission
	containerLayer.appendChild(inputLayer)
	{ // observation of inputLayer
		var isFocused = false
		var hideResultsOnBlur_timeout = null
		inputLayer.addEventListener(
			"blur",
			function(event)
			{
				isFocused = false
			}
		)
		inputLayer.addEventListener(
			"focus",
			function(event)
			{
				isFocused = true
				//
				if (context.CommonComponents_Forms_scrollToInputOnFocus == true) {
					inputLayer.Component_ScrollIntoViewInFormContainerParent()
				}
			}
		)
		inputLayer.Component_ScrollIntoViewInFormContainerParent = function()
		{ // this could also be called on window resize
			const this_layer = this
			commonComponents_forms._shared_scrollConformingElementIntoView(this_layer)
		}
		var typingDebounceTimeout = null
		function _inputLayer_receivedInputOrChanged(optl_event)
		{
			//
			// timeout-clearing key pressed
			if (typingDebounceTimeout !== null) {
				clearTimeout(typingDebounceTimeout)
			}
			const this_inputLayer = this
			typingDebounceTimeout = setTimeout(function()
			{ // to prevent searching too fast
				typingDebounceTimeout = null // clear for next
				//
				if (didFinishTypingInInput_fn) {
					didFinishTypingInInput_fn(optl_event)
				}

				// _searchForAndDisplaySearchResults() // there isn't this call in .Lite.

			}, 350)
		}
		inputLayer.addEventListener(
			"input", 
			function()
			{
				_inputLayer_receivedInputOrChanged(undefined) // this might seem redundant and/or to race with "keyup" but it doesn't affect _inputLayer_receivedInputOrChanged 
			}
		)
		inputLayer.addEventListener(
			"change", // try to catch paste on as many platforms as possible
			function()
			{
				_inputLayer_receivedInputOrChanged(undefined) // this might seem redundant and/or to race with "keyup" but it doesn't affect _inputLayer_receivedInputOrChanged 
			}
		)
		inputLayer.addEventListener(
			"keyup",
			function(event)
			{
				const code = event.code
				const wasEscapeKey = code == "Escape" || event.keyCode == 27 /* should we use keyCode? */
				if (wasEscapeKey) { // toggle search results visibility
					// TODO: clear input? esp if esc hit twice?
					return // think it's ok to just return here and not mess with the typingDebounceTimeout
				}
				const wasOnlyModifierKey = code.indexOf("Meta") != -1 || code.indexOf("Alt") != -1 || code.indexOf("Control") != -1
				if (wasOnlyModifierKey) {
					console.log("Input was only modifier key. Ignoring.")
					return
				}
				_inputLayer_receivedInputOrChanged(event)
			}
		)
	}
	containerLayer.ContactPicker_unpickExistingContact_andRedisplayPickInput = function(andDoNotFocus) { /*noOp*/ } // Present here b/c we must maintain the same interface!!
	//
	// imperatives
	containerLayer.Component_TearDown = function()
	{
		console.log("♻️  Tearing down (Lite) contacts picker.")
	}
	//
	return containerLayer
}
exports.New_contactPickerLayer_Lite = New_contactPickerLayer_Lite
//
function _new_inputLayer(placeholderText, context)
{
	const layer = commonComponents_forms.New_fieldValue_textInputLayer(context, {
		placeholderText: placeholderText
	})
	return layer
}