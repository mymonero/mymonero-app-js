'use strict'

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
const moneroUtils_promise_fn = function (options) {
  options = options || {}
  //
  return new Promise(function (resolve, reject) {
    function _didLoad (coreBridge_instance) {
      if (coreBridge_instance == null) {
        throw Error('Unable to make coreBridge_instance')
      }
      const local_fns = {}
      for (const i in fn_names) {
        const name = fn_names[i]
        local_fns[name] = function () {
          const retVals = coreBridge_instance[name].apply(coreBridge_instance, arguments) // called on the cached value
          // ^-- if not calling on the electron-remote, throws.
          if (retVals && typeof retVals === 'object') {
            if (typeof retVals.err_msg !== 'undefined' && retVals.err_msg) {
              throw retVals.err_msg // re-throw
            }
          }
          return retVals
        }
      }
      local_fns.Module = coreBridge_instance.Module
      //
      const { ipcRenderer } = require('electron')
      self._bridge_call_cbs_by_call_id = {}
      local_fns.async__send_funds = function (args) {
        console.log("in local_fns.async__send_funds")
        const real__authenticate_fn = args.authenticate_fn
        const real__get_unspent_outs_fn = args.get_unspent_outs_fn
        const real__get_random_outs_fn = args.get_random_outs_fn
        const real__submit_raw_tx_fn = args.submit_raw_tx_fn
        const real__status_update_fn = args.status_update_fn
        const real__canceled_fn = args.canceled_fn
        const real__willBeginSending_fn = args.willBeginSending_fn
        const real__error_fn = args.error_fn
        const real__success_fn = args.success_fn
        //
        delete args.authenticate_fn
        delete args.get_unspent_outs_fn
        delete args.get_random_outs_fn
        delete args.submit_raw_tx_fn
        delete args.status_update_fn
        delete args.canceled_fn
        delete args.willBeginSending_fn
        delete args.error_fn
        delete args.success_fn
        //
        self._bridge_call_cbs_by_call_id['IPCbridge_call_cb-authenticate'] = function () {
          real__authenticate_fn(function (did_pass) {
            ipcRenderer.send('async__send_funds--authenticate--res_cb', { did_pass: did_pass })
          })
        }
        self._bridge_call_cbs_by_call_id['IPCbridge_call_cb-get_unspent_outs'] = function (cb_arg) {
          real__get_unspent_outs_fn(cb_arg, function (err_msg, res) {
            const ret_args = {}
            if (err_msg) {
              ret_args.err_msg = err_msg
            } else {
              ret_args.res = res
            }
            ipcRenderer.send('async__send_funds--get_unspent_outs--res_cb', ret_args)
          })
        }
        self._bridge_call_cbs_by_call_id['IPCbridge_call_cb-get_random_outs'] = function (cb_arg) {
          real__get_random_outs_fn(cb_arg, function (err_msg, res) {
            const ret_args = {}
            if (err_msg) {
              ret_args.err_msg = err_msg
            } else {
              ret_args.res = res
            }
            ipcRenderer.send('async__send_funds--get_random_outs--res_cb', ret_args)
          })
        }
        self._bridge_call_cbs_by_call_id['IPCbridge_call_cb-submit_raw_tx'] = function (cb_arg) {
          real__submit_raw_tx_fn(cb_arg, function (err_msg, res) {
            const ret_args = {}
            if (err_msg) {
              ret_args.err_msg = err_msg
            } else {
              ret_args.res = res
            }
            ipcRenderer.send('async__send_funds--submit_raw_tx--res_cb', ret_args)
          })
        }
        self._bridge_call_cbs_by_call_id['IPCbridge_call_cb-status_update'] = function (cb_arg) {
          real__status_update_fn(cb_arg)
        }
        self._bridge_call_cbs_by_call_id['IPCbridge_call_cb-canceled'] = function (cb_arg) {
          real__canceled_fn(cb_arg)
        }
        self._bridge_call_cbs_by_call_id['IPCbridge_call_cb-willBeginSending'] = function (cb_arg) {
          real__willBeginSending_fn(cb_arg)
        }
        self._bridge_call_cbs_by_call_id['IPCbridge_call_cb-error'] = function (cb_arg) {
          real__error_fn(cb_arg) // contains .err_msg
        }
        self._bridge_call_cbs_by_call_id['IPCbridge_call_cb-success'] = function (cb_arg) {
          real__success_fn(cb_arg) // contains stuff like tx_hash, mixin, tx_key, final_payment_id, serialized_signed_tx, ....
        }
        //

        console.log('calling ipcRenderer to send funds')
        console.log(args)
        console.log(JSON.stringify(args))

        ipcRenderer.send('async__send_funds', {
          args: JSON.stringify(args)
        })
      }
      ipcRenderer.on('async__send_funds--authenticate_fn', function (event, IPC_on_arg) {
        self._bridge_call_cbs_by_call_id['IPCbridge_call_cb-authenticate']()
      })
      ipcRenderer.on('async__send_funds--get_unspent_outs_fn', function (event, IPC_on_arg) {
        self._bridge_call_cbs_by_call_id['IPCbridge_call_cb-get_unspent_outs'](IPC_on_arg.req_params)
      })
      ipcRenderer.on('async__send_funds--get_random_outs_fn', function (event, IPC_on_arg) {
        self._bridge_call_cbs_by_call_id['IPCbridge_call_cb-get_random_outs'](IPC_on_arg.req_params)
      })
      ipcRenderer.on('async__send_funds--submit_raw_tx_fn', function (event, IPC_on_arg) {
        self._bridge_call_cbs_by_call_id['IPCbridge_call_cb-submit_raw_tx'](IPC_on_arg.req_params)
      })
      ipcRenderer.on('async__send_funds--status_update_fn', function (event, IPC_on_arg) {
        self._bridge_call_cbs_by_call_id['IPCbridge_call_cb-status_update'](IPC_on_arg.params)
      })
      ipcRenderer.on('async__send_funds--canceled_fn', function (event, IPC_on_arg) {
        self._bridge_call_cbs_by_call_id['IPCbridge_call_cb-canceled'](IPC_on_arg.params)
      })
      ipcRenderer.on('async__send_funds--willBeginSending_fn', function (event, IPC_on_arg) {
        self._bridge_call_cbs_by_call_id['IPCbridge_call_cb-willBeginSending'](IPC_on_arg.params)
      })
      ipcRenderer.on('async__send_funds--error_fn', function (event, IPC_on_arg) {
        self._bridge_call_cbs_by_call_id['IPCbridge_call_cb-error'](IPC_on_arg.params)
      })
      ipcRenderer.on('async__send_funds--success_fn', function (event, IPC_on_arg) {
        self._bridge_call_cbs_by_call_id['IPCbridge_call_cb-success'](IPC_on_arg.params)
      })
      resolve(local_fns)
    }
    // Require file again except on the main process ...
    // this avoids a host of issues running wasm on the renderer side,
    // for right now until we can load such files raw w/o unsafe-eval
    // script-src CSP. makes calls synchronous. if that is a perf problem
    // we can make API async.
    //
    // Resolves relative to the entrypoint of the main process.
    const remoteModule = require('electron').remote.require('../MoneroUtils/__IPCSafe_remote_monero_utils.electron')
    // Oftentimes this will be ready right away.. somehow.. but just in case.. the readiness
    // state promise behavior should be preserved by the following codepath...
    let _try
    function __retryAfter (attemptN) {
      console.warn('Checking remote module readiness again after a few ms...')
      setTimeout(function () {
        _try(attemptN + 1)
      }, 30)
    }
    _try = function (attemptN) {
      if (attemptN > 10000) {
        throw 'Expected remote module to be ready'
      }
      if (remoteModule.isReady) {
        _didLoad(remoteModule, true)
      } else {
        __retryAfter(attemptN)
      }
    }
    _try(0)
  })
}
//
//
// Since we actually are constructing bridge functions we technically have the export ready
// synchronously but that would lose the ability to wait until the core bridge is actually ready.
//
// TODO: in future, possibly return function which takes options instead to support better env.
//
module.exports = moneroUtils_promise_fn
