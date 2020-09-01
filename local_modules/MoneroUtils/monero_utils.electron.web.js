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
"use strict";
//
const wants_electronRemote = true // becaus we're only ever including this in the electron renderer process
//
const fn_names = require('./__bridged_fns_spec.electron').bridgedFn_names;
const moneroUtils_promise_fn = function(options)
{
	options = options || {}
	//
	return new Promise(function(resolve, reject)
	{
		function _didLoad(coreBridge_instance)
		{
			if (coreBridge_instance == null) {
				throw "Unable to make coreBridge_instance"
			}
			const local_fns = {};
			for (const i in fn_names) {
				const name = fn_names[i]
				local_fns[name] = function()
				{
					const retVals = coreBridge_instance[name].apply(coreBridge_instance, arguments); // called on the cached value
					// ^-- if not calling on the electron-remote, throws.
					if (retVals && typeof retVals === 'object') {
						if (typeof retVals.err_msg != 'undefined' && retVals.err_msg) {
							throw retVals.err_msg; // re-throw
						}
					}
					return retVals;
				}
			}
			local_fns.Module = coreBridge_instance.Module;
			//
			// if (wants_electronRemote) { // set up async bridges 
			const {ipcRenderer} = require('electron')
			self._bridge_call_cbs_by_call_id = {};
			local_fns["async__send_funds"] = function(args)
			{
				const this_bridge_call_id = __new_bridge_call_id();
				const real__authenticate_fn = args.authenticate_fn;
				const real__get_unspent_outs_fn = args.get_unspent_outs_fn;
				const real__get_random_outs_fn = args.get_random_outs_fn;
				const real__submit_raw_tx_fn = args.submit_raw_tx_fn;
				const real__status_update_fn = args.status_update_fn;
				const real__canceled_fn = args.canceled_fn;
				const real__willBeginSending_fn = args.willBeginSending_fn;
				const real__error_fn = args.error_fn;
				const real__success_fn = args.success_fn;
				//
				delete args.authenticate_fn;
				delete args.get_unspent_outs_fn;
				delete args.get_random_outs_fn;
				delete args.submit_raw_tx_fn;
				delete args.status_update_fn;
				delete args.canceled_fn;
				delete args.willBeginSending_fn;
				delete args.error_fn;
				delete args.success_fn;
				//
				self._bridge_call_cbs_by_call_id[__IPCbridge_call_cb_key__authenticate(this_bridge_call_id)] = function()
				{
					real__authenticate_fn(function(did_pass)
					{
						const ret_args =
						{
							IPCBridge_call_id: this_bridge_call_id,
							did_pass: did_pass,
						}
						ipcRenderer.send('async__send_funds--authenticate--res_cb', ret_args)
					});
				}
				self._bridge_call_cbs_by_call_id[__IPCbridge_call_cb_key__get_unspent_outs(this_bridge_call_id)] = function(cb_arg)
				{
					real__get_unspent_outs_fn(cb_arg, function(err_msg, res)
					{
						const ret_args =
						{
							IPCBridge_call_id: this_bridge_call_id
						}
						if (err_msg) {
							ret_args.err_msg = err_msg
						} else {
							ret_args.res = res
						}
						ipcRenderer.send('async__send_funds--get_unspent_outs--res_cb', ret_args)
					});
				}
				self._bridge_call_cbs_by_call_id[__IPCbridge_call_cb_key__get_random_outs(this_bridge_call_id)] = function(cb_arg)
				{
					real__get_random_outs_fn(cb_arg, function(err_msg, res)
					{
						const ret_args =
						{
							IPCBridge_call_id: this_bridge_call_id
						}
						if (err_msg) {
							ret_args.err_msg = err_msg
						} else {
							ret_args.res = res
						}
						ipcRenderer.send('async__send_funds--get_random_outs--res_cb', ret_args)
					});
				}
				self._bridge_call_cbs_by_call_id[__IPCbridge_call_cb_key__submit_raw_tx(this_bridge_call_id)] = function(cb_arg)
				{
					real__submit_raw_tx_fn(cb_arg, function(err_msg, res)
					{
						const ret_args = 
						{
							IPCBridge_call_id: this_bridge_call_id
						}	
						if (err_msg) {
							ret_args.err_msg = err_msg
						} else {
							ret_args.res = res
						}
						ipcRenderer.send('async__send_funds--submit_raw_tx--res_cb', ret_args)
					})
				}
				self._bridge_call_cbs_by_call_id[__IPCbridge_call_cb_key__status_update(this_bridge_call_id)] = function(cb_arg)
				{
					real__status_update_fn(cb_arg);
				}
				self._bridge_call_cbs_by_call_id[__IPCbridge_call_cb_key__canceled(this_bridge_call_id)] = function(cb_arg)
				{
					real__canceled_fn(cb_arg);
				}
				self._bridge_call_cbs_by_call_id[__IPCbridge_call_cb_key__willBeginSending(this_bridge_call_id)] = function(cb_arg)
				{
					real__willBeginSending_fn(cb_arg);
				}
				self._bridge_call_cbs_by_call_id[__IPCbridge_call_cb_key__error(this_bridge_call_id)] = function(cb_arg)
				{
					real__error_fn(cb_arg) // contains .err_msg
				}
				self._bridge_call_cbs_by_call_id[__IPCbridge_call_cb_key__success(this_bridge_call_id)] = function(cb_arg)
				{
					real__success_fn(cb_arg) // contains stuff like tx_hash, mixin, tx_key, final_payment_id, serialized_signed_tx, ....
				}
				//
				ipcRenderer.send('async__send_funds', {
					IPCBridge_call_id: this_bridge_call_id,
					args: args
				})
			}
			ipcRenderer.on('async__send_funds--authenticate_fn', function(event, IPC_on_arg)
			{
				const call_id = IPC_on_arg.call_id
				self._bridge_call_cbs_by_call_id[__IPCbridge_call_cb_key__authenticate(call_id)]()
			})
			ipcRenderer.on('async__send_funds--get_unspent_outs_fn', function(event, IPC_on_arg)
			{
				const call_id = IPC_on_arg.call_id
				self._bridge_call_cbs_by_call_id[__IPCbridge_call_cb_key__get_unspent_outs(call_id)](IPC_on_arg.req_params)
			})
			ipcRenderer.on('async__send_funds--get_random_outs_fn', function(event, IPC_on_arg)
			{
				const call_id = IPC_on_arg.call_id
				self._bridge_call_cbs_by_call_id[__IPCbridge_call_cb_key__get_random_outs(call_id)](IPC_on_arg.req_params)
			})
			ipcRenderer.on('async__send_funds--submit_raw_tx_fn', function(event, IPC_on_arg)
			{
				const call_id = IPC_on_arg.call_id
				self._bridge_call_cbs_by_call_id[__IPCbridge_call_cb_key__submit_raw_tx(call_id)](IPC_on_arg.req_params)
			})
			ipcRenderer.on('async__send_funds--status_update_fn', function(event, IPC_on_arg)
			{
				const call_id = IPC_on_arg.call_id
				self._bridge_call_cbs_by_call_id[__IPCbridge_call_cb_key__status_update(call_id)](IPC_on_arg.params)
			})
			ipcRenderer.on('async__send_funds--canceled_fn', function(event, IPC_on_arg)
			{
				const call_id = IPC_on_arg.call_id
				self._bridge_call_cbs_by_call_id[__IPCbridge_call_cb_key__canceled(call_id)](IPC_on_arg.params)
			})
			ipcRenderer.on('async__send_funds--willBeginSending_fn', function(event, IPC_on_arg)
			{
				const call_id = IPC_on_arg.call_id
				self._bridge_call_cbs_by_call_id[__IPCbridge_call_cb_key__willBeginSending(call_id)](IPC_on_arg.params)
			})
			ipcRenderer.on('async__send_funds--error_fn', function(event, IPC_on_arg)
			{
				const call_id = IPC_on_arg.call_id
				self._bridge_call_cbs_by_call_id[__IPCbridge_call_cb_key__error(call_id)](IPC_on_arg.params)
			})
			ipcRenderer.on('async__send_funds--success_fn', function(event, IPC_on_arg)
			{
				const call_id = IPC_on_arg.call_id
				self._bridge_call_cbs_by_call_id[__IPCbridge_call_cb_key__success(call_id)](IPC_on_arg.params)
			})
			// }
			//
			resolve(local_fns);
		}
		// Require file again except on the main process ...
		// this avoids a host of issues running wasm on the renderer side, 
		// for right now until we can load such files raw w/o unsafe-eval
		// script-src CSP. makes calls synchronous. if that is a perf problem 
		// we can make API async.
		// 
		// Resolves relative to the entrypoint of the main process.
		const remoteModule = require('electron').remote.require("../MoneroUtils/__IPCSafe_remote_monero_utils.electron");
		// Oftentimes this will be ready right away.. somehow.. but just in case.. the readiness
		// state promise behavior should be preserved by the following codepath...
		var _try;
		function __retryAfter(attemptN)
		{
			console.warn("Checking remote module readiness again after a few ms...")
			setTimeout(function()
			{
				_try(attemptN + 1)
			}, 30)
		}
		_try = function(attemptN)
		{
			if (attemptN > 10000) {
				throw "Expected remote module to be ready"
			}
			if (remoteModule.isReady) {
				_didLoad(remoteModule, true);
			} else {
				__retryAfter(attemptN)
			}
		}
		_try(0)
	});
}
function __new_bridge_call_id()
{
	return Math.random().toString(36).substr(2, 9); // doesn't have to be super random
}
function __IPCbridge_call_cb_key__authenticate(call_id)
{
	return `IPCbridge_call_cb-authenticate-${call_id}`;
}
function __IPCbridge_call_cb_key__get_unspent_outs(call_id)
{
	return `IPCbridge_call_cb-get_unspent_outs-${call_id}`;
}
function __IPCbridge_call_cb_key__get_random_outs(call_id)
{
	return `IPCbridge_call_cb-get_random_outs-${call_id}`;
}
function __IPCbridge_call_cb_key__submit_raw_tx(call_id)
{
	return `IPCbridge_call_cb-submit_raw_tx-${call_id}`;
}
function __IPCbridge_call_cb_key__canceled(call_id)
{
	return `IPCbridge_call_cb-canceled-${call_id}`;
}
function __IPCbridge_call_cb_key__willBeginSending(call_id)
{
	return `IPCbridge_call_cb-willBeginSending-${call_id}`;
}
function __IPCbridge_call_cb_key__status_update(call_id)
{
	return `IPCbridge_call_cb-status_update-${call_id}`;
}
function __IPCbridge_call_cb_key__error(call_id)
{
	return `IPCbridge_call_cb-error-${call_id}`;
}
function __IPCbridge_call_cb_key__success(call_id)
{
	return `IPCbridge_call_cb-success-${call_id}`;
}
//
//
// Since we actually are constructing bridge functions we technically have the export ready 
// synchronously but that would lose the ability to wait until the core bridge is actually ready.
//
// TODO: in future, possibly return function which takes options instead to support better env.
//
module.exports = moneroUtils_promise_fn;