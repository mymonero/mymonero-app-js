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
const k_knobWidth = 12
const k_visibleTrackHeight = 2
const k_runnableTrackHeight = k_knobWidth + 2
//
// CSS rules
const NamespaceName = "labeledRangeInputs"
const haveCSSRulesBeenInjected_documentKey = "__haveCSSRulesBeenInjected_"+NamespaceName
const cssRules =
[
	`.labeledRangeInput-container {
		background: none;
	}`,
	`.labeledRangeInput-container.disabled {
		opacity: 0.5;
	}`,
	`.labeledRangeInput-container input[type=range] {
		-webkit-appearance: none;
		background: none;
		position: relative;
		z-index: 100; /* above custom track */
	}`,
	`.labeledRangeInput-container input[type=range]:focus {
		-webkit-appearance: none;
		outline: none;
	}`,
	`.labeledRangeInput-container input[type=range]::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		
		height: ${k_knobWidth}px;
		width: ${k_knobWidth}px;
		border-radius:100%;
		margin-top: 1px; /* minor visual */

		background:#494749;
		cursor: pointer;
		box-shadow:0 2px 4px 0 rgba(0,0,0,0.50), 0 0.5px 1px 0 #161416, inset 0 0.5px 0 0 #6b696b;
	}`,
	// :active
	`.labeledRangeInput-container:not(.disabled) input[type=range]:active::-webkit-slider-thumb {
		background:#404040;
		box-shadow:0 1px 1px 0 rgba(0,0,0,0.50), 0 0.5px 0.5px 0 #161416, inset 0 0.5px 0 0 #505050;
	}`,
	`.labeledRangeInput-container input[type=range]::-webkit-slider-runnable-track {
		-webkit-appearance: none;
		cursor: pointer;
		
		width:100%;
		height: ${k_runnableTrackHeight}px;
	}`,
	`.labeledRangeInput-container .slider-runnable-track {		
		position: absolute;
		z-index: 1;
		left: ${k_knobWidth/2}px;
		right: ${k_knobWidth/2}px;
		bottom: ${k_runnableTrackHeight/2 - k_visibleTrackHeight/2 + 3}px;
		background:#1d1b1d;
		box-shadow:0 0 0 0 rgba(56,54,56,0.50), inset 0 0 0 0 #161416;
		border-radius:${k_visibleTrackHeight/2}px;
		height:${k_visibleTrackHeight}px;
	}`,
	`.labeledRangeInput-container.disabled input[type=range]::-webkit-slider-thumb,
	 .labeledRangeInput-container.disabled input[type=range]::-webkit-slider-runnable-track {
		cursor: default !important;
	}`,
]
function __injectCSSRules_ifNecessary()
{
	Views__cssRules.InjectCSSRules_ifNecessary(haveCSSRulesBeenInjected_documentKey, cssRules)
}
//
function New_fieldValue_labeledRangeInputView(params, context)
{
	__injectCSSRules_ifNecessary()
	//
	const changed_fn = params.changed_fn || function(value) {}
	const finalized_labelText_fn = params.finalized_labelText_fn || function(float_inputValue) { return "" + float_inputValue }
	//
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
	const labelFor_min = params.slideSideLabelFor_min || "" + min
	const labelStyleWidthFor_min = params.slideSideLabelStyleWidthFor_min || "50px"
	const labelFor_max = params.slideSideLabelFor_max || "" + max
	const labelStyleWidthFor_max = params.slideSideLabelStyleWidthFor_max || "50px"
	//
	const view = new View({ tag: "table" }, context)
	const table = view.layer
	table.className = "labeledRangeInput-container"
	table.style.height = "40px"
	table.style.width = "100%"
	table.style.paddingTop = "14px"
	//
	const tr = document.createElement("tr")
	table.appendChild(tr)
	//
	function __new_sliderSide_labelLayer(text)
	{
		const sliderSide_labelLayer = document.createElement("div")
		sliderSide_labelLayer.innerHTML = text
		sliderSide_labelLayer.style.fontFamily = context.themeController.FontFamily_monospaceLight()
		sliderSide_labelLayer.style.color = "#8d8b8d"
		sliderSide_labelLayer.style.webkitFontSmoothing = "subpixel-antialiased"
		sliderSide_labelLayer.style.fontSize = "11px"
		return sliderSide_labelLayer
	}
	const td_1 = document.createElement("td")
	td_1.align = "left"
	td_1.valign = "bottom"
	td_1.style.width = labelStyleWidthFor_min
	const min_labelLayer = __new_sliderSide_labelLayer(labelFor_min)
	min_labelLayer.style.marginBottom = "-10px"
	td_1.appendChild(min_labelLayer)
	tr.appendChild(td_1)
	//
	const td_2 = document.createElement("td")
	td_2.style.position = "relative"
	td_2.style.left = "0"
	td_2.style.top = "0"
	td_2.style.width = "calc(100% - 10px)"
	td_2.style.padding = "0 5px"
	tr.appendChild(td_2)
	//
	const labelLayer = document.createElement("div")
	labelLayer.style.position = "relative"
	labelLayer.style.top = "-10px"
	const labelLayer_width = 100 // give it enough room for most labels - 'auto' would be nice
	labelLayer.style.width = labelLayer_width + "px"
	labelLayer.style.textAlign = "center"
	labelLayer.style.height = "15px"
	labelLayer.style.fontFamily = context.themeController.FontFamily_monospaceLight()
	labelLayer.style.fontWeight = "100"
	labelLayer.style.webkitFontSmoothing = "subpixel-antialiased"
	labelLayer.style.color = "#f8f8f8"
	labelLayer.style.fontSize = "11px"
	td_2.appendChild(labelLayer) // must be in container rather than on slider
	//
	const sliderRunnableTrackGraphicLayer = document.createElement("div")
	sliderRunnableTrackGraphicLayer.className = "slider-runnable-track"
	td_2.appendChild(sliderRunnableTrackGraphicLayer)
	//
	const layer = document.createElement("input")
	{
		layer.type = "range"
		layer.min = min
		layer.max = max
		layer.step = step
		layer.value = value
		//
		layer.className = "labeledRangeInput"
		layer.style.width = "100%"
		layer.style.display = "inline-block"
	}
	td_2.appendChild(layer)
	//
	const td_3 = document.createElement("td")
	td_3.align = "right"
	td_3.style.width = labelStyleWidthFor_max
	const max_labelLayer = __new_sliderSide_labelLayer(labelFor_max)
	max_labelLayer.style.marginBottom = "-10px"
	td_3.appendChild(max_labelLayer)
	tr.appendChild(td_3)
	//
	layer.onchange = function()
	{
		changed_fn(layer.value)		
	}
	layer.oninput = function()
	{
		view._updatedAndLayoutLabel()
	}
	view._window_resize_fn = function()
	{
		view._updatedAndLayoutLabel()
	}
	window.addEventListener('resize', view._window_resize_fn)
	view.__finalized_labelText_fn = function(inputValue)
	{
		const float_inputValue = parseFloat(inputValue)
		const float_max = parseFloat(max)
		// ^- going to assuming float is a good medium for numerical comparison - supposing JS doesn't screw it up
		if (isNaN(float_inputValue)) {
			throw "Range input value cannot be parsed as float for comparison"
		}
		if (isNaN(float_max)) {
			throw "Range input max cannot be parsed as float for comparison"
		}
		if (float_inputValue === float_max) {
			if (isMaxInfinity) {
				return labelForInfinity
			}
		}
		// else let consumer finalize
		return finalized_labelText_fn(float_inputValue)
	}
	//
	view._updatedAndLayoutLabel = function()
	{
		labelLayer.innerHTML = view.__finalized_labelText_fn(layer.value)
		//
		const offsetWidth = layer.offsetWidth
		var knob_next_x_pct = (layer.value - min) / range
		if (knob_next_x_pct < 0) {
			knob_next_x_pct = 0
		} else if (knob_next_x_pct > 1) {
			knob_next_x_pct = 1
		}
		const knob_x_px = offsetWidth * knob_next_x_pct
		const next_x_px = knob_x_px - (labelLayer_width/2) - k_knobWidth*(knob_next_x_pct-0.5) // this -knobWidth*pct-.5 is to offset the label in relation to the knob's displacement from the center as knob ends never move past track ends
		labelLayer.style.left = next_x_px + "px"
	}
	view._updatedAndLayoutLabel() // initial
	//
	view.TearDown = function()
	{ // NOTE: you must call this!
		console.log("♻️  Tearing down labeled range input.")
		window.removeEventListener('resize', view._window_resize_fn)
	}
	//
	view.SetValueMax = function()
	{
		layer.value = max
		view._updatedAndLayoutLabel()
	}
	view.SetValue = function(value)
	{
		layer.value = value
		view._updatedAndLayoutLabel()
	}
	view.SetEnabled = function(isEnabled)
	{
		view.isEnabled = isEnabled
		if (isEnabled == false) {
			view.layer.classList.add("disabled")
		} else {
			view.layer.classList.remove("disabled")
		}
		layer.disabled = !isEnabled
	}
	//
	return view
}
exports.New_fieldValue_labeledRangeInputView = New_fieldValue_labeledRangeInputView
//
function New_fieldValue_timeBasedLabeledRangeInputView(params, context)
{
	const optl_displayAsMinutesAtXMin = params.displayAsMinutesAtXMin
	var isToDisplayAsMinsAfterXMin = typeof optl_displayAsMinutesAtXMin !== 'undefined' ? true : false
	params.finalized_labelText_fn = function(float_inputValue)
	{
		if (isToDisplayAsMinsAfterXMin) {
			const secondsAtWhichToDisplayAsMins = optl_displayAsMinutesAtXMin * 60.0
			if (float_inputValue >= secondsAtWhichToDisplayAsMins) {
				return (float_inputValue/60.0).toFixed(0) + "m" // decimal pl makes it look a little sloppy
			}
		}

		return float_inputValue + "s"
	}
	//
	const view = New_fieldValue_labeledRangeInputView(params, context)
	return view
}
exports.New_fieldValue_timeBasedLabeledRangeInputView = New_fieldValue_timeBasedLabeledRangeInputView
//