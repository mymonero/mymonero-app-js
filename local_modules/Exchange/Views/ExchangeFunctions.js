//const http = require('http');

// const { URL } = require('url');
// This module contains XMR.TO functionality. For more info, go to test.xmr.to
const axios = require("axios");

class ExchangeFunctions {

    constructor() {
        // this.apiUrl = "https://test.xmr.to/api/";
        // this.apiVersion = "v3";
        // this.currencyToExchange = "xmr2btc";
        
    }
    static getOrderStatus(order_id) {
        //Post UUID to https://xmr.to/api/v3/xmr2btc/order_status_query/
    }

    // We expect a return code 201, not a 200
    static createNewOrder(amount, amount_currency, btc_dest_address) {
        return new Promise((resolve, reject) => {
            let endpoint = `https://test.xmr.to/api/v3/xmr2btc/order_create/`;
            // https://xmr.to/api/v3/xmr2btc/order_parameter_query/
                let data = {
                    amount,  // float
                    amount_currency, // currency as string
                    btc_dest_address // dest address as string
                }

                axios.post('endpoint', date)
                  .then(function (response) {
                    console.log(response);
                  })
                  .catch(function (error) {
                    console.log(error);
                  });

                // post data to test.xmr.to
                // let result = setTimeout(() => {
                //     resolve({
                //         "state": "TO_BE_CREATED",
                //         "btc_amount": 0.01,
                //         "btc_dest_address": "2NBaUzuYqJvbThw77QVqq8NEXmkmDmSooy9",
                //         "uses_lightning": false,
                //         "uuid": "234567890121"
                //     })
                // }, 200).then((resolve, reject) => {
                //     console.log(resolve);
                //     return resolve;
                // });

        });
    }

    static getRatesAndLimits() {
        return new Promise((resolve, reject) => {
            let operation = "order_parameter_query";
            let endpoint = "https://test.xmr.to/api/v3/xmr2btc/order_parameter_query";
            console.log('inside rates and limits');
            axios.get(endpoint)
                .then((response) => {
                    console.log(self);
                    resolve(response);
                });
        });
    }

    static generateRatesTable(rates) {
        return new Promise((resolve, reject) => {
            console.log('hello in setPricingTable'); 
            console.log(rates);
            let tbl = document.createElement('table');
            // row 0 is XMR => BTC
            let newRow = tbl.insertRow(0);
            let newCell = newRow.insertCell(0);
            let newText = document.createTextNode(`1 XMR buys you `);
            newCell.appendChild(newText);
            newCell = newRow.insertCell(1);
            newText = document.createTextNode(`${rates.data.price} BTC`);
            newCell.appendChild(newText);
            //let newRow2 = tbl.insertRow(0);
            newRow = tbl.insertRow(1);
            newCell = newRow.insertCell(0);
            newText = document.createTextNode(`Minimum BTC`);
            newCell.appendChild(newText);
            newCell = newRow.insertCell(1);
            newText = document.createTextNode(`${rates.data.lower_limit} BTC`);
            newCell.appendChild(newText);

            newRow = tbl.insertRow(1);
            newCell = newRow.insertCell(0);
            newText = document.createTextNode(`Max BTC`);
            newCell.appendChild(newText);
            newCell = newRow.insertCell(1);
            newText = document.createTextNode(`${rates.data.upper_limit} BTC`);
            newCell.appendChild(newText);



            resolve(tbl);
        })
    }
}

module.exports = ExchangeFunctions;
