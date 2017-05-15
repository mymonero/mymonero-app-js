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
const renderer_setup_utils = require('./renderer_setup_utils')
//
module.exports = function(params)
{
	params = params || {}
	//
	if (process.env.NODE_ENV !== 'development') {
		// startCrashReporting(params.reporting_processName) // do we really need crash reporting in renderer proc? would it be for Chrome process crashes?
		// //
		// const remote__electron = require('electron').remote
		// const remote__app = remote__electron.app
		// const appVersion = remote__app.getVersion()
		// renderer_setup_utils.StartExceptionReporting(
		// 	require("../reporting/exceptionReporterOptions.electron"),
		// 	appVersion, 
		// 	params.reporting_processName
		// )
		renderer_setup_utils.StartAlertingExceptions()
	}
	renderer_setup_utils.HardenRuntime()
	renderer_setup_utils.IdentifyRuntime("IsElectronRendererProcess") // set key-value to `true` on `window`
	ensureEnv()
}
//
function startCrashReporting(reporting_processName)
{
	// NOTE: Calls to startCrashReporting should also be commented. We deemed the risk of an info leak too great.
	// const {crashReporter} = require('electron')
	// const options_template = require('../reporting/crashReporterOptions.electron')
	// const options = JSON.parse(JSON.stringify(options_template)) // quick n dirty copy
	// options.extra.process = reporting_processName
	// crashReporter.start(options)
}
function ensureEnv()
{
	if (process.platform === 'linux') {
		// Grab process.env from main process, which doesn't happen by default on Linux
		// https://github.com/atom/electron/issues/3306
		const remote__electron = require('electron').remote
		const remote__process = remote__electron.process
		const remote__env = remote__process.env
		const _ = require('underscore')
		var newEnv = _.extend({}, process.env, remote__env);
		process.env = newEnv;
	}
}