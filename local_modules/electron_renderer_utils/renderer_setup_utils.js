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
const _ = require('underscore') // minor optimization for other platforms 
// would be to embed this require only where it's used below but here for clarity
//
module.exports = function(params)
{
	params = params || {}
	//
	if (process.env.NODE_ENV !== 'development') {
		startCrashReporting(params.reporting_processName) // do we really need crash reporting in renderer proc? is that for Chrome crashes?
		startExceptionReporting(params.exceptionReporting_processName)
	}
	startAlertingExceptions()
	//
	hardenRuntime()
	identifyRuntime()
	ensureEnv()
}
//
//
function startCrashReporting(reporting_processName)
{
	const {crashReporter} = require('electron')
	const options_template = require('../electron_main/crashReporterOptions')
	const options = JSON.parse(JSON.stringify(options_template)) // quick n dirty copy
	options.extra.process = reporting_processName
	crashReporter.start(options)
}
function startExceptionReporting(exceptionReporting_processName)
{
	const Raven = require('raven') // we're using the Node.JS raven package here for now because of https://github.com/getsentry/raven-js/issues/812 … any downsides?
	const remote__electron = require('electron').remote
	const remote__app = remote__electron.app
	const appVersion = remote__app.getVersion()
	const options = require('../electron_main/exceptionReporterOptions')(appVersion, exceptionReporting_processName)
	const sentry_dsn = options.sentry_dsn
	const raven_params = 
	{
		autoBreadcrumbs: options.autoBreadcrumbs,
		release: options.release,
		environment: options.environment,
		extra: options.extra
	}
	Raven.config(sentry_dsn, raven_params).install()
}
function startAlertingExceptions()
{
	if (process.env.NODE_ENV !== 'development') { // cause it's slightly intrusive to the dev process and obscures stack trace - and though we're catching these here, Raven still appears to pick them up
		process.on(
			'uncaughtException', 
			function(error)
			{
				var errStr = "An unexpected application error occurred.\n\nPlease let us know of ";
				if (error) {
					errStr += "the following error message as it could be a bug:\n\n"+ error.toString()
				} else {
					errStr += "this issue as it could be a bug."
				}
				alert(errStr)
			}
		)
	}
}
//
function hardenRuntime()
{
	// disable eval
	window.eval = global.eval = function()
	{
		throw new Error("MyMonero does not support window.eval() for security reasons.")
	}
}
function identifyRuntime()
{
	window.IsElectronRendererProcess = true
}
//
function ensureEnv()
{
	if (process.platform === 'linux') {
		// Grab process.env from main process, which doesn't happen by default on Linux
		// https://github.com/atom/electron/issues/3306
		const remote__electron = require('electron').remote
		const remote__process = remote__electron.process
		const remote__env = remote__process.env
	    var newEnv = _.extend({}, process.env, remote__env);
	    process.env = newEnv;
	}
}