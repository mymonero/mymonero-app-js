'use strict'

const EventEmitter = require('events')
const Currencies = require('./Currencies')

class Controller extends EventEmitter {
  //
  // Interface - Constants
  eventName_didUpdateAvailabilityOfRates () {
    return 'CcyConversionRates_Controller_EventName_didUpdateAvailabilityOfRates'
  }

  //
  // Interface - Lifecycle - Init
  constructor (options, context) {
    super()
    // must call super before accessing this
    const self = this
    //
    self.options = options
    self.context = context
    //
    self.setup()
  }

  //
  // Internal - Lifecycle - Init
  setup () {
    const self = this
    //
    self.setMaxListeners(999) // avoid error
    //
    // Internal - Properties
    self.xmrToCcyRateJSNumbersByCcySymbols = {} // [CurrencySymbol: Rate]
  }

  //
  // Interface - Accessors
  isRateReady ( // if you won't need the actual value
    ccySymbol // fromXMRToCurrencySymbol
  ) // -> Bool
  {
    const self = this
    //
    if (ccySymbol == Currencies.ccySymbolsByCcy.XMR) {
      throw Error("Invalid 'currency' argument value")
    }
    const rateValue_orNil = self.xmrToCcyRateJSNumbersByCcySymbols[ccySymbol]
    return (rateValue_orNil != null && typeof rateValue_orNil !== 'undefined')
  }

  rateFromXMR_orNullIfNotReady (
    ccySymbol // toCurrency
  ) // -> Rate?
  {
    const self = this
    //
    if (ccySymbol == Currencies.ccySymbolsByCcy.XMR) {
      throw "Invalid 'currency' argument value"
    }
    const rateValue_orNil = self.xmrToCcyRateJSNumbersByCcySymbols[ccySymbol] // which may be nil if the rate is not ready yet
    if (rateValue_orNil == null || typeof rateValue_orNil === 'undefined') {
      return null // value=null|undefined -> null
    }
    const final_rateValue = rateValue_orNil
    return final_rateValue
  }

  //
  // Interface - Imperatives
  set (
    rateAsNumber, // XMRToCurrencyRate; non-nil … ought to only need to be set to nil internally
    ccySymbol, // forCurrency
    isPartOfBatch // internally, aka doNotNotify; defaults to false; normally false … but pass true for batch calls and then call ifBatched_notifyOf_set_XMRToCurrencyRate manually (arg is called doNotNotify b/c if part of batch, you only want to do currency-non-specific notify post once instead of N times)
  ) // -> Bool // wasSetValueDifferent
  {
    const self = this
    //
    if (rateAsNumber == null || typeof rateAsNumber === 'undefined') {
      throw Error('unexpected nil rateAsNumber passed to CcyConversionRates.Controller.set()')
    }
    const doNotNotify = isPartOfBatch
    const raw_previouslyExisting_rateValue = self.xmrToCcyRateJSNumbersByCcySymbols[ccySymbol]
    const previouslyExistingRateValue_orNull = raw_previouslyExisting_rateValue != null && typeof raw_previouslyExisting_rateValue !== 'undefined' ? raw_previouslyExisting_rateValue : null
    //
    self.xmrToCcyRateJSNumbersByCcySymbols[ccySymbol] = rateAsNumber
    //
    if (doNotNotify != true) {
      self._notifyOf_updateTo_XMRToCurrencyRate() // the default
    }
    const wasSetValueDifferent = rateAsNumber != previouslyExistingRateValue_orNull // given rateAsNumber != nil
    return wasSetValueDifferent
  }

  ifBatched_notifyOf_set_XMRToCurrencyRate () {
    const self = this
    //
    // console.log(
    // 	"CcyConversionRates: Received updates:",
    // 	JSON.stringify(self.xmrToCcyRateJSNumbersByCcySymbols, null, '  ')
    // )
    self._notifyOf_updateTo_XMRToCurrencyRate()
  }

  //
  set_batchOf_ratesBySymbol (
    ratesBySymbol // : [String: Number]
  ) {
    const self = this
    //
    let mutable_didUpdateAnyValues = false
    {
      const ccySymbols = Object.keys(Currencies.ccySymbolsByCcy)
      const numberOf_ccySymbols = ccySymbols.length
      for (let i = 0; i < numberOf_ccySymbols; i++) {
        const ccySymbol = ccySymbols[i]
        if (ccySymbol == Currencies.ccySymbolsByCcy.XMR) {
          continue // do not need to mock XMR<->XMR rate
        }
        const rateAsNumber = ratesBySymbol[ccySymbol]
        if (typeof rateAsNumber !== 'undefined') { // but this WILL allow nulls! is that ok? figure being able to nil serverside might be important... and if it is null from server, invalidating/expiring the local value is probably therefore a good idea
          const _wasSetValueDifferent = self.set(
            rateAsNumber,
            ccySymbol,
            true // isPartOfBatch … defer notify
          )
          if (_wasSetValueDifferent) {
            mutable_didUpdateAnyValues = true
          }
        }
      }
    }
    const didUpdateAnyValues = mutable_didUpdateAnyValues
    if (didUpdateAnyValues) {
      // notify all of update
      self.ifBatched_notifyOf_set_XMRToCurrencyRate()
    }
  }

  //
  // Internal - Imperatives
  _notifyOf_updateTo_XMRToCurrencyRate () {
    const self = this
    //
    self.emit(
      self.eventName_didUpdateAvailabilityOfRates()
    )
  }
}
module.exports = Controller
