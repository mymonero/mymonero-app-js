"use strict"

const JSBigInt = require('../../mymonero_libapp_js/mymonero-core-js/cryptonote_utils/biginteger').BigInteger;

class WalletInfo
{
    // constructor(address, viewKeyPrivate, spendKeyPublic, spendKeyPrivate) {
    //     this.address = address;
    //     this.viewKeyPrivate = viewKeyPrivate;
    //     this.spendKeyPublic = spendKeyPublic;
    //     this.spendKeyPrivate = spendKeyPrivate;

    //     this.hasBalanceChanged = false;
    //     this.hasSpentOutputsChanged = false;
    //     this.hasHeightChanged = false;

    //     this.dateLastFetched = null;
    // }

    constructor() {
        this.hasBalanceChanged = false;
        this.hasSpentOutputsChanged = false;
        this.hasHeightChanged = false;

        this.dateLastFetched = null;
    }

    setValues(totalReceived, totalSent, lockedBalance, spentOutputs, scannedTxHeight, scannedBlockHeight, scanStartHeight, transactionHeight, blockchainHeight, ratesBySymbol, dateLastFetched) {
        this.totalReceived = totalReceived || new JSBigInt(0);
        this.lockedBalance = lockedBalance || new JSBigInt(0);
        this.totalSent = totalSent || new JSBigInt(0);
        this.spentOutputs = spentOutputs;
        this.scannedTxHeight = scannedTxHeight;
        this.scannedBlockHeight = scannedBlockHeight;
        this.scanStartHeight = scanStartHeight;
        this.transactionHeight = transactionHeight;
        this.blockchainHeight = blockchainHeight;
        this.ratesBySymbol = ratesBySymbol;
        this.dateLastFetched = dateLastFetched;

        console.log("💬  WalletInfo values set");
        console.log(this);
    }

    update(totalReceived, totalSent, lockedBalance, spentOutputs, scannedTxHeight, scannedBlockHeight, scanStartHeight, transactionHeight, blockchainHeight) {
        this.checkBalanceForChange(totalReceived, totalSent, lockedBalance);
        this.checkSpentOutputsForChange(spentOutputs);
        this.checkHeightForChange(scannedTxHeight, scannedBlockHeight, scanStartHeight, transactionHeight, blockchainHeight);
        this.isFirstFetch();

    }

    // these values need to be JSBigInt's
    checkBalanceForChange(totalReceived, totalSent, lockedBalance) {
        let didBalanceChange = false;
        if (this.isExistingBigIntDifferentFrom(this.totalReceived, totalReceived)) {
			didBalanceChange = true;
		}
		if (this.isExistingBigIntDifferentFrom(this.totalSent, totalSent)) {
			didBalanceChange = true;
		}
		if (this.isExistingBigIntDifferentFrom(this.lockedBalance, lockedBalance)) {
			didBalanceChange = true;
        }

        this.totalReceived = totalReceived
		this.totalSent = totalSent
		this.lockedBalance = lockedBalance
        
        //console.log("💬  WalletInfo checked balance for change, result: "+ didBalanceChange);

        return didBalanceChange;
    }

    checkSpentOutputsForChange(spentOutputs) {
		if (typeof this.spentOutputs === 'undefined' || this.spentOutputs === null || this.areObjectsEqual(spentOutputs, this.spentOutputs) === false) {
			return true;
        }

        return false;
    }

    checkHeightForChange(scannedTxHeight, scannedBlockHeight, scanStartHeight, transactionHeight, blockchainHeight) {
        let didHeightChange = false;
		// TODO: should this actually be account_scanned_height? can we remove account_scanned_tx_height?
		if (scannedTxHeight !== this.scannedTxHeight) {
			didHeightChange = true;
			this.scannedTxHeight = scannedTxHeight;
		}
		if (scannedBlockHeight !== this.scannedBlockHeight) {
			didHeightChange = true;
			this.scannedBlockHeight = scannedBlockHeight;
		}
		if (scanStartHeight !== this.scanStartHeight) {
			didHeightChange = true;
			this.scanStartHeight = scanStartHeight;
		}
		// NOTE: the following change even when we do not do/get any txs
		if (transactionHeight !== this.transactionHeight) {
			didHeightChange = true;
			this.transactionHeight = transactionHeight;
		}
		if (blockchainHeight !== this.blockchainHeight) {
			didHeightChange = true;
			this.blockchain_height = blockchainHeight;
        }
        
        return didHeightChange;
    }

    isFirstFetch() {
        let isFirstFetch = false;
		if (this.dateLastFetched === null) {
            
            isFirstFetch = true;
		}		
        this.dateLastFetched = new Date()
        
        return isFirstFetch;
    }

    isExistingBigIntDifferentFrom(existingValue, newValue) {
        if (typeof existingValue === 'undefined' || existingValue === null || typeof existingValue !== 'object') { // let's always broadcast-as-diff receiving a newValue when existingValue is undefined, null, or non JSBigInts
            return true
        } // now we presume it's a JSBigInt…
        if (existingValue.compare(newValue) != 0) {
            return true
        }
        return false
    }

    areObjectsEqual(x, y)
    {
        if ( x === y ) return true;
        if ( ! ( x instanceof Object ) || ! ( y instanceof Object ) ) return false;
        if ( x.constructor !== y.constructor ) return false;
        for ( var p in x ) {
            if ( ! x.hasOwnProperty( p ) ) continue;
            if ( ! y.hasOwnProperty( p ) ) return false;
            if ( x[ p ] === y[ p ] ) continue;
            if ( typeof( x[ p ] ) !== "object" ) return false;
            if ( ! this.areObjectsEqual( x[ p ],  y[ p ] ) ) return false;
        }
        for ( p in y ) {
            if ( y.hasOwnProperty( p ) && ! x.hasOwnProperty( p ) ) return false;
        }
        return true;
    }

}

module.exports = WalletInfo