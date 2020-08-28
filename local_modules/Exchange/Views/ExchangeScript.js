(function() {

    const XMRcurrencyInput = document.getElementById('XMRcurrencyInput');
    const BTCcurrencyInput = document.getElementById('BTCcurrencyInput');
    const validationMessages = document.getElementById('validation-messages');

    let cmt = "";
    let Utils = require('../../Exchange/Javascript/ExchangeUtililtyFunctions');
    let ExchangeFunctions = require('../../Exchange/Javascript/ExchangeFunctions');
    let loaderPage = document.getElementById('loader');
    let order = {};
    let exchangePage = document.getElementById('orderStatusPage');
    let orderBtn = document.getElementById("order-button");
    let orderTimer = {};
    let btcAddressInput = document.getElementById("btcAddress");
    let walletSelector = document.getElementById('wallet-selector');
    let walletOptions = document.getElementById('wallet-options');
    let exchangeXmrDiv = document.getElementById('exchange-xmr');
    let orderCreated = false;
    let backBtn = document.getElementsByClassName('nav-button-left-container')[0];    
    backBtn.style.display = "none";
    let addressValidation = document.getElementById('address-messages');

    ExchangeFunctions.getRatesAndLimits().then(() => {
        loaderPage.classList.remove('active');
        exchangePage.classList.add("active");
    });



    btcAddressInput.addEventListener('input', function() {
        console.log(Utils.validateBTCAddress(btcAddressInput.value));

        let div = document.getElementById('btc-invalid');
        if ((Utils.validateBTCAddress(btcAddressInput.value) == false) && div == null) {
            console.log('not valid BTC address');
            let error = document.createElement('div');
            error.classList.add('message-label');
            error.id = 'btc-invalid';
            error.innerHTML = `Your BTC address is not valid.`;
            addressValidation.appendChild(error);
        } else {
            console.log('yay valid!');
            if (!(div == null)) {
                div.remove();
            }
        }
    });

    XMRcurrencyInput.addEventListener('keydown', function(event) {
        if (event.which == 8) 
        return;
        if ( (event.which !== 110) 
            && (event.which <= 48 || event.which >= 57) 
            && (event.which <= 96 && event.which >= 105) 
            && (event.which !== 8) )  {
            event.preventDefault();
            return;
        }
        cmt = "We check here to ensure that we do not exceed 12 decimal places (XMR limit)";
        if (!Utils.checkDecimals(XMRcurrencyInput.value, 12)) {
            event.preventDefault();
            return;
        }
    });

    walletSelector.addEventListener('click', function(event) {
        let walletElement = document.getElementById('wallet-options');
        let selectedWallet = document.getElementById('selected-wallet');
        walletElement.classList.add('active');
        if (event.srcElement.parentElement.className.includes("optionCell")) {

            let dataAttributes = event.srcElement.parentElement.dataset;
            selectedWallet.dataset.walletlabel = dataAttributes.walletlabel;
            selectedWallet.dataset.walletBalance = dataAttributes.walletbalance;
            selectedWallet.dataset.swatch = dataAttributes.swatch;
            selectedWallet.dataset.walletselected = true;
            let walletLabel = document.getElementById('selected-wallet-label'); 
            let walletBalance = document.getElementById('selected-wallet-balance'); 
            let walletIcon = document.getElementById('selected-wallet-icon'); 
            walletElement.classList.remove('active');
            walletIcon.style.backgroundImage = `url('../../../assets/img/wallet-${dataAttributes.swatch}@3x.png'`;
            walletLabel.innerText = dataAttributes.walletlabel;
            walletBalance.innerText = dataAttributes.walletbalance;
            let walletSelector = document.getElementById('wallet-selector');
            walletSelector.dataset.walletchosen = true;
            clearCurrencies();
            console.log(walletElement);
        }
        if (event.srcElement.parentElement.className.includes("selectionDisplayCellView")) {
            console.log('we picked selectionDisplayCellView');
            console.log(event.srcElement.parentElement.dataset);
            walletElement.classList.add('active');
        }
        if (event.srcElement == 'div.hoverable-cell.utility.selectionDisplayCellView') {
            
        } 
    });



    BTCcurrencyInput.addEventListener('keydown', function(event) {
        if (event.which == 8) 
            return;

        if ( (event.which !== 110) 
            && (event.which <= 48 || event.which >= 57) 
            && (event.which <= 96 && event.which >= 105) 
            && (event.which !== 8) )  {
            event.preventDefault();
            return;
        }
        if (!Utils.checkDecimals(BTCcurrencyInput.value, 8)) {
            event.preventDefault();
            return;
        }
    });


    function xmrBalanceChecks() {
        let selectedWallet = document.getElementById('selected-wallet');
        let tx_feeElem = document.getElementById('tx-fee');
        let tx_fee = tx_feeElem.dataset.txFee;
        let tx_fee_double = parseFloat(tx_fee);
        let walletMaxSpendDouble = parseFloat(selectedWallet.dataset.walletbalance);
        let walletMaxSpend = walletMaxSpendDouble - tx_fee;
        let BTCToReceive = XMRcurrencyInput.value * ExchangeFunctions.currentRates.price;
        let XMRbalance = parseFloat(XMRcurrencyInput.value);
        if (walletMaxSpend - XMRbalance < 0) {
            console.log('not enough');
            let error = document.createElement('div');
            error.classList.add('message-label');
            error.id = 'xmrexceeded';
            error.innerHTML = `You cannot exchange more than ${walletMaxSpend} XMR`;
            validationMessages.appendChild(error);
        }
        if (BTCToReceive.toFixed(8) > ExchangeFunctions.currentRates.upper_limit) {
            let error = document.createElement('div');
            error.classList.add('message-label');
            error.id = 'xmrexceeded';
            error.innerHTML = `You cannot exchange more than ${ExchangeFunctions.currentRates.maximum_xmr.toFixed(12)} XMR`;
            validationMessages.appendChild(error);
        }
        if (BTCToReceive.toFixed(8) < ExchangeFunctions.currentRates.lower_limit) {
            let error = document.createElement('div');
            error.classList.add('message-label');
            error.id = 'xmrtoolow';
            error.innerHTML = `You cannot exchange less than ${ExchangeFunctions.currentRates.minimum_xmr.toFixed(12)} XMR.`;
            validationMessages.appendChild(error);
        }
        BTCcurrencyInput.value = BTCToReceive.toFixed(8);
    }

    XMRcurrencyInput.addEventListener('keyup', function(event) {
        validationMessages.innerHTML = '';
        xmrBalanceChecks();
    });
    

    function clearCurrencies() {
        XMRcurrencyInput.value = "";
        BTCcurrencyInput.value = "";
    }

    BTCcurrencyInput.addEventListener('keyup', function(event) {
        validationMessages.innerHTML = '';
        let XMRtoReceive = BTCcurrencyInput.value / ExchangeFunctions.currentRates.price;
        if (XMRtoReceive.toFixed(12) > ExchangeFunctions.currentRates.upper_limit) {
            let error = document.createElement('div');
            error.id = 'xmrexceeded';
            error.classList.add('message-label');
            console.log(ExchangeFunctions.currentRates);
            let btc_amount = parseFloat(ExchangeFunctions.currentRates.upper_limit);
            error.innerHTML = `You cannot exchange more than ${btc_amount} BTC.`;
            validationMessages.appendChild(error);
        }
        if (XMRtoReceive.toFixed(12) < ExchangeFunctions.currentRates.lower_limit) {
            let error = document.createElement('div');
            error.id = 'xmrtoolow';
            error.classList.add('message-label');
            console.log(ExchangeFunctions.currentRates);
            let btc_amount = parseFloat(ExchangeFunctions.currentRates.lower_limit);
            error.innerHTML = `You cannot exchange less than ${btc_amount} BTC.`;
            validationMessages.appendChild(error);
        }
        XMRcurrencyInput.value = XMRtoReceive.toFixed(12);
    });

    backBtn.addEventListener('click', function() {
        orderCreated = false;
        document.getElementById("orderStatusPage").classList.add('active');
        backBtn.style.display = "none";
        let orderStatusDiv = document.getElementById("exchangePage");
        loaderPage.classList.remove('active');
        orderStatusDiv.classList.remove('active');
        exchangeXmrDiv.classList.remove('active');
    });


    
    orderBtn.addEventListener('click', function() {
        if (orderCreated == true) {
            return;
        } 
        backBtn.style.display = "block";
        loaderPage.classList.add('active');
        let amount = document.getElementById('XMRcurrencyInput').value;
        let amount_currency = 'XMR';
        let btc_dest_address = document.getElementById('btcAddress').value;
            let test = ExchangeFunctions.createNewOrder(amount, amount_currency, btc_dest_address).then((response) => {
                order = response.data;
            
        }).then((response) => {
            console.log(order);
            console.log(response, 'inside update');
            backBtn.innerHTML = `<div class="base-button hoverable-cell utility grey-menu-button disableable left-back-button" style="cursor: default; -webkit-app-region: no-drag; position: absolute; opacity: 1; left: 0px;"></div>`;
            let cmt = "remove loader from view";
            orderTimer = setInterval(() => {
                ExchangeFunctions.getOrderStatus().then(function (response) {
                    Utils.renderOrderStatus(response);
                    let expiryTime = response.expires_at;
                    let secondsElement = document.getElementById('secondsRemaining');
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
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
            } else if (error.request) {
                    validationMessages.appendChild('XMR.to is not reachable');
                console.log(error.request);
            } else {
                console.log('Error', error.message);
            }
        });
    });
})()