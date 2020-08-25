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
const StackAndModalNavigationView = require('../../StackNavigation/Views/StackAndModalNavigationView.web')
const ExchangeContentView = require('./ExchangeContentView.web')

class ExchangeTabContentView extends StackAndModalNavigationView
{
	constructor(options, context)
	{
		super(options, context)
	}
	setup()
	{
		super.setup() // we must call on super
		const self = this
		{ 
			const options = {}

			const view = new ExchangeContentView(options, self.context)
			self.contactsListView = view
		}
		self.SetStackViews(
			[
				self.contactsListView
			]
		)
	}

	TabBarItem_layer_customStyle()
	{
		return {}
	}
	TabBarItem_icon_customStyle()
	{
		const self = this
		return {
			backgroundImage: "url(../../../assets/img/XMRtoBTCInactive.svg)",
			backgroundPosition: "center",
			backgroundRepeat: "no-repeat",
			backgroundSize: "39px"
		}
	}
	TabBarItem_icon_selected_customStyle()
	{
		const self = this
		return {
			backgroundImage: "url(../../../assets/img/XMRtoBTCActive.svg)",
			backgroundPosition: "center",
			backgroundRepeat: "no-repeat",
			backgroundSize: "39px"
		}
	}
	// interactivity
	TabBarItem_shallDisable()
	{
		const self = this
		const passwordController = self.context.passwordController
		if (passwordController.hasUserSavedAPassword !== true) {
			return true // no existing data - do disable
		}
		if (passwordController.HasUserEnteredValidPasswordYet() !== true) { // has data but not unlocked app
			return true // because the app needs to be unlocked before they can use it
		}
		if (passwordController.IsUserChangingPassword() === true) {
			return true // changing pw - prevent jumping around
		}
		const wallets = self.context.walletsListController.records // figure it's ready by this point
		const numberOf_wallets = wallets.length
		const walletsExist = numberOf_wallets !== 0
		const shallDisable = walletsExist == false // no wallets? disable
		return shallDisable
	}

	// We're importing the following function from Wallets/Views/ImportTransactionsModalView.web.js since the implementation there is simpler
	// We need to pass it a wallet from context.wallets to be able to invoke wallet.sendFunds. 
	// Since we know which wallet the user has selected (data-wallet-offset on the selected one), we supply that one.
	_tryToGenerateSend() {
		const self = this;
		console.log(self);
		return;
        if (self.isSubmitButtonDisabled) {
            console.warn("⚠️  Submit button currently disabled. Bailing.")
            return
        }
        { // disable form elements
            self.disable_submitButton()
            self.isFormDisabled = true
            //
            self.walletSelectView.SetEnabled(false)
        }
        {
            self._dismissValidationMessageLayer()
        }

        function _reEnableFormElements() {
            self.isFormDisabled = false
            //
            self.enable_submitButton()
            self.walletSelectView.SetEnabled(true)
        }

        function _trampolineToReturnWithValidationErrorString(errStr) { // call this anytime you want to exit this method before complete success (or otherwise also call _reEnableFormElements)
            self.validationMessageLayer.SetValidationError(errStr)
            _reEnableFormElements()
        }

        //
        const wallet = self.walletSelectView.CurrentlySelectedRowItem
        if (typeof wallet === 'undefined' || !wallet) {
            _trampolineToReturnWithValidationErrorString("Please create a wallet to send Monero.")
            return
        }
        wallet.SendFunds(
            self.addressInputLayer.value,
            undefined, // resolvedAddress
            self.manualPaymentIDInputLayer.value,
            undefined, // resolvedPaymentID
            false, // hasPickedAContact
            false, // resolvedAddress_fieldIsVisible
            true, // manuallyEnteredPaymentID_fieldIsVisible
            false, // resolvedPaymentID_fieldIsVisible
            //
            undefined, // contact_payment_id
            undefined, // cached_OAResolved_address
            undefined, // contact_hasOpenAliasAddress
            undefined, // contact_address
            //
            self.amountInputLayer.value,
            false, // sweeping
            monero_sendingFunds_utils.default_priority(),
            //
            preSuccess_nonTerminal_statusUpdate_fn,
            cancelled_fn,
            doViewSpecificUpdates
        )

        function doViewSpecificUpdates (err, mockedTransaction) {
            if (err) {
                _trampolineToReturnWithValidationErrorString(typeof err === 'string' ? err : err.message)
                return
            }
            //
            self.validationMessageLayer.SetValidationError(`Sent.`, true/*wantsXButtonHidden*/)
            // finally, clean up form
            setTimeout(
                function () {
                    self._dismissValidationMessageLayer()
                    // Now dismiss
                    self.dismissView()
                },
                500
            )
            // and fire off a request to have the wallet get the latest (real) tx records
            setTimeout(
                function () {
                    wallet.hostPollingController._fetch_transactionHistory() // TODO: maybe fix up the API for this
                }
            )
        }

        function preSuccess_nonTerminal_statusUpdate_fn(str)
        {
            self.validationMessageLayer.SetValidationError(str, true/*wantsXButtonHidden*/)
        }

        function cancelled_fn() { // canceled_fn
            self._dismissValidationMessageLayer()
            _reEnableFormElements()
        }
    }

}
module.exports = ExchangeTabContentView
