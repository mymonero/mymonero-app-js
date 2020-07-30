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
const View = require('../../Views/View.web')
const ListView = require('../../Lists/Views/ListView.web')
const emoji_web = require('../../Emoji/emoji_web')
const ExchangeFunctions = require('./ExchangeFunctions')
const commonComponents_navigationBarButtons = require('../../MMAppUICommonComponents/navigationBarButtons.web')

class ExchangeContentView extends ListView {
    constructor(options, context) {
        options.listController = context.contactsListController
        // ^- injecting dep so consumer of self doesn't have to
        super(options, context)
        self.currentlyPresented_AddContactView = null // zeroing
    }

    _setup_views() {
        const self = this
        super._setup_views()
        self._setup_emptyStateContainerView()
    }

    _setup_emptyStateContainerView() {
        const self = this

        const view = new View({}, self.context)
        {
            const layer = view.layer
            layer.classList.add("emptyScreens")
            layer.classList.add("empty-page-panel")
        }
        var contentContainerLayer;
        {
            const layer = document.createElement("div")
            layer.classList.add("content-container")
            layer.classList.add("empty-page-content-container")
            contentContainerLayer = layer
            view.layer.appendChild(layer)
        }
        {
            const layer = document.createElement("div")
            layer.classList.add("emoji-label")
            layer.innerHTML = emoji_web.NativeEmojiTextToImageBackedEmojiText_orUnlessDisabled_NativeEmojiText(self.context, "😬")
            contentContainerLayer.appendChild(layer)
        }
        {
            const layer = document.createElement("div")
            layer.classList.add("message-label")
            layer.classList.add("exchangeRate")
            layer.innerHTML = "This is where we will be exchanging! Click me to see exchange rates!";
            contentContainerLayer.appendChild(layer)
        }
        // How Paul does tooltips
		// const breakingDiv = document.createElement("div")
		// { // addtl element on this screen
		// 	const layer = commonComponents_forms.New_fieldTitle_labelLayer("", self.context)
		// 	layer.style.marginTop = "8px"
		// 	layer.style.color = "#9E9C9E"
		// 	layer.style.display = "inline-block"
		// 	self.networkFeeEstimateLayer = layer
		// 	breakingDiv.appendChild(layer)
		// }
		// {
		// 	const tooltipText = "Based on Monero network<br/>fee estimate (not final).<br/><br/>MyMonero does not charge<br/>a transfer service fee."
		// 	const view = commonComponents_tooltips.New_TooltipSpawningButtonView(tooltipText, self.context)
		// 	const layer = view.layer
		// 	breakingDiv.appendChild(layer)
		// }
		// div.appendChild(breakingDiv)



        {
            // let's make the xmr.to form in HTML for sanity's sake
            const layer = document.createElement("div");
            //layer.classList.add("xmr_input");
            let html = `
            <div id="exchangePage">
                <span id="exchangeRate">
                    <table>
                        <tr>
                            <td></td>
                            <td></td>
                        </tr>
                    </table>
                </span>
                <div class="form_field">
                    <span class="field_title form-field-title">FROM
            `;

            let newHTML = html.concat(`<a class="clickableLinkButton" data-id="1" style="">?</a>
                    </span>
                    <div class="WalletSelectView ListCustomSelectView" style="position: relative;">
                        <div class="hoverable-cell utility selectionDisplayCellView" style="word-break: break-all; height: 100%; position: relative; left: 0px; top: 0px; box-shadow: rgb(22, 20, 22) 0px 0.5px 1px 0px, rgb(73, 71, 73) 0px 0.5px 0px 0px inset;">
                            <div class="walletIcon medium-32" style="position: absolute; left: 16px; top: 16px; background-image: url(&quot;../../MMAppUICommonComponents/Resources/wallet-6B696B@3x.png&quot;);"></div>
                            <div style="position: relative; box-sizing: border-box; padding: 15px 38px 4px 66px; display: block; word-break: break-word; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, Oxygen, Ubuntu, Cantarell, &quot;Open Sans&quot;, &quot;Helvetica Neue&quot;, sans-serif; -webkit-font-smoothing: subpixel-antialiased; font-size: 12px; font-weight: 400; letter-spacing: 0.5px; color: rgb(252, 251, 252); cursor: default;">Test</div>
                            <div class="description-label" style="position: relative; box-sizing: border-box; padding: 0px 38px 4px 66px; font-size: 13px; font-family: Native-Light, input, menlo, monospace; font-weight: 100; -webkit-font-smoothing: subpixel-antialiased; max-height: 32px; color: rgb(158, 156, 158); word-break: normal; overflow: hidden; text-overflow: ellipsis; cursor: default;">0.5&nbsp;XMR</div></div>
                        <div class="options_containerView" style="display: none; position: absolute; width: 100%; top: 0px; left: 0px; z-index: 10; max-height: 174.9px; height: 66px;">
                            <div class="options_cellViews_containerView" style="position: relative; left: 0px; top: 0px; width: 100%; height: 100%; z-index: 20; overflow-y: auto; max-height: 174.9px;">
                                <div class="hoverable-cell utility optionCell" style="word-break: break-all; height: 66px; position: relative; left: 0px; top: 0px; box-sizing: border-box; width: 100%;">
                                    <div class="walletIcon medium-32" style="position: absolute; left: 16px; top: 16px; background-image: url(&quot;../../MMAppUICommonComponents/Resources/wallet-6B696B@3x.png&quot;);"></div>
                                    <div style="position: relative; box-sizing: border-box; padding: 15px 38px 4px 66px; display: block; word-break: break-word; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, Oxygen, Ubuntu, Cantarell, &quot;Open Sans&quot;, &quot;Helvetica Neue&quot;, sans-serif; -webkit-font-smoothing: subpixel-antialiased; font-size: 12px; font-weight: 400; letter-spacing: 0.5px; color: rgb(252, 251, 252); cursor: default;">Test</div>
                                    <div class="description-label" style="position: relative; box-sizing: border-box; padding: 0px 38px 4px 66px; font-size: 13px; font-family: Native-Light, input, menlo, monospace; font-weight: 100; -webkit-font-smoothing: subpixel-antialiased; max-height: 32px; color: rgb(158, 156, 158); word-break: normal; overflow: hidden; text-overflow: ellipsis; cursor: default;">0.5&nbsp;XMR</div></div></div>
                            <div class="background" style="position: absolute; left: 0px; top: 0px; width: 100%; height: 100%; z-index: 10;"></div></div>
                        <div style="pointer-events: none; border: none; position: absolute; width: 10px; height: 100%; right: 16px; top: 0px; z-index: 100; background-image: url(&quot;../../SelectView/Resources/dropdown-arrow-down@3x.png&quot;); background-repeat: no-repeat; background-position: center center; background-size: 10px 8px;"></div></div></div><table style="width: 100%;"><tr><td style="width: 100px; vertical-align: top;">
                <div class="form_field" style="position: relative; left: 0px; top: 0px; padding: 2px 22px 0px;"><span class="field_title form-field-title" style="margin-top: 0px;">AMOUNT</span><input class="field_value" type="text" placeholder="00.00" style="display: inline-block; height: 29px; width: 80px; border-radius: 4px; border: 1px solid rgba(0, 0, 0, 0); text-align: right; font-size: 13px; font-weight: 200; padding: 0px 63px 0px 7px; font-family: Native-Light, input, menlo, monospace; outline: none; box-shadow: rgba(56, 54, 56, 0.5) 0px 0.5px 0px 0px, rgb(22, 20, 22) 0px 0.5px 0px 0px inset; color: rgb(223, 222, 223); background-color: rgb(29, 27, 29);"><select style="font-family: -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, Oxygen, Ubuntu, Cantarell, &quot;Open Sans&quot;, &quot;Helvetica Neue&quot;, sans-serif; -webkit-font-smoothing: subpixel-antialiased; font-size: 11px; font-weight: 400; letter-spacing: 0.5px; text-indent: 10px; color: rgb(223, 222, 223); background-color: rgba(80, 74, 80, 0.55); position: absolute; left: 117.5px; width: 56px; height: 29.5px; border: 0px; padding: 0px; border-radius: 0px 4px 4px 0px; -webkit-appearance: none; top: 24px;"><option value="XMR" style="text-align: center;">XMR</option><option value="USD" style="text-align: center;">USD</option><option value="AUD" style="text-align: center;">AUD</option><option value="BRL" style="text-align: center;">BRL</option><option value="CAD" style="text-align: center;">CAD</option><option value="CHF" style="text-align: center;">CHF</option><option value="CNY" style="text-align: center;">CNY</option><option value="EUR" style="text-align: center;">EUR</option><option value="GBP" style="text-align: center;">GBP</option><option value="HKD" style="text-align: center;">HKD</option><option value="INR" style="text-align: center;">INR</option><option value="JPY" style="text-align: center;">JPY</option><option value="KRW" style="text-align: center;">KRW</option><option value="MXN" style="text-align: center;">MXN</option><option value="NOK" style="text-align: center;">NOK</option><option value="NZD" style="text-align: center;">NZD</option><option value="SEK" style="text-align: center;">SEK</option><option value="SGD" style="text-align: center;">SGD</option><option value="TRY" style="text-align: center;">TRY</option><option value="RUB" style="text-align: center;">RUB</option><option value="ZAR" style="text-align: center;">ZAR</option></select>
                    <div style="pointer-events: none; border: none; position: absolute; width: 8px; height: 13px; left: 159.5px; z-index: 9; background-image: url(&quot;../../MMAppUICommonComponents/Resources/smallSelect_disclosureArrow@3x.png&quot;); background-repeat: no-repeat; background-position: center center; background-size: 8px 13px; top: 33px;"></div><span class="field_title form-field-title" style="display: none; margin: 0px 0px 0px 8px; vertical-align: middle; color: rgb(141, 139, 141); font-family: Native-Regular, input, menlo, monospace; font-size: 12px; font-weight: normal;"></span><a class="clickableLinkButton" style="color: rgb(17, 187, 236); cursor: pointer; user-select: none; font-family: Native-Light, input, menlo, monospace; -webkit-font-smoothing: subpixel-antialiased; font-size: 10px; letter-spacing: 0.5px; width: auto; display: inline-block; clear: both; -webkit-tap-highlight-color: rgba(0, 0, 0, 0); margin: 0px 0px 0px 12px; font-weight: 300; vertical-align: middle;">MAX</a><br style="clear: both;"><div><span class="field_title form-field-title" style="margin-top: 8px; color: rgb(158, 156, 158); display: inline-block;">+ 0.000066009466 XMR EST. FEE</span><a class="clickableLinkButton" data-id="3" style="color: rgb(17, 187, 236); cursor: pointer; user-select: none; font-family: Native-Light, input, menlo, monospace; -webkit-font-smoothing: subpixel-antialiased; font-size: 10px; letter-spacing: 0.5px; width: auto; display: inline; clear: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0); margin: 8px 0px 0px 7px; font-weight: 300; float: none;">?</a></div></div></td></tr></table>
                <div class="form_field"><span class="field_title form-field-title" style="margin-top: 17px;">TO<a class="clickableLinkButton" data-id="4" style="color: rgb(17, 187, 236); cursor: pointer; user-select: none; font-family: Native-Light, input, menlo, monospace; -webkit-font-smoothing: subpixel-antialiased; font-size: 10px; letter-spacing: 0.5px; width: auto; display: inline; clear: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0); margin: 8px 0px 0px 7px; font-weight: 300; float: none;">?</a></span>
                    <div class="contactPicker" style="position: relative; width: 100%; user-select: none;"><input class="field_value" type="text" placeholder="BTC Address" autocomplete="off" autocapitalize="none" spellcheck="true" style="display: block; height: 29px; width: calc((100% - 2px) - 14px); border-radius: 4px; border: 1px solid rgba(0, 0, 0, 0); text-align: left; font-size: 13px; font-weight: 200; padding: 0px 7px; font-family: Native-Light, input, menlo, monospace; outline: none; box-shadow: rgba(56, 54, 56, 0.5) 0px 0.5px 0px 0px, rgb(22, 20, 22) 0px 0.5px 0px 0px inset; color: rgb(223, 222, 223); background-color: rgb(29, 27, 29);">
                        <div class="autocomplete-results" style="position: absolute; top: 30px; width: 100%; max-height: 155px; min-height: 30px; background-color: rgb(252, 251, 252); border-radius: 3px; box-shadow: rgba(0, 0, 0, 0.22) 0px 15px 12px 0px, rgba(0, 0, 0, 0.3) 0px 19px 38px 0px; overflow-y: auto; z-index: 10000; display: none;"></div></div>
                    <div class="graphicAndLabel activityIndicators on-normal-background" style="font-family: Native-Light, input, menlo, monospace; -webkit-font-smoothing: subpixel-antialiased; font-size: 10px; letter-spacing: 0.5px; font-weight: 300; color: rgb(248, 247, 248); display: none; padding-left: 7px;">
                        <div class="loader">
                            <div class="block block1"></div>
                            <div class="block block2"></div>
                            <div class="block block3"></div></div>&nbsp;<span>RESOLVING…</span></div>
                    <div style="display: none;"><span class="field_title form-field-title" style="margin-top: 12px;">MONERO ADDRESS</span>
                        <div style="border-radius: 3px; background-color: rgb(56, 54, 56); padding: 8px 11px; box-sizing: border-box; width: 100%; height: auto; color: rgb(124, 122, 124); font-size: 13px; font-weight: 100; font-family: Native-Light, input, menlo, monospace; -webkit-font-smoothing: subpixel-antialiased; word-break: break-all;"></div></div>
                    <div style="display: none;"><span class="field_title form-field-title" style="margin-top: 6px;">PAYMENT ID</span>
                        <div style="border-radius: 3px; background-color: rgb(56, 54, 56); padding: 8px 11px; box-sizing: border-box; width: 100%; height: auto; color: rgb(124, 122, 124); font-size: 13px; font-weight: 100; font-family: Native-Light, input, menlo, monospace; -webkit-font-smoothing: subpixel-antialiased; word-break: break-all;"></div>
                        <div class="iconAndMessageLayer" style="font-family: Native-Light, input, menlo, monospace; -webkit-font-smoothing: subpixel-antialiased; font-size: 11px; font-weight: 100; color: rgb(141, 139, 141);"><img src="../../MMAppUICommonComponents/Resources/detectedCheckmark@3x.png" width="9px" height="7px">&nbsp;<span>Detected</span></div></div></div><a class="clickableLinkButton" style="color: rgb(17, 187, 236); cursor: pointer; user-select: none; font-family: Native-Light, input, menlo, monospace; -webkit-font-smoothing: subpixel-antialiased; font-size: 10px; letter-spacing: 0.5px; width: auto; display: block; clear: both; -webkit-tap-highlight-color: rgba(0, 0, 0, 0); margin: -8px 0px 24px 32px; font-weight: 300;">+ ADD PAYMENT ID</a>
                <div class="form_field" style="display: none;">
                    <div style="margin: 0px 0px 8px;"><span class="field_title form-field-title" style="margin-top: 0px; margin-bottom: 0px; width: auto; display: inline; float: none;">ENTER PAYMENT ID OR&nbsp;</span><a class="clickableLinkButton" style="color: rgb(17, 187, 236); cursor: pointer; user-select: none; font-family: Native-Light, input, menlo, monospace; -webkit-font-smoothing: subpixel-antialiased; font-size: 10px; letter-spacing: 0.5px; width: auto; display: inline; clear: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0); margin: 0px; font-weight: 300; float: none;">GENERATE ONE</a></div><input class="field_value" type="text" placeholder="A specific payment ID" autocomplete="off" autocapitalize="none" spellcheck="true" style="display: block; height: 29px; width: calc((100% - 2px) - 14px); border-radius: 4px; border: 1px solid rgba(0, 0, 0, 0); text-align: left; font-size: 13px; font-weight: 200; padding: 0px 7px; font-family: Native-Light, input, menlo, monospace; outline: none; box-shadow: rgba(56, 54, 56, 0.5) 0px 0.5px 0px 0px, rgb(22, 20, 22) 0px 0.5px 0px 0px inset; color: rgb(223, 222, 223); background-color: rgb(29, 27, 29);"></div>
                <div class="form_field"><span class="field_title form-field-title" style="margin-top: 4px;">PRIORITY<a class="clickableLinkButton" data-id="5" style="color: rgb(17, 187, 236); cursor: pointer; user-select: none; font-family: Native-Light, input, menlo, monospace; -webkit-font-smoothing: subpixel-antialiased; font-size: 10px; letter-spacing: 0.5px; width: auto; display: inline; clear: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0); margin: 8px 0px 0px 7px; font-weight: 300; float: none;">?</a></span>
                    <div style="position: relative; left: 0px; top: 0px; width: 122px; height: 32px;"><select class="hoverable-cell utility" style="outline: none; color: rgb(252, 251, 252); background-color: rgb(56, 54, 56); width: 122px; height: 32px; border: 0px; padding: 0px; border-radius: 3px; box-shadow: rgb(22, 20, 22) 0px 0.5px 1px 0px, rgb(73, 71, 73) 0px 0.5px 0px 0px inset; -webkit-appearance: none; font-family: -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, Oxygen, Ubuntu, Cantarell, &quot;Open Sans&quot;, &quot;Helvetica Neue&quot;, sans-serif; -webkit-font-smoothing: subpixel-antialiased; font-size: 12px; letter-spacing: 0.5px; font-weight: 400; text-indent: 11px;"><option value="1" style="text-align: center;">Low</option><option value="2" style="text-align: center;">Medium</option><option value="3" style="text-align: center;">High</option><option value="4" style="text-align: center;">Very High</option></select>
                        <div style="pointer-events: none; border: none; position: absolute; width: 10px; height: 8px; right: 13px; top: 12px; z-index: 100; background-image: url(&quot;../../SelectView/Resources/dropdown-arrow-down@3x.png&quot;); background-repeat: no-repeat; background-position: center center; background-size: 10px 8px;"></div>
                    </div>
                </div>
            </div>
            `);
            console.log(html);
            layer.innerHTML = newHTML;
            contentContainerLayer.appendChild(layer);
        }
        {
            const layer = document.createElement("script");
            layer.innerText = `
            let ExchangeFunctions = require('../../Exchange/Views/ExchangeFunctions');
            console.log(ExchangeFunctions);
            const rateObj = ExchangeFunctions.getRatesAndLimits().then((result) => {
                setTimeout((result) => {
                    console.log(result);
                }, 1000);
                console.log(result); 
                let elem = document.getElementById('exchangeRate');
                let table = ExchangeFunctions.generateRatesTable(result).then((table) => {
                    console.log(table);
                    elem.appendChild(table);
                });
                console.log('this is table');
                console.log(table);
            });
            `;
            
            contentContainerLayer.appendChild(layer);
        }
        self.emptyStateMessageContainerView = view
        self.addSubview(view)
    }
/**
 *                 let exchangeRate = document.getElementById('exchangeRate');
                console.log(ExchangeFunctions)
                exchangeRate.addEventListener('click', function() {
                    const rateObj = await ExchangeFunctions.getRatesAndLimits();
                    console.log(rateObj);
                })
*/
    Navigation_Title() {
        return "Exchange"
    }

    Navigation_New_RightBarButtonView()
    {
        const self = this
        //
        const view = commonComponents_navigationBarButtons.New_RightSide_AddButtonView(self.context)
        view.layer.addEventListener(
            "click",
            function(e)
            {
                e.preventDefault()
                //
                console.warn("Button pressed and then view change")
                //
                // const view = new AddContactFromContactsTabView({}, self.context)
                // self.currentlyPresented_AddContactView = view
                // const navigationView = new StackAndModalNavigationView({}, self.context)
                // navigationView.SetStackViews([ view ])
                // self.navigationController.PresentView(navigationView, true)
                //
                return false
            }
        )
        return view
    }
}

module.exports = ExchangeContentView
