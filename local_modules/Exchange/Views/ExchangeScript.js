(function() {

    const XMRcurrencyInput = document.getElementById('XMRcurrencyInput');
    const BTCcurrencyInput = document.getElementById('BTCcurrencyInput');
    const validationMessages = document.getElementById('validation-messages');

    let validate = require('bitcoin-address-validation');
    let Utils = require('../../Exchange/Javascript/ExchangeUtilityFunctions');
    let ExchangeLibrary = require('mymonero-exchange');
    let ExchangeFunctions = new ExchangeLibrary();
    let Listeners = require('../../Exchange/Javascript/ExchangeListeners');
    let loaderPage = document.getElementById('loader');
    let order = {};
    let exchangePage = document.getElementById('orderStatusPage');
    let orderBtn = document.getElementById("order-button");
    let orderTimer = {};
    let btcAddressInput = document.getElementById("btcAddress");
    let walletSelector = document.getElementById('wallet-selector');
    let walletOptions = document.getElementById('wallet-options');
    let exchangeXmrDiv = document.getElementById('exchange-xmr');
    let orderStarted = false;
    let orderCreated = false;
    let orderStatusPage = document.getElementById("orderStatusPage");
    let backBtn = document.getElementsByClassName('nav-button-left-container')[0];    
    backBtn.style.display = "none";
    let addressValidation = document.getElementById('address-messages');
    let serverValidation = document.getElementById('server-messages');
    let explanatoryMessage = document.getElementById('explanatory-message');
    const selectedWallet = document.getElementById('selected-wallet');
    const serverRatesValidation = document.getElementById('server-rates-messages');

    Listeners.BTCAddressInputListener();

    function getRates() {
        serverRatesValidation.innerHTML = "";
        let retry = document.getElementById('retry-rates');
        let errorDiv = document.getElementById('retry-error');
        if (retry !== null) {
            retry.classList.add('hidden');
            errorDiv.classList.add('hidden');
        }
        ExchangeFunctions.getRatesAndLimits().then(() => {
            loaderPage.classList.remove('active');
            exchangePage.classList.add("active");
        }).catch((error) => {
            if (retry !== null) {
                retry.classList.remove('hidden');
                errorDiv.classList.remove('hidden');
            } else {            
                let errorDiv = document.createElement('div');
                errorDiv.innerText = "There was a problem with retrieving rates from the server. Please click the 'Retry' button to try connect again. The error message was: " + error.message;
                errorDiv.id = "retry-error";
                errorDiv.classList.add('message-label');
                let retryBtn = document.createElement('div');
                retryBtn.id = "retry-rates";
                retryBtn.classList.add('base-button');
                retryBtn.classList.add('hoverable-cell'); 
                retryBtn.classList.add('navigation-blue-button-enabled');
                retryBtn.classList.add('action');
                retryBtn.innerHTML = "Retry";
                retryBtn.addEventListener('click', getRates);
                explanatoryMessage.appendChild(errorDiv);
                explanatoryMessage.appendChild(retryBtn);
            }
        });
    }

    getRates();


    btcAddressInput.addEventListener('input', Listeners.BTCAddressInputListener);

    XMRcurrencyInput.addEventListener('keydown', Listeners.XMRCurrencyInputKeydownListener);

    walletSelector.addEventListener('click', Listeners.walletSelectorClickListener);


    BTCcurrencyInput.addEventListener('keydown', Listeners.BTCCurrencyKeydownListener);

    XMRcurrencyInput.addEventListener('keyup', function(event) {
        validationMessages.innerHTML = '';
        if (XMRcurrencyInput.value.length > 0) {
            Listeners.xmrBalanceChecks(ExchangeFunctions);            
        }
    });
    

    function clearCurrencies() {
        XMRcurrencyInput.value = "";
        BTCcurrencyInput.value = "";
    }

    BTCcurrencyInput.addEventListener('keyup', function(event) {
        validationMessages.innerHTML = '';
        if (BTCcurrencyInput.value.length > 0) {
            Listeners.btcBalanceChecks(ExchangeFunctions);            
        }
    });

     

    backBtn.addEventListener('click', backButtonClickListener);


    let viewOrderBtn = document.createElement('div');
    viewOrderBtn.id = "view-order";
    viewOrderBtn.innerHTML = "View Order";
    viewOrderBtn.addEventListener('click', function() {
        orderStatusPage.classList.add('active');
        orderStatusPage.classList.remove('active');
        let exchangePage = document.getElementById('exchangePage');
        exchangePage.classList.add('active');
        viewOrderBtn.style.display = "none";
    });


    let nav_right = document.getElementsByClassName('nav-button-right-container')[0];
    nav_right.appendChild(viewOrderBtn);

    orderBtn.addEventListener('click', function() {
        let validationError = false;
        serverValidation.innerHTML = "";
        if (orderStarted == true) {
            return;
        } 
        if (validationMessages.firstChild !== null) {
            validationMessages.firstChild.style.color = "#ff0000";
            validationError = true;
            return;
        }
        if (addressValidation.firstChild !== null) {
            addressValidation.firstChild.style.color = "#ff0000";
            validationError = true;
            return;
        }
        let btc_dest_address = document.getElementById('btcAddress').value;
        
        orderBtn.style.display = "none";
        orderStarted = true;
        backBtn.style.display = "block";
        loaderPage.classList.add('active');

        let out_amount = document.getElementById('BTCcurrencyInput').value;
        let in_currency = 'XMR';
        let out_currency = 'BTC';
        try {
            let offer = ExchangeFunctions.getOfferWithOutAmount(in_currency, out_currency, out_amount).then((error, response) => {
                console.log(error);
                console.log(response);
                console.log(ExchangeFunctions.offer);
            }).then((error, response) => {
                let selectedWallet = document.getElementById('selected-wallet');
                console.log(ExchangeFunctions);
                console.log(btc_dest_address);
                console.log(selectedWallet);
                ExchangeFunctions.createOrder(btc_dest_address, selectedWallet.dataset.walletpublicaddress).then((error, response) => {
                    let orderStatusDiv = document.getElementById("exchangePage");
                    document.getElementById("orderStatusPage").classList.remove('active');
                    loaderPage.classList.remove('active');
                    orderStatusDiv.classList.add('active');
                    exchangeXmrDiv.classList.add('active');
                    backBtn.innerHTML = `<div class="base-button hoverable-cell utility grey-menu-button disableable left-back-button" style="cursor: default; -webkit-app-region: no-drag; position: absolute; opacity: 1; left: 0px;"></div>`;
                    orderTimer = setInterval(() => {
                        ExchangeFunctions.getOrderStatus().then(function (response) {
                            console.log(response);
                            Utils.renderOrderStatus(response);
                            let expiryTime = response.expires_at;
                            let secondsElement = document.getElementById('secondsRemaining');
                            let minutesElement = document.getElementById('minutesRemaining');
                            if (secondsElement !== null) {
                                
                                let minutesElement = document.getElementById('minutesRemaining');
                                let timeRemaining = Utils.getTimeRemaining(expiryTime);
                                minutesElement.innerHTML = timeRemaining.minutes;
                                if (timeRemaining.seconds <= 9) {
                                    timeRemaining.seconds = "0" + timeRemaining.seconds;
                                }
                                secondsElement.innerHTML = timeRemaining.seconds;
                                let xmr_dest_address_elem = document.getElementById('in_address');
                                xmr_dest_address_elem.value = response.receiving_subaddress; 
                            }
                        })
                    }, 1000);
                    document.getElementById("orderStatusPage").classList.remove('active');
                    loaderPage.classList.remove('active');
                    orderStatusDiv.classList.add('active');
                    exchangeXmrDiv.classList.add('active');
                }).catch((error) => {
                    let errorDiv = document.createElement('div');
                    errorDiv.classList.add('message-label');
                    errorDiv.id = 'server-invalid';
                    errorDiv.innerHTML = `There was a problem communicating with the server. <br>If this problem keeps occurring, please contact support with a screenshot of the following error: <br>` + error;
                    serverValidation.appendChild(errorDiv);
                    orderBtn.style.display = "block";
                    orderStarted = false;
                })
            }).catch((error) => {
                let errorDiv = document.createElement('div');
                errorDiv.classList.add('message-label');
                errorDiv.id = 'server-invalid';
                errorDiv.innerHTML = `There was a problem communicating with the server. <br>If this problem keeps occurring, please contact support with a screenshot of the following error: <br>` + error;
                serverValidation.appendChild(errorDiv);
                orderBtn.style.display = "block";
                orderStarted = false;
            });
        } catch (Error) {
            console.log(Error);
        }
    });
})()