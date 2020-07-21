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

const loader_innerHTML =
`<div class="loader">`
	+`<div class="block block1"></div>`
	+`<div class="block block2"></div>`
	+`<div class="block block3"></div>`
+`</div>`
//
function New_Graphic_ActivityIndicatorLayer(isOnAccentBackground)
{
	//
	const layer = document.createElement("div")
	layer.classList.add("graphicOnly")
	layer.classList.add('activityIndicators')
	if (isOnAccentBackground) {
		layer.classList.add('on-accent-background')
	} else {
		layer.classList.add('on-normal-background')
	}
	layer.innerHTML = loader_innerHTML
		
	return layer
}
exports.New_Graphic_ActivityIndicatorLayer = New_Graphic_ActivityIndicatorLayer
//
function New_Graphic_ActivityIndicatorLayer_htmlString(customCSSByKey, isOnAccentBackground)
{
	var style_str = ``
	customCSSByKey = customCSSByKey || {}
	const customCSSKeys = Object.keys(customCSSByKey)
	const customCSSKeys_length = customCSSKeys.length
	for (var i = 0 ; i < customCSSKeys_length ; i++) {
		const cssKey = customCSSKeys[i]
		const cssValue = customCSSByKey[cssKey]
		style_str += `${cssKey}: ${cssValue}; `
	}
	var classes = `graphicOnly activityIndicators`
	if (isOnAccentBackground) {
		classes += " on-accent-background"
	} else {
		classes += " on-normal-background"
	}
	const htmlString = `<div class="${classes}" style="${style_str}">`
		+ loader_innerHTML
		+ `</div>`

	return htmlString
}
exports.New_Graphic_ActivityIndicatorLayer_htmlString = New_Graphic_ActivityIndicatorLayer_htmlString

function New_GraphicAndLabel_ActivityIndicatorLayer(messageText, context)
{ // no support for isOnAccentBackground yet  
	const layer = document.createElement("div")
	layer.classList.add("graphicAndLabel")
	layer.classList.add('activityIndicators')
	layer.classList.add('on-normal-background')
	layer.style.fontFamily = 'Native-Light, input, menlo, monospace'
	layer.style.webkitFontSmoothing = "subpixel-antialiased" // for chrome browser
	layer.style.fontSize = "10px"
	layer.style.letterSpacing = "0.5px"
	if (typeof process !== 'undefined' && process.platform === "linux") {
		layer.style.fontWeight = "700" // surprisingly does not render well w/o this… not linux thing but font size thing. would be nice to know which font it uses and toggle accordingly. platform is best guess for now
	} else {
		layer.style.fontWeight = "300"
	}
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