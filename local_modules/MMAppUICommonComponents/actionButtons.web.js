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

const View = require('../Views/View.web')

function New_ActionButtonView(
    title,
    iconimage_filename,
    isRightmostButtonInContainer,
    clicked_fn, // (clickedLayer, e) -> Void
    context,
    optl_icon_bgPos_top,
    optl_colorType, // "blue", "grey", "red"
    optl_icon_bgSize // e.g. "12px 14px"
) {
    const hasImage = iconimage_filename !== null && typeof iconimage_filename !== 'undefined'
    const icon_bgPos_top = typeof optl_icon_bgPos_top === 'undefined' ? 8 : optl_icon_bgPos_top
    //
    const view = new View({tag: "a"}, context)
    const layer = view.layer
    layer.ondragstart = function (e) {
        e.preventDefault();
        return false;
    } // disable link dragging
    view.Disable = function () { // is this going to create a retain cycle?
        view.isDisabled = true
        layer.href = "" // to make it non-clickable
        layer.style.opacity = "0.5"
        layer.classList.add("disabled")
    }
    view.Enable = function () { // is this going to create a retain cycle?
        view.isDisabled = false
        layer.href = "#" // to make it clickable
        layer.style.opacity = "1.0"
        layer.classList.remove("disabled")
    }
    view.SetColorType = function (colorType) {
        layer.classList.remove('utility')
        layer.classList.remove('action')
        layer.classList.remove('destructive')
        //
        if (colorType === "grey") {
            layer.classList.add('utility')
            layer.style.color = "#FCFBFC"
            layer.style.backgroundColor = "#383638"
            layer.style.boxShadow = "0 0.5px 1px 0 #161416, inset 0 0.5px 0 0 #494749"
            layer.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif'
            layer.style.webkitFontSmoothing = "subpixel-antialiased"
            layer.style.fontSize = "12px" // appears slightly too small but 13 is far to big
            layer.style.letterSpacing = "0.5px"
            layer.style.fontWeight = "400"
            layer.style.lineHeight = (32 + 2) + "px" // set for smaller font size so layout isn't messed
        } else if (colorType == "blue") {
            layer.classList.add('action')
            layer.style.color = "#161416"
            layer.style.backgroundColor = "#00C6FF"
            layer.style.boxShadow = "inset 0 0.5px 0 0 rgba(255,255,255,0.20)"

            layer.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif'
            layer.style.webkitFontSmoothing = "subpixel-antialiased"
            layer.style.fontSize = "13px" // appears /slightly/ too bug but waygd
            layer.style.letterSpacing = "0"
            layer.style.fontWeight = "600"
            layer.style.transform = "none" // reset
            layer.style.lineHeight = 32 + "px" // reset/set
        } else if (colorType === "red") {
            layer.classList.add('destructive')
            layer.style.color = "#161416"
            layer.style.backgroundColor = "#f97777"
            layer.style.boxShadow = "inset 0 0.5px 0 0 rgba(255,255,255,0.20)"
            layer.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif'
            layer.style.webkitFontSmoothing = "subpixel-antialiased"
            layer.style.fontSize = "13px" // appears /slightly/ too bug but waygd
            layer.style.letterSpacing = "0"
            layer.style.fontWeight = "600"
            layer.style.lineHeight = 32 + "px" // reset/set
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
        layer.style.width = `calc(50% - ${9 / 2}px` // we're assuming there are only two buttons
        layer.style.height = 32 + "px"
        layer.style.boxSizing = "border-box"
        layer.style.borderRadius = "3px"
        {
            layer.classList.add('hoverable-cell')
            layer.classList.add('disableable')
            view.SetColorType(optl_colorType || "grey")
        }
        layer.style.textDecoration = "none"
        layer.style.textAlign = "center"
        layer.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif'
        if (isRightmostButtonInContainer !== true) {
            layer.style.marginRight = 9 + "px"
        }
    }
    layer.addEventListener(
        "click",
        function (e) {
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