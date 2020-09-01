// Copyright (c) 2014-2019, MyMonero.com
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
const className_onNormalBackground = "on-normal-background"
const className_onAccentBackground = "on-accent-background"
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
		box-shadow: inset 0 1px 0 rgba(73, 71, 73, 0.5), 0 1px 1px rgba(0, 0, 0, 0.3);
	}`,
	`.${NamespaceName}.${className_onNormalBackground} .loader > .block  {
		background-color: #383638;
		animation: block-animate-normal-bg .75s infinite ease-in-out;
	}`,
	`.${NamespaceName}.${className_onAccentBackground} .loader > .block  {
		background-color: #5A585A;
		animation: block-animate-on-accent-bg .75s infinite ease-in-out;
	}`,
	/* 
  		the following animation-delays use "!important" as a short-cut to give the CSS rules more
  	 weight than the above "on*Background" variants' "animation" styles which would override the delay
  	 */
	`.${NamespaceName} .loader > .block1 {
		animation-delay: -1.2s !important;
	}`,
	`.${NamespaceName} .loader > .block2 {
		animation-delay: -1.0s !important;
	}`,
	`.${NamespaceName} .loader > .block3 {
		animation-delay: -0.8s !important;
	}`,
	`@keyframes block-animate-normal-bg {
		0%, 20%, 60%, 100% {
			transform: translateY(2px);
			background-color: #383638;
		}
		40% {
			transform: translateY(0);
			background-color: #494749;
		}
	}`,
	`@keyframes block-animate-on-accent-bg {
		0%, 20%, 60%, 100% {
			transform: translateY(2px);
			background-color: #5A585A;
		}
		40% {
			transform: translateY(0);
			background-color: #7C7A7C;
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
const loader_innerHTML = 
`<div class="loader">`
	+`<div class="block block1"></div>`
	+`<div class="block block2"></div>`
	+`<div class="block block3"></div>`
+`</div>`
//
function New_Graphic_ActivityIndicatorLayer(isOnAccentBackground)
{
	__injectCSSRules_ifNecessary()
	//
	const layer = document.createElement("div")
	layer.classList.add("graphicOnly")
	layer.classList.add(NamespaceName)
	if (isOnAccentBackground) {
		layer.classList.add(className_onAccentBackground)
	} else {
		layer.classList.add(className_onNormalBackground)
	}
	layer.innerHTML = loader_innerHTML
		
	//
	return layer		
}
exports.New_Graphic_ActivityIndicatorLayer = New_Graphic_ActivityIndicatorLayer
//
function New_Graphic_ActivityIndicatorLayer_htmlString(customCSSByKey, isOnAccentBackground)
{
	__injectCSSRules_ifNecessary()
	//
	var style_str = ``
	customCSSByKey = customCSSByKey || {}
	const customCSSKeys = Object.keys(customCSSByKey)
	const customCSSKeys_length = customCSSKeys.length
	for (var i = 0 ; i < customCSSKeys_length ; i++) {
		const cssKey = customCSSKeys[i]
		const cssValue = customCSSByKey[cssKey]
		style_str += `${cssKey}: ${cssValue}; `
	}
	var classes = `graphicOnly ${NamespaceName}`
	if (isOnAccentBackground) {
		classes += " " + className_onAccentBackground
	} else {
		classes += " " + className_onNormalBackground
	}
	const htmlString = `<div class="${classes}" style="${style_str}">`
		+ loader_innerHTML
		+ `</div>`
	//
	return htmlString
}
exports.New_Graphic_ActivityIndicatorLayer_htmlString = New_Graphic_ActivityIndicatorLayer_htmlString
//
function New_GraphicAndLabel_ActivityIndicatorLayer(messageText, context)
{ // no support for isOnAccentBackground yet  
	__injectCSSRules_ifNecessary()
	const layer = document.createElement("div")
	layer.classList.add("graphicAndLabel")
	layer.classList.add(NamespaceName)
	layer.classList.add(className_onNormalBackground)
	context.themeController.StyleLayer_FontAsSmallRegularMonospace(layer)
	layer.style.color = "#F8F7F8"
	//
	layer.Component_setMessageText = function(to_messageText)
	{
		const html = loader_innerHTML
			+`&nbsp;`
			+`<span>${to_messageText}</span>`
		layer.innerHTML = html
	}
	layer.Component_setMessageText(messageText)
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