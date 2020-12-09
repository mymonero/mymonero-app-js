// import function for Bitcoin address checking
let validate = require('bitcoin-address-validation');

function sendFunds(wallet, xmr_amount, xmr_send_address, sweep_wallet, validation_status_fn, handle_response_fn) {
    return new Promise((resolve, reject) => {

        // for debug, we use our own xmr_wallet and we send a tiny amount of XMR. Change this once we can send funds
        if (process.env.EXCHANGE_TESTMODE == "true") {
            xmr_send_address = process.env.EXCHANGE_TESTADDRESS; // an XMR wallet address under your control
            xmr_amount = 0.000001;    
        } else {

        }

        let enteredAddressValue = xmr_send_address; //;
        let resolvedAddress = "";
        let manuallyEnteredPaymentID = "";
        let resolvedPaymentID = "";
        let hasPickedAContact = false;
        let manuallyEnteredPaymentID_fieldIsVisible = false;
        let resolvedPaymentID_fieldIsVisible = false;
        let resolvedAddress_fieldIsVisible = false;
        let contact_payment_id = undefined;
        let cached_OAResolved_address = undefined;
        let contact_hasOpenAliasAddress = undefined;
        let contact_address = undefined;
        let raw_amount_string = xmr_amount; // XMR amount in double
        let sweeping = sweep_wallet;
        let simple_priority = 1;

        wallet.SendFunds(
            enteredAddressValue,
            resolvedAddress,
            manuallyEnteredPaymentID,
            resolvedPaymentID,
            hasPickedAContact,
            resolvedAddress_fieldIsVisible,
            manuallyEnteredPaymentID_fieldIsVisible,
            resolvedPaymentID_fieldIsVisible,
            contact_payment_id,
            cached_OAResolved_address,
            contact_hasOpenAliasAddress,
            contact_address,
            raw_amount_string,
            sweeping,
            simple_priority,
            validation_status_fn,
            cancelled_fn,
            handle_response_fn
        );

        function cancelled_fn() { // canceled_fn    
            // TODO: Karl: I haven't diven deep enough to determine what state would invoke this function yet
        }
    });
}


function validateBTCAddress(address) {
    if (validate(address) == false) {
        return false;
    }
    // TODO: check for and fail on testnet address? Force testnet address on ENABLE_TESTMODE?


    return true;
}

function determineAddressNetwork(address) {
    let info = validate(address);
    return info.network;
}

// end of functions to check Bitcoin address

function renderOrderStatus(order) {    
    return new Promise((resolve, reject) => {
        let idArr = [
            "in_amount_remaining",
            "out_amount",
            "status",
            "expires_at",
            "provider_order_id",
            "in_address",
            "in_amount"
        ];
    
        let test = document.getElementById('exchangePage');
        if (!(test == null)) {
            idArr.forEach((item, index) => {
                if (item == "in_address") {
                    document.getElementById('receiving_subaddress').innerHTML = order[item];
                } else {
                    document.getElementById(item).innerHTML = order[item];
                }
                
            });
        }
        resolve();
    })
}

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

function checkDecimals(value, decimals) {
    let str = value.toString();
    let strArr = str.split('.');
    if (strArr.length > 1) {
        if (strArr[1].length >= decimals) {
            return false;
        }
    }
    return true;
}

function isValidBase10Decimal(number) {
    let str = number.toString();
    let strArr = str.split('.');
    if (strArr.size > 1 && typeof(strArr) == Array) {
        return false;
    }
    for (let i = 0; i < 2; i++) {
        if (isNaN(parseInt(strArr[i]))) {
            return false;
        }
    }
    if (strArr.size > 1) {
        if (strArr[1].length == 0) {
            return false;
        }
    }
    return true;
}

    module.exports = { validateBTCAddress, getTimeRemaining, isValidBase10Decimal, checkDecimals, renderOrderStatus, sendFunds };