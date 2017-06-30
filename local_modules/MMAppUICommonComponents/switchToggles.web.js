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
const k_transitionTime         = 0.2
const k_height                 = 12 
const k_width                  = k_height * 2 
const k_knobHeight             = k_height - 4 
const k_knobWidth              = k_height - 4 
const k_backgroundColor        = "#1D1B1D"
const k_backgroundColorChecked = "#1D1B1D"
const k_knobColor              = "#333638"
const k_knobColorChecked       = "#00C6FF"
//
// CSS rules
const NamespaceName = "switchToggles"
const haveCSSRulesBeenInjected_documentKey = "__haveCSSRulesBeenInjected_"+NamespaceName
const cssRules =
[
	`.switch {
		display: flex;
		justify-content: space-between;
		margin-left: 8px;
		padding: 13px 0px 13px 0px;
		cursor: pointer;
	}`,
	`.switch.border {
		border-bottom: 1px solid #383638;
	}`,
	`.switch .note {
		align-self: flex-start;
		color: #8D8B8D;
	}`,
	`.switch .toggle {
		visibility: hidden;
		position: absolute;
		margin-left: -9999px;
	}`,
	`.switch input.toggle+label {
		align-self: flex-end;
		height: ${k_height}px;
		width:  ${k_width}px;
		background-color: ${k_backgroundColor};
		box-shadow: 0 0.5px 0 0 rgba(56,54,56,0.5), inset 0 0.5px 0 0 #161416;
		border-radius: 100px;
		transition: background ${k_transitionTime}s;
		display: block;
		position: relative;
		outline: none;
	}`,
	`.switch input.toggle:checked+label {
		background-color: ${k_backgroundColorChecked};
	}`,
	`.switch input.toggle+label:before {
		height: ${k_height}px;
		width: ${k_width}px;
		background-color: ${k_backgroundColor};
		border-radius: 100px;
		transition: background ${k_transitionTime}s;
	}`,
	`.switch input.toggle:checked+label:before {
		background-color: ${k_backgroundColorChecked};
	}`,
	`.switch input.toggle+label:after {
		top: 2px;
		left: 2px;
		bottom: 2px;
		height: ${k_knobHeight}px;
		width:  ${k_knobWidth}px;
		background-color: ${k_knobColor}; 
		box-shadow: 0 0.5px 1px 0 #161416, inset 0 0.5px 0 0 #494749;
		border-radius: 21px;
		transition: transform ${k_transitionTime}s, background ${k_transitionTime}s;
	}`,
	`.switch input.toggle:checked+label:after {
		transform: translateX(${k_width - k_height}px);
		background-color: ${k_knobColorChecked};
		box-shadow: inset 0 0 0 0 rgba(255,255,255,0.2); 
		transition: transform ${k_transitionTime}s, background ${k_transitionTime}s;
	}`,
	`.switch input.toggle+label:before, .switch input.toggle+label:after {
		display: block;
		position: absolute;
		content: "";
	}`,
]
function __injectCSSRules_ifNecessary()
{
	Views__cssRules.InjectCSSRules_ifNecessary(haveCSSRulesBeenInjected_documentKey, cssRules)
}
//
function New_fieldValue_switchToggle(params, context)
{
	__injectCSSRules_ifNecessary()
	const name = params.name || "toggle"
	const note = params.note || "note"
	const border = params.border

	const view = new View({ tag: "div" }, context)
	const container = view.layer

	container.className = "switch"
	container.className += border ? " border" : ""

	const noteDiv = document.createElement("span")
	noteDiv.className = "note"
	context.themeController.StyleLayer_FontAsMessageBearingSmallLightMonospace(noteDiv)
	noteDiv.innerHTML = note 
	container.appendChild(noteDiv)

	const input = document.createElement("input")
	input.id = name 
	input.className = "toggle"
	input.type = "checkbox"
	container.appendChild(input)
	

	const label = document.createElement("label")
	label.for = input.id

	container.onclick = function()
	{
		input.click() 
	}

	container.appendChild(label)

	return view
}
exports.New_fieldValue_switchToggle = New_fieldValue_switchToggle
