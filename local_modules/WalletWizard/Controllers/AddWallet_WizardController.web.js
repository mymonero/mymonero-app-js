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
const WizardTask_Modes =
{
	CreateWallet: "CreateWallet",
	UseExisting: "UseExisting",
	PickCreateOrUseExisting: "PickCreateOrUseExisting"
}
const WizardTask_StepName_CreatePasswordOrDone = "CreatePassword_orDone"
const WizardTask_ModeStepNamesByIdxStr_CreateWallet =
{
	"0": "MetaInfo",
	"1": "Instructions",
	"2": "InformOfMnemonic",
	"3": "ConfirmMnemonic",
	"4": WizardTask_StepName_CreatePasswordOrDone
}
const WizardTask_ModeStepNamesByIdxStr_UseExisting =
{
	"0": "MetaInfo",
	"1": WizardTask_StepName_CreatePasswordOrDone
}
const WizardTask_ModeStepNamesByIdxStr_PickCreateOrUseExisting =
{
	"0": "Landing" // there's only one screen
}
const WizardTask_ModeStepNamesByIdxStr_ByTaskModeName =
{
	CreateWallet: WizardTask_ModeStepNamesByIdxStr_CreateWallet,
	UseExisting: WizardTask_ModeStepNamesByIdxStr_UseExisting,
	PickCreateOrUseExisting: WizardTask_ModeStepNamesByIdxStr_PickCreateOrUseExisting
}
//
class AddWallet_WizardController
{
	constructor(options, context)
	{
		const self = this
		{
			self.options = options
			self.context = context
		}
		self.setup()
	}
	setup()
	{
		const self = this
		{
			self.isPerformingTask = false
			self.current_wizardTaskModeName = null
		}
	}
	//
	//
	// Lifecycle - Teardown
	//
	TearDown()
	{ // this is public and must be called manually by wallet
		const self = this
	}
	//
	//
	// Runtime - Accessors - Lookups
	//
	WizardTask_Mode_CreateWallet()
	{
		return WizardTask_Modes.CreateWallet
	}
	WizardTask_Mode_UseExisting()
	{
		return WizardTask_Modes.UseExisting
	}
	WizardTask_Mode_PickCreateOrUseExisting()
	{
		return WizardTask_Modes.PickCreateOrUseExisting
	}
	//
	IsCurrentlyPerformingTask()
	{
		const self = this
		return self.current_wizardTaskMode != null
	}
	//
	_current_wizardTaskMode_stepNamesByIdxStr()
	{
		const self = this
		if (self.current_wizardTaskModeName == null || typeof self.current_wizardTaskModeName === 'undefined') {
			throw "asked for _current_wizardTaskMode_stepNamesByIdxStr while self.current_wizardTaskModeName nil"
		}
		const steps = WizardTask_ModeStepNamesByIdxStr_ByTaskModeName[self.current_wizardTaskModeName]
		//
		return steps
	}
	_current_wizardTaskMode_stepName_orNilForEnd()
	{
		const self = this
		if (self.current_wizardTaskMode_stepNamesByIdxStr == null || typeof self.current_wizardTaskMode_stepNamesByIdxStr === 'undefined') {
			throw "asked for _current_wizardTaskMode_stepName while self.current_wizardTaskMode_stepNamesByIdxStr nil"
		}
		if (self.current_wizardTaskMode_stepIdx == null || typeof self.current_wizardTaskMode_stepIdx === 'undefined') {
			throw "asked for _current_wizardTaskMode_stepName while self.current_wizardTaskMode_stepIdx nil"
		}
		const stepName = self.current_wizardTaskMode_stepNamesByIdxStr["" + self.current_wizardTaskMode_stepIdx]
		if (typeof stepName === 'undefined' || stepName == null || stepName == "") {
			return null // end
		}
		//
		return stepName
	}
	//
	//
	// Runtime - Accessors - Factories
	//
	_new_current_wizardTaskMode_stepView()
	{
		const self = this
		const viewsDirectory_absoluteFilepath = __dirname + "/../Views"
		const viewModule_absoluteFilepath = `${viewsDirectory_absoluteFilepath}/${self.current_wizardTaskModeName}_${self.current_wizardTaskMode_stepName}_View.web`
		const viewConstructor = require(viewModule_absoluteFilepath)
		if (!viewConstructor || typeof viewConstructor === 'undefined') {
			throw "Unable to find the file at " + viewModule_absoluteFilepath
			return
		}
		const initialView = new viewConstructor({
			wizardController: self
		}, self.context)
		//
		return initialView
	}
	
	//
	//
	// Runtime - Imperatives - Entrypoints
	//
	EnterWizardTaskMode_returningNavigationView(taskModeName)
	{ // -> StackAndModalNavigationView
		const self = this
		if (self.IsCurrentlyPerformingTask()) {
			console.error("❌  Asked to enter wizard with task mode", taskModeName, "but already performing a task.")
			return
		}
		{
			self.current_wizardTaskModeName = taskModeName
			self.current_wizardTaskMode_stepIdx = 0
			//
			self.current_wizardTaskMode_stepNamesByIdxStr = self._current_wizardTaskMode_stepNamesByIdxStr()
			self.current_wizardTaskMode_stepName = self._current_wizardTaskMode_stepName_orNilForEnd()
		}
		const StackAndModalNavigationView = require('../../StackNavigation/Views/StackAndModalNavigationView.web')
		const navigationView = new StackAndModalNavigationView({}, self.context)
		{
			const initialView = self._new_current_wizardTaskMode_stepView()
			navigationView.SetStackViews([ initialView ])
		}
		self.current_wizardTaskMode_navigationView = navigationView
		//
		return navigationView
	}
	//
	//
	// Runtime - Imperatives - Steps
	//
	_proceedTo_nextStep()
	{
		const self = this
		{
			self.current_wizardTaskMode_stepIdx += 1
		}
		if (self.current_wizardTaskMode_stepName === null) { // is at end
			self.__dismissWizardModal()
			return
		}
		const nextView = self._new_current_wizardTaskMode_stepView()
		self.current_wizardTaskMode_navigationView.PushView(nextView, true)		
	}
	__dismissWizardModal(opts)
	{
		const self = this
		opts = opts || {}
		const modalParentView = self.current_wizardTaskMode_navigationView.modalParentView
		modalParentView.DismissModalViewsToView(
			null, // null for top stack view
			true,
			function()
			{
				console.log("TODO: dismissed modal. call back that task done(?)")
				if (opts.userCancelled === true) {
				} else if (opts.taskFinished === true) {
					
				} else {
					throw "[" + self.constructor.name + "/__dismissWizardModal]: unrecognized opts flag configuration: " + JSON.stringify(opts)
				}
			}
		)
	}
	//
	//
	// Runtime - Imperatives - Wallet Operations - Creation
	//
	_createWalletWithNameAndSwatch(walletName, swatchColor)
	{
		const self = this
		
		// TODO:
		// const informingAndVerifyingMnemonic_cb = function(mnemonicString, confirmation_cb)
		// { // simulating user correctly entering mnemonic string they needed to have written down
		// 	confirmation_cb(mnemonicString)
		// }
		// const fn = function(err, walletInstance) {}
		//
		// self.context.walletsListController.WhenBooted_CreateAndAddNewlyGeneratedWallet(
		// 	informingAndVerifyingMnemonic_cb,
		// 	fn
		// )		
	}
	//
	//
	//
	//
	_fromScreen_userPickedCancel()
	{
		const self = this
		self.__dismissWizardModal({
			userCancelled: true
		})
	}
}
module.exports = AddWallet_WizardController