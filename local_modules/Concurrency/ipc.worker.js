"use strict"

const shared_bg_ipc = require('./shared_bg_ipc')
//	
// Public - Setup - Entrypoints:
function InitWithTasks_AndStartListening(tasksByName)
{ // Call this to set up the worker
	{ // start observing incoming messages
		self.addEventListener('message', function(event)
		{
			if (typeof event === 'undefined' || !event || !(typeof event)) {
				console.warn("Received 'message' with nil event")
				return
			}
			const data = event.data
			if (!data || typeof data === 'undefined') {
				throw "Received nil event.data"
			}
			shared_bg_ipc._didReceiveIPCPayload(
				tasksByName, // exposed dependency to avoid having to nest fns
				data
			)
		})
	}
	{ // ack boot
		self.postMessage({ message: "worker is up" })
	}
}
exports.InitWithTasks_AndStartListening = InitWithTasks_AndStartListening
//
// Public - Imperatives - Yielding task products
function CallBack(taskUUID, err, returnValue)
{
	shared_bg_ipc.CallBack(
		taskUUID,
		err,
		returnValue,
		function(payload)
		{
			self.postMessage(payload)
		}
	)
}	
exports.CallBack = CallBack