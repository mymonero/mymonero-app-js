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
const Views__cssRules = require('../Views/cssRules.web')
//
const NamespaceName = "activityIndicators"
const haveCSSRulesBeenInjected_documentKey = "__haveCSSRulesBeenInjected_"+NamespaceName
const cssRules =
[
	`.${NamespaceName} .loader > .block  {
		margin: 1px;
		float: left;
		width: 3px;
		height: 8px;
		border-radius: 2px;
		background-color: #383638;
		box-shadow: inset 0 1px 0 rgba(73, 71, 73, 0.5), 0 1px 1px rgba(0, 0, 0, 0.3);
		animation: block-animate .75s infinite ease-in-out;
  	}`,
	`.${NamespaceName} .loader > .block1 {
		animation-delay: -1.2s;
  	}`,
	`.${NamespaceName} .loader > .block2 {
		animation-delay: -1.0s;
  	}`,
	`.${NamespaceName} .loader > .block3 {
		animation-delay: -0.8s;
  	}`,
	`@keyframes block-animate {
		0%, 20%, 60%, 100% {
			transform: translateY(2px);
			background-color: #383638;
		}
		40% {
			transform: translateY(0);
			background-color: #494749;
		} 
	}`,
	//
	// .graphicAndLabel
	`.${NamespaceName}.graphicAndLabel {
		padding: 8px 10px 7px 32px;
	}`,
	`.${NamespaceName}.graphicAndLabel > div.loader {
		display: inline-block;
		position: relative;
		top: 0px;
	}`,
	`.${NamespaceName}.graphicAndLabel > span {
		display: inline-block;
	}`
]
function __injectCSSRules_ifNecessary() { Views__cssRules.InjectCSSRules_ifNecessary(haveCSSRulesBeenInjected_documentKey, cssRules) }
//
function New_GraphicAndLabel_ActivityIndicatorLayer(messageText, context)
{
	__injectCSSRules_ifNecessary()
	const layer = document.createElement("div")
	layer.classList.add("graphicAndLabel")
	layer.classList.add(NamespaceName)
	layer.innerHTML = 
		`<div class="loader">`
			+`<div class="block block1"></div>`
			+`<div class="block block2"></div>`
			+`<div class="block block3"></div>`
		+`</div>`
		+`&nbsp;`
		+`<span>${messageText}</span>`
	context.themeController.StyleLayer_FontAsSmallRegularMonospace(layer)
	layer.style.color = "#F8F7F8"
	//
	return layer		
}
exports.New_GraphicAndLabel_ActivityIndicatorLayer = New_GraphicAndLabel_ActivityIndicatorLayer
function New_Resolving_ActivityIndicatorLayer(context)
{
	const layer = New_GraphicAndLabel_ActivityIndicatorLayer( // will call `__inject…`
		"RESOLVING…",
		context
	)
	return layer
}
exports.New_Resolving_ActivityIndicatorLayer = New_Resolving_ActivityIndicatorLayer