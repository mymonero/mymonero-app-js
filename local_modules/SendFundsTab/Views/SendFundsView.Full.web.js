'use strict'

const SendFundsView_Base = require('./SendFundsView_Base.web')
const commonComponents_contactPicker = require('../../MMAppUICommonComponents/contactPicker.web')
const monero_requestURI_utils = require('../../MoneroUtils/monero_requestURI_utils')
const AddContactFromSendTabView = require('../../Contacts/Views/AddContactFromSendTabView.web')
const StackAndModalNavigationView = require('../../StackNavigation/Views/StackAndModalNavigationView.web')

class SendFundsView extends SendFundsView_Base {
  constructor (options, context) {
    super(options, context)
  }

  //
  // Overrides - Setup - Imperatives
  startObserving () {
    const self = this
    super.startObserving() // must call
    { // urlOpeningController
      const controller = self.context.urlOpeningCoordinator
      controller.on(
        'EventName_TimeToHandleReceivedMoneroRequestURL',
        function (url) {
          self.navigationController.DismissModalViewsToView( // dismissing these b/c of checks in __shared_isAllowedToPerformDropOrURLOpeningOps
            null, // null -> to top stack view
            false // not animated
          )
          self.navigationController.PopToRootView(false) // in case they're not on root
          //
          if (self.__shared_isAllowedToPerformDropOrURLOpeningOps() != true) {
            console.warn('Not allowed to perform URL opening ops yet.')
            return false
          }
          self._shared_didPickRequestConfirmedURIStringForAutofill(url)
        }
      )
    }
  }

  //
  // Overrides - Required - Setup - Accessors
  _new_required_contactPickerLayer () {
    const self = this
    const layer = commonComponents_contactPicker.New_contactPickerLayer(
      self.context,
      'Contact name, or address/domain',
      self.context.contactsListController,
      function (contact) { // did pick
        self._didPickContact(contact)
      },
      function (clearedContact) {
        self.cancelAny_requestHandle_for_oaResolution()
        //
        self._dismissValidationMessageLayer() // in case there was an OA addr resolve network err sitting on the screen
        self._hideResolvedPaymentID()
        self._hideResolvedAddress()
        //
        self.addPaymentIDButtonView.layer.style.display = 'block' // can re-show this
        self.manualPaymentIDInputLayer_containerLayer.style.display = 'none' // just in case
        self.manualPaymentIDInputLayer.value = ''
        //
        self.pickedContact = null
      },
      function (event) { // didFinishTypingInInput_fn
        self._didFinishTypingInContactPickerInput(event)
      }
    )
    return layer
  }

  //
  // Delegation - Internal
  _shared_didPickRequestConfirmedURIStringForAutofill (possibleUriString) {
    const self = this
    //
    self.validationMessageLayer.ClearAndHideMessage() // in case there was a parsing err etc displaying
    self._clearForm()
    //
    self.cancelAny_requestHandle_for_oaResolution()
    //
    let requestPayload
    try {
      requestPayload = monero_requestURI_utils.New_ParsedPayload_FromPossibleRequestURIString(possibleUriString, self.context.nettype, self.context.monero_utils)
    } catch (errStr) {
      if (errStr) {
        self.validationMessageLayer.SetValidationError('Unable to decode that URL: ' + errStr)
        return
      }
    }
    self._shared_havingClearedForm_didPickRequestPayloadForAutofill(requestPayload)
  }

  __didSendWithPickedContact (pickedContact_orNull, enteredAddressValue_orNull, resolvedAddress_orNull, mockedTransaction) {
    const self = this
    // TODO: When we have Contacts support for Yats, we'll remove this check

    if (pickedContact_orNull === null) { // so they're going with a custom addr
      setTimeout(
        function () {
          const view = new AddContactFromSendTabView({
            mockedTransaction: mockedTransaction,
            enteredAddressValue_orNull: enteredAddressValue_orNull,
            resolvedAddress_orNull: resolvedAddress_orNull
          }, self.context)
          const navigationView = new StackAndModalNavigationView({}, self.context)
          navigationView.SetStackViews([view])
          self.navigationController.PresentView(navigationView, true)
        },
        750 + 300 // after the navigation transition just above has taken place, and given a little delay for user to get their bearings
      )
    }
  }
}

module.exports = SendFundsView
