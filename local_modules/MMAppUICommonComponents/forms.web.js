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
const commonComponents_tables = require('./tables.web')
//
const NamespaceName = "Forms"
const haveCSSRulesBeenInjected_documentKey = "__haveCSSRulesBeenInjected_"+NamespaceName
const cssRules =
[
	`.form_field {
		padding: 0 24px 20px 24px;
	}`,
	`.form_field .field_title {
	}`,
	`.form_field .field_value {
		-webkit-font-smoothing: subpixel-antialiased;
	}`,
	`.form_field .field_value::-webkit-input-placeholder  {
		-webkit-font-smoothing: subpixel-antialiased;
		color: #6B696B;
	}`,
	//
	// .iconAndMessageLayer
	`.iconAndMessageLayer {
		padding: 7px 10px 7px 10px;
	}`,
	`.iconAndMessageLayer > img {
		display: inline-block;
		position: relative;
		top: 1px;
	}`,
	`.iconAndMessageLayer > span {
		display: inline-block;
	}`
]
function __injectCSSRules_ifNecessary() { Views__cssRules.InjectCSSRules_ifNecessary(haveCSSRulesBeenInjected_documentKey, cssRules) }
//
function New_fieldContainerLayer(context)
{
	__injectCSSRules_ifNecessary()
	const layer = document.createElement("div")
	layer.className = "form_field"
	return layer
}
exports.New_fieldContainerLayer = New_fieldContainerLayer
//
function New_fieldTitle_labelLayer(labelText, context)
{
	__injectCSSRules_ifNecessary()
	const layer = document.createElement("span")
	layer.className = "field_title"
	layer.innerHTML = labelText
	layer.style.webkitUserSelect = "none"
	layer.style.display = "block" // own line
	layer.style.margin = "15px 0 8px 8px"
	layer.style.textAlign = "left"
	layer.style.color = "#F8F7F8"
	//
	context.themeController.StyleLayer_FontAsSmallRegularMonospace(layer)
	//
	return layer
}
exports.New_fieldTitle_labelLayer = New_fieldTitle_labelLayer
//
function New_fieldTitle_rightSide_accessoryLayer(labelText, context)
{
	__injectCSSRules_ifNecessary()
	const layer = New_fieldTitle_labelLayer("optional", context)
	layer.style.float = "right"
	layer.style.color = "#6B696B"
	layer.style.fontSize = "11px"
	layer.style.letterSpacing = "0"
	layer.style.marginRight = "10px"
	return layer
}
exports.New_fieldTitle_rightSide_accessoryLayer = New_fieldTitle_rightSide_accessoryLayer
//
function ClassNameForScrollingAncestorOfScrollToAbleElement()
{
	return "ClassNameForScrollingAncestorOfScrollToAbleElement"
}
exports.ClassNameForScrollingAncestorOfScrollToAbleElement = ClassNameForScrollingAncestorOfScrollToAbleElement
function ScrollCurrentFormElementIntoView()
{ // not a factory but a convenience function for call, e.g.. on window resize
	const activeElement = document.activeElement
	if (activeElement) {
		const tagName = activeElement.tagName
		if (tagName == "INPUT" || tagName == "TEXTAREA") {
			const scrollToView_fn = activeElement.Component_ScrollIntoViewInFormContainerParent
			// does it conform to informal 'protocol'?
			// doing it this way instead of just calling _shared_scrollElementIntoView…
			// so that elements can declare if they want to conform
			if (scrollToView_fn && typeof scrollToView_fn === "function") {
				scrollToView_fn.apply(activeElement)
			}
		}
	}
}
exports.ScrollCurrentFormElementIntoView = ScrollCurrentFormElementIntoView

var LocalVendor_ScrollPositionEndFixed_Animate = null 
function _shared_scrollConformingElementIntoView(inputLayer)
{
	const selector = `.${ClassNameForScrollingAncestorOfScrollToAbleElement()}`
	const scrollingAncestor = inputLayer.closest(selector)
	if (!scrollingAncestor || typeof scrollingAncestor === 'undefined') {
		console.warn("⚠️  Asked to _shared_scrollConformingElementIntoView but no scrollingAncestor found")
		return
	}
	// NOTE: velocity 1.5.0 is waiting on v2 to introduce a fix for 
	// bug in scrolling to element who is wrapped in a relative parent
	// before its scrollable ancestor (showing bug on e.g. Contact picker);
	// so patch was manually applied. See local vendored velocity.js header 
	// for note with github issues.
	{ // lazy require to avoid usage in e.g. electron; hopefully the perf hit will not be noticed
		if (LocalVendor_ScrollPositionEndFixed_Animate == null) {
			LocalVendor_ScrollPositionEndFixed_Animate = require('../Animation/Vendor/velocity')
			// ^-- hopefully it will not cause problems to have multiple velocity modules connected to the same DOM
		}
	}
	LocalVendor_ScrollPositionEndFixed_Animate(inputLayer, "stop")
	LocalVendor_ScrollPositionEndFixed_Animate(scrollingAncestor, "stop")
	const navBarHeight = 44 // janky/fragile
	const topMargin = 20 // to clear the form title labels - would be nice to source these from shared constants/metrics
	LocalVendor_ScrollPositionEndFixed_Animate(
		inputLayer,
		"scroll",
		{
			container: scrollingAncestor, 
			duration: 500, 
			offset:-1 * (topMargin + navBarHeight)
		}
	)
}
exports._shared_scrollConformingElementIntoView = _shared_scrollConformingElementIntoView
//
function New_fieldValue_textInputLayer(context, params)
{
	__injectCSSRules_ifNecessary()
	const layer = document.createElement("input")
	layer.className = "field_value"
	layer.type = "text"
	layer.style.display = "block" // own line
	const existingValue = params.existingValue
	if (typeof existingValue !== 'undefined' && existingValue !== null) {
		layer.value = existingValue
	}
	const placeholderText = params.placeholderText
	if (typeof placeholderText !== 'undefined' && placeholderText !== null) {
		layer.placeholder = placeholderText
	}
	layer.style.height = "29px"
	const padding_h = 7
	const borderWidth = 1
	if (typeof params.target_width !== 'undefined') {
		const width = params.target_width - 2*borderWidth - 2*padding_h
		layer.style.width = width + "px"
	} else {
		layer.style.width = `calc(100% - ${2*borderWidth}px - ${2 * padding_h}px)`
	}
	layer.style.borderRadius = "4px"
	layer.style.border = `${borderWidth}px solid rgba(0,0,0,0)` // transparent border to preserve layout while showing validation clr border
	layer.style.textAlign = "left"
	layer.style.fontSize = "13px"
	layer.style.fontWeight = "200"
	layer.style.padding = `0 ${padding_h}px`
	layer.style.fontFamily = context.themeController.FontFamily_monospaceLight()
	layer.style.outline = "none" // no focus ring
	// editable:true
	if (context.Views_selectivelyEnableMobileRenderingOptimizations !== true) {
		layer.style.boxShadow = "0 0.5px 0 0 rgba(56,54,56,0.50), inset 0 0.5px 0 0 #161416"
	} else { // avoiding shadow
		layer.style.boxShadow = "inset 0 0.5px 0 0 #161416"
	}
	layer.style.color = "#dfdedf"
	layer.style.backgroundColor = "#1d1b1d"
	layer.disabled = false
	layer.Component_ScrollIntoViewInFormContainerParent = function()
	{ // this could also be called on window resize
		const this_layer = this
		_shared_scrollConformingElementIntoView(this_layer)
	}
	if (context.CommonComponents_Forms_scrollToInputOnFocus == true) {
		layer.addEventListener(
			"focus",
			function()
			{
				layer.Component_ScrollIntoViewInFormContainerParent()
			}
		)
	}
	return layer
}
exports.New_fieldValue_textInputLayer = New_fieldValue_textInputLayer
//
function New_fieldValue_textAreaView(params, context)
{
	__injectCSSRules_ifNecessary()
	const view = new View({ tag: "textarea" }, context)
	const layer = view.layer
	layer.className = "field_value"
	layer.style.display = "block" // own line
	const existingValue = params.existingValue
	if (typeof existingValue !== 'undefined' && existingValue !== null) {
		layer.value = existingValue
	}
	const placeholderText = params.placeholderText
	if (typeof placeholderText !== 'undefined' && placeholderText !== null) {
		layer.placeholder = placeholderText
	}
	const padding_h = 8
	layer.style.padding = `9px ${padding_h}px`
	layer.style.height = `${61 - 2 * padding_h}px`
	layer.style.width = `calc(100% - ${2 * padding_h}px)` // no border so no -2*brdr_w
	layer.style.borderRadius = "3px"
	layer.style.border = "none"
	layer.style.textAlign = "left"
	layer.style.fontSize = "13px"
	layer.style.fontWeight = "100"
	layer.style.lineHeight = "15px"
	layer.style.resize = "none" // not user-resizable
	layer.style.outline = "none" // no focus ring
	layer.style.fontFamily = context.themeController.FontFamily_monospaceLight()
	layer.style.wordBreak = "break-word"
	//
	view.SetEnabled = function(isEnabled)
	{
		if (isEnabled) {
			if (context.Views_selectivelyEnableMobileRenderingOptimizations !== true) {
				layer.style.boxShadow = "0 0.5px 0 0 rgba(56,54,56,0.50), inset 0 0.5px 0 0 #161416"
			} else { // avoiding shadow
				layer.style.boxShadow = "inset 0 0.5px 0 0 #161416"
			}
			//
			layer.style.color = "#dfdedf"
			layer.style.backgroundColor = "#1d1b1d"
			layer.disabled = undefined
		} else {
			layer.style.boxShadow = "none"
			//
			layer.style.color = "#dfdedf"
			layer.style.backgroundColor = "#1d1b1d"
			layer.disabled = true
		}
		view.isEnabled = isEnabled // this going to cause a retain cycle ? 
	}
	view.SetEnabled(true) // to get initial styling, any state, et al.
	//
	// putting this on layer instead of view for now to conform to informal 'protocol' of ScrollCurrentFormElementIntoView
	layer.Component_ScrollIntoViewInFormContainerParent = function()
	{
		const this_layer = this
		_shared_scrollConformingElementIntoView(this_layer)
	}
	if (context.CommonComponents_Forms_scrollToInputOnFocus == true) {
		layer.addEventListener(
			"focus",
			function()
			{
				// TODO: retain cycle?
				layer.Component_ScrollIntoViewInFormContainerParent()
			}
		)
	}
	//
	return view
}
exports.New_fieldValue_textAreaView = New_fieldValue_textAreaView
//
function New_fieldValue_selectLayer(params)
{
	__injectCSSRules_ifNecessary()
	const values = params.values || []
	const layer = document.createElement("select")
	{
		values.forEach(
			function(value, i)
			{
				const optionLayer = document.createElement("option")
				optionLayer.value = value
				optionLayer.innerHTML = "" + value
				layer.appendChild(optionLayer)
			}
		)
	}
	{
		const existingValue = params.existingValue
		if (typeof existingValue !== 'undefined' && existingValue !== null) {
			layer.value = existingValue
		}
		layer.style.display = "inline-block"
		layer.style.height = "30px"
		layer.style.width = `calc(100% - 4px - ${2 * 10}px)`
		layer.style.border = "1px inset #222"
		layer.style.borderRadius = "4px"
		layer.style.textAlign = "left"
		layer.style.fontSize = "14px"
		layer.style.color = "#ccc"
		layer.style.backgroundColor = "#444"
		layer.style.padding = "0 10px"
		layer.style.fontFamily = "monospace"
	}				
	return layer
}
exports.New_fieldValue_selectLayer = New_fieldValue_selectLayer
//
function New_fieldAccessory_messageLayer(context)
{
	__injectCSSRules_ifNecessary()
	const layer = document.createElement("p")
	context.themeController.StyleLayer_FontAsMessageBearingSmallLightMonospace(layer) // name needs improvement
	layer.style.lineHeight = "15px"
	layer.style.margin = "7px 7px 0 7px"
	layer.style.color = "#8d8b8d"
	layer.style.wordBreak = "break-word"
	// TODO: is there any merit to this? ---v
	/* layer.style.wordBreak = "keep-all" // to get the text to wrap only at the word, not letter */
	layer.style.webkitUserSelect = "none"
	return layer
}
exports.New_fieldAccessory_messageLayer = New_fieldAccessory_messageLayer
function New_fieldAccessory_validationMessageLayer(context)
{
	__injectCSSRules_ifNecessary()
	const layer = New_fieldAccessory_messageLayer(context)
	layer.style.color = "#f97777"
	return layer
}
exports.New_fieldAccessory_validationMessageLayer = New_fieldAccessory_validationMessageLayer
//
function New_NonEditable_ValueDisplayLayer(value, context)
{
	__injectCSSRules_ifNecessary()
	const layer = document.createElement("div")
	layer.value = value // setting this so there is a common interface with _textView above - some consumers rely on it. this should be standardized into a Value() method of a View
	layer.style.borderRadius = "3px"
	layer.style.backgroundColor = "#383638"
	layer.style.padding = "8px 11px"
	layer.style.boxSizing = "border-box"
	layer.style.width = "100%"
	layer.style.height = "auto"
	//
	layer.style.color = "#7C7A7C"
	layer.style.fontSize = "13px"
	layer.style.fontWeight = "100"
	layer.style.fontFamily = context.themeController.FontFamily_monospaceLight()
	layer.style.webkitFontSmoothing = "subpixel-antialiased"
	layer.innerHTML = value
	//
	return layer
}
exports.New_NonEditable_ValueDisplayLayer = New_NonEditable_ValueDisplayLayer
function New_NonEditable_ValueDisplayLayer_BreakWord(value, context)
{
	const layer = New_NonEditable_ValueDisplayLayer(value, context)
	layer.style.wordBreak = "break-word"
	return layer
}
exports.New_NonEditable_ValueDisplayLayer_BreakWord = New_NonEditable_ValueDisplayLayer_BreakWord
function New_NonEditable_ValueDisplayLayer_BreakChar(value, context)
{
	const layer = New_NonEditable_ValueDisplayLayer(value, context)
	layer.style.wordBreak = "break-all"
	return layer
}
exports.New_NonEditable_ValueDisplayLayer_BreakChar = New_NonEditable_ValueDisplayLayer_BreakChar
//
function New_IconAndMessageLayer(iconPath, messageText, context, optl_imgW, optl_imgH)
{
	__injectCSSRules_ifNecessary()
	const layer = document.createElement("div")
	layer.classList.add("iconAndMessageLayer")
	layer.innerHTML = `<img src="${iconPath}" ${optl_imgW ? 'width="'+ optl_imgW + '"' : ""} ${optl_imgH ? 'height="'+ optl_imgH + '"' : ""} />&nbsp;<span>${messageText}</span>`
	layer.style.fontFamily = context.themeController.FontFamily_monospaceLight()
	layer.style.webkitFontSmoothing = "subpixel-antialiased"
	layer.style.fontSize = "11px"
	layer.style.fontWeight = "100"
	layer.style.color = "#8D8B8D"
	
	return layer		
}
exports.New_IconAndMessageLayer = New_IconAndMessageLayer
function New_Detected_IconAndMessageLayer(context)
{
	const layer = New_IconAndMessageLayer( // will call `__inject…`
		context.crossPlatform_appBundledAssetsRootPath+"/MMAppUICommonComponents/Resources/detectedCheckmark@3x.png",
		"Detected",
		context,
		"9px",
		"7px"
	)
	return layer
}
exports.New_Detected_IconAndMessageLayer = New_Detected_IconAndMessageLayer
//
//
function New_AmountInputFieldPKG(
	context,
	humanReadable_currencyAbbrv, // e.g. "XMR"
	optl__enterPressed_fn
)
{ // -> {} // Experimental 'pkg' style return… maybe refactor into View later
	const enterPressed_fn = optl__enterPressed_fn ? optl__enterPressed_fn : function() {}
	//
	const div = New_fieldContainerLayer()
	div.style.width = "210px"
	div.style.padding = "7px 22px 0 22px"
	//
	const labelLayer = New_fieldTitle_labelLayer("AMOUNT", context)
	div.appendChild(labelLayer)
	// ^ block
	const valueLayer = New_fieldValue_textInputLayer(context, {
		placeholderText: "00.00"
	})
	// not going to set `pattern` attribute because it can't support periods
	// not going to set type="number" because it inserts commas, etc
	valueLayer.style.textAlign = "right"
	valueLayer.float = "left" // because we want it to be on the same line as the "XMR" label
	valueLayer.style.display = "inline-block" // so we can have the XMR label on the right
	valueLayer.style.width = "98px"
	valueLayer.addEventListener("keyup", function(event)
	{
		if (event.keyCode === 13) {
			enterPressed_fn()
			return
		}
	})
	div.appendChild(valueLayer)
	valueLayer.Component_ScrollIntoViewInFormContainerParent = function()
	{ // this could also be called on window resize
		const this_layer = this
		_shared_scrollConformingElementIntoView(this_layer)
	}
	if (context.CommonComponents_Forms_scrollToInputOnFocus == true) {
		valueLayer.addEventListener(
			"focus",
			function()
			{
				valueLayer.Component_ScrollIntoViewInFormContainerParent()
			}
		)
	}
	//
	const currencyLabel = New_fieldTitle_labelLayer(humanReadable_currencyAbbrv, context)
	currencyLabel.style.display = "inline-block"
	currencyLabel.style.margin = "0 0 0 8px"
	currencyLabel.style.verticalAlign = "middle"
	currencyLabel.style.color = "#8D8B8D"
	div.appendChild(currencyLabel)
	//
	div.appendChild(commonComponents_tables.New_clearingBreakLayer())
	
	return {
		containerLayer: div,
		labelLayer: labelLayer,
		valueLayer: valueLayer,
		currencyLabel: currencyLabel
	}
}
exports.New_AmountInputFieldPKG = New_AmountInputFieldPKG