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
function StartExceptionReporting(
	exceptionReporterOptions_requiredModule, 
	appVersion, 
	exceptionReporting_processName
)
{
	// NOTE: Calls to StartExceptionReporting should also be commented (we deemed the risk of an info leak too great.)
	// const Raven = require('raven') // we're using the Node.JS raven package here for now because of https://github.com/getsentry/raven-js/issues/812 … any downsides?
	// const options = exceptionReporterOptions_requiredModule(appVersion, exceptionReporting_processName)
	// const sentry_dsn = options.sentry_dsn
	// const raven_params = 
	// {
	// 	autoBreadcrumbs: options.autoBreadcrumbs,
	// 	release: options.release,
	// 	environment: options.environment,
	// 	extra: options.extra
	// }
	// Raven.config(sentry_dsn, raven_params).install()
}
exports.StartExceptionReporting = StartExceptionReporting
//
function StartAlertingExceptions()
{
	process.on(
		'uncaughtException', 
		function(error)
		{
			var errStr = "An unexpected application error occurred.\n\nPlease let us know of ";
			if (error) {
				errStr += "the following error message as it could be a bug:\n\n"+ error.toString()
				if (error.stack) {
					errStr += "\n\n" + error.stack
				}
			} else {
				errStr += "this issue as it could be a bug."
			}
			alert(errStr)
		}
	)
}
exports.StartAlertingExceptions = StartAlertingExceptions
//
function HardenRuntime(options)
{
	options = options || {}
	const isBrowserBuild = options.isBrowserBuild == true
	//
	if (isBrowserBuild != true ) {// we used to disable eval for browser builds as well but now use it there when fallback to asmjs is needed
		window.eval = global.eval = function()
		{
			throw new Error("MyMonero does not support window.eval() for security reasons.")
		}
	}
}
exports.HardenRuntime = HardenRuntime
//
function IdentifyRuntime(runtimeNameFlag)
{
	window[runtimeNameFlag] = true // e.g. IsElectronRendererProcess
}
exports.IdentifyRuntime = IdentifyRuntime