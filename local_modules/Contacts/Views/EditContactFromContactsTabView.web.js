'use strict'

const ContactFormView = require('../../Contacts/Views/ContactFormView.web')
const commonComponents_tables = require('../../MMAppUICommonComponents/tables.web')
const commonComponents_activityIndicators = require('../../MMAppUICommonComponents/activityIndicators.web')
const monero_paymentID_utils = require('@mymonero/mymonero-paymentid-utils')
const YatMoneroLookup = require('@mymonero/mymonero-yat-lookup')
const yatMoneroLookup = new YatMoneroLookup({})

class EditContactFromContactsTabView extends ContactFormView {
  setup () {
    const self = this
    { // before -setup
      self.contact = self.options.contact
      if (!self.contact) {
        throw self.constructor.name + ' requires an options.contact'
      }
    }
    super.setup()
    { // addtl UI elements
      self._setup_deleteRecordButtonLayer()
    }
    { // initial view config
      self.fullnameInputLayer.value = self.contact.fullname || ''
      // self.yatInputLayer.value = self.contact.yat || ''
      // this is commented because it is accomplished via _overridable_initial_emoji_value; may be deleted soon
      // self.emojiInputView.aLayer.value = self.emojiInputView.SetValue(self.contact.emoji || "")
      self.addressInputLayer.value = self.contact.address || ''
      self.paymentIDInputLayer.value = self.contact.payment_id || '' // to avoid 'undefined'
    }
  }

  _overridable_initial_emoji_value () {
    const self = this
    const value = self.contact.emoji || ''
    return value
  }

  _setup_deleteRecordButtonLayer () {
    const self = this
    const view = commonComponents_tables.New_deleteRecordNamedButtonView('contact', self.context)
    const layer = view.layer
    layer.style.marginTop = '21px'
    function __proceedTo_deleteRecord () {
      const record_id = self.contact._id
      self.context.contactsListController.WhenBooted_DeleteRecordWithId(
        record_id,
        function (err) {
          if (err) {
            throw err
          }
          self._thisRecordWasDeleted()
        }
      )
    }
    layer.addEventListener(
      'click',
      function (e) {
        e.preventDefault()
        {
          if (view.isEnabled === false) {
            console.warn('Delete btn not enabled')
            return false
          }
          self.context.windowDialogs.PresentQuestionAlertDialogWith(
            'Delete this contact?',
            'Delete this contact?\n\nThis cannot be undone.',
            'Delete',
            'Cancel',
            function (err, didChooseYes) {
              if (err) {
                throw err
              }
              if (didChooseYes) {
                __proceedTo_deleteRecord()
              }
            }
          )
        }
        return false
      }
    )
    self.layer.appendChild(layer)
  }

  _setup_field_address () {
    super._setup_field_address()
    // we're hooking into this function purely to get called just after the corresponding field layer's setup
    const self = this
    self._setup_form_resolving_activityIndicatorLayer()
  }

  _setup_form_resolving_activityIndicatorLayer () {
    const self = this
    const layer = commonComponents_activityIndicators.New_Resolving_ActivityIndicatorLayer(self.context)
    layer.style.display = 'none' // initial state
    self.resolving_activityIndicatorLayer = layer
    self.form_containerLayer.appendChild(layer)
  }

  Navigation_Title () {
    return 'Edit Contact'
  }

  dismissView () {
    const self = this
    const modalParentView = self.navigationController.modalParentView
    setTimeout(function () { // just to make sure the PushView is finished
      modalParentView.DismissTopModalView(true)
    })
  }

  _tryToCreateOrSaveContact () {
    const self = this
    //
    const fullname = self.fullnameInputLayer.value
    //const emoji = self.emojiInputView.Value()
    
    const address = self.addressInputLayer.value
    let paymentID = self.paymentIDInputLayer.value
    //
    if (typeof fullname === 'undefined' || !fullname) {
      self.validationMessageLayer.SetValidationError('Please enter a name for this contact.')
      return
    }
    if (typeof address === 'undefined' || !address) {
      self.validationMessageLayer.SetValidationError('Please enter an address for this contact.')
      return
    }
    if (typeof paymentID !== 'undefined' && paymentID) {
      if (self.context.monero_utils.is_subaddress(address, self.context.nettype)) { // paymentID disallowed with subaddress
        self.validationMessageLayer.SetValidationError('Payment IDs cannot be used with subaddresses.')
        return
      }
    }

    function __disableForm () {
      // TODO: disable / re-enable form elements plus cancel button as well (for Cordova slowness)
      self.disable_submitButton()
    }
    function __reEnableForm () {
      self.enable_submitButton()
    }
    self.validationMessageLayer.ClearAndHideMessage()
    __disableForm()
    //

    // Yat
    // checking for emojis for Yat addresses
    const hasEmojiCharacters = /\p{Extended_Pictographic}/u.test(address)
    if (hasEmojiCharacters) {
      // const isYat = yatMoneroLookup.isValidYatHandle(address)
      const isYat = true
      self.isYat = isYat
      if (isYat) {
        self.yat = address;
        const lookup = yatMoneroLookup.lookupMoneroAddresses(address).then((responseMap) => {
          // Our library returns a ResponseMap with between 0 and 2 keys
          if (responseMap.size == 0) {
            // no monero address
            // When zero keys, we're not going to let a user save a contact. There's the off chance they try to add an incorrect Yat
            const errorString = `There is no Monero address associated with "${address}"`
            self.validationMessageLayer.SetValidationError(errorString)
            return
          } else if (responseMap.size == 1) {
            // Either a Monero address or a Monero subaddress was found.
            const iterator = responseMap.values()
            const record = iterator.next()
          } else if (responseMap.size == 2) {
            const moneroAddress = responseMap.get('0x1001')
          }
          // So, success
          // const contactDescription = {
          //   fullname: fullname,
          //   // emoji: emoji,
          //   yat: self.yat, 
          //   address: address,
          //   payment_id: null,
          //   cached_OAResolved_XMR_address: null
          // }
          // self._willSaveContactWithDescription(contactDescription)
          // self.context.contactsListController.WhenBooted_AddContact(
          //   contactDescription,
          //   function (err, contact) {
          //     if (err) {
          //       __reEnableForm()
          //       console.error('Error while creating contact', err)
          //       self.validationMessageLayer.SetValidationError(err)
          //       return
          //     }
          //     // there's no need to re-enable the form because we're about to dismiss
          //     self._didSaveNewContact(contact)
          //   }
          // )
          self.contact.Set_valuesByKey(
            {
              fullname: fullname,
              address: address,
              isYat: true,
              cached_OAResolved_XMR_address: null,
              payment_id: ''
            },
            function (err) {
              if (err) {
                __reEnableForm()
                console.error('Error while saving contact', err)
                self.validationMessageLayer.SetValidationError(err.message)
                return
              }
              //
              // still not going to re-enable form because now that we've succeeded, we will just dismiss
              //
              self._didSaveContact()
            }
          )
        }).catch((error) => {
          console.log(error);
          __reEnableForm()
          // If the error status is defined, handle this error according to the HTTP error status code
          if (typeof (error.response) !== 'undefined' && typeof (error.response.status) !== 'undefined') {
            if (error.response.status == 404) {
              // Yat not found
              const errorString = `The Yat "${address}" does not exist`
              self.validationMessageLayer.SetValidationError(errorString)
            } else if (error.response.status >= 500) {
              // Yat server / remote network device error encountered
              const errorString = `The Yat server is responding with an error. Please try again later. Error: ${error.message}`
              self.validationMessageLayer.SetValidationError(errorString)
            } else {
              // Response code that isn't 404 or a server error (>= 500) on their side
              const errorString = `An unexpected error occurred when looking up the Yat Handle: ${error.message}`
              self.validationMessageLayer.SetValidationError(errorString)
            }
          } else {
            // Network connectivity issues -- could be offline / Yat server not responding
            const errorString = `Unable to communicate with the Yat server. It may be down, or you may be experiencing internet connectivity issues. Error: ${error.message}`
            self.validationMessageLayer.SetValidationError(errorString)
            // If we don't have an error.response, our request failed because of a network error
          }
        })
      } else {
        // This conditional will run when a mixture of emoji and non-emoji characters are present in the address
        const errorString = `"${address}" is not a valid Yat handle. You may have input an emoji that is not part of the Yat emoji set, or a non-emoji character.`
        self.validationMessageLayer.SetValidationError(errorString)
        const hasEmojiCharacters = true;
        return
      }
    }

    if (hasEmojiCharacters == true) {
      return
    }

    self.cancelAny_requestHandle_for_oaResolution() // jic
    //
    const openAliasResolver = self.context.openAliasResolver
    if (openAliasResolver.DoesStringContainPeriodChar_excludingAsXMRAddress_qualifyingAsPossibleOAAddress(address) === false) {
      let address__decode_result
      try {
        address__decode_result = self.context.monero_utils.decode_address(address, self.context.nettype)
      } catch (e) {
        __reEnableForm()
        self.validationMessageLayer.SetValidationError('Please enter a valid Monero address') // not using the error here cause it can be pretty unhelpful to the lay user
        return
      }
      const integratedAddress_paymentId = address__decode_result.intPaymentId
      const isIntegratedAddress = !!integratedAddress_paymentId // would like this test to be a little more rigorous
      if (isIntegratedAddress) { // is integrated address
        paymentID = integratedAddress_paymentId // use this one instead
        self.paymentIDInputLayer.value = paymentID
      } else { // not an integrated addr - normal wallet addr or subaddress
        if (self.context.monero_utils.is_subaddress(address, self.context.nettype)) { // paymentID disallowed with subaddress
          paymentID = undefined
          self.paymentIDInputLayer.value = ''
        } else { // normal wallet address
          if (paymentID === '' || typeof paymentID === 'undefined') { // if no existing payment ID
            paymentID = self.context.monero_utils.new_payment_id() // generate new one for them
            self.paymentIDInputLayer.value = paymentID
          } else { // just use/allow entered paymentID
          }
        }
      }
      //
      _proceedTo_saveContact_paymentID(paymentID, undefined)
    } else {
      self.resolving_activityIndicatorLayer.style.display = 'block' // AFTER any cancelAny_requestHandle…
      //
      self.requestHandle_for_oaResolution = self.context.openAliasResolver.ResolveOpenAliasAddress(
        address,
        function (
          err,
          addressWhichWasPassedIn,
          moneroReady_address,
          returned__payment_id, // may be undefined
          tx_description,
          openAlias_domain,
          oaRecords_0_name,
          oaRecords_0_description,
          dnssec_used_and_secured
        ) {
          self.resolving_activityIndicatorLayer.style.display = 'none'
          //
          if (typeof self.requestHandle_for_oaResolution === 'undefined' || !self.requestHandle_for_oaResolution) {
            __reEnableForm()
            console.warn('⚠️  Called back from ResolveOpenAliasAddress but no longer have a self.requestHandle_for_oaResolution. Canceled by someone else? Bailing after neutralizing UI.')
            return
          }
          self.requestHandle_for_oaResolution = null
          //
          if (address !== addressWhichWasPassedIn) {
            console.warn('⚠️  The addressWhichWasPassedIn to the ResolveOpenAliasAddress call of which this is a callback is different than the currently selected address. Bailing')
            return
          }
          if (err) {
            __reEnableForm()
            self.validationMessageLayer.SetValidationError(err.toString())
            return
          }
          self.paymentIDInputLayer.value = returned__payment_id || ''
          //
          // not going to re-enable the form yet
          //
          const payment_id__toSave = returned__payment_id || ''
          const cached_OAResolved_XMR_address = moneroReady_address
          _proceedTo_saveContact_paymentID(
            payment_id__toSave, // aka use no/zero/emptystr payment id rather than null as null will create a new
            cached_OAResolved_XMR_address // it's ok if this is undefined
          )
        }
      )
    }
    //
    function _proceedTo_saveContact_paymentID (paymentID__toSave, cached_OAResolved_XMR_address__orUndefined) {
      const paymentID_exists = paymentID__toSave && typeof paymentID__toSave !== 'undefined'
      const paymentID_existsAndIsNotValid = paymentID_exists && monero_paymentID_utils.IsValidPaymentIDOrNoPaymentID(paymentID__toSave) === false
      if (paymentID_existsAndIsNotValid === true) {
        __reEnableForm()
        self.validationMessageLayer.SetValidationError('Please enter a valid payment ID.')
        return
      }
      self.contact.Set_valuesByKey(
        {
          fullname: fullname,
          address: address,
          isYat: false,
          cached_OAResolved_XMR_address: cached_OAResolved_XMR_address__orUndefined,
          payment_id: paymentID__toSave
        },
        function (err) {
          if (err) {
            __reEnableForm()
            console.error('Error while saving contact', err)
            self.validationMessageLayer.SetValidationError(err.message)
            return
          }
          //
          // still not going to re-enable form because now that we've succeeded, we will just dismiss
          //
          self._didSaveContact()
        }
      )
    }
  }

  _saveButtonView_pressed () {
    super._saveButtonView_pressed()
    //
    const self = this
    self._tryToCreateOrSaveContact()
  }

  _thisRecordWasDeleted () {
    const self = this
    self.dismissView()
  }

  _didSaveContact () {
    const self = this
    self.dismissView()
  }
}
module.exports = EditContactFromContactsTabView
