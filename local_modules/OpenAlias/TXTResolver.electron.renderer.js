'use strict'

const { ipcRenderer } = require('electron')
const uuidV1 = require('uuid/v1')

const TXTResolver_Interface = require('./TXTResolver_Interface')
const DNSResolverHandle = require('./DNSResolverHandle.node')

class TXTResolver extends TXTResolver_Interface {
  constructor (options) {
    super(options)
    const self = this
    self.callbacksByUUID = {}
    //
    self.startObserving_ipc()
  }

  startObserving_ipc () {
    const self = this
    ipcRenderer.on(
      'TXTRecords-Callback',
      function (event, arg) {
        const uuid = arg.uuid
        const callback = self.callbacksByUUID[uuid]
        delete self.callbacksByUUID[uuid]
        //
        if (arg.err && typeof arg.err !== 'undefined') {
          callback(arg.err)
          return
        }
        callback(null, arg.records, arg.dnssec_used, arg.secured, arg.dnssec_fail_reason)
      }
    )
  }

  //
  // Accessors
  TXTRecords (
    hostname,
    fn // (err, records, dnssec_used, secured, dnssec_fail_reason) -> Void
  ) /* -> DNSResolverHandle */ {
    const self = this
    const uuid = uuidV1()
    self.callbacksByUUID[uuid] = fn
    //
    const dnsResolverHandle = new DNSResolverHandle({ // implements abort()
      uuid: uuid,
      abort_called_fn: function () {
        delete self.callbacksByUUID[uuid] // must let go of this here as we don't get notified back an error
        //
        ipcRenderer.send(
          'TXTRecords-Abort',
          {
            uuid: uuid
          }
        )
      }
    })
    ipcRenderer.send(
      'TXTRecords',
      {
        hostname: hostname,
        uuid: uuid
      }
    )
    return dnsResolverHandle
  }
}
module.exports = TXTResolver
