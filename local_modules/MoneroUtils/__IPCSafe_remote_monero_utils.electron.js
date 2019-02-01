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
// NOTE: You will never need to require this file directly. See / use monero_utils.js.
//
const ENVIRONMENT_IS_WEB = typeof window==="object";
const ENVIRONMENT_IS_WORKER = typeof importScripts==="function";
const ENVIRONMENT_IS_NODE = typeof process==="object" && process.browser !== true && typeof require==="function" && ENVIRONMENT_IS_WORKER == false; // we want this to be true for Electron but not for a WebView
if (!ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_WEB) {
	throw "Not expecting this module to be included in this environment: non-node or web"
}
var coreBridge_instance = null;
const local_fns = {};
const fn_names = require('./__bridged_fns_spec.electron').bridgedFn_names;
for (const i in fn_names) {
	const name = fn_names[i]
	local_fns[name] = function()
	{
		if (coreBridge_instance === null) {
			throw "Expected coreBridge_instance to have been loaded by the time " + name + " was called"
		}
		var retVals;
		try {
			retVals = coreBridge_instance[name].apply(coreBridge_instance, arguments); // We are not intercepting the err_msg here -- because we will kill the remote fn call if we throw -- so we'll let the renderer-side throw
		} catch (e) {
			return { err_msg: e };
		}
		return retVals;
	}
}
{ // IPC async bridging
	const {ipcMain} = require('electron')
	const IPCBridge_cb_jump_map = {}
	ipcMain.on('async__send_funds--authenticate--res_cb', function(event, IPC_arg)
	{
		const IPCBridge_call_id = IPC_arg.IPCBridge_call_id;
		const did_pass = IPC_arg.did_pass
		IPCBridge_cb_jump_map["async__send_funds--authenticate--res_cb_jump_cb--" + IPCBridge_call_id](did_pass)
	})
	ipcMain.on('async__send_funds--get_unspent_outs--res_cb', function(event, IPC_arg)
	{
		const IPCBridge_call_id = IPC_arg.IPCBridge_call_id;
		const err_msg = IPC_arg.err_msg
		const res = IPC_arg.res
		IPCBridge_cb_jump_map["async__send_funds--get_unspent_outs--res_cb_jump_cb--" + IPCBridge_call_id](err_msg, res)
	})
	ipcMain.on('async__send_funds--get_random_outs--res_cb', function(event, IPC_arg)
	{
		const IPCBridge_call_id = IPC_arg.IPCBridge_call_id;
		const err_msg = IPC_arg.err_msg
		const res = IPC_arg.res
		IPCBridge_cb_jump_map["async__send_funds--get_random_outs--res_cb_jump_cb--" + IPCBridge_call_id](err_msg, res)
	})
	ipcMain.on('async__send_funds--submit_raw_tx--res_cb', function(event, IPC_arg)
	{
		const IPCBridge_call_id = IPC_arg.IPCBridge_call_id;
		const err_msg = IPC_arg.err_msg
		const res = IPC_arg.res
		IPCBridge_cb_jump_map["async__send_funds--submit_raw_tx--res_cb_jump_cb--" + IPCBridge_call_id](err_msg, res)
	})
	ipcMain.on('async__send_funds', function(event, IPC_arg)
	{
		if (coreBridge_instance === null) {
			throw "Expected coreBridge_instance to have been loaded by the time async__send_funds was called"
		}
		const IPCBridge_call_id = IPC_arg.IPCBridge_call_id;
		const call_args = IPC_arg.args;
		call_args.authenticate_fn = function(cb)
		{
			IPCBridge_cb_jump_map["async__send_funds--authenticate--res_cb_jump_cb--" + IPCBridge_call_id] = function(did_pass)
			{
				cb(did_pass)
			}
			event.sender.send('async__send_funds--authenticate_fn', {
				call_id: IPCBridge_call_id
			})
			// wait for return ipcMain.on with the IPCBridge_call_id
		}
		call_args.get_unspent_outs_fn = function(req_params, cb)
		{
			IPCBridge_cb_jump_map["async__send_funds--get_unspent_outs--res_cb_jump_cb--" + IPCBridge_call_id] = function(err_msg, res)
			{
				cb(err_msg, res)
			}
			event.sender.send('async__send_funds--get_unspent_outs_fn', {
				call_id: IPCBridge_call_id,
				req_params: req_params
			})
			// wait for return ipcMain.on with the IPCBridge_call_id
		}
		call_args.get_random_outs_fn = function(req_params, cb)
		{
			IPCBridge_cb_jump_map["async__send_funds--get_random_outs--res_cb_jump_cb--" + IPCBridge_call_id] = function(err_msg, res)
			{
				cb(err_msg, res)
			}
			event.sender.send('async__send_funds--get_random_outs_fn', {
				call_id: IPCBridge_call_id,
				req_params: req_params
			})
			// wait for return ipcMain.on with the IPCBridge_call_id
		}
		call_args.submit_raw_tx_fn = function(req_params, cb)
		{
			IPCBridge_cb_jump_map["async__send_funds--submit_raw_tx--res_cb_jump_cb--" + IPCBridge_call_id] = function(err_msg, res)
			{
				cb(err_msg, res)
			}
			event.sender.send('async__send_funds--submit_raw_tx_fn', {
				call_id: IPCBridge_call_id,
				req_params: req_params
			})
			// wait for return ipcMain.on with the IPCBridge_call_id
		}
		call_args.willBeginSending_fn = function()
		{
			event.sender.send('async__send_funds--willBeginSending_fn', {
				call_id: IPCBridge_call_id
			})
		}
		call_args.canceled_fn = function()
		{
			event.sender.send('async__send_funds--canceled_fn', {
				call_id: IPCBridge_call_id
			})
		}
		call_args.status_update_fn = function(params)
		{
			event.sender.send('async__send_funds--status_update_fn', {
				call_id: IPCBridge_call_id,
				params: params
			})
		}
		call_args.success_fn = function(params)
		{
			event.sender.send('async__send_funds--success_fn', {
				call_id: IPCBridge_call_id,
				params: params
			})
		}
		call_args.error_fn = function(params)
		{
			event.sender.send('async__send_funds--error_fn', {
				call_id: IPCBridge_call_id,
				params: params
			})
		}
		coreBridge_instance.async__send_funds(call_args)
	})
}
//
// Cannot export a promise, though, because this must be safe for IPC to electron 'remote'...
local_fns.isReady = false;
//
module.exports = local_fns;
//
//
const coreBridgeLoading_promise = require('./MyMoneroLibAppBridge_Singleton.electron')
coreBridgeLoading_promise.then(function(this__coreBridge_instance)
{
	coreBridge_instance = this__coreBridge_instance;
	//
	local_fns.isReady = true;
	//
});
coreBridgeLoading_promise.catch(function(e)
{
	console.log("Error: ", e);
	// this may be insufficient… being able to throw would be nice
});