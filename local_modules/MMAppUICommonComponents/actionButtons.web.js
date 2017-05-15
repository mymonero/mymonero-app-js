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
const commonComponents_hoverableCells = require('./hoverableCells.web')
//
const ActionButton_h = 32
const ActionButton_rightMargin = 9
//
const ActionButtonsContainerView_h = ActionButton_h
const ActionButtonsContainerView_bottomMargin = 8
exports.ActionButtonsContainerView_bottomMargin = ActionButtonsContainerView_bottomMargin
exports.ActionButtonsContainerView_h = ActionButtonsContainerView_h
//
function New_ActionButtonsContainerView(
	margin_fromWindowLeft,
	margin_fromWindowRight, 
	context
)
{
	const view = new View({}, context)
	const layer = view.layer
	{
		layer.style.position = "fixed"
		layer.style.top = `calc(100% - ${ActionButtonsContainerView_h}px - ${ActionButtonsContainerView_bottomMargin}px)`
		layer.style.width = `calc(100% - ${margin_fromWindowLeft}px - ${margin_fromWindowRight}px)`
		layer.style.height = ActionButtonsContainerView_h + "px"
	}	
	return view
}
exports.New_ActionButtonsContainerView = New_ActionButtonsContainerView
//
function New_Stacked_ActionButtonsContainerView(
	margin_left,
	margin_right,
	margin_top,
	context
)
{
	const view = new View({}, context)
	const layer = view.layer
	{
		layer.style.position = "relative"
		layer.style.width = `calc(100% - ${margin_left}px - ${margin_right}px)`
		layer.style.marginLeft = `${margin_left}px`
		layer.style.marginTop = `${margin_top}px`
		layer.style.height = ActionButtonsContainerView_h + ActionButtonsContainerView_bottomMargin + "px"
	}	
	return view
}
exports.New_Stacked_ActionButtonsContainerView = New_Stacked_ActionButtonsContainerView
//
function New_ActionButtonView(
	title, 
	iconimage_filename, 
	isRightmostButtonInContainer,
	clicked_fn, // (clickedLayer, e) -> Void
	context,
	optl_icon_bgPos_top,
	optl_colorType, // "blue", "grey", "red"
	optl_icon_bgSize // e.g. "12px 14px"
)
{
	const hasImage = iconimage_filename !== null && typeof iconimage_filename !== 'undefined'
	const icon_bgPos_top = typeof optl_icon_bgPos_top === 'undefined' ? 8 : optl_icon_bgPos_top
	//
	const view = new View({ tag: "a" }, context)
	const layer = view.layer
	layer.ondragstart = function(e) { e.preventDefault(); return false; } // disable link dragging
	view.Disable = function()
	{ // is this going to create a retain cycle?
		view.isDisabled = true
		layer.href = "" // to make it non-clickable
		layer.style.opacity = "0.5"
		layer.classList.add("disabled")
	}
	view.Enable = function()
	{ // is this going to create a retain cycle?
		view.isDisabled = false
		layer.href = "#" // to make it clickable
		layer.style.opacity = "1.0"
		layer.classList.remove("disabled")
	}
	view.SetColorType = function(colorType)
	{
		layer.classList.remove(commonComponents_hoverableCells.ClassFor_GreyCell())
		layer.classList.remove(commonComponents_hoverableCells.ClassFor_BlueCell())
		layer.classList.remove(commonComponents_hoverableCells.ClassFor_RedCell())
		//		
		if (colorType === "grey") {
			layer.classList.add(commonComponents_hoverableCells.ClassFor_GreyCell())
			layer.style.color = "#FCFBFC"
			layer.style.backgroundColor = "#383638"
			if (context.Views_selectivelyEnableMobileRenderingOptimizations !== true) {
				layer.style.boxShadow = "0 0.5px 1px 0 #161416, inset 0 0.5px 0 0 #494749"
			} else { // avoiding shadow gradient
				layer.style.boxShadow = "inset 0 0.5px 0 0 #494749"
			}
			context.themeController.StyleLayer_FontAsMiddlingButtonContentSemiboldSansSerif(
				layer,
				true // bright content, dark bg
			)
			if (context.ThemeController_isMobileBrowser !== true) { // note: using the same flag as themeController for toggling font sizes - slightly fragile tho
				layer.style.lineHeight = (ActionButton_h+2) + "px" // set for smaller font size so layout isn't messed
			} else {
				layer.style.lineHeight = ActionButton_h + "px" // reset/set on mobile - cause font size is consistent
			}
		} else if (colorType == "blue") {
			layer.classList.add(commonComponents_hoverableCells.ClassFor_BlueCell())
			layer.style.color = "#161416"
			layer.style.backgroundColor = "#00C6FF"
			if (context.Views_selectivelyEnableMobileRenderingOptimizations !== true) {
				layer.style.boxShadow = "inset 0 0.5px 0 0 rgba(255,255,255,0.20)"
			} else {
				// TODO: add replacement box shadow w/effective color and 1.0 opacity
				layer.style.boxShadow = "none" // temporary until replaced - to reset potential 'grey'
			}
			context.themeController.StyleLayer_FontAsMiddlingButtonContentSemiboldSansSerif(
				layer,
				false // dark content, bright bg
			)
			layer.style.transform = "none" // reset
			layer.style.lineHeight = ActionButton_h + "px" // reset/set
		} else if (colorType === "red") {
			layer.classList.add(commonComponents_hoverableCells.ClassFor_RedCell())
			layer.style.color = "#161416"
			layer.style.backgroundColor = "#f97777"
			if (context.Views_selectivelyEnableMobileRenderingOptimizations !== true) {
				layer.style.boxShadow = "inset 0 0.5px 0 0 rgba(255,255,255,0.20)"
			} else {
				// TODO: add replacement box shadow w/effective color and 1.0 opacity
				layer.style.boxShadow = "none" // temporary until replaced - to reset potential 'grey'
			}
			context.themeController.StyleLayer_FontAsMiddlingButtonContentSemiboldSansSerif(
				layer,
				false // dark content, bright bg
			)
			layer.style.lineHeight = ActionButton_h + "px" // reset/set
		} else {
			throw "unrecognized colorType " + colorType
		}
	}
	{ // setup/style
		const layer = view.layer
		view.Enable()
		layer.innerHTML = title
		if (hasImage) {
			layer.style.backgroundImage = "url(" + iconimage_filename + ")"
			layer.style.backgroundPosition = `17px ${icon_bgPos_top}px`
			layer.style.backgroundRepeat = "no-repeat"
			if (optl_icon_bgSize && typeof optl_icon_bgSize !== 'undefined') {
				layer.style.backgroundSize = optl_icon_bgSize
			}
			layer.style.textIndent = "10px" // to prevent visual weirdness as button gets so small text may overlap image… would be nice to have a better solution which takes into account size of text and maybe size of button
		}
		layer.style.display = "inline-block"
		layer.style.width = `calc(50% - ${ActionButton_rightMargin/2}px` // we're assuming there are only two buttons
		layer.style.height = ActionButton_h + "px"
		layer.style.boxSizing = "border-box"
		layer.style.borderRadius = "3px"
		{
			layer.classList.add(commonComponents_hoverableCells.ClassFor_HoverableCell())
			view.SetColorType(optl_colorType || "grey")
		}		
		layer.style.textDecoration = "none"
		layer.style.textAlign = "center"
		layer.style.fontFamily = context.themeController.FontFamily_sansSerif()
		if (isRightmostButtonInContainer !== true) {
			layer.style.marginRight = ActionButton_rightMargin + "px"
		}
	}
	layer.addEventListener(
		"click", 
		function(e) 
		{
			e.preventDefault()
			if (view.isDisabled === true) {
				return false
			}
			const clickedLayer = this
			clicked_fn(clickedLayer, e)
			return false
		}
	)
	return view
}
exports.New_ActionButtonView = New_ActionButtonView