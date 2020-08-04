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
// Includes usage of OpenTip tooltip library which is copyright (c) 2012 by 
// Matias Meno <m@tias.me> and licensed under The MIT License. https://github.com/enyo/opentip
//
"use strict"
//
const Opentip = require('../../assets/js/opentip-native.min.js')
//
const commonComponents_tables = require('./tables.web')

//
function _once_listenForTouchStartToDismissTooltip() {
    const documentKey = "tooltips_did_listenForMobileNonHoveringEventsToDismissTooltip"
    if (document[documentKey] !== true) {
        document[documentKey] = true
        //
        window.addEventListener('touchstart', function (e) {
            for (var i = 0; i < Opentip.tips.length; i++) {
                Opentip.tips[i].hide()
            }
        })
    }
}

function New_TooltipSpawningButtonView(tooltipText, context) {
    const buttonTitle = "?"
    const view = commonComponents_tables.New_clickableLinkButtonView(buttonTitle, context)
    const layer = view.layer
    layer.style.marginLeft = "7px"
    layer.style.display = "inline" // same line
    layer.style.float = "none"
    layer.style.clear = "none" // must unset
    const tooltip_options =
        {
            target: true, // target trigger (`layer`)
            tipJoint: "bottom center",
            containInViewport: true,
            //
            stemBase: 14,
            stemLength: 13,
            //
            background: "#FCFBFC",
            //
            borderWidth: 0,
            borderRadius: 5,
            //
            shadow: true,
            shadowBlur: 38,
            shadowOffset: [0, 19],
            shadowColor: "rgba(0,0,0,0.26)"
        }
    if (context.Tooltips_nonHoveringBehavior == true) {
        tooltip_options.showOn = "click"
        tooltip_options.hideOn = "click"
        _once_listenForTouchStartToDismissTooltip()
    }
    const tooltip = new Opentip(layer, tooltip_options)
    tooltip.setContent(tooltipText)
    return view
}

exports.New_TooltipSpawningButtonView = New_TooltipSpawningButtonView

