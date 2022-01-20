"use strict"

const BackgroundTaskExecutor_Interface = require('./BackgroundTaskExecutor_Interface')

class BackgroundTaskExecutor extends BackgroundTaskExecutor_Interface
{
	constructor(options, context)
	{
		super(options, context)
	}
	setup_worker()
	{
		const self = this
		throw `You must override and implement ${self.constructor.name}/setup_worker and set self.worker`
		// This was left to the subclasser because webpack does not play well with dynamic requires
	}
	startObserving_worker()
	{
		const self = this
		super.startObserving_worker()
		self.worker.addEventListener("message", function(event)
		{
			const event_data = event.data || {}
			const event_data_message = event_data.message || null
			if (event_data_message && event_data_message === "worker is up") {
				self._receivedBootAckFromWorker()
				return
			}
			// console.log("Main thread received", event_data)
			self._receivedPayloadFromWorker(event_data)
		})
	}
	_concrete_sendPayloadToWorker(payload)
	{
		const self = this
		self.worker.postMessage(payload)
	}
}
module.exports = BackgroundTaskExecutor