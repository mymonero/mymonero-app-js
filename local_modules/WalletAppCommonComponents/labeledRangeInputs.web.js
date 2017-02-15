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
const k_knobWidth = 12
//
function New_fieldValue_labeledRangeInputView(params, context)
{
	const changed_fn = params.changed_fn || function(value) {}
	const min = params.min
	const max = params.max
	const range = max - min
	const step = params.step
	const optl_existingValue = params.existingValue
	const optl_defaultValue = params.default
	const value = typeof optl_existingValue !== 'undefined' && optl_existingValue !== null ? optl_existingValue 
					: typeof optl_defaultValue !== 'undefined' && optl_defaultValue !== null ? optl_defaultValue
					: min
	const isMaxInfinity = params.isMaxInfinity === true ? true : false
	const labelForInfinity = params.labelForInfinity || "Infinity" // like "Never"
	//
	const view = new View({ tag: "div" }, context)
	const containerLayer = view.layer
	containerLayer.style.position = "relative"
	containerLayer.style.left = "0"
	containerLayer.style.top = "0"
	containerLayer.style.height = "40px"
	containerLayer.style.paddingTop = "10px"
	//
	const labelLayer = document.createElement("div")
	labelLayer.style.position = "relative"
	labelLayer.style.top = "-10px"
	const labelLayer_width = 100 // give it enough room for most labels - 'auto' would be nice
	labelLayer.style.width = labelLayer_width + "px"
	labelLayer.style.textAlign = "center"
	labelLayer.style.height = "15px"
	labelLayer.style.fontFamily = context.themeController.FontFamily_monospace()
	labelLayer.style.color = "#ffffff"
	labelLayer.style.fontSize = "11px"
	containerLayer.appendChild(labelLayer) // must be in container rather than on slider
	//
	const layer = document.createElement("input")
	{
		layer.type = "range"
		layer.min = min
		layer.max = max
		layer.step = step
		layer.value = value
	}
	{
		layer.style.backgroundColor = "blue"
		layer.style.width = "100%"
	}
	containerLayer.appendChild(layer)
	//
	layer.onchange = function()
	{
		changed_fn(layer.value)		
	}
	layer.oninput = function()
	{
		view._layoutLabel()
	}
	//
	view._layoutLabel = function()
	{
		labelLayer.innerHTML = layer.value
		const offsetWidth = layer.offsetWidth
		const next_x_pct = (layer.value - min) / range
		if (next_x_pct < 0) {
			next_x_pct = 0
		} else if (next_x_pct > 1) {
			next_x_pct = 1
		}
		const knob_x_px = offsetWidth * next_x_pct
		const next_x_px = knob_x_px - (labelLayer_width/2) - k_knobWidth*(next_x_pct-0.5) // this -knobWidth*pct-.5 is to offset the label in relation to the knob's displacement from the center
		labelLayer.style.left = next_x_px + "px"
	}
	view._layoutLabel() // initial
	//
	return view
}
exports.New_fieldValue_labeledRangeInputView = New_fieldValue_labeledRangeInputView
//
function New_fieldValue_timeBasedLabeledRangeInputView(params, context)
{
	const optl_displayAsMinutesAfterXMin = params.displayAsMinutesAfterXMin
	//
	const view = New_fieldValue_labeledRangeInputView(params, context)
	return view
}
exports.New_fieldValue_timeBasedLabeledRangeInputView = New_fieldValue_timeBasedLabeledRangeInputView
//