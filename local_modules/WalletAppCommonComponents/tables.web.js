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
	{ // setup
		layer.innerHTML = "COPY"
		layer.style.float = "right"
		layer.style.textAlign = "right"
		layer.style.fontSize = "15px"
		layer.style.fontWeight = "bold"
	}
	var runtime_valueToCopy = value
	var runtime_pasteboard_valueContentType_orText = pasteboard_valueContentType_orText
	{ // component fns
		layer.Component_SetEnabled = function(enabled)
		{
			layer.Component_IsEnabled = enabled
			if (enabled !== false) {
				layer.href = "#" // to make it look clickable
				layer.style.color = "#6666ff"
			} else {
				layer.href = ""
				layer.style.color = "#444"
			}
		}
		layer.Component_SetValue = function(to_value, to_pasteboard_valueContentType_orText)
		{
			runtime_valueToCopy = to_value
			runtime_pasteboard_valueContentType_orText = to_pasteboard_valueContentType_orText
			if (to_value === "" || typeof to_value === 'undefined' || !to_value) {
				layer.Component_SetEnabled(false)
			} else {
				layer.Component_SetEnabled(true)
			}
		}
	}
	{ // initial config
		layer.Component_SetEnabled(enabled_orTrue)
	}
	{ // start observing
		layer.addEventListener(
			"click",
			function(e)
			{
				e.preventDefault()
				{
					if (layer.Component_IsEnabled !== false) {
						pasteboard.CopyString(
							runtime_valueToCopy, 
							runtime_pasteboard_valueContentType_orText
						)
					}
				}
				return false
			}
		)
	}
	return layer
}
exports.New_copyButton_aLayer = New_copyButton_aLayer
//
function New_deleteRecordNamedButton_aLayer(lowercased_humanReadable_recordName)
{
	const layer = document.createElement("a")
	{
		layer.innerHTML = "Delete this " + lowercased_humanReadable_recordName
		layer.href = "#" // to make it look clickable
		//
		layer.display = "block" // own line
		//
		layer.style.fontSize = "15px"
		layer.style.fontWeight = "bold"
		layer.style.color = "red" // TODO
	}
	return layer
}
exports.New_deleteRecordNamedButton_aLayer = New_deleteRecordNamedButton_aLayer
//
function New_createNewRecordNamedButton_aLayer(
	lowercased_humanReadable_recordName
)
{
	const layer = document.createElement("a")
	{
		layer.innerHTML = "+ CREATE NEW " + lowercased_humanReadable_recordName
		layer.href = "#" // to make it look clickable
		//
		layer.display = "block" // own line
		//
		layer.style.textDecoration = "none"
		layer.style.fontSize = "12px"
		layer.style.fontWeight = "bold"
		layer.style.color = "blue" // TODO
		layer.addEventListener(
			"mouseenter",
			function()
			{
				layer.style.textDecoration = "underline"
			}
		)
		layer.addEventListener(
			"mouseleave",
			function()
			{
				layer.style.textDecoration = "none"
			}
		)
	}
	return layer
}
exports.New_createNewRecordNamedButton_aLayer = New_createNewRecordNamedButton_aLayer
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
	var labelLayer;
	var copy_buttonLayer; // functionally namespaced for scope clarity in call to SetValue below
	var valueLayer;
	{
		{ // left
			labelLayer = New_fieldTitle_labelLayer(fieldLabelTitle)
			div.appendChild(labelLayer)
		}
		{ // right
			const buttonLayer = New_copyButton_aLayer(
				value,
				isValueNil === false ? true : false,
				pasteboard
			)
			copy_buttonLayer = buttonLayer // essential
			buttonLayer.style.float = "right"
			div.appendChild(buttonLayer)
		}
		{ // to put the tx hash on the next line in the UI to make way for the COPY button
			const clearingBreakLayer = document.createElement("br")
			clearingBreakLayer.clear = "both"
			div.appendChild(clearingBreakLayer)
		}
		valueLayer = New_fieldValue_labelLayer("" + valueToDisplay)
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
	{
		div.Component_SetValue = function(to_value)
		{
			const to_valueToDisplay = isValueNil === false ? "" + to_value : valueToDisplayIfValueNil_orDefault
			valueLayer.innerHTML = to_valueToDisplay
			copy_buttonLayer.Component_SetValue(to_value)
		}
	}
	//
	return div
}
exports.New_copyable_longStringValueField_component_fieldContainerLayer = New_copyable_longStringValueField_component_fieldContainerLayer