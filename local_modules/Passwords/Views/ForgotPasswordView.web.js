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
const View = require('../../Views/View.web')
const commonComponents_forms = require('../../MMAppUICommonComponents/forms.web')
const commonComponents_navigationBarButtons = require('../../MMAppUICommonComponents/navigationBarButtons.web')
const commonComponents_emptyScreens = require('../../MMAppUICommonComponents/emptyScreens.web')
const commonComponents_actionButtons = require('../../MMAppUICommonComponents/actionButtons.web')
//
class ForgotPasswordView extends View
{
	constructor(options, context)
	{
		super(options, context)
		const self = this
		{
			const userSelectedTypeOfPassword = self.context.passwordController.userSelectedTypeOfPassword
			if (userSelectedTypeOfPassword === null || userSelectedTypeOfPassword == "" || typeof userSelectedTypeOfPassword === 'undefined') {
				throw "ConfigureToBeShown called but userSelectedTypeOfPassword undefined"
			}
			self.userSelectedTypeOfPassword = userSelectedTypeOfPassword
		}
		self.setup()
	}
	setup()
	{
		const self = this
		self._setup_views()
		self._setup_startObserving()
	}
	_setup_views()
	{
		const self = this
		self.__setup_self_layer()
		self._setup_emptyStateMessageContainerView()
		self._setup_actionButtonsContainerView()
		{ // update empty state message container to accommodate 
			const margin_v = self.emptyStateMessageContainerView.__EmptyStateMessageContainerView_margin_v
			self.emptyStateMessageContainerView.layer.style.height = 
				`calc(100% - ${2 * margin_v}px + 3px - ${self.actionButtonsContainerView.layer.style.height/*no'px'*/})`
		}
	}
	__setup_self_layer()
	{
		const self = this
		//
		const layer = self.layer
		layer.style.webkitUserSelect = "none" // disable selection here but enable selectively
		//
		layer.style.position = "relative"
		layer.style.boxSizing = "border-box"
		layer.style.width = "100%"
		layer.style.height = "100%" // we're also set height in viewWillAppear when in a nav controller
		layer.style.padding = "0" // actually going to change paddingTop in self.viewWillAppear() if navigation controller
		//
		layer.style.backgroundColor = "#272527" // so we don't get a strange effect when pushing self on a stack nav view
		//
		layer.style.color = "#c0c0c0" // temporary
		//
		layer.style.wordBreak = "break-all" // to get the text to wrap
	}
	_setup_emptyStateMessageContainerView()
	{
		const self = this
		const view = commonComponents_emptyScreens.New_EmptyStateMessageContainerView(
			"😢", 
			"Password reset is not possible,<br/>as your data is encrypted and local.<br/><br/>If you can't remember it, you'll need<br/>to clear all data and re-import your<br/>wallets to continue.",
			self.context,
			16,
			19 // and we'll set btm to 0 manually
		)
		const layer = view.layer
		layer.style.marginBottom = "0" // not going to use margin on the btm because action bar is there
		self.emptyStateMessageContainerView = view
		self.addSubview(view)
	}
	_setup_actionButtonsContainerView()
	{
		const self = this
		const margin_h = self.emptyStateMessageContainerView.__EmptyStateMessageContainerView_margin_h
		const margin_v = self.emptyStateMessageContainerView.__EmptyStateMessageContainerView_margin_v
		const view = commonComponents_actionButtons.New_Stacked_ActionButtonsContainerView(
			margin_h, 
			margin_h, 
			margin_v - 3,
			self.context
		)
		self.actionButtonsContainerView = view
		{
			self._setup_actionButton_nevermind()
			self._setup_actionButton_clearAllData()
		}
		self.addSubview(view)
	}
	_setup_actionButton_nevermind()
	{
		const self = this
		const buttonView = commonComponents_actionButtons.New_ActionButtonView(
			"Nevermind", 
			null, // no image
			false,
			function(layer, e)
			{
				self.navigationController.PopView(true)
			},
			self.context
		)
		self.actionButtonsContainerView.addSubview(buttonView)
	}
	_setup_actionButton_clearAllData()
	{
		const self = this
		const buttonView = commonComponents_actionButtons.New_ActionButtonView(
			"Clear all data", 
			null, // no image
			true,
			function(layer, e)
			{
				var msg = 'Are you sure you want to delete all of your local data?\n\nAny wallets will remain permanently on the Monero blockchain but local data such as contacts will not be recoverable.'
				self.context.windowDialogs.PresentQuestionAlertDialogWith(
					'Delete everything?', 
					msg,
					[ 'Delete Everything', 'Cancel' ],
					function(err, selectedButtonIdx)
					{
						if (err) {
							throw err
						}
						const didChooseYes = selectedButtonIdx === 0
						if (didChooseYes) {
							self.context.passwordController.InitiateDeleteEverything(function(err) {})
						}
					}
				)
			},
			self.context,
			undefined,
			"red" // 'destructive' cell
		)
		self.actionButtonsContainerView.addSubview(buttonView)
	}
	_setup_startObserving()
	{
		const self = this
	}
	//
	//
	// Lifecycle - Teardown
	//
	TearDown()
	{
		const self = this
		super.TearDown()
	}
	//
	//
	// Runtime - Accessors - Navigation
	//
	Navigation_Title()
	{
		const self = this
		const passwordType_humanReadableString = self.context.passwordController.HumanReadable_AvailableUserSelectableTypesOfPassword()[self.userSelectedTypeOfPassword]
		return "Forgot " + passwordType_humanReadableString + "?"
	}
	Navigation_New_LeftBarButtonView()
	{
		const self = this
		return null // no back btn
	}
	Navigation_HidesBackButton()
	{
		return true
	}
	//
	//
	// Runtime - Imperatives - 
	//

	//
	//
	// Runtime - Delegation - Navigation/View lifecycle
	//
	viewWillAppear()
	{
		const self = this
		super.viewWillAppear()
		if (typeof self.navigationController !== 'undefined' && self.navigationController !== null) {
			self.layer.style.paddingTop = `${self.navigationController.NavigationBarHeight()}px`
		}
	}
}
module.exports = ForgotPasswordView
