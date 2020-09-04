(function() {

    const XMRcurrencyInput = document.getElementById('XMRcurrencyInput');
    const BTCcurrencyInput = document.getElementById('BTCcurrencyInput');
    const validationMessages = document.getElementById('validation-messages');

    let validate = require('bitcoin-address-validation');
    let Utils = require('../../Exchange/Javascript/ExchangeUtilityFunctions');
    let ExchangeFunctions = require('../../Exchange/Javascript/ExchangeFunctions');
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
    let backBtn = document.getElementsByClassName('nav-button-left-container')[0];    
    backBtn.style.display = "none";
    let addressValidation = document.getElementById('address-messages');

    ExchangeFunctions.getRatesAndLimits().then(() => {
        loaderPage.classList.remove('active');
        exchangePage.classList.add("active");
    });



    btcAddressInput.addEventListener('input', Listeners.BTCAddressInputListener);

    XMRcurrencyInput.addEventListener('keydown', Listeners.XMRCurrencyInputKeydownListener);

    walletSelector.addEventListener('click', Listeners.walletSelectorClickListener);


    BTCcurrencyInput.addEventListener('keydown', Listeners.BTCCurrencyKeydownListener);

    XMRcurrencyInput.addEventListener('keyup', function(event) {
        validationMessages.innerHTML = '';
        Listeners.xmrBalanceChecks(ExchangeFunctions.currentRates);
    });
    

    function clearCurrencies() {
        XMRcurrencyInput.value = "";
        BTCcurrencyInput.value = "";
    }

    BTCcurrencyInput.addEventListener('keyup', Listeners.BTCCurrencyInput);

    backBtn.addEventListener('click', backButtonClickListener);


    
    orderBtn.addEventListener('click', function() {
        let validationError = false;
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
        orderBtn.style.display = "none";
        orderStarted = true;
        backBtn.style.display = "block";
        loaderPage.classList.add('active');
        let amount = document.getElementById('XMRcurrencyInput').value;
        let amount_currency = 'XMR';
        let btc_dest_address = document.getElementById('btcAddress').value;
        let test = ExchangeFunctions.createNewOrder(amount, amount_currency, btc_dest_address).then((response) => {
            order = response.data;
            orderCreated = true;
        }).then((response) => {
            backBtn.innerHTML = `<div class="base-button hoverable-cell utility grey-menu-button disableable left-back-button" style="cursor: default; -webkit-app-region: no-drag; position: absolute; opacity: 1; left: 0px;"></div>`;
            orderTimer = setInterval(() => {
                ExchangeFunctions.getOrderStatus().then(function (response) {
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
                        let xmr_dest_address_elem = document.getElementById('XMRtoAddress');
                        xmr_dest_address_elem.value = response.receiving_subaddress; 
                    }
                })
            }, 1000);
            document.getElementById("orderStatusPage").classList.remove('active');
            let orderStatusDiv = document.getElementById("exchangePage");
            loaderPage.classList.remove('active');
            orderStatusDiv.classList.add('active');
            exchangeXmrDiv.classList.add('active');
        }).catch((error) => {
            if (error.response) {
                let errorDiv = document.createElement("div");
                errorDiv.innerText = "An unexpected error occurred";
                validationMessages.appendChild(errorDiv);
            } else if (error.request) {
                let errorDiv = document.createElement("div");
                errorDiv.innerText = "XMR.to's server is unreachable. Please try again shortly.";
                validationMessages.appendChild(errorDiv);
            } else {
                let errorDiv = document.createElement("div");
                errorDiv.innerText = error.message;
                validationMessages.appendChild(errorDiv);
            }
        });
    });
})()