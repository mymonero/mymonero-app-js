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
//"use strict"
const View = require('../../Views/View.web')
const ListView = require('../../Lists/Views/ListView.web')
const emoji_web = require('../../Emoji/emoji_web')
const ExchangeFunctions = require('./ExchangeFunctions')
const commonComponents_navigationBarButtons = require('../../MMAppUICommonComponents/navigationBarButtons.web')
const WalletsSelectView = require('../../WalletsList/Views/WalletsSelectView.web')
const fs = require('fs');
//const commonComponents_contactPicker = require('../../MMAppUICommonComponents/contactPicker.web')


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
        console.log(self.context);
        const view = new View({}, self.context)
        {
            const layer = view.layer
            layer.classList.add("emptyScreens")
            layer.classList.add("empty-page-panel")
        }
        var contentContainerLayer;
        {
            //const layer = document.createElement("div")
            
            // layer.classList.add("content-container")
            // layer.classList.add("empty-page-content-container")
            // 
            // view.layer.appendChild(layer)
            //let html = fs.readFileSync(__dirname + '/Header.html', 'utf8');
            //layer.innerHTML = html;
            const layer = document.createElement("div");
            layer.classList.add("content-container")
            layer.classList.add("empty-page-content-container")
            view.layer.appendChild(layer)
            contentContainerLayer = layer
            //layer.classList.add("xmr_input");
            let html = fs.readFileSync(__dirname + '/Header.html', 'utf8');
            layer.innerHTML = html;
            //contentContainerLayer.appendChild(layer);
        }
        // {
		// 	// const labelLayer = commonComponents_forms.New_fieldTitle_labelLayer("FROM", self.context)
		// 	// {
		// 	// 	const tooltipText = `Monero makes transactions<br/>with your "available outputs",<br/>so part of your balance will<br/>be briefly locked and then<br/>returned as change.`
		// 	// 	const view = commonComponents_tooltips.New_TooltipSpawningButtonView(tooltipText, self.context)
		// 	// 	const layer = view.layer
		// 	// 	labelLayer.appendChild(layer) // we can append straight to labelLayer as we don't ever change its innerHTML
		// 	// }
		// 	// div.appendChild(labelLayer)
		// 	// //
		// 	const view = new WalletsSelectView({}, self.context)
        //     view.didUpdateSelection_fn = function(){};
        //     console.log(view);
		// 	{
		// 		//self.configure_amountInputTextGivenMaxToggledState()
		// 	}
		// 	self.walletSelectView = view
        //     const valueLayer = view.layer;
        //     console.log(valueLayer);
        //     contentContainerLayer.appendChild(valueLayer)
        //     //view.layer.appendChild(valueLayer)

        // }
        // {
        //     const layer = document.createElement("div")
        //     layer.classList.add("emoji-label")
        //     layer.innerHTML = emoji_web.NativeEmojiTextToImageBackedEmojiText_orUnlessDisabled_NativeEmojiText(self.context, "😬")
        //     contentContainerLayer.appendChild(layer)
        // }
        {
            
            const layer = document.createElement("div")
            layer.classList.add("message-label")
            layer.classList.add("exchangeRate")
            layer.innerHTML = "You can exchange XMR to Bitcoin directly from this page.";
            contentContainerLayer.appendChild(layer)
        }
        {
            // let's make the xmr.to form in HTML for sanity's sake
            const layer = document.createElement("div");
            //layer.classList.add("xmr_input");
            let html = fs.readFileSync(__dirname + '/Body.html', 'utf8');
            layer.innerHTML = html;
            contentContainerLayer.appendChild(layer);
        }
        {
            const layer = document.createElement("script");
            layer.innerText = fs.readFileSync(__dirname + '/ExchangeScript.js', 'utf8');
            // we will probably need to handle the context.wallet stuff here
            contentContainerLayer.appendChild(layer);
        }
        self.emptyStateMessageContainerView = view
        self.addSubview(view)
        // setInterval((context, options) => {
        //     console.log(options);
        //     console.log(self.context);
        //     console.log(self.context.walletsListController);
        // }, 5000);
    }
/**
 *                 let exchangeRate = document.getElementById('exchangeRate');
                
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
        //const view = _New_ButtonBase_View(context)
        const layer = view.layer
        { // setup/style
            layer.href = "" // to make it non-clickable -- KB: Or you could event.preventDefault..., like sane people?
            layer.innerHTML = "Create Order";
            layer.id = "order-button"
            layer.classList.add('exchange-button')
            layer.classList.add('base-button'); 
            layer.classList.add('hoverable-cell'); 
            layer.classList.add('navigation-blue-button-enabled'); 
            layer.classList.add('action'); 

            if (typeof process !== 'undefined' && process.platform === "linux") {
                layer.style.fontWeight = "700" // surprisingly does not render well w/o this… not linux thing but font size thing. would be nice to know which font it uses and toggle accordingly. platform is best guess for now
            } else {
                layer.style.fontWeight = "300"
                }
            }
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
