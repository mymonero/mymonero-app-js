'use strict'

const JSBigInt = require('@mymonero/mymonero-bigint').BigInteger // important: grab defined export
const net_service_utils = require('@mymonero/mymonero-net-service-utils')

class HostedMoneroAPIClient {
  constructor (options, context) {
    const self = this
    self.options = options
    self.context = context

    self.request = options.request_conformant_module
    if (!self.request) {
      throw Error(`${self.constructor.name} requires an options.request_conformant_module such as require('request' / 'xhr')`)
    }

    self.setup()
  }

  setup () {
    const self = this
    self.appUserAgent_product = self.options.appUserAgent_product
    if (!self.appUserAgent_product) {
      throw Error(`${self.constructor.name} requires options.appUserAgent_product`)
    }
    self.appUserAgent_version = self.options.appUserAgent_version
    if (!self.appUserAgent_version) {
      throw Error(`${self.constructor.name} requires options.appUserAgent_version`)
    }
  }

  _new_apiAddress_authority () { // overridable
    const self = this
    return self.context.settingsController.specificAPIAddressURLAuthority
  }

  check (url, fn) {
    const self = this

    const parameters = {
      address: '',
      view_key: '',
      create_account: false,
      generated_locally: ''
    }

    const requestHandle = net_service_utils.HTTPRequest(
      self.request,
      url,
      '/login',
      parameters,
      function (err, data) {
        if (err) {
          fn(err)
        }
      }
    )

    return requestHandle
  }

  LogIn (address, privateViewKey, generatedLocally, fn) {
    const self = this

    const parameters = {
      address: address,
      view_key: privateViewKey,
      create_account: true,
      generated_locally: generatedLocally
    }

    const requestHandle = net_service_utils.HTTPRequest(
      self.request,
      self._new_apiAddress_authority(),
      '/login',
      parameters,
      function (err, data) {
        if (err) {
          fn(err)
          return
        }
        __proceedTo_parseAndCallBack(data)
      }
    )
    function __proceedTo_parseAndCallBack (data) {
      const new_address = data.new_address
      const received__generated_locally = data.generated_locally
      const start_height = data.start_height
      fn(null, new_address, received__generated_locally, start_height)
    }
    return requestHandle
  }

  AddressInfo_returningRequestHandle (address, privateViewKey, publicSpendKey, privateSpendKey, fn) {
    const self = this
    const parameters = {
      address: address,
      view_key: privateViewKey
    }
    const requestHandle = net_service_utils.HTTPRequest(
      self.request,
      self._new_apiAddress_authority(),
      '/get_address_info',
      parameters,
      function (err, data) {
        if (err) {
          fn(err)
          return
        }
        __proceedTo_parseAndCallBack(data)
      }
    )
    function __proceedTo_parseAndCallBack (data) {
      self.context.backgroundAPIResponseParser.Parsed_AddressInfo(
        data,
        address,
        privateViewKey,
        publicSpendKey,
        privateSpendKey,
        function (err, returnValuesByKey) {
          if (err) {
            fn(err)
            return
          }
          let total_received_JSBigInt
          const total_received_String = returnValuesByKey.total_received_String
          if (total_received_String) {
            total_received_JSBigInt = new JSBigInt(total_received_String)
          } else {
            total_received_JSBigInt = new JSBigInt(0)
          }
          //
          let locked_balance_JSBigInt
          const locked_balance_String = returnValuesByKey.locked_balance_String
          if (locked_balance_String) {
            locked_balance_JSBigInt = new JSBigInt(locked_balance_String)
          } else {
            locked_balance_JSBigInt = new JSBigInt(0)
          }
          //
          let total_sent_JSBigInt
          const total_sent_String = returnValuesByKey.total_sent_String
          if (total_sent_String) {
            total_sent_JSBigInt = new JSBigInt(total_sent_String)
          } else {
            total_sent_JSBigInt = new JSBigInt(0)
          }
          fn(
            err,
            //
            total_received_JSBigInt,
            locked_balance_JSBigInt,
            total_sent_JSBigInt,
            //
            returnValuesByKey.spent_outputs,
            returnValuesByKey.account_scanned_tx_height,
            returnValuesByKey.account_scanned_block_height,
            returnValuesByKey.account_scan_start_height,
            returnValuesByKey.transaction_height,
            returnValuesByKey.blockchain_height,
            //
            returnValuesByKey.ratesBySymbol
          )
        }
      )
    }
    return requestHandle
  }

  AddressTransactions_returningRequestHandle (address, privateViewKey, publicSpendKey, privateSpendKey, fn) {
    const self = this
    const parameters = {
      address: address,
      view_key: privateViewKey
    }
    const requestHandle = net_service_utils.HTTPRequest(
      self.request,
      self._new_apiAddress_authority(),
      '/get_address_txs',
      parameters,
      function (err, data) {
        if (err) {
          fn(err)
          return
        }
        __parseAndCallBack(data)
      }
    )
    function __parseAndCallBack (data) {
      self.context.backgroundAPIResponseParser.Parsed_AddressTransactions(
        data,
        address,
        privateViewKey,
        publicSpendKey,
        privateSpendKey,
        function (err, returnValuesByKey) {
          if (err) {
            fn(err)
            return
          }
          //
          const transactions = returnValuesByKey.serialized_transactions
          for (const transaction of transactions) {
            transaction.amount = new JSBigInt(transaction.amount)
            if (typeof transaction.total_sent !== 'undefined' && transaction.total_sent !== null) {
              transaction.total_sent = new JSBigInt(transaction.total_sent)
            }
            transaction.timestamp = new Date(transaction.timestamp)
          }
          //
          fn(
            err,
            //
            returnValuesByKey.account_scanned_height,
            returnValuesByKey.account_scanned_block_height,
            returnValuesByKey.account_scan_start_height,
            returnValuesByKey.transaction_height,
            returnValuesByKey.blockchain_height,
            //
            transactions
          )
        }
      )
    }
    return requestHandle
  }

  ImportRequestInfoAndStatus (address, privateViewKey, fn) {
    const self = this
    const parameters = {
      address: address,
      view_key: privateViewKey,
      app_name: self.appUserAgent_product,
      app_version: self.appUserAgent_version
    }
    const requestHandle = net_service_utils.HTTPRequest(
      self.request,
      self._new_apiAddress_authority(),
      '/import_wallet_request',
      parameters,
      function (err, data) {
        if (err) {
          fn(err)
          return
        }
        __proceedTo_parseAndCallBack(data)
      }
    )
    function __proceedTo_parseAndCallBack (data) {
      const payment_id = data.payment_id
      const payment_address = data.payment_address
      const import_fee__JSBigInt = new JSBigInt(data.import_fee)
      const feeReceiptStatus = data.status
      fn(
        null,
        payment_id,
        payment_address,
        import_fee__JSBigInt,
        feeReceiptStatus
      )
    }
    return requestHandle
  }

  UnspentOuts (reqParams, fn) {
    const self = this
    reqParams.app_name = self.appUserAgent_product
    reqParams.app_version = self.appUserAgent_version
    const requestHandle = net_service_utils.HTTPRequest(
      self.request,
      self._new_apiAddress_authority(),
      '/get_unspent_outs',
      reqParams,
      function (err, data) {
        fn(err ? err.toString() : null, data)
      }
    )
    return requestHandle
  }

  RandomOuts (reqParams, fn) {
    const self = this
    reqParams.app_name = self.appUserAgent_product
    reqParams.app_version = self.appUserAgent_version
    const requestHandle = net_service_utils.HTTPRequest(
      self.request,
      self._new_apiAddress_authority(),
      '/get_random_outs',
      reqParams,
      function (err, data) {
        fn(err ? err.toString() : null, data)
      }
    )
    return requestHandle
  }

  SubmitRawTx (reqParams, fn) {
    const self = this
    reqParams.app_name = self.appUserAgent_product
    reqParams.app_version = self.appUserAgent_version

    const requestHandle = net_service_utils.HTTPRequest(
      self.request,
      self._new_apiAddress_authority(),
      '/submit_raw_tx',
      reqParams,
      function (err, data) {
        fn(err ? err.toString() : null, data)
      }
    )
    return requestHandle
  }
}
module.exports = HostedMoneroAPIClient
