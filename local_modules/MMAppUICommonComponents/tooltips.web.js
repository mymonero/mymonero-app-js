// Includes usage of OpenTip tooltip library which is copyright (c) 2012 by 
// Matias Meno <m@tias.me> and licensed under The MIT License. https://github.com/enyo/opentip
"use strict"

const Opentip = require('../../assets/js/opentip-native.min.js')
const commonComponents_tables = require('./tables.web')

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

