const axios = require("axios");
//const http = require('http');
// const { URL } = require('url');
// This module contains XMR.TO functionality. For more info, go to test.xmr.to

class ExchangeFunctions {

    // constructor() {
    //     this.order = {};
    //     this.orderRefreshTimer = {};
    //     this.currentRates = {};
    //     this.orderStatus = {};
    // }
    // static getOrderStatus() {
    //     const order = this.order;
    //     const self = this;
    //     return new Promise((resolve, reject) => {
    //         let endpoint = `https://test.xmr.to/api/v3/xmr2btc/order_status_query/`;
    //         let data = {
    //             "uuid": order.data.uuid
    //         }
    //         axios.post(endpoint, data)
    //             .then(function (response) {
    //                 self.orderStatus = response.data;
    //                 resolve(self.orderStatus);
    //             })
    //             .catch(function (error) {
    //                 console.log(error);
    //                 reject(error);
    //             });
    //     });
    // }

    // static getOrderExpiry() {
    //     return this.orderStatus.expires_at;
    // }

    // static getTimeRemaining() {
    //     return this.orderStatus.seconds_till_timeout;
    // }
    // // We expect a return code 201, not a 200
    // static createNewOrder(amount, amount_currency, btc_dest_address) {
    //     let self = this;
    //     return new Promise((resolve, reject) => {
    //         let endpoint = `https://test.xmr.to/api/v3/xmr2btc/order_create/`;
    //         // https://xmr.to/api/v3/xmr2btc/order_parameter_query/
    //             let data = {
    //                 amount,  // float
    //                 amount_currency, // currency as string
    //                 btc_dest_address // dest address as string
    //             }
    //             axios.post(endpoint, data)
    //               .then(function (response) {
    //                 self.order = response;
    //                 // we're successful with the order creation. We now invoke our order update timer
    //                 self.orderRefreshTimer = setInterval(() => {
    //                     let data = ExchangeFunctions.getOrderStatus(self.order.uuid).then((response) => {
    //                         self.orderStatus = response.data;
    //                     });
    //                 }, 5000);
    //                 resolve(response);
    //               })
    //               .catch(function (error) {
    //                 console.log(error);
    //                 reject(error);
    //               });

    //             // post data to test.xmr.to
    //             // let result = setTimeout(() => {
    //             //     resolve({
    //             //         "state": "TO_BE_CREATED",
    //             //         "btc_amount": 0.01,
    //             //         "btc_dest_address": "2NBaUzuYqJvbThw77QVqq8NEXmkmDmSooy9",
    //             //         "uses_lightning": false,
    //             //         "uuid": "234567890121"
    //             //     })
    //             // }, 200).then((resolve, reject) => {
    //             //     console.log(resolve);
    //             //     return resolve;
    //             // });

    //     });
    // }

    // static updateOrder() {
    //     let self = this;
    //     return new Promise((resolve, reject) => {
    //     let endpoint = `https://test.xmr.to/api/v3/xmr2btc/order_create/`;
    //     // https://xmr.to/api/v3/xmr2btc/order_parameter_query/
    //         let data = {
    //             amount,  // float
    //             amount_currency, // currency as string
    //             btc_dest_address // dest address as string
    //         }
    //         axios.post(endpoint, data)
    //             .then(function (response) {
    //             self.order = response;
    //             // we're successful with the order creation. We now invoke our order update timer
    //             self.orderRefreshTimer = setInterval(() => {
    //                 if (self.order == undefined && self.order.state == undefined) {
    //                     let data = ExchangeFunctions.getOrderStatus(order.uuid).then((response) => {
    //                         self.orderStatus = response.data;
    //                     });
    //                 }
    //             }, 4000);
    //                 resolve(response);
    //             })
    //             .catch(function (error) {
    //                 console.log(error);
    //                 reject(error);
    //             });
    //     })
    // }
    
    // static generateRatesTable(rates) {
    //     return new Promise((resolve, reject) => {
    //         let tbl = document.createElement('table');
    //         // row 0 is XMR => BTC
    //         let newRow = tbl.insertRow(0);
    //         let newCell = newRow.insertCell(0);
    //         let newText = document.createTextNode(`1 XMR buys you `);
    //         newCell.appendChild(newText);
    //         newCell = newRow.insertCell(1);
    //         newText = document.createTextNode(`${rates.data.price} BTC`);
    //         newCell.appendChild(newText);
    //         //let newRow2 = tbl.insertRow(0);
    //         newRow = tbl.insertRow(1);
    //         newCell = newRow.insertCell(0);
    //         newText = document.createTextNode(`Minimum BTC`);
    //         newCell.appendChild(newText);
    //         newCell = newRow.insertCell(1);
    //         newText = document.createTextNode(`${rates.data.lower_limit} BTC`);
    //         newCell.appendChild(newText);

    //         newRow = tbl.insertRow(1);
    //         newCell = newRow.insertCell(0);
    //         newText = document.createTextNode(`Max BTC`);
    //         newCell.appendChild(newText);
    //         newCell = newRow.insertCell(1);
    //         newText = document.createTextNode(`${rates.data.upper_limit} BTC`);
    //         newCell.appendChild(newText);



    //         resolve(tbl);
    //     })
    // }
}

module.exports = ExchangeFunctions;
