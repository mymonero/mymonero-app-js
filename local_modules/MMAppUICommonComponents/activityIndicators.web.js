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