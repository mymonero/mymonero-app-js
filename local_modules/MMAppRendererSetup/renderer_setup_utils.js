const Swal = require('sweetalert2')
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
				errStr += `the following error message as it could be a bug:\n\n <p><span style='font-size: 11px;'>${error.toString()}`
			} else {
				errStr += "this issue as it could be a bug."
			}
			
			errStr += "</span></p>";

			let errorHtml = errStr;
			// append stack trace to error we copy to clipboard
			if (error && error.stack !== 'undefined') {
				errStr += error.stack;
			}

			errStr += navigator.userAgent;

			Swal.fire({
				title: 'MyMonero has encountered an error',
				html: errorHtml,
				background: "#272527",
				titleColor: "#FFFFFF",
				color: "#FFFFFF",
				text: 'Do you want to continue',
				confirmButtonColor: "#11bbec",
				confirmButtonText: 'Copy Error To Clipboard',
				cancelButtonText: 'Close',
				showCloseButton: true,
				showCancelButton: true,
				preConfirm: () => {	
					navigator.clipboard.writeText(errStr)
				},
				customClass: {
					confirmButton: 'base-button hoverable-cell navigation-blue-button-enabled action right-save-button',
					cancelButton: 'base-button hoverable-cell navigation-blue-button-enabled action right-save-button disabled navigation-blue-button-disabled'
				},
			})
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