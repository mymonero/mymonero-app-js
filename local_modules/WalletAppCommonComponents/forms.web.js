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
function _new_fieldContainerLayer()
{
	const layer = document.createElement("div")
	layer.style.padding = "0 10px"
	//
	return layer
}
exports.New_fieldContainerLayer = _new_fieldContainerLayer
//
function New_fieldTitle_labelLayer(labelText, context)
{
	const layer = document.createElement("span")
	{
		layer.innerHTML = labelText
		layer.style.display = "block" // own line
		layer.style.margin = "18px 0 9px 11px"
		layer.style.textAlign = "left"
		layer.style.fontSize = "11px"
		layer.style.color = "#f8f7f8"
		layer.style.fontFamily = context.themeController.FontFamily_monospace()
		layer.style.fontWeight = "100"
	}
	return layer
}
exports.New_fieldTitle_labelLayer = New_fieldTitle_labelLayer
//
function New_fieldValue_textInputLayer(params)
{
	const layer = document.createElement("input")
	{
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
		layer.style.height = "30px"
		layer.style.width = `calc(100% - 4px - ${2 * 10}px)`
		layer.style.borderRadius = "4px"
		layer.style.textAlign = "left"
		layer.style.fontSize = "13px"
		layer.style.padding = "0 10px"
		layer.style.fontFamily = "monospace"
		layer.style.border = "none"
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
	const view = new View({ tag: "textarea" }, context)
	const layer = view.layer
	{
		layer.style.display = "block" // own line
		const existingValue = params.existingValue
		if (typeof existingValue !== 'undefined' && existingValue !== null) {
			layer.value = existingValue
		}
		const placeholderText = params.placeholderText
		if (typeof placeholderText !== 'undefined' && placeholderText !== null) {
			layer.placeholder = placeholderText
		}
		layer.style.className = "form-input"
		const padding_h = 9
		layer.style.padding = `9px ${padding_h}px`
		layer.style.height = `${62 - 2 * padding_h}px`
		layer.style.width = `calc(100% - 4px - ${2 * padding_h}px)`
		layer.style.borderRadius = "3px"
		layer.style.border = "none"
		layer.style.boxShadow = "0 0.5px 0 0 rgba(56,54,56,0.50), inset 0 0.5px 0 0 #161416"
		layer.style.textAlign = "left"
		layer.style.fontSize = "13px"
		layer.style.lineHeight = "15px"
		layer.style.resize = "none" // not user-resizable
		layer.style.outline = "none" // no focus ring
		layer.style.fontFamily = context.themeController.FontFamily_monospace()
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