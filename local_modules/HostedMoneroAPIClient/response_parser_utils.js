'use strict'

const JSBigInt = require('@mymonero/mymonero-bigint').BigInteger
const monero_amount_format_utils = require('@mymonero/mymonero-money-format')
const monero_keyImage_cache_utils = require('@mymonero/mymonero-keyimage-cache')

function Parsed_AddressInfo__sync (
  keyImage_cache,
  data,
  address,
  view_key__private,
  spend_key__public,
  spend_key__private,
  coreBridge_instance
) {
  // -> returnValuesByKey
  const total_received = new JSBigInt(data.total_received || 0)
  const locked_balance = new JSBigInt(data.locked_funds || 0)
  let total_sent = new JSBigInt(data.total_sent || 0) // will be modified in place
  //
  const account_scanned_tx_height = data.scanned_height || 0
  const account_scanned_block_height = data.scanned_block_height || 0
  const account_scan_start_height = data.start_height || 0
  const transaction_height = data.transaction_height || 0
  const blockchain_height = data.blockchain_height || 0
  const spent_outputs = data.spent_outputs || []
  //
  for (const spent_output of spent_outputs) {
    const key_image = monero_keyImage_cache_utils.Lazy_KeyImage(
      keyImage_cache,
      spent_output.tx_pub_key,
      spent_output.out_index,
      address,
      view_key__private,
      spend_key__public,
      spend_key__private,
      coreBridge_instance
    )
    if (spent_output.key_image !== key_image) {
      // console.log('💬  Output used as mixin (' + spent_output.key_image + '/' + key_image + ')')
      total_sent = new JSBigInt(total_sent).subtract(spent_output.amount)
    }
  }
  //
  const ratesBySymbol = data.rates || {} // jic it's not there
  //
  const returnValuesByKey = {
    total_received_String: total_received
      ? total_received.toString()
      : null,
    locked_balance_String: locked_balance
      ? locked_balance.toString()
      : null,
    total_sent_String: total_sent ? total_sent.toString() : null,
    // ^serialized JSBigInt
    spent_outputs: spent_outputs,
    account_scanned_tx_height: account_scanned_tx_height,
    account_scanned_block_height: account_scanned_block_height,
    account_scan_start_height: account_scan_start_height,
    transaction_height: transaction_height,
    blockchain_height: blockchain_height,
    //
    ratesBySymbol: ratesBySymbol
  }
  return returnValuesByKey
}
function Parsed_AddressInfo__sync__keyImageManaged (
  data,
  address,
  view_key__private,
  spend_key__public,
  spend_key__private,
  coreBridge_instance
) {
  // -> returnValuesByKey
  const keyImageCache = monero_keyImage_cache_utils.Lazy_KeyImageCacheForWalletWith(
    address
  )
  return Parsed_AddressInfo__sync(
    keyImageCache,
    data,
    address,
    view_key__private,
    spend_key__public,
    spend_key__private,
    coreBridge_instance
  )
}
function Parsed_AddressInfo (
  keyImage_cache,
  data,
  address,
  view_key__private,
  spend_key__public,
  spend_key__private,
  coreBridge_instance,
  fn // (err?, returnValuesByKey) -> Void
) {
  const returnValuesByKey = Parsed_AddressInfo__sync(
    keyImage_cache,
    data,
    address,
    view_key__private,
    spend_key__public,
    spend_key__private,
    coreBridge_instance
  )
  fn(null, returnValuesByKey)
}
function Parsed_AddressInfo__keyImageManaged (
  data,
  address,
  view_key__private,
  spend_key__public,
  spend_key__private,
  coreBridge_instance,
  fn
) {
  // -> returnValuesByKey
  Parsed_AddressInfo(
    monero_keyImage_cache_utils.Lazy_KeyImageCacheForWalletWith(address),
    data,
    address,
    view_key__private,
    spend_key__public,
    spend_key__private,
    coreBridge_instance,
    fn
  )
}
exports.Parsed_AddressInfo = Parsed_AddressInfo
exports.Parsed_AddressInfo__keyImageManaged = Parsed_AddressInfo__keyImageManaged // in case you can't send a mutable key image cache dictionary
exports.Parsed_AddressInfo__sync__keyImageManaged = Parsed_AddressInfo__sync__keyImageManaged // in case you can't send a mutable key image cache dictionary
exports.Parsed_AddressInfo__sync = Parsed_AddressInfo__sync
//
function Parsed_AddressTransactions (
  keyImage_cache,
  data,
  address,
  view_key__private,
  spend_key__public,
  spend_key__private,
  coreBridge_instance,
  fn // (err?, returnValuesByKey) -> Void
) {
  const returnValuesByKey = Parsed_AddressTransactions__sync(
    keyImage_cache,
    data,
    address,
    view_key__private,
    spend_key__public,
    spend_key__private,
    coreBridge_instance
  )
  fn(null, returnValuesByKey)
}
function Parsed_AddressTransactions__sync (
  keyImage_cache,
  data,
  address,
  view_key__private,
  spend_key__public,
  spend_key__private,
  coreBridge_instance
) {
  const account_scanned_height = data.scanned_height || 0
  const account_scanned_block_height = data.scanned_block_height || 0
  const account_scan_start_height = data.start_height || 0
  const transaction_height = data.transaction_height || 0
  const blockchain_height = data.blockchain_height || 0
  //
  const transactions = data.transactions || []
  //
  // TODO: rewrite this with more clarity if possible
  for (let i = 0; i < transactions.length; ++i) {
    if ((transactions[i].spent_outputs || []).length > 0) {
      for (let j = 0; j < transactions[i].spent_outputs.length; ++j) {
        const key_image = monero_keyImage_cache_utils.Lazy_KeyImage(
          keyImage_cache,
          transactions[i].spent_outputs[j].tx_pub_key,
          transactions[i].spent_outputs[j].out_index,
          address,
          view_key__private,
          spend_key__public,
          spend_key__private,
          coreBridge_instance
        )
        if (transactions[i].spent_outputs[j].key_image !== key_image) {
          // console.log('Output used as mixin, ignoring (' + transactions[i].spent_outputs[j].key_image + '/' + key_image + ')')
          transactions[i].total_sent = new JSBigInt(
            transactions[i].total_sent
          )
            .subtract(transactions[i].spent_outputs[j].amount)
            .toString()
          transactions[i].spent_outputs.splice(j, 1)
          j--
        }
      }
    }
    if (
      new JSBigInt(transactions[i].total_received || 0)
        .add(transactions[i].total_sent || 0)
        .compare(0) <= 0
    ) {
      transactions.splice(i, 1)
      i--
      continue
    }
    transactions[i].amount = new JSBigInt(
      transactions[i].total_received || 0
    )
      .subtract(transactions[i].total_sent || 0)
      .toString()
    transactions[i].approx_float_amount = parseFloat(
      monero_amount_format_utils.formatMoney(transactions[i].amount)
    )
    transactions[i].timestamp = transactions[i].timestamp
    const record__payment_id = transactions[i].payment_id
    if (typeof record__payment_id !== 'undefined' && record__payment_id) {
      if (record__payment_id.length == 16) {
        // short (encrypted) pid
        if (transactions[i].approx_float_amount < 0) {
          // outgoing
          delete transactions[i].payment_id // need to filter these out .. because the server can't filter out short (encrypted) pids on outgoing txs
        }
      }
    }
  }
  transactions.sort(function (a, b) {
    if (a.mempool == true) {
      if (b.mempool != true) {
        return -1 // a first
      }
      // both mempool - fall back to .id compare
    } else if (b.mempool == true) {
      return 1 // b first
    }
    return b.id - a.id
  })
  // prepare transactions to be serialized
  for (const transaction of transactions) {
    transaction.amount = transaction.amount.toString() // JSBigInt -> String
    if (
      typeof transaction.total_sent !== 'undefined' &&
			transaction.total_sent !== null
    ) {
      transaction.total_sent = transaction.total_sent.toString()
    }
  }
  // on the other side, we convert transactions timestamp to Date obj
  const returnValuesByKey = {
    account_scanned_height: account_scanned_height,
    account_scanned_block_height: account_scanned_block_height,
    account_scan_start_height: account_scan_start_height,
    transaction_height: transaction_height,
    blockchain_height: blockchain_height,
    serialized_transactions: transactions
  }
  return returnValuesByKey
}
function Parsed_AddressTransactions__sync__keyImageManaged (
  data,
  address,
  view_key__private,
  spend_key__public,
  spend_key__private,
  coreBridge_instance
) {
  const keyImageCache = monero_keyImage_cache_utils.Lazy_KeyImageCacheForWalletWith(
    address
  )
  return Parsed_AddressTransactions__sync(
    keyImageCache,
    data,
    address,
    view_key__private,
    spend_key__public,
    spend_key__private,
    coreBridge_instance
  )
}
function Parsed_AddressTransactions__keyImageManaged (
  data,
  address,
  view_key__private,
  spend_key__public,
  spend_key__private,
  coreBridge_instance,
  fn
) {
  Parsed_AddressTransactions(
    monero_keyImage_cache_utils.Lazy_KeyImageCacheForWalletWith(address),
    data,
    address,
    view_key__private,
    spend_key__public,
    spend_key__private,
    coreBridge_instance,
    fn
  )
}
exports.Parsed_AddressTransactions = Parsed_AddressTransactions
exports.Parsed_AddressTransactions__keyImageManaged = Parsed_AddressTransactions__keyImageManaged
exports.Parsed_AddressTransactions__sync = Parsed_AddressTransactions__sync
exports.Parsed_AddressTransactions__sync__keyImageManaged = Parsed_AddressTransactions__sync__keyImageManaged
