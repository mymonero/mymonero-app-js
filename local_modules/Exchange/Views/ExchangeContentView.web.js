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
const ExchangeFunctions = require('../Javascript/ExchangeFunctions')
const ExchangeUtils = require('../Javascript/ExchangeUtilityFunctions');
const commonComponents_navigationBarButtons = require('../../MMAppUICommonComponents/navigationBarButtons.web')
const commonComponents_forms = require('../../MMAppUICommonComponents/forms.web')
const commonComponents_tooltips = require('../../MMAppUICommonComponents/tooltips.web')
const WalletsSelectView = require('../../WalletsList/Views/WalletsSelectView.web')
const fs = require('fs');
//const commonComponents_contactPicker = require('../../MMAppUICommonComponents/contactPicker.web')
const jsQR = require('jsqr')
const monero_requestURI_utils = require('../../MoneroUtils/monero_requestURI_utils')

let JSBigInt = require('../../mymonero_libapp_js/mymonero-core-js/cryptonote_utils/biginteger').BigInteger // important: grab defined export
const monero_sendingFunds_utils = require('../../mymonero_libapp_js/mymonero-core-js/monero_utils/monero_sendingFunds_utils')
const monero_openalias_utils = require('../../OpenAlias/monero_openalias_utils')
const monero_config = require('../../mymonero_libapp_js/mymonero-core-js/monero_utils/monero_config')
const monero_amount_format_utils = require('../../mymonero_libapp_js/mymonero-core-js/monero_utils/monero_amount_format_utils')
const documents = require('../../DocumentPersister/DocumentPersister_Interface.js');

class ExchangeContentView extends ListView {
    constructor(options, context) {
        options.listController = context.contactsListController
        let self = context;
        // ^- injecting dep so consumer of self doesn't have to
        super(options, context)
        self.currentlyPresented_AddContactView = null // zeroing
        let passwordInput = document.getElementsByClassName('field_value');
        // wait half a second for password controller to boot
        // setTimeout(() => {
        //     let passwordInput = document.getElementsByClassName('field_value');
        //     let m = passwordInput[0];
        //     setTimeout(() => {
        //         let passwordInput = document.getElementsByClassName('field_value');
        //         let m = passwordInput[0];
        //         // pass default password to password field
        //         m.value = "";
        //     }, 500)
        // }, 500)
        // regularly update our selector component with latest wallet values
        //setInterval()
    }

    _setup_walletExchangeOptions(context) {
        let self = this;
        let walletDiv = document.getElementById('wallet-selector');
        if (walletDiv === null) {
            return;
        }
        
        // if the user has selected a wallet, we update the balances for them
        if (walletDiv.dataset.walletchosen == "true") {
            let selectedWallet = document.getElementById('selected-wallet');
            let selectorOffset = selectedWallet.dataset.walletoffset;
            let selectorInt = parseInt(selectorOffset);
            let wallet = self.context.wallets[selectorInt];
            let walletBalance = document.getElementById('selected-wallet-balance'); 
            walletBalance.innerText = `${self.UnlockedBalance_FormattedString(self.context.wallets[selectorOffset])} XMR available`;
        } else {
            let walletOptions = ``;
            for (let i = 0; i < context.wallets.length; i++) {
                let wallet = context.wallets[i];
                let swatch = wallet.swatch.substr(1);
                walletOptions = walletOptions + `
                <div data-walletLabel="${wallet.walletLabel}" data-walletoffset="${i}" data-swatch="${swatch}" data-walletbalance="${self.UnlockedBalance_FormattedString(wallet)}" data-walletid="${wallet._id}" data-walletpublicaddress="${wallet.public_address}" class="hoverable-cell utility optionCell" style="word-break: break-all; height: 66px; position: relative; left: 0px; top: 0px; box-sizing: border-box; width: 100%;">                    
                    <div class="walletIcon medium-32" style="background-image: url('../../../assets/img/wallet-${swatch}@3x.png');"></div>                        
                    <div class="walletLabel">${wallet.walletLabel}</div>
                    <div class="description-label" style="position: relative; box-sizing: border-box; padding: 0px 38px 4px 66px; font-size: 13px; font-family: Native-Light, input, menlo, monospace; font-weight: 100; -webkit-font-smoothing: subpixel-antialiased; max-height: 32px; color: rgb(158, 156, 158); word-break: normal; overflow: hidden; text-overflow: ellipsis; cursor: default;">${self.UnlockedBalance_FormattedString(wallet)} XMR available</div>
                </div>
                `;
            }         

            // get oldest wallet based on how wallets are inserted into wallets as a zero element, changing indexes backwards
            let size = context.wallets.length;
            size = size - 1;
            let defaultOffset = 0;
            let defaultWallet = context.wallets[defaultOffset];
            let walletSelectOptions = `
            <div data-walletoffset="0" data-walletpublicaddress="${defaultWallet.public_address}" data-walletLabel="${defaultWallet.walletLabel}" data-swatch="${defaultWallet.swatch.substr(1)}" data-walletbalance="${self.UnlockedBalance_FormattedString(defaultWallet)}" data-walletid="${defaultWallet._id}" id="selected-wallet" class="hoverable-cell utility selectionDisplayCellView" style="">
                    <div id="selected-wallet-icon" class="walletIcon medium-32" style="background-image: url('../../../assets/img/wallet-${defaultWallet.swatch.substr(1)}@3x.png')"></div>
                    <div id="selected-wallet-label" class="walletName">${defaultWallet.walletLabel}</div>
                    <div id="selected-wallet-balance" class="description-label">${self.UnlockedBalance_FormattedString(defaultWallet)} XMR available</div>
                </div>
                <div id="wallet-options" class="options_containerView">
                    <div class="options_cellViews_containerView" style="position: relative; left: 0px; top: 0px; width: 100%; height: 100%; z-index: 20; overflow-y: auto; max-height: 174.9px;">
                        ${walletOptions}
                    </div>
                </div>
            `;
            walletDiv.innerHTML = walletSelectOptions;
        }

    }
    _refresh_sending_fee() {
        const self = this;
        let tx_fee = document.getElementById('tx-fee');
        if (tx_fee !== null) {
            tx_fee.dataset.txFee = self._new_estimatedNetworkFee_displayString();
            tx_fee.innerHTML = `<span class="field_title form-field-title" style="margin-top: 8px; color: rgb(158, 156, 158); display: inline-block;">+ ${self._new_estimatedNetworkFee_displayString()} XMR EST. FEE</span>`;
        }
    }

    _setup_views() {
        // to do -- clean up interval timers a bit.
        const self = this
        super._setup_views()
        self._setup_emptyStateContainerView()
        self.observerIsSet = false;

        let interval = setInterval(function() {
            // if wallets exist, setup the wallet selector for the exchange page
            if (self.context.wallets !== undefined) {
                self._setup_walletExchangeOptions(self.context);
            }
            self._refresh_sending_fee();
        }, 4000);
        self.keepExchangeOptionsUpdated = interval; // we use a named interval attached to the view so that we can stop it if we ever want to;
    }
    
    _setup_emptyStateContainerView() {
        // TODO: wrap this in a promise so that we can execute logic after this
        const self = this;

        // We run this on an interval because of the way DOM elements are instantiated. Our Exchange DOM only renders once a user clicks the XMR->BTC menu tab
        let initialExchangeInit = setInterval(() => {
            let walletDiv = document.getElementById('wallet-selector');
            if (walletDiv !== null) {
                clearInterval( self.initialExchangeInit ); 
                self._setup_walletExchangeOptions(self.context);
            }
        }, 200);

        self.initialExchangeInit = initialExchangeInit;
        const view = new View({}, self.context)
        {
            const layer = view.layer
            layer.classList.add("emptyScreens")
            layer.classList.add("empty-page-panel")
        }
        var contentContainerLayer;
        {
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

        {
            const layer = document.createElement("div")
            layer.classList.add("message-label")
            layer.classList.add("exchangeRate")
            layer.id = "explanatory-message";
            layer.innerHTML = "You can exchange XMR to Bitcoin here.";
            contentContainerLayer.appendChild(layer)
        }
        
        {
            // Send Funds
            const layer = document.createElement("div");
            // we use ES6's spread operator (...buttonClasses) to invoke the addition of classes -- cleaner than a foreach
            let buttonClasses = ['base-button', 'hoverable-cell', 'navigation-blue-button-enabled', 'action', 'right-add-button', 'exchange-button'];
            layer.classList.add(...buttonClasses);  
            layer.id = "exchange-xmr";
            layer.innerText = "Exchange XMR";
            layer.addEventListener('click', function() {
                let exchangeXmrBtn = document.getElementById("exchange-xmr");
                exchangeXmrBtn.style.display = "none";
                /* 
                * We define the status update and the response handling function here, since we need to update the DOM with status feedback from the monero-daemon. 
                * We pass them as the final argument to ExchangeUtils.sendFunds
                * It performs the necessary DOM-based status updates in this file so that we don't tightly couple DOM updates to a Utility module.
                */
                function validation_status_fn(str)
                {

                    let monerodUpdates = document.getElementById('monerod-updates')
                    monerodUpdates.innerText = str;
                }
                /* 
                * We perform the necessary DOM-based status updates in this file so that we don't tightly couple DOM updates to a Utility module.
                */
                function handle_response_fn(err, mockedTransaction)
                {
                    let str;
                    let monerodUpdates = document.getElementById('monerod-updates');
                    if (err) {
                        str = typeof err === 'string' ? err : err.message;
                        monerodUpdates.innerText = str;
                        exchangeXmrBtn.style.display = "block";
                        return
                    }
                    str = "Sent successfully.";
                    monerodUpdates.innerText = str;
                }
                let xmr_amount = document.getElementById('in_amount_remaining').innerHTML;
                let xmr_send_address = document.getElementById('receiving_subaddress').innerHTML;
                let xmr_amount_str = "" + xmr_amount;
                
                let selectedWallet = document.getElementById('selected-wallet');
                let selectorOffset = selectedWallet.dataset.walletoffset;
                let sweep_wallet = false; // TODO: Add sweeping functionality
                ExchangeUtils.sendFunds(self.context.wallets[selectorOffset], xmr_amount_str, xmr_send_address, sweep_wallet, validation_status_fn, handle_response_fn);
            });


            contentContainerLayer.appendChild(layer);
        }
        {
            // let's make the xmr.to form in HTML for sanity's sake
            const layer = document.createElement("div");
            //layer.classList.add("xmr_input");
            let html = '    <div>';
            html += fs.readFileSync(__dirname + '/Body.html', 'utf8');
            layer.innerHTML = html;
            contentContainerLayer.appendChild(layer);
        }
        {
            const layer = document.createElement("div");
            layer.id = "exchange-wallet-options";
            //layer.innerHTML = self._setup_walletExchangeOptions(self.context);
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
    }

    Balance_JSBigInt(wallet)
    {
        const self = this;
        var total_received = wallet.total_received
        var total_sent = wallet.total_sent
        if (typeof total_received === 'undefined') {
            total_received = new JSBigInt(0) // patch up to avoid crash as this doesn't need to be fatal
        }
        if (typeof total_sent === 'undefined') {
            total_sent = new JSBigInt(0) // patch up to avoid crash as this doesn't need to be fatal
        }
        const balance_JSBigInt = total_received.subtract(total_sent)
        if (balance_JSBigInt.compare(0) < 0) {
            return new JSBigInt(0)
        }
        return balance_JSBigInt
    }
    UnlockedBalance_FormattedString(wallet)
	{ // provided for convenience mainly so consumers don't have to require monero_utils
        let self = this;
		let balance_JSBigInt = self.UnlockedBalance_JSBigInt(wallet);
		return monero_amount_format_utils.formatMoney(balance_JSBigInt) 
	}
    Balance_FormattedString(wallet)
	{ // provided for convenience mainly so consumers don't have to require monero_utils
        let self = this;
		let balance_JSBigInt = self.Balance_JSBigInt(wallet);
		return monero_amount_format_utils.formatMoney(balance_JSBigInt) 
	}
	Balance_DoubleNumber(wallet)
	{
		let self = wallet;
		return parseFloat(self.Balance_FormattedString()) // is this appropriate and safe?
	}
	UnlockedBalance_JSBigInt(wallet)
	{
		let self = wallet;
		const difference = self.Balance_JSBigInt().subtract(
			self.locked_balance || new JSBigInt(0)
		)
		if (difference.compare(0) < 0) {
			return new JSBigInt(0)
		}
		return difference
	}
	LockedBalance_JSBigInt(wallet)
	{
		let self = wallet;
		var lockedBalance_JSBigInt = self.locked_balance
		if (typeof lockedBalance_JSBigInt === 'undefined') {
			lockedBalance_JSBigInt = new JSBigInt(0)
		}
		//
		return lockedBalance_JSBigInt
	}
	LockedBalance_FormattedString()
	{ // provided for convenience mainly so consumers don't have to require monero_utils
		let self = this
		let lockedBalance_JSBigInt = self.LockedBalance_JSBigInt()
		//
		return monero_amount_format_utils.formatMoney(lockedBalance_JSBigInt)
	}
	LockedBalance_DoubleNumber()
	{
		let self = this
		return parseFloat(self.LockedBalance_FormattedString()) // is this appropriate and safe?
    }
    
	new_xmr_estFeeAmount() 
	{
		const self = this
		const estimatedNetworkFee_JSBigInt = new JSBigInt(self.context.monero_utils.estimated_tx_network_fee(
			null, // deprecated - will be removed soon
			1,
			"24658" // TODO: grab this from wallet via API request
		))
		const estimatedTotalFee_JSBigInt = estimatedNetworkFee_JSBigInt // no tx hosting service fee
		//
		return estimatedTotalFee_JSBigInt
	}

    _new_estimatedNetworkFee_displayString()
	{
		const self = this
		const estimatedTotalFee_JSBigInt = self.new_xmr_estFeeAmount()
		const estimatedTotalFee_str = monero_amount_format_utils.formatMoney(estimatedTotalFee_JSBigInt)
		const estimatedTotalFee_moneroAmountDouble = parseFloat(estimatedTotalFee_str)
		
		// const estimatedTotalFee_moneroAmountDouble = 0.028
		// Just hard-coding this to a reasonable estimate for now as the fee estimator algo uses the median blocksize which results in an estimate about twice what it should be
		let displayCcySymbol = self.context.settingsController.displayCcySymbol
		let finalizable_ccySymbol = displayCcySymbol
		var finalizable_formattedAmountString = estimatedTotalFee_str;//`${estimatedTotalFee_moneroAmountDouble}`
		let final_formattedAmountString = finalizable_formattedAmountString
		let final_ccySymbol = "XMR";
		let displayString = `${final_formattedAmountString}`
		//
		return displayString
	}


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

            
            // view.layer.addEventListener(
            //     "click",
            //     function(e)
            //     {
            //         e.preventDefault()
            //         //
            //         let orderElement = document.getElementById("")    
            //         //
            //         // const view = new AddContactFromContactsTabView({}, self.context)
            //         // self.currentlyPresented_AddContactView = view
            //         // const navigationView = new StackAndModalNavigationView({}, self.context)
            //         // navigationView.SetStackViews([ view ])
            //         // self.navigationController.PresentView(navigationView, true)
            //         //
            //         return false
            //     }
            // )
            return view
        }
    }



module.exports = ExchangeContentView
