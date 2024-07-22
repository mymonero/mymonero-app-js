'use strict'
//
// NOTE: You will never need to require this file directly. See / use monero_utils.js.
//
const ENVIRONMENT_IS_WEB = typeof window === 'object'
const ENVIRONMENT_IS_WORKER = typeof importScripts === 'function'
const ENVIRONMENT_IS_NODE = typeof process === 'object' && process.browser !== true && typeof require === 'function' && ENVIRONMENT_IS_WORKER == false // we want this to be true for Electron but not for a WebView
if (!ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_WEB) {
  throw Error('Not expecting this module to be included in this environment: non-node or web')
}
let coreBridge_instance = null
const local_fns = {}
const fn_names = [
  'is_subaddress',
  'is_integrated_address',
  'new_payment_id',
  'new__int_addr_from_addr_and_short_pid',
  'decode_address',
  'newly_created_wallet',
  'are_equal_mnemonics',
  'mnemonic_from_seed',
  'seed_and_keys_from_mnemonic',
  'validate_components_for_login',
  'address_and_keys_from_seed',
  'generate_key_image',
  'estimated_tx_network_fee'
  // "async__send_funds", // this is not to be bridged via synch IPC since it requires async bridging
]
for (const i in fn_names) {
  const name = fn_names[i]
  local_fns[name] = function () {
    if (coreBridge_instance === null) {
      throw Error('Expected coreBridge_instance to have been loaded by the time ' + name + ' was called')
    }
    let retVals
    try {
      retVals = coreBridge_instance[name].apply(coreBridge_instance, arguments) // We are not intercepting the err_msg here -- because we will kill the remote fn call if we throw -- so we'll let the renderer-side throw
    } catch (e) {
      return { err_msg: e }
    }
    return retVals
  }
}
{ // IPC async bridging
  const { ipcMain } = require('electron')
  const IPCBridge_cb_jump_map = {}
  ipcMain.on('async__send_funds--authenticate--res_cb', function (event, IPC_arg) {
    IPCBridge_cb_jump_map['async__send_funds--authenticate--res_cb_jump_cb--'](IPC_arg.did_pass)
  })
  ipcMain.on('async__send_funds--get_unspent_outs--res_cb', function (event, IPC_arg) {
    IPCBridge_cb_jump_map['async__send_funds--get_unspent_outs--res_cb_jump_cb--'](IPC_arg.err_msg, IPC_arg.res)
  })
  ipcMain.on('async__send_funds--get_random_outs--res_cb', function (event, IPC_arg) {
    IPCBridge_cb_jump_map['async__send_funds--get_random_outs--res_cb_jump_cb--'](IPC_arg.err_msg, IPC_arg.res)
  })
  ipcMain.on('async__send_funds--submit_raw_tx--res_cb', function (event, IPC_arg) {
    IPCBridge_cb_jump_map['async__send_funds--submit_raw_tx--res_cb_jump_cb--'](IPC_arg.err_msg, IPC_arg.res)
  })
  ipcMain.on('async__send_funds', function (event, IPC_arg) {
    console.log("ipcMain.on 'async__send_funds'")
    if (coreBridge_instance === null) {
      console.log("coreBridge_instance == null")
      throw Error('Expected coreBridge_instance to have been loaded by the time async__send_funds was called')
    }
    console.log("IPC_arg.args");
    console.log(IPC_arg.args);
    const call_args = JSON.parse(IPC_arg.args);
    console.log("call_args");
    console.log(call_args);

    call_args.authenticate_fn = function (cb) {
      IPCBridge_cb_jump_map['async__send_funds--authenticate--res_cb_jump_cb--'] = function (did_pass) {
        cb(did_pass)
      }
      event.sender.send('async__send_funds--authenticate_fn', {})
      // wait for return ipcMain.on with the IPCBridge_call_id
    }
    call_args.get_unspent_outs_fn = function (req_params, cb) {
      IPCBridge_cb_jump_map['async__send_funds--get_unspent_outs--res_cb_jump_cb--'] = function (err_msg, res) {
        cb(err_msg, res)
      }
      event.sender.send('async__send_funds--get_unspent_outs_fn', { req_params: req_params })
      // wait for return ipcMain.on with the IPCBridge_call_id
    }
    call_args.get_random_outs_fn = function (req_params, cb) {
      IPCBridge_cb_jump_map['async__send_funds--get_random_outs--res_cb_jump_cb--'] = function (err_msg, res) {
        cb(err_msg, res)
      }
      event.sender.send('async__send_funds--get_random_outs_fn', { req_params: req_params })
      // wait for return ipcMain.on with the IPCBridge_call_id
    }
    call_args.submit_raw_tx_fn = function (req_params, cb) {
      IPCBridge_cb_jump_map['async__send_funds--submit_raw_tx--res_cb_jump_cb--'] = function (err_msg, res) {
        cb(err_msg, res)
      }
      event.sender.send('async__send_funds--submit_raw_tx_fn', { req_params: req_params })
      // wait for return ipcMain.on with the IPCBridge_call_id
    }
    call_args.willBeginSending_fn = function () {
      event.sender.send('async__send_funds--willBeginSending_fn', {})
    }
    call_args.canceled_fn = function () {
      event.sender.send('async__send_funds--canceled_fn', {})
    }
    call_args.status_update_fn = function (params) {
      event.sender.send('async__send_funds--status_update_fn', { params: params })
    }
    call_args.success_fn = function (params) {
      event.sender.send('async__send_funds--success_fn', { params: params })
    }
    call_args.error_fn = function (params) {
      event.sender.send('async__send_funds--error_fn', { params: params })
    }
    coreBridge_instance.async__send_funds(call_args)
  })
}
//
// Cannot export a promise, though, because this must be safe for IPC to electron 'remote'...
local_fns.isReady = false
//
module.exports = local_fns
//
//
const coreBridgeLoading_promise = require('./MyMoneroLibAppBridge_Singleton.electron')
coreBridgeLoading_promise.then(function (this__coreBridge_instance) {
  coreBridge_instance = this__coreBridge_instance
  //
  local_fns.isReady = true
  //
})
coreBridgeLoading_promise.catch(function (e) {
  console.log('Error: ', e)
  // this may be insufficient… being able to throw would be nice
})
