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

    let orderBtn = document.getElementById("order-button");
    orderBtn.addEventListener('click', function() {
        console.log('clicked');

    });
    console.log(orderBtn);
    
})()