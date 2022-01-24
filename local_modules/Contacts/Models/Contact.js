'use strict'

const EventEmitter = require('events')
const Emojis = require('../../Emoji/emoji_set').Emojis
const persistable_object_utils = require('../../DocumentPersister/persistable_object_utils')
const contact_persistence_utils = require('./contact_persistence_utils')
const monero_paymentID_utils = require('@mymonero/mymonero-paymentid-utils')
const monero_requestURI_utils = require('../../MoneroUtils/monero_requestURI_utils')
const QRCode = require('qrcode')

class Contact extends EventEmitter {
  //
  // Setup
  constructor (options, context) {
    super() // must call super before we can access `this`
    //
    const self = this
    self.options = options
    self.context = context
    //
    self.failedToInitialize_cb = self.options.failedToInitialize_cb || function (err, instance) {}
    self.successfullyInitialized_cb = self.options.successfullyInitialized_cb || function (instance) {}
    //
    self.hasBooted = false
    //
    self.setup()
  }

  setup () {
    const self = this
    //
    self._id = self.options._id || null // initialize to null if creating new document
    self.persistencePassword = self.options.persistencePassword
    if (typeof self.persistencePassword === 'undefined' || self.persistencePassword === null) {
      setTimeout(function () { // wait til next tick so that instantiator cannot have missed this
        self.emit(
          self.EventName_errorWhileBooting(),
          new Error('You must supply an options.persistencePassword to your Contact instance'),
          self
        )
      })
      return
    }
    if (self._id === null || typeof self._id === 'undefined') { // must create new
      self._setup_newDocument()
    } else { // document supposedly already exists. Let's look it up…
      self._setup_fetchExistingDocumentWithId()
    }
  }

  __setup_didBoot () {
    const self = this
    self._startObserving_openAliasResolver()
    self.regenerateQRCode()
      .then(() => {
        self.hasBooted = true
        setTimeout(function () { // wait til next tick so that instantiator cannot have missed this
          self.successfullyInitialized_cb(self)
          self.emit(self.EventName_booted(), self)
        })
      })
  }

  __setup_didFailToBoot (err) {
    const self = this
    self.didFailToInitialize_flag = true
    self.didFailToInitialize_errOrNil = err

    self.didFailToBoot_flag = true
    self.didFailToBoot_errOrNil = err
    setTimeout(function () { // wait til next tick so that instantiator cannot have missed this
      self.failedToInitialize_cb(err, self)
      self.emit(self.EventName_errorWhileBooting(), err)
    })
  }

  _setup_newDocument () {
    const self = this
    self.fullname = self.options.fullname
    self.address = self.options.address
    self.payment_id = self.options.payment_id
    self.emoji = self.options.emoji
    self.cached_OAResolved_XMR_address = self.options.cached_OAResolved_XMR_address

    self.saveToDisk()
      .then(() => {
        console.log('📝  Successfully saved new contact.')
        self.__setup_didBoot()
      })
      .catch((err) => {
        console.error('Failed to save new contact', err)
        self.__setup_didFailToBoot(err)
      })
  }

  _setup_fetchExistingDocumentWithId () {
    const self = this
    persistable_object_utils.read(self.context.persister, contact_persistence_utils.CollectionName, self)
      .then((plaintextDocument) => {
        __proceedTo_hydrateByParsingPlaintextDocument(plaintextDocument)
      })
      .catch((err) => {
        self.__setup_didFailToBoot(err)
      })

    function __proceedTo_hydrateByParsingPlaintextDocument (plaintextDocument) { // reconstituting state…
      contact_persistence_utils.HydrateInstance(self, plaintextDocument)
      __proceedTo_validateHydration()
    }

    function __proceedTo_validateHydration () {
      function _failWithValidationErr (errStr) {
        const err = new Error(errStr)
        console.error(errStr)
        self.__setup_didFailToBoot(err)
      }
      // we *could* check if fullname and possibly XMR addr are empty/undef here but not much need/reason
      // and might lead to awkward UX
      //
      // all done
      self.__setup_didBoot()
    }
  }

  _startObserving_openAliasResolver () {
    const self = this
    const emitter = self.context.openAliasResolver
    self._EventName_resolvedOpenAliasAddress_fn = function (
      openAliasAddress,
      //
      moneroReady_address,
      payment_id, // may be undefined
      tx_description, // may be undefined
      //
      openAlias_domain,
      oaRecords_0_name,
      oaRecords_0_description,
      dnssec_used_and_secured
    ) {
      if (self.address === openAliasAddress) {
        // ^-- this update is for self
        self.Set_valuesByKey(
          {
            payment_id: payment_id, // always overwrite, regardless of content
            cached_OAResolved_XMR_address: moneroReady_address
          },
          function (err) {
            if (err) {
              throw err
            }
          }
        )
      }
    }
    emitter.on(
      emitter.EventName_resolvedOpenAliasAddress(),
      self._EventName_resolvedOpenAliasAddress_fn
    )
  }

  TearDown () {
    const self = this

    self._stopObserving_openAliasResolver()
  }

  _stopObserving_openAliasResolver () {
    const self = this
    const emitter = self.context.openAliasResolver
    if (self._EventName_resolvedOpenAliasAddress_fn && typeof self._EventName_resolvedOpenAliasAddress_fn !== 'undefined') {
      emitter.removeListener(
        emitter.EventName_resolvedOpenAliasAddress(),
        self._EventName_resolvedOpenAliasAddress_fn
      )
      self._EventName_resolvedOpenAliasAddress_fn = null
    }
  }

  Description () {
    const self = this
    //
    return `${self.constructor.name}<${self._id}> "${self.emoji}  ${self.fullname}, XMR addr: ${self.address}, payment id: ${self.payment_id}".`
  }

  EventName_booted () {
    return 'EventName_booted'
  }

  EventName_errorWhileBooting () {
    return 'EventName_errorWhileBooting'
  }

  EventName_contactInfoUpdated () {
    return 'EventName_contactInfoUpdated'
  }

  EventName_willBeDeleted () {
    return 'EventName_willBeDeleted'
  }

  EventName_deleted () {
    return 'EventName_deleted'
  }

  HasOpenAliasAddress () { // throws
    const self = this
    const address = self.address
    //
    return self.context.openAliasResolver.DoesStringContainPeriodChar_excludingAsXMRAddress_qualifyingAsPossibleOAAddress(address)
  }

  HasIntegratedAddress () { // throws
    const self = this
    const address = self.address
    if (!address || typeof address === 'undefined') {
      throw Error('HasIntegratedAddress() called but address nil.')
    }
    if (self.HasOpenAliasAddress() === true) {
      return false
    }
    // TODO: how to cache this? would need to invalidate every time .address is touched
    const address__decode_result = self.context.monero_utils.decode_address(address, self.context.nettype) // just letting it throw
    const integratedAddress_paymentId = address__decode_result.intPaymentId
    const isIntegratedAddress = !!integratedAddress_paymentId // would like this test to be a little more rigorous
    //
    return isIntegratedAddress
  }

  new_integratedXMRAddress_orNilIfNotApplicable () {
    const self = this
    const payment_id = self.payment_id
    if (payment_id == null || payment_id == '' || typeof payment_id === 'undefined') {
      return null // no possible derived int address
    }
    if (monero_paymentID_utils.IsValidShortPaymentID(payment_id) == false) {
      return null // must be a long payment ID
    }
    if (self.HasIntegratedAddress()) {
      return null // b/c we don't want to show a derived int addr if we already have it!
    }
    let address = null
    if (self.HasOpenAliasAddress()) {
      address = self.cached_OAResolved_XMR_address
    } else {
      address = self.address
    }
    if (address == null || address == '' || typeof address === 'undefined') {
      return null // probably not resolved yet…… guess don't show any hypothetical derived int addr for now
    }
    if (self.context.monero_utils.is_subaddress(address, self.context.nettype)) {
      return null // integrated addr must not be generated for subaddrs
    }
    // now we know we have a std xmr addr and a short pid
    const int_addr = self.context.monero_utils.new__int_addr_from_addr_and_short_pid(address, payment_id, self.context.nettype)
    return int_addr
  }

  Lazy_URI__addressAsFirstPathComponent () {
    const self = this
    if (self.hasBooted !== true) {
      throw Error('Lazy_URI__addressAsFirstPathComponent() called while FundsRequest instance not booted')
    }
    return self._assumingBootedOrEquivalent__Lazy_URI__addressAsFirstPathComponent()
  }

  _assumingBootedOrEquivalent__Lazy_URI__addressAsFirstPathComponent () {
    const self = this
    if (typeof self.uri_addressAsFirstPathComponent === 'undefined' || !self.uri_addressAsFirstPathComponent) {
      // using the request URIs because all parsing is the same anyway
      self.uri_addressAsFirstPathComponent = monero_requestURI_utils.New_RequestFunds_URI({
        address: self.address,
        payment_id: self.payment_id,
        amount: null,
        amountCcySymbol: null,
        description: null,
        message: null,
        uriType: monero_requestURI_utils.URITypes.addressAsFirstPathComponent
      })
    }
    return self.uri_addressAsFirstPathComponent
  }

  _new_qrCode_imgDataURIString () {
    return new Promise((resolve, reject) => {
      const self = this
      const uri = self._assumingBootedOrEquivalent__Lazy_URI__addressAsFirstPathComponent() // NOTE: creating QR code with URI w/o "//" - wider scanning support in ecosystem
      // ^- since we're not booted yet but we're only calling this when we know we have all the info
      const options = { errorCorrectionLevel: 'Q' } // Q: quartile: 25%
      QRCode.toDataURL(
        uri,
        options,
        function (err, imgDataURIString) {
          if (err) {
            console.error('Error generating QR code:', err)
          }
          err ? reject(err) : resolve(imgDataURIString)
        }
      )
    })
  }

  regenerateQRCode () {
    return new Promise((resolve, reject) => {
      const self = this
      self._new_qrCode_imgDataURIString()
        .then((qrCode_imgDataURIString) => {
          self.qrCode_imgDataURIString = qrCode_imgDataURIString
          resolve()
        })
        .catch((err) => {
          reject(err)
        })
    })
  }

  saveToDisk () {
    const self = this
    return contact_persistence_utils.SaveToDisk(self)
  }

  Delete (fn) {
    const self = this
    self.emit(self.EventName_willBeDeleted(), self._id)
    contact_persistence_utils.DeleteFromDisk(
      self,
      function (err) {
        if (err) {
          fn(err)
          return
        }
        self.emit(self.EventName_deleted(), self._id)
        fn()
      }
    )
  }

  ChangePasswordTo (changeTo_persistencePassword, fn) {
    const self = this
    const old_persistencePassword = self.persistencePassword
    self.persistencePassword = changeTo_persistencePassword
    self.saveToDisk()
      .then(() => {
        console.log('Successfully changed password.')
      })
      .catch((err) => {
        console.error('Failed to change password with error', err)
        self.persistencePassword = old_persistencePassword // revert
        fn(err)
      })
  }

  Set_valuesByKey (valuesByKey, fn) {
    const self = this
    const valueKeys = Object.keys(valuesByKey)
    for (const valueKey of valueKeys) {
      const value = valuesByKey[valueKey]
      // validate
      if (valueKey === 'emoji') {
        const supposedEmoji = value
        if (Emojis.indexOf(supposedEmoji) === -1) {
          const errStr = 'Input to set emoji was not a known emoji.'
          fn(new Error(errStr))
          return
        }
      } else if (valueKey === 'address') {
        const address = value
        if (self.context.openAliasResolver.DoesStringContainPeriodChar_excludingAsXMRAddress_qualifyingAsPossibleOAAddress(address) === false) { // if new one is not OA addr, clear cached OA-resolved info
          self.cached_OAResolved_XMR_address = null
        }
      }
      // set
      self[valueKey] = value
    }
    self.saveToDisk()
      .then(() => {
        // console.log("📝  Successfully saved Contact update ", JSON.stringify(valuesByKey))
        self.regenerateQRCode()
          .then(() => {
            self._atRuntime_contactInfoUpdated()
          })
        fn()
      })
      .catch((err) => {
        console.error('Failed to save new valuesByKey', err)
        fn(err)
      })
  }

  _atRuntime_contactInfoUpdated () {
    const self = this
    self.emit(self.EventName_contactInfoUpdated())
  }
}
module.exports = Contact
