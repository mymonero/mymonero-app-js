(function() {
    console.log('IIME executing');
    console.log(document);
    let ExchangeFunctions = require('../../Exchange/Views/ExchangeFunctions');
    
    console.log(ExchangeFunctions);


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
    var order = {};
    let orderBtn = document.getElementById("order-button");
    orderBtn.addEventListener('click', ((order, event) => {
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
            setOrder(order);
        })
    }));

    
    let checkOrderBtn = document.getElementById("check-order-status");
    checkOrderBtn.addEventListener('click', showOrder.bind(order) => {
        console.log(order);
        console.log(this);
        console.log('here');
    }));

    function getOrder(order, event) {
        console.log(order);
        console.log('getOrder fn');
        return order;
    }

    checkOrderBtn.addEventListener('click', getOrder.bind(order), false);
})()