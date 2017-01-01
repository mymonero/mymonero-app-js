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
	layer.style.padding = "18px 0"
	//
	return layer
}
exports.New_fieldContainerLayer = _new_fieldContainerLayer
//
function _new_fieldTitle_labelLayer(labelText)
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
exports.New_fieldTitle_labelLayer = _new_fieldTitle_labelLayer
//
function _new_fieldValue_labelLayer(labelText)
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
exports.New_fieldValue_labelLayer = _new_fieldValue_labelLayer
//
function _new_separatorLayer()
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
exports.New_separatorLayer = _new_separatorLayer
//
function _new_copyButton_aLayer(value, enabled_orTrue, pasteboard)
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
					pasteboard.CopyString(value)
				}
				return false
			}
		)
	}
	//
	return layer
}
exports.New_copyButton_aLayer = _new_copyButton_aLayer
//
function _new_clearingBreakLayer()
{
	const layer = document.createElement("br")
	layer.clear = "both"
	//
	return layer
}
exports.New_clearingBreakLayer = _new_clearingBreakLayer
//
function _new_inlineMessageDialogLayer(messageString)
{
	const layer = document.createElement("div")
	layer.innerHTML = messageString
	layer.style.border = "1px solid #ccc"
	layer.style.backgroundColor = "#333"
	layer.style.margin = "0 0 10px 0"
	//
	return layer
}
exports.New_inlineMessageDialogLayer = _new_inlineMessageDialogLayer