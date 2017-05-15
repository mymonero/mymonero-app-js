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
const BarButtonBaseView = require('../StackNavigation/Views/BarButtonBaseView.web')
const commonComponents_hoverableCells = require('./hoverableCells.web')
//	
function _New_ButtonBase_View(context, optl_didConfigureInteractivity_fn)
{
	const view = new BarButtonBaseView({
		didConfigureInteractivity_fn: function(thisView)
		{
			if (typeof optl_didConfigureInteractivity_fn !== 'undefined' && optl_didConfigureInteractivity_fn) {
				optl_didConfigureInteractivity_fn(thisView)
			}
		}
	}, context)
	const layer = view.layer
	//
	layer.style.borderRadius = "3px"
	layer.style.height = "24px"
	//
	layer.style.fontFamily = context.themeController.FontFamily_sansSerif()
	layer.style.textAlign = "center"
	layer.style.border = "none"
	layer.style.textDecoration = "none"
	layer.style.lineHeight = "24px"
	//
	layer.style.boxSizing = "border-box"
	layer.style.width = "auto"
	layer.style.padding = "0 8px"
	//
	view.SetEnabled(true)
	layer.classList.add(commonComponents_hoverableCells.ClassFor_HoverableCell())
	//
	return view
}
exports.New_ButtonBase_View = _New_ButtonBase_View
//
function New_GreyButtonView(context)
{
	const view = _New_ButtonBase_View(
		context, 
		function(thisView)
		{ // config from interactivity
			// if (thisView.isEnabled) {
			// } else {
			// }
		}
	)
	const layer = view.layer
	layer.classList.add(commonComponents_hoverableCells.ClassFor_GreyCell())
	if (context.Views_selectivelyEnableMobileRenderingOptimizations !== true) {
		layer.style.boxShadow = "0 0.5px 1px 0 #161416, inset 0 0.5px 0 0 #494749"	
	} else { // avoiding shadow
		layer.style.boxShadow = "inset 0 0.5px 0 0 #494749"
	}
	layer.style.backgroundColor = "#383638"
	layer.style.color = "#FCFBFC"
	context.themeController.StyleLayer_FontAsMiddlingSemiboldSansSerif(layer)		
	return view
}
exports.New_GreyButtonView = New_GreyButtonView
//
function New_BlueButtonView(context)
{
	const view = _New_ButtonBase_View(
		context, 
		function(thisView)
		{ // config from interactivity
			const layer = thisView.layer
			if (thisView.isEnabled) {
				layer.style.backgroundColor = "#00c6ff"
				if (context.Views_selectivelyEnableMobileRenderingOptimizations !== true) {
					layer.style.boxShadow = "0 0.5px 1px 0 #161416, inset 0 0.5px 0 0 rgba(255,255,255,0.20)"	
				} else { // avoiding shadow
					layer.style.boxShadow = "inset 0 0.5px 0 0 rgba(255,255,255,0.20)"	
				}
				layer.style.color = "#161416"
				//
				layer.style.fontWeight = "600"	
			} else {
				layer.style.backgroundColor = "#383638"
				layer.style.boxShadow = "none"
				layer.style.color = "#6B696B"
				//
				layer.style.fontWeight = "600"
			}
		}
	)
	const layer = view.layer
	layer.classList.add(commonComponents_hoverableCells.ClassFor_BlueCell())
		
	layer.style.webkitFontSmoothing = "subpixel-antialiased"
	layer.style.fontSize = "12px"
	layer.style.letterSpacing = "0.5px"
	
	return view
}
exports.New_BlueButtonView = New_BlueButtonView
//
function New_LeftSide_BackButtonView(context)
{
	const view = New_GreyButtonView(context)
	const layer = view.layer
	layer.style.display = "block"
	layer.style.float = "right" // so it sticks to the right of the right btn holder view layer
	layer.style.marginTop = "10px"
	layer.style.width = "26px"
	layer.style.height = "24px"
	layer.style.backgroundImage = "url("+context.crossPlatform_appBundledAssetsRootPath+"/MMAppUICommonComponents/Resources/backButtonIcon@3x.png)"
	layer.style.backgroundSize = "9px 14px"
	layer.style.backgroundRepeat = "no-repeat"
	layer.style.backgroundPosition = "8px 5px"
	return view
}
exports.New_LeftSide_BackButtonView = New_LeftSide_BackButtonView
//
function New_RightSide_AddButtonView(context)
{
	const view = New_BlueButtonView(context)
	const layer = view.layer
	layer.style.float = "right" // so it sticks to the right of the right btn holder view layer
	layer.style.marginTop = "10px"
	layer.style.width = "26px" // instead of 24px - slightly wider than H 
	layer.style.backgroundImage = "url("+context.crossPlatform_appBundledAssetsRootPath+"/MMAppUICommonComponents/Resources/addButtonIcon_10@3x.png)"
	layer.style.backgroundSize = "10px 10px"
	layer.style.backgroundRepeat = "no-repeat"
	layer.style.backgroundPosition = "center"
	return view
}
exports.New_RightSide_AddButtonView = New_RightSide_AddButtonView
//
function New_LeftSide_CancelButtonView(context, title_orUndefinedForDefaultCancel)
{
	const view = New_GreyButtonView(context)
	const layer = view.layer
	const title = 
		typeof title_orUndefinedForDefaultCancel === "undefined" 
			|| title_orUndefinedForDefaultCancel === null 
			|| title_orUndefinedForDefaultCancel === "" 
		? "Cancel" : title_orUndefinedForDefaultCancel
	layer.innerHTML = title
	//
	layer.style.display = "block"
	layer.style.float = "left" // so it sticks to the left of the left btn holder view layer
	layer.style.marginTop = "10px"
	//
	return view
}
exports.New_LeftSide_CancelButtonView = New_LeftSide_CancelButtonView
//
function New_RightSide_SaveButtonView(context)
{
	const view = New_BlueButtonView(context)
	const layer = view.layer
	layer.innerHTML = "Save"
	layer.style.float = "right" // so it sticks to the right of the right btn holder view layer
	layer.style.marginTop = "10px"
	return view
}
exports.New_RightSide_SaveButtonView = New_RightSide_SaveButtonView
//
function New_RightSide_EditButtonView(context)
{
	const view = New_GreyButtonView(context)
	const layer = view.layer
	layer.innerHTML = "Edit"
	layer.style.display = "block"
	layer.style.float = "right" // so it sticks to the right of the right btn holder view layer
	layer.style.marginTop = "10px"
	return view	
}
exports.New_RightSide_EditButtonView = New_RightSide_EditButtonView
//
function New_RightSide_ValueDisplayLabelButtonView(context)
{
	const view = _New_ButtonBase_View(context)
	const layer = view.layer
	{ // setup/style
		layer.href = "" // to make it non-clickable
		layer.style.display = "block"
		layer.style.float = "right" // so it sticks to the right of the right btn holder view layer
		layer.style.marginTop = "12px"
		layer.style.width = "auto"
		layer.style.height = "auto"
		layer.style.textDecoration = "none"
		context.themeController.StyleLayer_FontAsSmallRegularMonospace(layer)
		layer.style.color = "#9E9C9E"
		layer.style.lineHeight = "200%" // % extra to get + aligned properly
		layer.style.textAlign = "center"
		layer.style.cursor = "default"
	}
	return view	
}
exports.New_RightSide_ValueDisplayLabelButtonView = New_RightSide_ValueDisplayLabelButtonView