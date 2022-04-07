(function () {
  const XMRcurrencyInput = document.getElementById('XMRcurrencyInput')
  const BTCcurrencyInput = document.getElementById('BTCcurrencyInput')
  const validationMessages = document.getElementById('validation-messages')
  const shell = require('electron').shell
  const validate = require('bitcoin-address-validation')
  const Utils = require('../../Exchange/Javascript/ExchangeUtilityFunctions')
  const ExchangeLibrary = require('mymonero-exchange')
  const ExchangeFunctions = new ExchangeLibrary()
  const Listeners = require('../../Exchange/Javascript/ExchangeListeners')
  const loaderPage = document.getElementById('loader')
  const order = {}
  const exchangePage = document.getElementById('orderStatusPage')
  const orderBtn = document.getElementById('order-button')
  const orderTimerInterval = {}
  const orderStatusInterval = {}
  const orderStatusResponse = {}
  const btcAddressInput = document.getElementById('btcAddress')
  const walletSelector = document.getElementById('wallet-selector')
  const walletOptions = document.getElementById('wallet-options')
  const exchangeXmrDiv = document.getElementById('exchange-xmr')
  let orderStarted = false
  const orderCreated = false
  const orderStatusPage = document.getElementById('orderStatusPage')
  const backBtn = document.getElementsByClassName('nav-button-left-container')[0]
  backBtn.style.display = 'none'
  const addressValidation = document.getElementById('address-messages')
  const serverValidation = document.getElementById('server-messages')
  const explanatoryMessage = document.getElementById('explanatory-message')
  const selectedWallet = document.getElementById('selected-wallet')
  const serverRatesValidation = document.getElementById('server-rates-messages')

  Listeners.BTCAddressInputListener()

  function getRates () {
    serverRatesValidation.innerHTML = ''
    const retry = document.getElementById('retry-rates')
    const errorDiv = document.getElementById('retry-error')
    if (retry !== null) {
      retry.classList.add('hidden')
      errorDiv.classList.add('hidden')
    }

    const indacoinDiv = document.getElementById('indacoin')
    const localmoneroDiv = document.getElementById('localmonero')

    function openClickableLink () {
      const self = this
      const referrer_id = self.getAttribute('referrer_id')
      const url = self.getAttribute('url')
      const paramStr = self.getAttribute('param_str')
      if (referrer_id.length > 0) {
        console.log('Got a referrer -- generate custom URL')
        const urlToOpen = url + '?' + paramStr + '=' + referrer_id
        shell.openExternal(urlToOpen)
      } else {
        console.log('No referrer')
        shell.openExternal('https://localmonero.co')
      }
    }
    ExchangeFunctions.initialiseExchangeConfiguration().then((response) => {
      const localmoneroAnchor = document.getElementById('localmonero-anchor')
      localmoneroAnchor.setAttribute('referrer_id', response.data.referrer_info.localmonero.referrer_id)
      localmoneroAnchor.setAttribute('url', 'https://localmonero.co')
      localmoneroAnchor.setAttribute('param_str', 'rc')
      if (response.data.referrer_info.localmonero.enabled === true) {
        localmoneroDiv.style.display = 'block'
        localmoneroAnchor.addEventListener('click', openClickableLink)
      }
    }).catch((error) => {
      const localmoneroAnchor = document.getElementById('localmonero-anchor')
      localmoneroAnchor.setAttribute('referrer_id', 'h2t1')
      localmoneroAnchor.setAttribute('url', 'https://localmonero.co')
      localmoneroAnchor.setAttribute('param_str', 'rc')
      localmoneroDiv.style.display = 'block'
      localmoneroAnchor.addEventListener('click', openClickableLink)
    })

    ExchangeFunctions.getRatesAndLimits().then(() => {
      loaderPage.classList.remove('active')
      exchangePage.classList.add('active')
    }).catch((error) => {
      if (retry !== null) {
        retry.classList.remove('hidden')
        errorDiv.classList.remove('hidden')
      } else {
        const errorDiv = document.createElement('div')
        errorDiv.innerText = "There was a problem with retrieving rates from the server. Please click the 'Retry' button to try connect again. The error message was: " + error.message
        errorDiv.id = 'retry-error'
        errorDiv.classList.add('message-label')
        const retryBtn = document.createElement('div')
        retryBtn.id = 'retry-rates'
        retryBtn.classList.add('base-button')
        retryBtn.classList.add('hoverable-cell')
        retryBtn.classList.add('navigation-blue-button-enabled')
        retryBtn.classList.add('action')
        retryBtn.innerHTML = 'Retry'
        retryBtn.addEventListener('click', getRates)
        explanatoryMessage.appendChild(errorDiv)
        explanatoryMessage.appendChild(retryBtn)
      }
    })
  }

  getRates()

  btcAddressInput.addEventListener('input', Listeners.BTCAddressInputListener)

  XMRcurrencyInput.addEventListener('keydown', Listeners.XMRCurrencyInputKeydownListener)

  walletSelector.addEventListener('click', Listeners.walletSelectorClickListener)

  BTCcurrencyInput.addEventListener('keydown', Listeners.BTCCurrencyKeydownListener)

  XMRcurrencyInput.addEventListener('keyup', function (event) {
    validationMessages.innerHTML = ''
    if (XMRcurrencyInput.value.length > 0) {
      Listeners.xmrBalanceChecks(ExchangeFunctions)
    }
  })

  function clearCurrencies () {
    XMRcurrencyInput.value = ''
    BTCcurrencyInput.value = ''
  }

  BTCcurrencyInput.addEventListener('keyup', function (event) {
    validationMessages.innerHTML = ''
    if (BTCcurrencyInput.value.length > 0) {
      Listeners.btcBalanceChecks(ExchangeFunctions)
    }
  })

  backBtn.addEventListener('click', backButtonClickListener)

  const viewOrderBtn = document.createElement('div')
  viewOrderBtn.id = 'view-order'
  viewOrderBtn.innerHTML = 'View Order'
  viewOrderBtn.addEventListener('click', function () {
    orderStatusPage.classList.remove('active')
    const exchangePage = document.getElementById('exchangePage')
    exchangePage.classList.add('active')
    viewOrderBtn.style.display = 'none'
    backBtn.style.display = 'block'
  })

  const nav_right = document.getElementsByClassName('nav-button-right-container')[0]
  nav_right.appendChild(viewOrderBtn)

  orderBtn.addEventListener('click', function () {
    let validationError = false
    serverValidation.innerHTML = ''
    if (orderStarted == true) {
      return
    }
    if (validationMessages.firstChild !== null) {
      validationMessages.firstChild.style.color = '#ff0000'
      validationError = true
      return
    }
    if (addressValidation.firstChild !== null) {
      addressValidation.firstChild.style.color = '#ff0000'
      validationError = true
      return
    }
    const btc_dest_address = document.getElementById('btcAddress').value

    orderBtn.style.display = 'none'
    orderStarted = true

    loaderPage.classList.add('active')
    let orderStatusResponse = { orderTick: 0 }
    const out_amount = document.getElementById('BTCcurrencyInput').value
    const in_currency = 'XMR'
    const out_currency = 'BTC'
    let firstTick = true
    try {
      const offer = ExchangeFunctions.getOfferWithOutAmount(in_currency, out_currency, out_amount).then((response) => {
        const selectedWallet = document.getElementById('selected-wallet')
        ExchangeFunctions.createOrder(btc_dest_address, selectedWallet.dataset.walletpublicaddress).then((response) => {
          const orderStatusDiv = document.getElementById('exchangePage')
          document.getElementById('orderStatusPage').classList.remove('active')
          loaderPage.classList.remove('active')
          orderStatusDiv.classList.add('active')
          exchangeXmrDiv.classList.add('active')
          backBtn.innerHTML = '<div class="base-button hoverable-cell utility grey-menu-button disableable left-back-button" style="cursor: default; -webkit-app-region: no-drag; position: absolute; opacity: 1; left: 0px;"></div>'
          const localOrderTimer = setInterval(() => {
            if (orderStatusResponse.hasOwnProperty('expires_at')) {
              orderStatusResponse.orderTick++
              Utils.renderOrderStatus(orderStatusResponse)
              const expiryTime = orderStatusResponse.expires_at
              const secondsElement = document.getElementById('secondsRemaining')
              const minutesElement = document.getElementById('minutesRemaining')
              if (secondsElement !== null) {
                const minutesElement = document.getElementById('minutesRemaining')
                const timeRemaining = Utils.getTimeRemaining(expiryTime)
                minutesElement.innerHTML = timeRemaining.minutes
                if (timeRemaining.seconds <= 9) {
                  timeRemaining.seconds = '0' + timeRemaining.seconds
                }
                secondsElement.innerHTML = timeRemaining.seconds
                const xmr_dest_address_elem = document.getElementById('in_address')
                xmr_dest_address_elem.value = response.receiving_subaddress
              }

              if (orderStatusResponse.status == 'PAID' || orderStatusResponse.status == 'TIMED_OUT' ||
                                orderStatusResponse.status == 'DONE' || orderStatusResponse.status == 'FLAGGED_DESTINATION_ADDRESS' ||
                                orderStatusResponse.status == 'PAYMENT_FAILED' || orderStatusResponse.status == 'REJECTED' ||
                                orderStatusResponse.status == 'EXPIRED') {
                clearInterval(localOrderTimer)
              }
            }
            if ((orderStatusResponse.orderTick % 10) == 0) {
              ExchangeFunctions.getOrderStatus().then(function (response) {
                const elemArr = document.getElementsByClassName('provider-name')
                if (firstTick == true || elemArr[0].innerHTML == 'undefined') {
                  Utils.renderOrderStatus(response)
                  elemArr[0].innerHTML = response.provider_name
                  elemArr[1].innerHTML = response.provider_name
                  elemArr[2].innerHTML = response.provider_name

                  firstTick = false
                }
                let orderTick = orderStatusResponse.orderTick
                orderTick++
                response.orderTick = orderTick
                orderStatusResponse = response
              })
            }
          }, 1000)

          document.getElementById('orderStatusPage').classList.remove('active')
          loaderPage.classList.remove('active')
          orderStatusDiv.classList.add('active')
          exchangeXmrDiv.classList.add('active')
        }).catch((error) => {
          const errorDiv = document.createElement('div')
          errorDiv.classList.add('message-label')
          errorDiv.id = 'server-invalid'
          errorDiv.innerHTML = 'There was a problem communicating with the server. <br>If this problem keeps occurring, please contact support with a screenshot of the following error: <br>' + error
          serverValidation.appendChild(errorDiv)
          orderBtn.style.display = 'block'
          orderStarted = false
        })
      }).catch((error) => {
        const errorDiv = document.createElement('div')
        errorDiv.classList.add('message-label')
        errorDiv.id = 'server-invalid'
        errorDiv.innerHTML = 'There was a problem communicating with the server. <br>If this problem keeps occurring, please contact support with a screenshot of the following error: <br>' + error
        serverValidation.appendChild(errorDiv)
        orderBtn.style.display = 'block'
        orderStarted = false
      })
    } catch (Error) {
      console.log(Error)
    }
  })
})()
