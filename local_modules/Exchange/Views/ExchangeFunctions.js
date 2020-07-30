// const http = require('http');
// const net = require('net');
// const { URL } = require('url');
class ExchangeFunctions {
    static getRatesAndLimits() {
        return new Promise((resolve, reject) => {
            // https://xmr.to/api/v3/xmr2btc/order_parameter_query/

                // Simulating a long running function
                setTimeout(() => {
                    resolve({"price":"0.00731","upper_limit":"2","lower_limit":"0.001","ln_upper_limit":"0.025","ln_lower_limit":"0.0001","zero_conf_enabled":true,"zero_conf_max_amount":"0.1"})
                }, 200);
            });
    }
    static generateRatesTable(rates) {
        return new Promise((resolve, reject) => {
            console.log('hello in setPricingTable'); 
            let tbl = document.createElement('table');
            // row 0 is XMR => BTC
            let newRow = tbl.insertRow(0);
            let newCell = newRow.insertCell(0);
            let newText = document.createTextNode(`1 XMR buys you `);
            newCell.appendChild(newText);
            newCell = newRow.insertCell(1);
            newText = document.createTextNode(`${rates.price} BTC`);
            newCell.appendChild(newText);
            //let newRow2 = tbl.insertRow(0);
            newRow = tbl.insertRow(1);
            newCell = newRow.insertCell(0);
            newText = document.createTextNode(`Minimum BTC`);
            newCell.appendChild(newText);
            newCell = newRow.insertCell(1);
            newText = document.createTextNode(`${rates.lower_limit} BTC`);
            newCell.appendChild(newText);

            newRow = tbl.insertRow(1);
            newCell = newRow.insertCell(0);
            newText = document.createTextNode(`Max BTC`);
            newCell.appendChild(newText);
            newCell = newRow.insertCell(1);
            newText = document.createTextNode(`${rates.upper_limit} BTC`);
            newCell.appendChild(newText);



            resolve(tbl);
        })
    }
}

module.exports = ExchangeFunctions;
