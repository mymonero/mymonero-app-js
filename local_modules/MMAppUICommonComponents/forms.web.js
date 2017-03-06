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
const Views__cssRules = require('../Views/cssRules.web')
//
const NamespaceName = "Forms"
const haveCSSRulesBeenInjected_documentKey = "__haveCSSRulesBeenInjected_"+NamespaceName
const cssRules =
[
	`.form_field {
		padding: 0 14px 20px 14px;
	}`,
	`.form_field .field_title {
	}`,
	`.form_field .field_value {
		-webkit-font-smoothing: subpixel-antialiased;
	}`,
	`.form_field .field_value::-webkit-input-placeholder  {
		-webkit-font-smoothing: subpixel-antialiased;
		color: #6B696B;
	}`
]
function __injectCSSRules_ifNecessary() { Views__cssRules.InjectCSSRules_ifNecessary(haveCSSRulesBeenInjected_documentKey, cssRules) }
//
function _new_fieldContainerLayer()
{
	__injectCSSRules_ifNecessary()
	const layer = document.createElement("div")
	layer.className = "form_field"
	return layer
}
exports.New_fieldContainerLayer = _new_fieldContainerLayer
//
function New_fieldTitle_labelLayer(labelText, context)
{
	__injectCSSRules_ifNecessary()
	const layer = document.createElement("span")
	layer.className = "field_title"
	layer.innerHTML = labelText
	layer.style.webkitUserSelect = "none"
	layer.style.display = "block" // own line
	layer.style.margin = "15px 0 8px 8px"
	layer.style.textAlign = "left"
	layer.style.webkitFontSmoothing = "subpixel-antialiased"
	layer.style.fontSize = "10px" // design says 11 but chrome renders too strongly; simulating with 10/0.5/500
	layer.style.letterSpacing = "0.5px"
	layer.style.fontWeight = "100" // instead of 500, cause this color, white, is rendered strong
	layer.style.color = "#F8F7F8"
	layer.style.fontFamily = context.themeController.FontFamily_monospace()
	return layer
}
exports.New_fieldTitle_labelLayer = New_fieldTitle_labelLayer
//
function New_fieldTitle_rightSide_accessoryLayer(labelText, context)
{
	__injectCSSRules_ifNecessary()
	const layer = New_fieldTitle_labelLayer("optional", context)
	layer.style.float = "right"
	layer.style.color = "#6B696B"
	layer.style.fontSize = "11px"
	layer.style.letterSpacing = "0"
	layer.style.marginRight = "10px"
	return layer
}
exports.New_fieldTitle_rightSide_accessoryLayer = New_fieldTitle_rightSide_accessoryLayer
//
function New_fieldValue_textInputLayer(context, params)
{
	__injectCSSRules_ifNecessary()
	const layer = document.createElement("input")
	{
		layer.className = "field_value"
		layer.type = "text"
		layer.style.display = "block" // own line
		const existingValue = params.existingValue
		if (typeof existingValue !== 'undefined' && existingValue !== null) {
			layer.value = existingValue
		}
		const placeholderText = params.placeholderText
		if (typeof placeholderText !== 'undefined' && placeholderText !== null) {
			layer.placeholder = placeholderText
		}
		layer.style.height = "29px"
		const padding_h = 7
		if (typeof params.target_width !== 'undefined') {
			const width = params.target_width - 4 - 2 * padding_h
			layer.style.width = width + "px"
		} else {
			layer.style.width = `calc(100% - 4px - ${2 * padding_h}px)`
		}
		layer.style.borderRadius = "4px"
		layer.style.border = "1px solid rgba(0,0,0,0)" // transparent border to preserve layout while showing validation clr border
		layer.style.textAlign = "left"
		layer.style.fontSize = "13px"
		layer.style.fontWeight = "200"
		layer.style.padding = `0 ${padding_h}px`
		layer.style.fontFamily = context.themeController.FontFamily_monospace()
		layer.style.outline = "none" // no focus ring
	}
	{
		layer.Component_MakeNonEditable = function()
		{
			layer.style.boxShadow = "none"
			layer.style.color = "#dfdedf"
			layer.style.backgroundColor = "#1d1b1d"
			layer.disabled = true
		}
		layer.Component_MakeEditable = function()
		{
			layer.style.boxShadow = "0 0.5px 0 0 rgba(56,54,56,0.50), inset 0 0.5px 0 0 #161416"
			layer.style.color = "#dfdedf"
			layer.style.backgroundColor = "#1d1b1d"
			layer.disabled = false
		}
	}
	{
		if (params.isNonEditable === true) {
			layer.Component_MakeNonEditable()
		} else {
			layer.Component_MakeEditable()
		}
	}
	return layer
}
exports.New_fieldValue_textInputLayer = New_fieldValue_textInputLayer
//
function New_fieldValue_textAreaView(params, context)
{
	__injectCSSRules_ifNecessary()
	const view = new View({ tag: "textarea" }, context)
	const layer = view.layer
	{
		layer.className = "field_value"
		layer.style.display = "block" // own line
		const existingValue = params.existingValue
		if (typeof existingValue !== 'undefined' && existingValue !== null) {
			layer.value = existingValue
		}
		const placeholderText = params.placeholderText
		if (typeof placeholderText !== 'undefined' && placeholderText !== null) {
			layer.placeholder = placeholderText
		}
		const padding_h = 8
		layer.style.padding = `9px ${padding_h}px`
		layer.style.height = `${62 - 2 * padding_h}px`
		layer.style.width = `calc(100% - 4px - ${2 * padding_h}px)`
		layer.style.borderRadius = "3px"
		layer.style.border = "none"
		layer.style.boxShadow = "0 0.5px 0 0 rgba(56,54,56,0.50), inset 0 0.5px 0 0 #161416"
		layer.style.textAlign = "left"
		layer.style.fontSize = "13px"
		layer.style.fontWeight = "100"
		layer.style.lineHeight = "15px"
		layer.style.resize = "none" // not user-resizable
		layer.style.outline = "none" // no focus ring
		layer.style.fontFamily = context.themeController.FontFamily_monospace()
		layer.style.wordBreak = "break-word"
	}
	{
		view.SetEnabled = function(isEnabled)
		{
			if (isEnabled) {
				layer.style.boxShadow = "0 0.5px 0 0 rgba(56,54,56,0.50), inset 0 0.5px 0 0 #161416"
				//
				layer.style.color = "#dfdedf"
				layer.style.backgroundColor = "#1d1b1d"
			} else {
				layer.style.boxShadow = "none"
				//
				layer.style.color = "#dfdedf"
				layer.style.backgroundColor = "#1d1b1d"
			}
			view.isEnabled = isEnabled // this going to cause a retain cycle ? 
		}
	}
	view.SetEnabled(true)
	return view
}
exports.New_fieldValue_textAreaView = New_fieldValue_textAreaView
//
function New_fieldValue_selectLayer(params)
{
	__injectCSSRules_ifNecessary()
	const values = params.values || []
	const layer = document.createElement("select")
	{
		values.forEach(
			function(value, i)
			{
				const optionLayer = document.createElement("option")
				optionLayer.value = value
				optionLayer.innerHTML = "" + value
				layer.appendChild(optionLayer)
			}
		)
	}
	{
		const existingValue = params.existingValue
		if (typeof existingValue !== 'undefined' && existingValue !== null) {
			layer.value = existingValue
		}
		layer.style.display = "inline-block"
		layer.style.height = "30px"
		layer.style.width = `calc(100% - 4px - ${2 * 10}px)`
		layer.style.border = "1px inset #222"
		layer.style.borderRadius = "4px"
		layer.style.textAlign = "left"
		layer.style.fontSize = "14px"
		layer.style.color = "#ccc"
		layer.style.backgroundColor = "#444"
		layer.style.padding = "0 10px"
		layer.style.fontFamily = "monospace"
	}				
	return layer
}
exports.New_fieldValue_selectLayer = New_fieldValue_selectLayer
//
function New_fieldAccessory_messageLayer(context)
{
	__injectCSSRules_ifNecessary()
	const layer = document.createElement("p")
	layer.style.fontFamily = context.themeController.FontFamily_monospace()
	layer.style.fontSize = "11px"
	layer.style.lineHeight = "15px"
	layer.style.fontWeight = "100"
	layer.style.margin = "7px 7px 0 7px"
	layer.style.color = "#8d8b8d"
	layer.style.wordBreak = "break-word"
	layer.style.webkitUserSelect = "none"
	return layer
}
exports.New_fieldAccessory_messageLayer = New_fieldAccessory_messageLayer
function New_fieldAccessory_validationMessageLayer(context)
{
	__injectCSSRules_ifNecessary()
	const layer = New_fieldAccessory_messageLayer(context)
	layer.style.color = "#f97777"
	return layer
}
exports.New_fieldAccessory_validationMessageLayer = New_fieldAccessory_validationMessageLayer