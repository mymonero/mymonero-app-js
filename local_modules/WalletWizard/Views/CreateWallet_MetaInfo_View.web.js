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
const commonComponents_forms = require('../../MMAppUICommonComponents/forms.web')
const commonComponents_navigationBarButtons = require('../../MMAppUICommonComponents/navigationBarButtons.web')
//
const BaseView_Wallet_MetaInfo = require('./BaseView_Wallet_MetaInfo.web')
//
class CreateWallet_MetaInfo_View extends BaseView_Wallet_MetaInfo
{
	_setup_views()
	{
		const self = this
		super._setup_views()
		self._setup_form_walletNameField()
		self._setup_form_walletSwatchField()
		// after visible… (TODO: improve this by doing on VDA or other trigger)
		setTimeout(function()
		{
			self.walletNameInputLayer.focus()
		}, 600)
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
		return "New Wallet"
	}
	Navigation_New_LeftBarButtonView()
	{
		const self = this
		if (self.options.wizardController_current_wizardTaskModeName != self.wizardController.WizardTask_Mode_FirstTime_CreateWallet()) {
			return null // cause we either want null or maybe a back button
		}
		const view = commonComponents_navigationBarButtons.New_LeftSide_CancelButtonView(self.context)
		self.leftBarButtonView = view
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
	// Runtime - Delegation - Navigation View special methods
	//
	navigationView_viewIsBeingPoppedFrom()
	{	// this will only get popped from when it's not the first in the nav stack, i.e. not adding first wallet,
		// so we'll need to get back into Mode_PickCreateOrUseExisting
		const self = this
		self.wizardController.PatchToDifferentWizardTaskMode_withoutPushingScreen( // to maintain the correct state
			self.wizardController.WizardTask_Mode_PickCreateOrUseExisting(), 
			0 // back to 0 from 1
		)
	}
	//
	//
	// Runtime - Delegation - Interactions
	//
	_userSelectedNextButton()
	{
		const self = this
		const walletColorHexString = self.walletColorPickerInputView.Component_Value()
		const walletName = self.walletNameInputLayer.value
		self.wizardController.walletMeta_name = walletName
		self.wizardController.walletMeta_colorHexString = walletColorHexString
		//
		self.wizardController.ProceedToNextStep()
	}
}
module.exports = CreateWallet_MetaInfo_View
