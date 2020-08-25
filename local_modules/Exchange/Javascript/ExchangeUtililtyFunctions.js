// Functions for Bitcoin address checking
//let validate = require((require.resolve('bitcoin-address-validation')));
let validate = require('bitcoin-address-validation');
console.log(validate);
console.log(validate.validateBtcAddress);
//import validate from 'bitcoin-address-validation';

/*
/Users/karlbuys/Sites/github/new-mym/local_modules/SendFundsTab/Views/SendFundsView_Base.web.js:1520 enteredAddressValue: 
/Users/karlbuys/Sites/github/new-mym/local_modules/SendFundsTab/Views/SendFundsView_Base.web.js:1521 resolvedAddress: 
/Users/karlbuys/Sites/github/new-mym/local_modules/SendFundsTab/Views/SendFundsView_Base.web.js:1522 manuallyEnteredPaymentID: 
/Users/karlbuys/Sites/github/new-mym/local_modules/SendFundsTab/Views/SendFundsView_Base.web.js:1523 resolvedPaymentID: b344ed9dd89e3ef3
/Users/karlbuys/Sites/github/new-mym/local_modules/SendFundsTab/Views/SendFundsView_Base.web.js:1524 hasPickedAContact: true
/Users/karlbuys/Sites/github/new-mym/local_modules/SendFundsTab/Views/SendFundsView_Base.web.js:1525 resolvedAddress_fieldIsVisible: false
/Users/karlbuys/Sites/github/new-mym/local_modules/SendFundsTab/Views/SendFundsView_Base.web.js:1526 manuallyEnteredPaymentID_fieldIsVisible: false
/Users/karlbuys/Sites/github/new-mym/local_modules/SendFundsTab/Views/SendFundsView_Base.web.js:1527 resolvedPaymentID_fieldIsVisible: true
/Users/karlbuys/Sites/github/new-mym/local_modules/SendFundsTab/Views/SendFundsView_Base.web.js:1528 contact_payment_id: b344ed9dd89e3ef3
/Users/karlbuys/Sites/github/new-mym/local_modules/SendFundsTab/Views/SendFundsView_Base.web.js:1529 cached_OAResolved_address: undefined
/Users/karlbuys/Sites/github/new-mym/local_modules/SendFundsTab/Views/SendFundsView_Base.web.js:1530 contact_hasOpenAliasAddress: false
/Users/karlbuys/Sites/github/new-mym/local_modules/SendFundsTab/Views/SendFundsView_Base.web.js:1531 contact_address: 4B8okpWm3JN1EuSSCqN96WWtgae5eiPLMFTDjHMv1dqa8YVZSq5i5Nb7yp4psnoyDFeKP7qqSeTppNeEpyeM5wB84rHDRJ1
/Users/karlbuys/Sites/github/new-mym/local_modules/SendFundsTab/Views/SendFundsView_Base.web.js:1532 Final_XMR_amount_number): 1e-7
/Users/karlbuys/Sites/github/new-mym/local_modules/SendFundsTab/Views/SendFundsView_Base.web.js:1533 sweeping: false
/Users/karlbuys/Sites/github/new-mym/local_modules/UserIdle/UserIdleInWindowController.js:78 ⏳  Temporarily disabling the user idle timer.
/Users/karlbuys/Sites/github/new-mym/local_modules/MoneroUtils/monero_utils.electron.web.js:167 calling ipcRenderer to send funds
/Users/karlbuys/Sites/github/new-mym/local_modules/MoneroUtils/monero_utils.electron.web.js:168 cd72snfmp
*/


function sendFunds(wallet, xmr_amount, xmr_send_address, sweep_wallet) {
    return new Promise((resolve, reject) => {
        console.log(wallet);
        console.log(xmr_amount, xmr_send_address, sweep_wallet);
        //const self = this
        // if (self.isSubmitButtonDisabled) {
        //     console.warn("⚠️  Submit button currently disabled. Bailing.")
        //     return
        // }
        // { // disable form elements
        //     self.disable_submitButton()
        //     self.isFormDisabled = true
        //     //
        //     self.walletSelectView.SetEnabled(false)
        // }
        // {
        //     self._dismissValidationMessageLayer()
        // }

        // function _reEnableFormElements() {
        //     self.isFormDisabled = false
        //     //
        //     self.enable_submitButton()
        //     self.walletSelectView.SetEnabled(true)
        // }

        function _trampolineToReturnWithValidationErrorString(errStr) { // call this anytime you want to exit this method before complete success (or otherwise also call _reEnableFormElements)
            //self.validationMessageLayer.SetValidationError(errStr)
            console.log(errStr);
            //_reEnableFormElements()
        }
        console.log(typeof(xmr_send_address));
        // for debug, we use our own xmr_wallet and we send a tiny amount of XMR. Change this once we can send funds
        xmr_send_address = "45am3uVv3gNGUWmMzafgcrAbuw8FmLmtDhaaNycit7XgUDMBAcuvin6U2iKohrjd6q2DLUEzq5LLabkuDZFgNrgC9i3H4Tm";
        xmr_amount = 0.000001;

        let enteredAddressValue = xmr_send_address; //;
        let resolvedAddress = "";
        let manuallyEnteredPaymentID = "";
        let resolvedPaymentID = "";
        let hasPickedAContact = false;
        let resolvedAddress_fieldIsVisible = "";
        let manuallyEnteredPaymentID_fieldIsVisible = "";
        let resolvedPaymentID_fieldIsVisible = "";
        let contact_payment_id = undefined;
        let cached_OAResolved_address = undefined;
        let contact_hasOpenAliasAddress = undefined;
        let contact_address = undefined;
        let raw_amount_string = xmr_amount; // XMR amount in double
        let sweeping = sweep_wallet;
        let simple_priority = 1;
        
        /**
         * 		enteredAddressValue, // currency-ready wallet address, but not an OpenAlias address (resolve before calling)
		resolvedAddress,
		manuallyEnteredPaymentID,
		resolvedPaymentID,
		hasPickedAContact,
		resolvedAddress_fieldIsVisible,
		manuallyEnteredPaymentID_fieldIsVisible,
		resolvedPaymentID_fieldIsVisible,
		//
		contact_payment_id,
		cached_OAResolved_address,
		contact_hasOpenAliasAddress,
		contact_address,
		//
		raw_amount_string,
		isSweepTx, // when true, amount will be ignored
		simple_priority,
		//
		preSuccess_nonTerminal_statusUpdate_fn, // (String) -> Void
		canceled_fn, // () -> Void
		fn // (err?, mockedTransaction?) -> Void
         * 
         */

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
            preSuccess_nonTerminal_statusUpdate_fn,
            cancelled_fn,
            handleResponse_fn
        );

        // these functions are passed as parameters to wallet.SendFunds
        function handleResponse_fn (err, mockedTransaction) {
            console.log('handleResponse_fn:', err, mockedTransaction);
            if (err) {
                //_trampolineToReturnWithValidationErrorString(typeof err === 'string' ? err : err.message)
                return
            }
            //
            self.validationMessageLayer.SetValidationError(`Sent.`, true/*wantsXButtonHidden*/)
            // finally, clean up form
            setTimeout(
                function () {
                    self._dismissValidationMessageLayer()
                    // Now dismiss
                    self.dismissView()
                },
                500
            )
            // and fire off a request to have the wallet get the latest (real) tx records
            setTimeout(
                function () {
                    wallet.hostPollingController._fetch_transactionHistory() // TODO: maybe fix up the API for this
                }
            )
        }

        function preSuccess_nonTerminal_statusUpdate_fn(str)
        {
            console.log('statuses: ' + str);
            self.validationMessageLayer.SetValidationError(str, true/*wantsXButtonHidden*/)
        }

        function cancelled_fn() { // canceled_fn
            console.log(e);
            self._dismissValidationMessageLayer()
            _reEnableFormElements()
        }
    });
}


function validateBTCAddress(address) {
    console.log(typeof(validage(address)));
    if (typeof(validate(address)) !== Object) {
        return false;
    }
    return true;
}

function determineAddressNetwork(address) {
    let info = validate(address);
    return info.network;
}

// end of functions to check Bitcoin address

function renderOrderStatus(order) {
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

    let test = document.getElementById('btc_amount');
    console.log(test);
    console.log(test == null);
    console.log(typeof(test));
    if (!(test == null)) {
        idArr.forEach((item, index) => {
            document.getElementById(item).innerHTML = order[item];
        });
    }
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

    module.exports = { validateBTCAddress, getTimeRemaining, isValidBase10Decimal, checkDecimals, renderOrderStatus, sendFunds };