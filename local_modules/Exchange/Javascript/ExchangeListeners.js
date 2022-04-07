const Utils = require('../Javascript/ExchangeUtilityFunctions')

const validationMessages = document.getElementById('validation-messages')
// const addressValidation = document.getElementById('address-messages');
const serverValidation = document.getElementById('server-messages')
const orderBtn = document.getElementById('order-button')
const loaderPage = document.getElementById('loader')

const exchangeXmrDiv = document.getElementById('exchange-xmr')
const backBtn = document.getElementsByClassName('nav-button-left-container')[0]
const XMRcurrencyInput = document.getElementById('XMRcurrencyInput')
const BTCcurrencyInput = document.getElementById('BTCcurrencyInput')
let currencyInputTimer

BTCAddressInputListener = function () {
  const div = document.getElementById('btc-invalid')
  const btcAddressInput = document.getElementById('btcAddress')
  if ((Utils.validateBTCAddress(btcAddressInput.value) == false) && div == null) {
    const error = document.createElement('div')
    error.classList.add('message-label')
    error.id = 'btc-invalid'
    error.innerHTML = 'Your BTC address is not valid.'
    const addressValidation = document.getElementById('address-messages')
    addressValidation.appendChild(error)
  } else {
    if (!(div == null)) {
      div.remove()
    }
  }
}

XMRCurrencyInputKeydownListener = function (event) {
  if (event.which == 8 || event.which == 110 || event.which == 46 || event.which == 190) { return }

  if ((event.which >= 48 && event.which <= 57) || (event.which >= 96 && event.which <= 105)) {
    return
  }

  if (!Utils.checkDecimals(XMRcurrencyInput.value, 12)) {
    event.preventDefault()
    return
  }

  event.preventDefault()
}

walletSelectorClickListener = function (event) {
  const walletElement = document.getElementById('wallet-options')
  const selectedWallet = document.getElementById('selected-wallet')
  walletElement.classList.add('active')
  if (event.srcElement.parentElement.className.includes('optionCell')) {
    const dataAttributes = event.srcElement.parentElement.dataset
    selectedWallet.dataset.walletlabel = dataAttributes.walletlabel
    selectedWallet.dataset.walletbalance = dataAttributes.walletbalance
    selectedWallet.dataset.swatch = dataAttributes.swatch
    selectedWallet.dataset.walletselected = true
    selectedWallet.dataset.walletoffset = dataAttributes.walletoffset
    const walletLabel = document.getElementById('selected-wallet-label')
    const walletBalance = document.getElementById('selected-wallet-balance')
    const walletIcon = document.getElementById('selected-wallet-icon')
    walletElement.classList.remove('active')
    walletIcon.style.backgroundImage = `url('../../../assets/img/wallet-${dataAttributes.swatch}@3x.png'`
    walletLabel.innerText = dataAttributes.walletlabel
    walletBalance.innerText = dataAttributes.walletbalance + ' XMR'
    const walletSelector = document.getElementById('wallet-selector')
    walletSelector.dataset.walletchosen = true
    clearCurrencies()
  }
  if (event.srcElement.parentElement.className.includes('selectionDisplayCellView')) {
    walletElement.classList.add('active')
  }
  if (event.srcElement == 'div.hoverable-cell.utility.selectionDisplayCellView') {

  }
}

BTCCurrencyKeydownListener = function (event) {
  if (event.which == 8 || event.which == 110 || event.which == 46 || event.which == 190) { return }

  if ((event.which >= 48 && event.which <= 57) || (event.which >= 96 && event.which <= 105)) {
    return
  }

  if (!Utils.checkDecimals(BTCcurrencyInput.value, 8)) {
    event.preventDefault()
    return
  }
  event.preventDefault()
}

xmrBalanceChecks = function (exchangeFunctions) {
  let BTCToReceive
  const XMRbalance = parseFloat(XMRcurrencyInput.value)
  const in_amount = XMRbalance.toFixed(12)
  BTCcurrencyInput.value = 'Loading...'
  if (currencyInputTimer !== undefined) {
    clearTimeout(currencyInputTimer)
  }

  if (in_amount == 0) {
    const error = document.createElement('div')
    error.classList.add('message-label')
    error.id = 'xmrexceeded'
    error.innerHTML = 'Please enter a valid amount'
    validationMessages.appendChild(error)
    return
  }
  // if (exchangeFunctions.currentRates.in_min > XMRbalance) {
  //     let error = document.createElement('div');
  //     error.classList.add('message-label');
  //     error.id = 'xmrexceeded';
  //     error.innerHTML = `You cannot exchange less than ${exchangeFunctions.currentRates.in_min} XMR`;
  //     validationMessages.appendChild(error);
  //     return;
  // }
  // if (exchangeFunctions.currentRates.in_max < XMRbalance) {
  //     let error = document.createElement('div');
  //     error.classList.add('message-label');
  //     error.id = 'xmrexceeded';
  //     error.innerHTML = `You cannot exchange more than ${exchangeFunctions.currentRates.in_max} XMR`;
  //     validationMessages.appendChild(error);
  //     return;
  // }
  validationMessages.innerHTML = ''
  serverValidation.innerHTML = ''
  currencyInputTimer = setTimeout(() => {
    exchangeFunctions.getOfferWithInAmount(exchangeFunctions.in_currency, exchangeFunctions.out_currency, in_amount)
      .then((response) => {
        // We clear error messages again here to prevent duplicates, since it's possible that a user may change the input value while a request is still waiting for a server response. This prevents duplicate error messages
        validationMessages.innerHTML = ''
        serverValidation.innerHTML = ''
        BTCToReceive = parseFloat(response.out_amount)
        const selectedWallet = document.getElementById('selected-wallet')
        const tx_feeElem = document.getElementById('tx-fee')
        const tx_fee = tx_feeElem.dataset.txFee
        const tx_fee_double = parseFloat(tx_fee)
        const walletMaxSpendDouble = parseFloat(selectedWallet.dataset.walletbalance)
        const walletMaxSpend = walletMaxSpendDouble - tx_fee

        if ((walletMaxSpend - XMRbalance) < 0) {
          const error = document.createElement('div')
          error.classList.add('message-label')
          error.id = 'xmrexceeded'
          error.innerHTML = `You cannot exchange more than ${walletMaxSpend} XMR`
          validationMessages.appendChild(error)
        }
        // if (BTCToReceive.toFixed(8) > exchangeFunctions.currentRates.out_max) {
        //     let error = document.createElement('div');
        //     error.classList.add('message-label');
        //     error.id = 'xmrexceeded';
        //     error.innerHTML = `You cannot exchange more than ${exchangeFunctions.currentRates.in_max.toFixed(12)} XMR`;
        //     validationMessages.appendChild(error);
        // }
        // if (BTCToReceive.toFixed(8) < exchangeFunctions.currentRates.lower_limit) {
        //     let error = document.createElement('div');
        //     error.classList.add('message-label');
        //     error.id = 'xmrtoolow';
        //     error.innerHTML = `You cannot exchange less than ${exchangeFunctions.currentRates.in_min.toFixed(12)} XMR.`;
        //     validationMessages.appendChild(error);
        // }
        BTCcurrencyInput.value = BTCToReceive.toFixed(8)
      }).catch((error) => {
        // We clear error messages again here to prevent duplicates, since it's possible that a user may change the input value while a request is still waiting for a server response. This prevents duplicate error messages
        validationMessages.innerHTML = ''
        serverValidation.innerHTML = ''
        const errorDiv = document.createElement('div')
        const errorStringSplit = error.response.data.Error.split('must be')
        errorDiv.classList.add('message-label')
        let errorMessage = ''
        if (typeof (error.response.status) === 'undefined') {
          errorMessage = error.message
        } else {
          // We may have a value in error.response.data.Error
          if (typeof (error.response.data) !== 'undefined' && typeof (error.response.data.Error !== 'undefined')) {
            errorMessage = error.response.data.Error
          } else {
            errorMessage = error.message
          }
        }
        errorDiv.id = 'server-invalid'
        errorDiv.innerHTML = 'There was a problem communicating with the server. <br>If this problem keeps occurring, please contact support with a screenshot of the following error: <br>' + errorMessage
        serverValidation.appendChild(errorDiv)
      })
  }, 1500)
}

btcBalanceChecks = function (exchangeFunctions) {
  let BTCToReceive
  const BTCbalance = parseFloat(BTCcurrencyInput.value)
  const out_amount = BTCbalance.toFixed(12)
  XMRcurrencyInput.value = 'Loading...'
  if (currencyInputTimer !== undefined) {
    clearTimeout(currencyInputTimer)
  }

  if (out_amount == 0) {
    const error = document.createElement('div')
    error.classList.add('message-label')
    error.id = 'xmrexceeded'
    error.innerHTML = 'Please enter a valid amount'
    validationMessages.appendChild(error)
    return
  }
  // if (exchangeFunctions.currentRates.out_min > BTCbalance) {
  //     let error = document.createElement('div');
  //     error.classList.add('message-label');
  //     error.id = 'xmrexceeded';
  //     error.innerHTML = `You cannot exchange less than ${exchangeFunctions.currentRates.out_min} BTC`;
  //     validationMessages.appendChild(error);
  //     return;
  // }
  // if (exchangeFunctions.currentRates.out_max < BTCbalance) {
  //     let error = document.createElement('div');
  //     error.classList.add('message-label');
  //     error.id = 'xmrexceeded';
  //     error.innerHTML = `You cannot exchange more than ${exchangeFunctions.currentRates.out_max} BTC`;
  //     validationMessages.appendChild(error);
  //     return;
  // }
  validationMessages.innerHTML = ''
  serverValidation.innerHTML = ''
  currencyInputTimer = setTimeout(() => {
    exchangeFunctions.getOfferWithOutAmount(exchangeFunctions.in_currency, exchangeFunctions.out_currency, out_amount)
      .then((response) => {
        // We clear error messages again here to prevent duplicates, since it's possible that a user may change the input value while a request is still waiting for a server response. This prevents duplicate error messages
        validationMessages.innerHTML = ''
        serverValidation.innerHTML = ''
        const XMRtoReceive = parseFloat(response.in_amount)
        const selectedWallet = document.getElementById('selected-wallet')
        const tx_feeElem = document.getElementById('tx-fee')
        const tx_fee = tx_feeElem.dataset.txFee
        const tx_fee_double = parseFloat(tx_fee)
        const walletMaxSpendDouble = parseFloat(selectedWallet.dataset.walletbalance)
        const walletMaxSpend = walletMaxSpendDouble - tx_fee
        const BTCCurrencyValue = parseFloat(BTCcurrencyInput.value)

        if ((walletMaxSpend - XMRtoReceive) < 0) {
          const error = document.createElement('div')
          error.classList.add('message-label')
          error.id = 'xmrexceeded'
          error.innerHTML = `You cannot exchange more than ${walletMaxSpend} XMR`
          validationMessages.appendChild(error)
        }

        if (BTCCurrencyValue.toFixed(12) > exchangeFunctions.currentRates.upper_limit) {
          const error = document.createElement('div')
          error.id = 'xmrexceeded'
          error.classList.add('message-label')
          const btc_amount = parseFloat(exchangeFunctions.currentRates.upper_limit)
          error.innerHTML = `You cannot exchange more than ${btc_amount} BTC.`
          validationMessages.appendChild(error)
        }
        if (BTCCurrencyValue.toFixed(8) < exchangeFunctions.currentRates.lower_limit) {
          const error = document.createElement('div')
          error.id = 'xmrtoolow'
          error.classList.add('message-label')
          const btc_amount = parseFloat(exchangeFunctions.currentRates.lower_limit)
          error.innerHTML = `You cannot exchange less than ${btc_amount} BTC.`
          validationMessages.appendChild(error)
        }
        XMRcurrencyInput.value = XMRtoReceive.toFixed(12)
      }).catch((error) => {
        // We clear error messages again here to prevent duplicates, since it's possible that a user may change the input value while a request is still waiting for a server response. This prevents duplicate error messages
        validationMessages.innerHTML = ''
        serverValidation.innerHTML = ''
        const errorDiv = document.createElement('div')
        const errorStringSplit = error.response.data.Error.split('must be')
        errorDiv.classList.add('message-label')
        let errorMessage = ''
        if (typeof (error.response.status) === 'undefined') {
          errorMessage = error.message
        } else {
          // We may have a value in error.response.data.Error
          if (typeof (error.response.data) !== 'undefined' && typeof (error.response.data.Error !== 'undefined')) {
            errorMessage = error.response.data.Error
          } else {
            errorMessage = error.message
          }
        }
        errorDiv.id = 'server-invalid'
        errorDiv.innerHTML = 'There was a problem communicating with the server. <br>If this problem keeps occurring, please contact support with a screenshot of the following error: <br>' + errorMessage
        serverValidation.appendChild(errorDiv)
      })
  }, 1500)
}

backButtonClickListener = function () {
  const backBtn = document.getElementsByClassName('nav-button-left-container')[0]
  const viewOrderBtn = document.getElementById('view-order')
  orderCreated = false
  document.getElementById('orderStatusPage').classList.add('active')
  backBtn.style.display = 'none'
  const orderStatusDiv = document.getElementById('exchangePage')
  loaderPage.classList.remove('active')
  orderStatusDiv.classList.remove('active')
  exchangeXmrDiv.classList.remove('active')
  viewOrderBtn.style.display = 'block'
}

function clearCurrencies () {
  XMRcurrencyInput.value = ''
  BTCcurrencyInput.value = ''
}

// TODO: Finish refactoring this to clean up ExchangeScript.js
// orderBtnClickListener = function(orderStarted, ExchangeFunctions) {
//     let validationError = false;
//     if (orderStarted == true) {
//         return;
//     }
//     if (validationMessages.firstChild !== null) {
//         validationMessages.firstChild.style.color = "#ff0000";
//         validationError = true;
//         return;
//     }
//     if (addressValidation.firstChild !== null) {
//         addressValidation.firstChild.style.color = "#ff0000";
//         validationError = true;
//         return;
//     }
//     orderBtn.style.display = "none";
//     orderStarted = true;
//     backBtn.style.display = "block";
//     loaderPage.classList.add('active');
//     let amount = document.getElementById('XMRcurrencyInput').value;
//     let amount_currency = 'XMR';
//     let btc_dest_address = document.getElementById('btcAddress').value;
//     let test = ExchangeFunctions.createNewOrder(amount, amount_currency, btc_dest_address).then((response) => {
//         order = response.data;
//         orderCreated = true;
//     }).then((response) => {
//         backBtn.innerHTML = `<div class="base-button hoverable-cell utility grey-menu-button disableable left-back-button" style="cursor: default; -webkit-app-region: no-drag; position: absolute; opacity: 1; left: 0px;"></div>`;
//         orderTimer = setInterval(() => {
//             ExchangeFunctions.getOrderStatus().then(function (response) {
//                 Utils.renderOrderStatus(response);
//                 let expiryTime = response.expires_at;
//                 let secondsElement = document.getElementById('secondsRemaining');
//                 let minutesElement = document.getElementById('minutesRemaining');
//                 if (secondsElement !== null) {

//                     let minutesElement = document.getElementById('minutesRemaining');
//                     let timeRemaining = Utils.getTimeRemaining(expiryTime);
//                     minutesElement.innerHTML = timeRemaining.minutes;
//                     if (timeRemaining.seconds <= 9) {
//                         timeRemaining.seconds = "0" + timeRemaining.seconds;
//                     }
//                     secondsElement.innerHTML = timeRemaining.seconds;
//                     let xmr_dest_address_elem = document.getElementById('XMRtoAddress');
//                     xmr_dest_address_elem.value = response.receiving_subaddress;
//                 }
//             })
//         }, 1000);
//         document.getElementById("orderStatusPage").classList.remove('active');
//         let orderStatusDiv = document.getElementById("exchangePage");
//         loaderPage.classList.remove('active');
//         orderStatusDiv.classList.add('active');
//         exchangeXmrDiv.classList.add('active');
//     }).catch((error) => {
//         if (error.response) {
//             let errorDiv = document.createElement("div");
//             errorDiv.innerText = "An unexpected error occurred";
//             validationMessages.appendChild(errorDiv);
//         } else if (error.request) {
//             let errorDiv = document.createElement("div");
//             errorDiv.innerText = "XMR.to's server is unreachable. Please try again shortly.";
//             validationMessages.appendChild(errorDiv);
//         } else {
//             let errorDiv = document.createElement("div");
//             errorDiv.innerText = error.message;
//             validationMessages.appendChild(errorDiv);
//         }
//     });
// }

module.exports = {
  BTCAddressInputListener,
  XMRCurrencyInputKeydownListener,
  BTCCurrencyKeydownListener,
  walletSelectorClickListener,
  xmrBalanceChecks,
  btcBalanceChecks
  // orderBtnClickListener
}
