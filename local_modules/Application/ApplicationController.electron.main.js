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
const ApplicationController = require('./ApplicationController')
//
const __platform = process.platform // const as of derivation
const __platform_named_MacOS = 'darwin' // not really MacOS
const __platforms =
{
	MacOS: __platform_named_MacOS
}
//
class ApplicationController_electron extends ApplicationController
{

	setup()
	{
		const self = this
		super.setup() // call super first 
		self._setup_makeAppSingleInstance_andQuitIfNecessary()
	}
	_setup_makeAppSingleInstance_andQuitIfNecessary()
	{
		const self = this
		const app = self.context.app
		var shouldQuit = app.makeSingleInstance( // ensure only one instance of the app
		// can be run... not only for UX reasons but so we don't get any conditions
		// which might mess with db sanity
			function(argv, workingDirectory)
			{ // Single instance context being passed control when user attempted to launch duplicate instance. Emit event so that main window may be focused
				self._calledByConcreteImplementation_broadcastThat_userAttemptedToDuplicativelyLaunchApp()
			}
		)
		if (shouldQuit) { // would be true if this is a duplicative app instance
			console.log("💬  Will quit as app should be single-instance.")
			self.QuitApp() // or just call app.quit()
			return
		}
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Accessors - Concrete implementation overrides

	Platform()
	{
		return __platform
	}
	Platforms()
	{ // use this to look up possible platforms (note that __platforms is not complete)
		return __platforms
	}


	////////////////////////////////////////////////////////////////////////////////
	// Runtime - Imperatives - Concrete implementation overrides
	
	QuitApp()
	{ // we expose this instead of having people call `app.quit()` so that we can have application biz logic controllers
		// observe self instead of the platform-specific `app`
		const self = this
		const app = self.context.app
		app.quit()
	}
	

	////////////////////////////////////////////////////////////////////////////////
	// Runtime (not boot) - Imperatives - Setup - Observation
	
	_concreteImpOverride_startObserving_app()
	{
		const self = this
		const app = self.context.app
		//
		self.hasAlreadyHeardThat_willQuit = false
		app.on('will-quit', function()
		{
			if (self.hasAlreadyHeardThat_willQuit === true) {
				console.warn("⚠️  'will-quit' received redundantly")
				return
			}
			self.hasAlreadyHeardThat_willQuit = true
			self._calledByConcreteImplementation_broadcastThatAppWillQuit()
		})
	}
}
module.exports = ApplicationController_electron
