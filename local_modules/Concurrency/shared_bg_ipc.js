"use strict"
// Public - Imperatives - Yielding task products
function CallBack(
	taskUUID, 
	err, 
	returnValue, 
	backgroundToFore_postingImplFn // (payload) -> Void
)
{
	const payload =
	{
		eventName: 'FinishedTask', 
		taskUUID: taskUUID, 
		err_str: err && typeof err !== 'string' ? ""+err : err, 
		returnValue: returnValue
	}
	backgroundToFore_postingImplFn(payload)
}	
exports.CallBack = CallBack
//
// Internal - Delegation
function _didReceiveIPCPayload(tasksByName, payload)
{
	const taskName = payload.taskName
	const taskUUID = payload.taskUUID
	const payload_args = payload.args
	const argsToCallWith = payload_args.slice() // copy
	{ // finalize:
		argsToCallWith.unshift(taskUUID) // prepend with taskUUID
	}
	const taskFn = tasksByName[taskName]
	taskFn.apply(
		this, // this might need to be exposed as an arg later
		argsToCallWith
	)
}
exports._didReceiveIPCPayload = _didReceiveIPCPayload