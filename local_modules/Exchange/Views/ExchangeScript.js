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
        
            
        });

    });
    console.log(orderBtn);
    
    setInterval(() => {
        if (ExchangeFunctions.order == undefined && ExchangeFunctions.order.state == undefined) {
            let data = ExchangeFunctions.getOrderStatus(order.uuid).then((response) => {
                console.log('order');
                console.log(response);
            });
        }
        console.log(ExchangeFunctions.order.state);
    }, 2500);
    
    let checkOrderBtn = document.getElementById("check-order-status");
    let checkOrderResult = checkOrderBtn.addEventListener('click', function(){
        console.log(order);
        console.log(this);
        console.log('here');
        let html = `
            <div>
                <div><h2>Order Status</h2></div>
                <table>
                    <tr class=""><td>Order Status:</td><td>${order.state}</td></tr>
                    <tr class=""><td>UUID:</td><td>${order.uuid}</td></tr>
                    <tr class=""><td>BTC Amount:</td><td>${order.btc_amount}</td></tr>
                    <tr class=""><td>BTC Destination Address</td><td>${order.btc_dest_address}</td></div>
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