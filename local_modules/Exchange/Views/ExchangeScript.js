(function() {

    let cmt = "";

    function getTimeRemaining(endtime){
        let total = Date.parse(endtime) - Date.parse(new Date());
        let seconds = Math.floor( (total/1000) % 60 );
        let minutes = Math.floor( (total/1000/60) % 60 );
        let hours = Math.floor( (total/(1000*60*60)) % 24 );
        let days = Math.floor( total/(1000*60*60*24) );
        
        if (total < 0) {
            seconds = 0;
            minutes = 0;
        }

        return {
          total,
          days,
          hours,
          minutes,
          seconds
        };
    }

    function isValidBase10Decimal(number) {
        console.log(number);
        let str = number.toString();
        console.log(str);
        let strArr = str.split('.');
        if (strArr.size > 1 && typeof(strArr) == Array) {
            return false;
        }
        for (let i = 0; i < 2; i++) {
            if (isNaN(parseInt(strArr[i]))) {
                return false;
            }
        }
        console.log(strArr[1].length);
        console.log(strArr[1]);
        if (strArr.size > 1) {
            if (strArr[1].length == 0) {
                return false;
            }
        }
        return true;
    }

    console.log('IIME executing');
    console.log(document);
    let ExchangeFunctions = require('../../Exchange/Views/ExchangeFunctions');
    let loaderPage = document.getElementById('loader');

    setTimeout(() => {
        cmt = "TODO: Refactor this to toggle loader classes after retrieving data from XMR.to, not on 1000 ms";
        cmt = "TODO: Set default value for XMR to 1, and BTC equivalent amount for input according to rates";
        loaderPage.classList.remove("active");
        let exchangePage = document.getElementById('exchangePage');
        exchangePage.classList.add("active");
    }, 1000);

    const rateObj = ExchangeFunctions.getRatesAndLimits().then((result) => {
        console.log(result); 
        let elem = document.getElementById('exchangeRate');
        console.log('try create table');
        let table = ExchangeFunctions.generateRatesTable(result).then((table) => {
            console.log(table);
            elem.appendChild(table);
        });
    });

    const XMRcurrencyInput = document.getElementById('XMRcurrencyInput');
    const BTCcurrencyInput = document.getElementById('BTCcurrencyInput');
    const validationMessages = document.getElementById('validation-messages');

    function checkDecimals(value, decimals) {
        let str = value.toString();
        let strArr = str.split('.');
        console.log('checking decimal places');
        if (strArr.length > 1) {
            console.log(strArr[1].length);
            console.log(strArr[1].length >= decimals);
            if (strArr[1].length >= decimals) {
                return false;
            }
        }
        return true;
    }

    function renderOrderStatus(order) {
        console.log(order);
        let idArr = [
            "btc_amount",
            "btc_amount_partial",
            "btc_dest_address",
            "btc_num_confirmations_threshold",
            "created_at",
            "expires_at",
            "incoming_amount_total",
            "incoming_num_confirmations_remaining",
            "incoming_price_btc",
            "receiving_subaddress",
            "recommended_mixin",
            "remaining_amount_incoming",
            "seconds_till_timeout",
            "state",
            "uses_lightning",
            "uuid"
        ];

        idArr.forEach((item, index) => {
            console.log(item);
            console.log();
            console.log(order);
            document.getElementById(item).innerHTML = order[item];
        });
        let cmt = "TODO: we need to display part payment details once we get it back. Not sure what that looks like yet";
    }

    XMRcurrencyInput.addEventListener('keydown', function(event) {
        if ( (event.which !== 110) && (event.which < 48 || event.which > 57) && (event.which !== 8) )  {
            console.log(event);
            console.log(event.which !== 110);
            console.log(event.which < 48 || event.which > 57);
            console.log(event.which !== 8);
            event.preventDefault();
            return;
        }
        cmt = "We check here to ensure that we do not exceed 12 decimal places (XMR limit)";
        if (!checkDecimals(XMRcurrencyInput.value, 12)) {
            event.preventDefault();
            return;
        }
        console.log(isValidBase10Decimal(XMRcurrencyInput.value));
        validationMessages.innerHTML = '';
        let BTCToReceive = XMRcurrencyInput.value * ExchangeFunctions.currentRates.price;
        if (BTCToReceive.toFixed(8) > ExchangeFunctions.currentRates.upper_limit) {
            let error = document.createElement('div');
            error.id = 'xmrexceeded';
            error.innerHTML = `You cannot exchange more than ${ExchangeFunctions.currentRates.maximum_xmr}.`;
            validationMessages.appendChild(error);
        }
        if (BTCToReceive.toFixed(8) < ExchangeFunctions.currentRates.lower_limit) {
            let error = document.createElement('div');
            error.id = 'xmrtoolow';
            error.innerHTML = `You cannot exchange less than ${ExchangeFunctions.currentRates.minimum_xmr}.`;
            validationMessages.appendChild(error);
        }
        console.log(typeof(BTCToReceive));

        BTCcurrencyInput.value = BTCToReceive.toFixed(8);
    });

    

    BTCcurrencyInput.addEventListener('keydown', function(event) {
        if ( (event.which !== 110) && (event.which < 48 || event.which > 57) && (event.which !== 8) && (event.which !== 93) )  {
            console.log('preventing event');
            console.log((event.which !== 110) || (event.which < 48 || event.which > 57));
            console.log(event.which == 110);
            console.log(event.which < 48);
            console.log(event.which > 57);
            console.log(event);
            event.preventDefault();
            return;
        }
        if (!checkDecimals(BTCcurrencyInput.value, 8)) {
            event.preventDefault();
            return;
        }
        cmt = "We check here to ensure that we do not exceed 8 decimal places (XMR limit)";
        console.log(checkDecimals(BTCcurrencyInput.value, 8));

        validationMessages.innerHTML = '';
        let XMRtoReceive = BTCcurrencyInput.value / ExchangeFunctions.currentRates.price;
        if (XMRtoReceive.toFixed(12) > ExchangeFunctions.currentRates.upper_limit) {
            let error = document.createElement('div');
            error.id = 'xmrexceeded';
            error.innerHTML = `You cannot exchange more than ${ExchangeFunctions.currentRates.upper_limit}.`;
            validationMessages.appendChild(error);
        }
        if (XMRtoReceive.toFixed(12) < ExchangeFunctions.currentRates.lower_limit) {
            let error = document.createElement('div');
            error.id = 'xmrtoolow';
            error.innerHTML = `You cannot exchange less than ${ExchangeFunctions.currentRates.lower_limit}.`;
            validationMessages.appendChild(error);
        }
        XMRcurrencyInput.value = XMRtoReceive.toFixed(12);
    });

    let order = {};
    let orderBtn = document.getElementById("order-button");
    let orderTimer = {};

    orderBtn.addEventListener('click', function() {
        loaderPage.classList.add('active');
        let amount = document.getElementById('XMRcurrencyInput').value;
        let amount_currency = 'XMR';
        let btc_dest_address = document.getElementById('btcAddress').value;
        let test = ExchangeFunctions.createNewOrder(amount, amount_currency, btc_dest_address).then((response) => {
            order = response.data;
            console.log(order);
        }).then(() => {
            let cmt = "remove loader from view";
            orderTimer = setInterval(() => {
                ExchangeFunctions.getOrderStatus().then(function (response) {
                console.log(renderOrderStatus(response));
                let expiryTime = response.expires_at;
                let secondsElement = document.getElementById('secondsRemaining');
                let minutesElement = document.getElementById('minutesRemaining');
                
                    let timeRemaining = getTimeRemaining(expiryTime);
                    minutesElement.innerHTML = timeRemaining.minutes;
                    if (timeRemaining.seconds <= 9) {
                        timeRemaining.seconds = "0" + timeRemaining.seconds;
                    }
                    secondsElement.innerHTML = timeRemaining.seconds;
                
                })
            }, 1000);
            document.getElementById("exchangePage").classList.remove('active');
            let orderStatusDiv = document.getElementById("orderStatusPage");
            loaderPage.classList.remove('active');
            orderStatusDiv.classList.add('active');
        });
    });
    
    
    
    let checkOrderBtn = document.getElementById("check-order-status");
    let checkOrderResult = checkOrderBtn.addEventListener('click', function(){
        console.log('checking order status');
        ExchangeFunctions.getOrderStatus().then(function (response) {
            console.log(renderOrderStatus(response));
            let expiryTime = response.expires_at;
            let secondsElement = document.getElementById('secondsRemaining');
            let minutesElement = document.getElementById('minutesRemaining');
            let updateTimeRemaining = setInterval(() => {
                let timeRemaining = getTimeRemaining(expiryTime);
                minutesElement.innerHTML = timeRemaining.minutes;
                if (timeRemaining.seconds <= 9) {
                    timeRemaining.seconds = "0" + timeRemaining.seconds;
                }
                secondsElement.innerHTML = timeRemaining.seconds;
            }, 1000);
        });
        
        let orderParams = ExchangeFunctions.getOrderStatus().then((response) => {
            console.log(response);
        });
        document.getElementById('order-status').innerHTML = html;

        return order;
    });
})()