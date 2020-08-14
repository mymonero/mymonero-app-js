// Functions for Bitcoin address checking
import validate from 'bitcoin-address-validation';

function checkBTCAddress(address) {
    if (validate.validate(address) == 'false') {
        return false;
    }
    return true;
}

// end of functions to check Bitcoin address

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

    module.exports = { checkBTCAddress, getTimeRemaining, isValidBase10Decimal, checkDecimals, renderOrderStatus };