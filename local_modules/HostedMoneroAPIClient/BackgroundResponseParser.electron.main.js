'use strict'

const { ipcMain } = require('electron')
const response_parser_utils = require('./response_parser_utils')
const monero_keyImage_cache_utils = require('@mymonero/mymonero-keyimage-cache')
const coreBridgeLoading_promise = require('../MoneroUtils/MyMoneroLibAppBridge_Singleton.electron')

class BackgroundResponseParser {
  constructor (options, context) {
    const self = this
    self.options = options
    self.context = context
    //
    self.startObserving_ipc()
  }

  startObserving_ipc () {
    const self = this
    ipcMain.on(
      'Parsed_AddressInfo',
      function (event, params) {
        // console.time("Parsed_AddressInfo: " + taskUUID)
        coreBridgeLoading_promise.then(function (coreBridge_instance) {
          response_parser_utils.Parsed_AddressInfo__keyImageManaged(
            // key-image-managed - be sure to call DeleteManagedKeyImagesForWalletWith when you're done with them
            params.data,
            params.address,
            params.view_key__private,
            params.spend_key__public,
            params.spend_key__private,
            coreBridge_instance,
            function (err, returnValuesByKey) {
              // console.timeEnd("Parsed_AddressInfo: " + taskUUID)
              event.sender.send(
                'Parsed_AddressInfo-Callback',
                {
                  uuid: params.uuid,
                  err: err,
                  returnValuesByKey: returnValuesByKey
                }
              )
            }
          )
        })
      }
    )
    ipcMain.on(
      'Parsed_AddressTransactions',
      function (event, params) {
        // console.time("Parsed_AddressTransactions: " + taskUUID)
        coreBridgeLoading_promise.then(function (coreBridge_instance) {
          response_parser_utils.Parsed_AddressTransactions__keyImageManaged(
            // key-image-managed - be sure to call DeleteManagedKeyImagesForWalletWith when you're done with them
            params.data,
            params.address,
            params.view_key__private,
            params.spend_key__public,
            params.spend_key__private,
            coreBridge_instance,
            function (err, returnValuesByKey) {
              // console.timeEnd("Parsed_AddressTransactions: " + taskUUID)
              event.sender.send(
                'Parsed_AddressTransactions-Callback',
                {
                  uuid: params.uuid,
                  err: err,
                  returnValuesByKey: returnValuesByKey
                }
              )
            }
          )
        })
      }
    )
    ipcMain.on(
      'DeleteManagedKeyImagesForWalletWith',
      function (event, params) {
        // console.time("DeleteManagedKeyImagesForWalletWith: " + taskUUID)
        monero_keyImage_cache_utils.DeleteManagedKeyImagesForWalletWith(params.address)
        const err = null
        // console.timeEnd("DeleteManagedKeyImagesForWalletWith: " + taskUUID)
        event.sender.send(
          'DeleteManagedKeyImagesForWalletWith-Callback',
          {
            uuid: params.uuid,
            err: err
          }
        )
      }
    )
  }
}
module.exports = BackgroundResponseParser
