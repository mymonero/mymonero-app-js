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
//
const commonComponents_forms = require('../../MMAppUICommonComponents/forms.web')
const commonComponents_navigationBarButtons = require('../../MMAppUICommonComponents/navigationBarButtons.web')
const commonComponents_emptyScreens = require('../../MMAppUICommonComponents/emptyScreens.web')
const commonComponents_actionButtons = require('../../MMAppUICommonComponents/actionButtons.web')
//
const BaseView_AWalletWizardScreen = require('./BaseView_AWalletWizardScreen.web')
//
class PickCreateOrUseExisting_Landing_View extends BaseView_AWalletWizardScreen
{
	_setup_views()
	{
		const self = this
		super._setup_views()
		self._setup_emptyStateMessageContainerView()
		self._setup_actionButtonsContainerView()
		{ // update empty state message container to accommodate 
			const margin_v = self.emptyStateMessageContainerView.__EmptyStateMessageContainerView_margin_v
			self.emptyStateMessageContainerView.layer.style.height 
				= `calc(100% - ${2 * margin_v}px + 3px - ${self.actionButtonsContainerView.layer.style.height/*no'px'*/})`
		}
	}
	_setup_emptyStateMessageContainerView()
	{
		const self = this
		const view = commonComponents_emptyScreens.New_EmptyStateMessageContainerView(
			"🤔", 
			"How would you like to</br>add a wallet?",
			self.context,
			16,
			19
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
			margin_v - 3, // top
			self.context
		)
		self.actionButtonsContainerView = view
		{
			self._setup_actionButton_useExistingWallet()
			self._setup_actionButton_createNewWallet()
		}
		self.addSubview(view)
	}
	_setup_actionButton_useExistingWallet()
	{
		const self = this
		const buttonView = commonComponents_actionButtons.New_ActionButtonView(
			"Use existing wallet", 
			null, // no image
			false,
			function(layer, e)
			{
				self.wizardController.PatchToDifferentWizardTaskMode_byPushingScreen(
					self.wizardController.WizardTask_Mode_AfterPick_UseExisting(), 
					1 // first screen after 0 - maintain ability to hit 'back'
				)
			},
			self.context
		)
		self.actionButtonsContainerView.addSubview(buttonView)
	}
	_setup_actionButton_createNewWallet()
	{
		const self = this
		const buttonView = commonComponents_actionButtons.New_ActionButtonView(
			"Create new wallet", 
			null, // no image
			true,
			function(layer, e)
			{
				self.wizardController.PatchToDifferentWizardTaskMode_byPushingScreen(
					self.wizardController.WizardTask_Mode_AfterPick_CreateWallet(), 
					1 // first screen after 0 - maintain ability to hit 'back'
				)
			},
			self.context,
			undefined,
			"blue"
		)
		self.actionButtonsContainerView.addSubview(buttonView)
	}
	_setup_startObserving()
	{
		const self = this
		super._setup_startObserving()
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
		return "Add Wallet"
	}
	Navigation_New_LeftBarButtonView()
	{
		const self = this
		const view = commonComponents_navigationBarButtons.New_LeftSide_CancelButtonView(self.context)
		const layer = view.layer
		{ // observe
			layer.addEventListener(
				"click",
				function(e)
				{
					e.preventDefault()
					self.wizardController._fromScreen_userPickedCancel()
					return false
				}
			)
		}
		return view
	}
	//
	//
	// Runtime - Imperatives - 
	//
}
module.exports = PickCreateOrUseExisting_Landing_View
