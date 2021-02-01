(function() {

    const XMRcurrencyInput = document.getElementById('XMRcurrencyInput');
    const BTCcurrencyInput = document.getElementById('BTCcurrencyInput');
    const validationMessages = document.getElementById('validation-messages');
    const shell = require('electron').shell;
    let validate = require('bitcoin-address-validation');
    let Utils = require('../../Exchange/Javascript/ExchangeUtilityFunctions');
    let ExchangeLibrary = require('mymonero-exchange');
    let ExchangeFunctions = new ExchangeLibrary();
    let Listeners = require('../../Exchange/Javascript/ExchangeListeners');
    let loaderPage = document.getElementById('loader');
    let order = {};
    let exchangePage = document.getElementById('orderStatusPage');
    let orderBtn = document.getElementById("order-button");
    let orderTimerInterval = {};
    let orderStatusInterval = {};
    let orderStatusResponse = {};
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

        let indacoinDiv = document.getElementById("indacoin");
        let localmoneroDiv = document.getElementById("localmonero");

        function openClickableLink() {
            const self = this;
            let referrer_id = self.getAttribute("referrer_id");
            let url = self.getAttribute("url");
            let paramStr = self.getAttribute("param_str");
            if (referrer_id.length > 0) {
                console.log("Got a referrer -- generate custom URL");
                let urlToOpen = url + "?" + paramStr + "=" + referrer_id;
                shell.openExternal(urlToOpen);
            } else {
                console.log("No referrer");
                shell.openExternal("https://localmonero.co");
            }
        }
        ExchangeFunctions.initialiseExchangeConfiguration().then((response) => {
            let localmoneroAnchor = document.getElementById('localmonero-anchor');
            localmoneroAnchor.setAttribute("referrer_id", response.data.referrer_info.localmonero.referrer_id);
            localmoneroAnchor.setAttribute("url", "https://localmonero.co");
            localmoneroAnchor.setAttribute("param_str", "rc");
            if (response.data.referrer_info.localmonero.enabled === true) {
                localmoneroDiv.style.display = "block";
                localmoneroAnchor.addEventListener('click', openClickableLink);
            }
        }).catch((error) => {
            let localmoneroAnchor = document.getElementById('localmonero-anchor');
            localmoneroAnchor.setAttribute("referrer_id", "h2t1");
            localmoneroAnchor.setAttribute("url", "https://localmonero.co");
            localmoneroAnchor.setAttribute("param_str", "rc");
            localmoneroDiv.style.display = "block";
            localmoneroAnchor.addEventListener('click', openClickableLink);
        });


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
        orderStatusPage.classList.remove('active');
        let exchangePage = document.getElementById('exchangePage');
        exchangePage.classList.add('active');
        viewOrderBtn.style.display = "none";
        backBtn.style.display = "block";
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
        
        loaderPage.classList.add('active');
        let orderStatusResponse = { orderTick: 0 };
        let out_amount = document.getElementById('BTCcurrencyInput').value;
        let in_currency = 'XMR';
        let out_currency = 'BTC';
        let firstTick = true;
        try {
            let offer = ExchangeFunctions.getOfferWithOutAmount(in_currency, out_currency, out_amount).then((response) => {
                let selectedWallet = document.getElementById('selected-wallet');
                ExchangeFunctions.createOrder(btc_dest_address, selectedWallet.dataset.walletpublicaddress).then((response) => {
                    let orderStatusDiv = document.getElementById("exchangePage");
                    document.getElementById("orderStatusPage").classList.remove('active');
                    loaderPage.classList.remove('active');
                    orderStatusDiv.classList.add('active');
                    exchangeXmrDiv.classList.add('active');
                    backBtn.innerHTML = `<div class="base-button hoverable-cell utility grey-menu-button disableable left-back-button" style="cursor: default; -webkit-app-region: no-drag; position: absolute; opacity: 1; left: 0px;"></div>`;
                    let localOrderTimer = setInterval(() => {
                        if (orderStatusResponse.hasOwnProperty('expires_at')) {
                            orderStatusResponse.orderTick++;
                            Utils.renderOrderStatus(orderStatusResponse);
                            let expiryTime = orderStatusResponse.expires_at;
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

                            if (orderStatusResponse.status == "PAID" || orderStatusResponse.status == "TIMED_OUT"
                                || orderStatusResponse.status == "DONE" || orderStatusResponse.status == "FLAGGED_DESTINATION_ADDRESS"
                                || orderStatusResponse.status == "PAYMENT_FAILED" || orderStatusResponse.status == "REJECTED" 
                                || orderStatusResponse.status == "EXPIRED") 
                                {
                                    clearInterval(localOrderTimer);
                                }
                        }
                        if ((orderStatusResponse.orderTick % 10) == 0) {
                            ExchangeFunctions.getOrderStatus().then(function (response) {
                                let elemArr = document.getElementsByClassName("provider-name");
                                if (firstTick == true || elemArr[0].innerHTML == 'undefined') {
                                    Utils.renderOrderStatus(response);
                                    elemArr[0].innerHTML = response.provider_name;
                                    elemArr[1].innerHTML = response.provider_name;
                                    elemArr[2].innerHTML = response.provider_name;
                                    
                                    firstTick = false;
                                }
                                let orderTick = orderStatusResponse.orderTick;
                                orderTick++;
                                response.orderTick = orderTick;
                                orderStatusResponse = response;
                            })
                        }
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
    })
})()
