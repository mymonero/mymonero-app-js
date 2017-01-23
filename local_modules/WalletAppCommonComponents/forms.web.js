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
function _new_fieldContainerLayer()
{
	const layer = document.createElement("div")
	layer.style.padding = "18px 10px"
	//
	return layer
}
exports.New_fieldContainerLayer = _new_fieldContainerLayer
//
function New_fieldTitle_labelLayer(labelText)
{
	const layer = document.createElement("span")
	{
		layer.innerHTML = labelText
		layer.style.display = "block" // own line
		layer.style.margin = "0 0 4px 0"
		layer.style.textAlign = "left"
		layer.style.fontSize = "11px"
		layer.style.fontWeight = "light"
		layer.style.color = "#ccc"
		layer.style.fontFamily = "\"Helvetica Neue\", Helvetica, sans-serif"
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
	}
	{
		layer.Component_MakeNonEditable = function()
		{
			layer.style.backgroundColor = "#777"
			layer.style.border = "0"
			layer.style.color = "#ccc"
			layer.disabled = true
		}
		layer.Component_MakeEditable = function()
		{
			layer.style.backgroundColor = "#444"
			layer.style.border = "1px inset #222"
			layer.style.color = "#ccc"
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