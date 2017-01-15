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
function New_fieldContainerLayer()
{
	const layer = document.createElement("div")
	layer.style.padding = "18px 0"
	//
	return layer
}
exports.New_fieldContainerLayer = New_fieldContainerLayer
//
function New_fieldTitle_labelLayer(labelText)
{
	const layer = document.createElement("span")
	{
		layer.innerHTML = labelText
		layer.style.float = "left"
		layer.style.textAlign = "left"
		layer.style.fontSize = "14px"
		layer.style.fontWeight = "bold"
		layer.style.color = "#ccc"
		layer.style.fontFamily = "\"Helvetica Neue\", Helvetica, sans-serif"
	}				
	return layer
}
exports.New_fieldTitle_labelLayer = New_fieldTitle_labelLayer
//
function New_fieldValue_labelLayer(labelText)
{
	const layer = document.createElement("span")
	{
		layer.innerHTML = labelText
		layer.style.float = "right"
		layer.style.textAlign = "right"
		layer.style.fontSize = "14px"
		layer.style.color = "#aaa"
		layer.style.fontFamily = "monospace"
	}
	return layer
}
exports.New_fieldValue_labelLayer = New_fieldValue_labelLayer
//
function New_separatorLayer()
{
	const layer = document.createElement("div")
	{
		layer.style.width = "calc(100% - 15px)"
		layer.style.marginLeft = "15px"
		layer.style.height = "1px"
		layer.style.backgroundColor = "#666"
		layer.style.color = "#ccc"
	}				
	return layer
}
exports.New_separatorLayer = New_separatorLayer
//
function New_copyButton_aLayer(value, enabled_orTrue, pasteboard, pasteboard_valueContentType_orText)
{
	const layer = document.createElement("a")
	{
		layer.innerHTML = "COPY"
		layer.style.float = "right"
		layer.style.textAlign = "right"
		layer.style.fontSize = "15px"
		layer.style.fontWeight = "bold"
		//
		layer.style.color = enabled_orTrue !== false ? "#6666ff" : "#444"
		if (enabled_orTrue === true) {
			layer.href = "#" // to make it look clickable
		}
		
	}
	if (enabled_orTrue !== false) {
		layer.addEventListener(
			"click",
			function(e)
			{
				e.preventDefault()
				{ // this should capture value
					pasteboard.CopyString(value, pasteboard_valueContentType_orText)
				}
				return false
			}
		)
	}
	//
	return layer
}
exports.New_copyButton_aLayer = New_copyButton_aLayer
//
function New_clearingBreakLayer()
{
	const layer = document.createElement("br")
	layer.clear = "both"
	//
	return layer
}
exports.New_clearingBreakLayer = New_clearingBreakLayer
//
function New_spacerLayer()
{
	const layer = document.createElement("div")
	layer.style.width = "100%"
	layer.style.height = "40px" // just tentative - feel free to customize
	//
	return layer
}
exports.New_spacerLayer = New_spacerLayer
//
function New_inlineMessageDialogLayer(messageString)
{
	const layer = document.createElement("div")
	layer.innerHTML = messageString
	layer.style.border = "1px solid #ccc"
	layer.style.backgroundColor = "#333"
	layer.style.margin = "0 0 10px 0"
	layer.style.display = "none" // initial visibility
	{
		layer.SetValidationError = function(to_messageString)
		{
			layer.innerHTML = to_messageString
			layer.style.display = "block"
		}
		layer.ClearAndHideMessage = function()
		{
			layer.innerHTML = ""
			layer.style.display = "none"
		}
	}
	{
		// TODO: add X button which removes layer from parent (i think)
	}
	return layer
}
exports.New_inlineMessageDialogLayer = New_inlineMessageDialogLayer
//
function New_copyable_longStringValueField_component_fieldContainerLayer(
	fieldLabelTitle, 
	value,
	pasteboard, 
	valueToDisplayIfValueNil_orDefault
)
{ 
	const isValueNil = value === null || typeof value === 'undefined' || value === ""
	const valueToDisplay = isValueNil === false ? value : valueToDisplayIfValueNil_orDefault
	const div = New_fieldContainerLayer()
	{
		{ // left
			const labelLayer = New_fieldTitle_labelLayer(fieldLabelTitle)
			div.appendChild(labelLayer)
		}
		{ // right
			const buttonLayer = New_copyButton_aLayer(
				value,
				isValueNil === false ? true : false,
				pasteboard
			)
			buttonLayer.style.float = "right"
			div.appendChild(buttonLayer)
		}
		{ // to put the tx hash on the next line in the UI to make way for the COPY button
			const clearingBreakLayer = document.createElement("br")
			clearingBreakLayer.clear = "both"
			div.appendChild(clearingBreakLayer)
		}
		const valueLayer = New_fieldValue_labelLayer("" + valueToDisplay)
		{ // special case
			valueLayer.style.float = "left"
			valueLayer.style.textAlign = "left"
			//
			valueLayer.style.width = "270px"
			//
			// valueLayer.style.webkitUserSelect = "all" // commenting for now as we have the COPY button
		}
		div.appendChild(valueLayer)
	}
	div.appendChild(New_clearingBreakLayer()) // preserve height; better way?
	//
	return div
}
exports.New_copyable_longStringValueField_component_fieldContainerLayer = New_copyable_longStringValueField_component_fieldContainerLayer