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
const {ipcRenderer} = require('electron')
//
class Controller
{	
	//
	// Lifecycle - Initialization
	constructor(options, context)
	{
		const self = this
		self.options = options
		self.context = context
		//
		self.appUpdatesController = self.context.appUpdatesController // on the main process -- so this will be synchronous IPC
		//
		self.setup()
	}
	setup()
	{
		const self = this
		//
		self.setupWith_settingsController()
	}
	setupWith_settingsController()
	{
		const self = this
		const controller = self.context.settingsController
		controller.executeWhenBooted(
			function()
			{
				self.call_menuController_IPCMethod_ViewOfSettingsUpdated()
			}
		)
		controller.on(
			controller.EventName_settingsChanged_autoDownloadUpdatesEnabled(),
			function()
			{
				self.call_menuController_IPCMethod_ViewOfSettingsUpdated()
			}
		)
	}
	//
	// Imperatives
	call_menuController_IPCMethod_ViewOfSettingsUpdated()
	{
		const self = this
		var isEnabled = self.context.settingsController.autoDownloadUpdatesEnabled
		if (typeof isEnabled === 'undefined' || isEnabled === null) {
			isEnabled = false
			throw "Expected isEnabled != nil" 
		}
		ipcRenderer.send(
			self.appUpdatesController.IPCMethod__ViewOfSettingsUpdated(),
			{
				autoDownloadUpdatesEnabled: isEnabled 
			}
		)
	}
}
module.exports = Controller