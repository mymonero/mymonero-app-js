const axios = require("axios");
//const http = require('http');
// const { URL } = require('url');
// This module contains XMR.TO functionality. For more info, go to test.xmr.to

class ExchangeFunctions {

    constructor() {
        // this.apiUrl = "https://test.xmr.to/api/";
        // this.apiVersion = "v3";
        // this.currencyToExchange = "xmr2btc";
        this.order = {};
        this.orderRefreshTimer = {};
        this.currentRates = {};
        this.orderStatus = {};
    }
    static getOrderStatus() {
        //Post UUID to https://xmr.to/api/v3/xmr2btc/order_status_query/
        // {
        //     "state": <order_state_as_string>,
        //     "btc_amount": <requested_amount_in_btc_as_string>,
        //     "btc_amount_partial": <partial_amount_in_btc_as_string>,
        //     "btc_dest_address": <requested_destination_address_as_string>,
        //     "uuid": <unique_order_identifier_as_12_character_string>
        //     "btc_num_confirmations_threshold": <btc_num_confirmations_threshold_as_integer>,
        //     "created_at": <timestamp_as_string>,
        //     "expires_at": <timestamp_as_string>,
        //     "seconds_till_timeout": <seconds_till_timeout_as_integer>,
        //     "incoming_amount_total": <amount_in_incoming_currency_for_this_order_as_string>,
        //     "remaining_amount_incoming": <amount_in_incoming_currency_that_the_user_must_still_send_as_string>,
        //     "incoming_num_confirmations_remaining": <num_incoming_currency_confirmations_remaining_before_bitcoins_will_be_sent_as_integer>,
        //     "incoming_price_btc": <price_of_1_incoming_in_btc_currency_as_offered_by_service_as_string>,
        //     "receiving_subaddress": <xmr_subaddress_user_needs_to_send_funds_to_as_string>,
        //     "recommended_mixin": <recommended_mixin_as_integer>,
        //     "uses_lightning": <boolean_indicating_the_method_for_the_payment>,
        //     "msat_amount": <order_amount_in_msat_as_integer>,
        //     "payments": [<payment_objects>]
        // }
        const order = this.order;
        const self = this;
        return new Promise((resolve, reject) => {
            let endpoint = `https://test.xmr.to/api/v3/xmr2btc/order_status_query/`;
            let data = {
                "uuid": order.data.uuid
            }
            axios.post(endpoint, data)
                .then(function (response) {
                    self.orderStatus = response.data;
                    resolve(self.orderStatus);
                })
                .catch(function (error) {
                    console.log(error);
                    reject(error);
                });
        });
    }

    static getOrderExpiry() {
        return this.orderStatus.expires_at;
    }

    static getTimeRemaining() {
        return this.orderStatus.seconds_till_timeout;
    }
    // We expect a return code 201, not a 200
    static createNewOrder(amount, amount_currency, btc_dest_address) {
        let self = this;
        return new Promise((resolve, reject) => {
            let endpoint = `https://test.xmr.to/api/v3/xmr2btc/order_create/`;
            // https://xmr.to/api/v3/xmr2btc/order_parameter_query/
                let data = {
                    amount,  // float
                    amount_currency, // currency as string
                    btc_dest_address // dest address as string
                }
                axios.post(endpoint, data)
                  .then(function (response) {
                    self.order = response;
                    // we're successful with the order creation. We now invoke our order update timer
                    self.orderRefreshTimer = setInterval(() => {
                        let data = ExchangeFunctions.getOrderStatus(self.order.uuid).then((response) => {
                            self.orderStatus = response.data;
                        });
                    }, 5000);
                    resolve(response);
                  })
                  .catch(function (error) {
                    console.log(error);
                    reject(error);
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

    static updateOrder() {
        let self = this;
        return new Promise((resolve, reject) => {
        let endpoint = `https://test.xmr.to/api/v3/xmr2btc/order_create/`;
        // https://xmr.to/api/v3/xmr2btc/order_parameter_query/
            let data = {
                amount,  // float
                amount_currency, // currency as string
                btc_dest_address // dest address as string
            }
            axios.post(endpoint, data)
                .then(function (response) {
                self.order = response;
                // we're successful with the order creation. We now invoke our order update timer
                self.orderRefreshTimer = setInterval(() => {
                    if (self.order == undefined && self.order.state == undefined) {
                        let data = ExchangeFunctions.getOrderStatus(order.uuid).then((response) => {
                            self.orderStatus = response.data;
                        });
                    }
                }, 4000);
                    resolve(response);
                })
                .catch(function (error) {
                    console.log(error);
                    reject(error);
                });
        })
    }
    

    static getRatesAndLimits() {
        let self = this;
        return new Promise((resolve, reject) => {
            let operation = "order_parameter_query";
            let endpoint = "https://test.xmr.to/api/v3/xmr2btc/order_parameter_query";
            console.log('inside rates and limits');
            axios.get(endpoint)
                .then((response) => {
                    self.currentRates = response.data;
                    self.currentRates.minimum_xmr = self.currentRates.lower_limit / self.currentRates.price;
                    self.currentRates.maximum_xmr = self.currentRates.upper_limit / self.currentRates.price;
                    console.log(self);
                    resolve(response);
                }).catch((error) => {
                    reject(error);
                })
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
