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
//
const ActionButton_h = 33
const ActionButton_rightMargin = 8
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
	optl_icon_bgPos_top
)
{
	const hasImage = iconimage_filename !== null && typeof iconimage_filename !== 'undefined'
	const icon_bgPos_top = typeof optl_icon_bgPos_top === 'undefined' ? 8 : optl_icon_bgPos_top
	//
	const view = new View({ tag: "a" }, context)
	{
		view.Disable = function()
		{ // is this going to create a retain cycle?
			view.isDisabled = true
			const layer = view.layer
			layer.href = "" // to make it non-clickable
			layer.style.opacity = "0.5"
		}
		view.Enable = function()
		{ // is this going to create a retain cycle?
			view.isDisabled = false
			const layer = view.layer
			layer.href = "#" // to make it clickable
			layer.style.opacity = "1.0"
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
		}
		layer.style.display = "inline-block"
		layer.style.width = `calc(50% - ${ActionButton_rightMargin/2}px` // we're assuming there are only two buttons
		layer.style.height = ActionButton_h + "px"
		layer.style.borderRadius = "3px"
		layer.style.backgroundColor = "#383638"
		layer.style.boxShadow = "0 0.5px 1px 0 #161416, inset 0 0.5px 0 0 #494749"			
		layer.style.textDecoration = "none"
		layer.style.fontSize = "13px"
		layer.style.fontWeight = "500"
		layer.style.lineHeight = ActionButton_h + "px"
		layer.style.color = "#ddd" // TODO
		layer.style.textAlign = "center"
		layer.style.fontFamily = context.themeController.FontFamily_sansSerif()
		if (isRightmostButtonInContainer !== true) {
			layer.style.marginRight = ActionButton_rightMargin + "px"
		}
		//
		layer.addEventListener("click", function(e) 
		{
			e.preventDefault()
			if (view.isDisabled === true) {
				return false
			}
			const clickedLayer = this
			clicked_fn(clickedLayer, e)
			return false
		})
	}
	return view
}
exports.New_ActionButtonView = New_ActionButtonView