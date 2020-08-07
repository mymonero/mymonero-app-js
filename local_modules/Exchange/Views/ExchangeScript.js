(function() {
    console.log('IIME executing');
    console.log(document);
    let ExchangeFunctions = require('../../Exchange/Views/ExchangeFunctions');
    let loaderPage = document.getElementById('loader');

    setTimeout(() => {
        
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
        console.log('this is table');
        console.log(table);
    });

    const XMRcurrencyInput = document.getElementById('XMRcurrencyInput');
    const BTCcurrencyInput = document.getElementById('BTCcurrencyInput');
    const validationMessages = document.getElementById('validation-messages');

    XMRcurrencyInput.addEventListener('keyup', function() {
        validationMessages.innerHTML = '';
        let BTCToReceive = XMRcurrencyInput.value * ExchangeFunctions.currentRates.price;
        if (BTCToReceive > ExchangeFunctions.currentRates.upper_limit) {
            let error = document.createElement('div');
            error.id = 'xmrexceeded';
            error.innerHTML = `You cannot exchange more than ${ExchangeFunctions.currentRates.maximum_xmr}.`;
            validationMessages.appendChild(error);
        }
        if (BTCToReceive < ExchangeFunctions.currentRates.lower_limit) {
            let error = document.createElement('div');
            error.id = 'xmrtoolow';
            error.innerHTML = `You cannot exchange less than ${ExchangeFunctions.currentRates.minimum_xmr}.`;
            validationMessages.appendChild(error);
        }
        BTCcurrencyInput.value = BTCToReceive;
    });

    BTCcurrencyInput.addEventListener('keyup', function() {
        validationMessages.innerHTML = '';
        let XMRtoReceive = BTCcurrencyInput.value / ExchangeFunctions.currentRates.price;
        if (XMRtoReceive > ExchangeFunctions.currentRates.upper_limit) {
            let error = document.createElement('div');
            error.id = 'xmrexceeded';
            error.innerHTML = `You cannot exchange more than ${ExchangeFunctions.currentRates.upper_limit}.`;
            validationMessages.appendChild(error);
        }
        if (XMRtoReceive < ExchangeFunctions.currentRates.lower_limit) {
            let error = document.createElement('div');
            error.id = 'xmrtoolow';
            error.innerHTML = `You cannot exchange less than ${ExchangeFunctions.currentRates.lower_limit}.`;
            validationMessages.appendChild(error);
        }
        console.log(XMRtoReceive);
        XMRcurrencyInput.value = XMRtoReceive;
    });


    let order = {};
    let orderBtn = document.getElementById("order-button");
    orderBtn.addEventListener('click', function() {
        console.log('clicked');
        console.log(document.getElementById('currencyInput'));
        console.log(document.getElementById('currencyInput').value);
        
        let amount = document.getElementById('currencyInput').value;
        let amount_currency = 'XMR';
        let btc_dest_address = document.getElementById('btcAddress').value;
        let test = ExchangeFunctions.createNewOrder(amount, amount_currency, btc_dest_address).then((response) => {
            console.log(response);
            order = response.data;
            console.log(order);
            return order;
        }).then((order) => {
            console.log(order);
            console.log('preorder');
            toggleLoader.classList.remove('active');
            let orderDiv = document.getElementById("orderStatusPage");
            orderDiv.classList.add('active');
        });
    });
    console.log(orderBtn);
    
    let checkOrderBtn = document.getElementById("check-order-status");
    let checkOrderResult = checkOrderBtn.addEventListener('click', function(){
        console.log(order);
        console.log(this);
        console.log('here');
        let html = `
            <div>
                <div><h2>Order Status</h2></div>
                <table>
                    <tr class=""><td>Order Status:</td><td>${ExchangeFunctions.order.state}</td></tr>
                    <tr class=""><td>UUID:</td><td>${ExchangeFunctions.uuid}</td></tr>
                    <tr class=""><td>BTC Amount:</td><td>${ExchangeFunctions.btc_amount}</td></tr>
                    <tr class=""><td>BTC Destination Address</td><td>${ExchangeFunctions.btc_dest_address}</td></div>
                </table>
            </div>;
        `;
        let orderParams = ExchangeFunctions.getOrderStatus().then((response) => {
            console.log(response);
        });
        document.getElementById('order-status').innerHTML = html;

        return order;
    });
})()