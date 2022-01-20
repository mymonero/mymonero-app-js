"use strict"

const renderer_setup_utils = require('./renderer_setup_utils')

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
		const remote__electron = require('electron').remote;
		const remote__process = remote__electron.process;
		const remote__env = remote__process.env;
		var newEnv = {};
		{
			newEnv = Object.assign(newEnv, process.env); 
			newEnv = Object.assign(newEnv, remote__env); // remote__env overwriting process.env
		}
		process.env = newEnv;
	}
}