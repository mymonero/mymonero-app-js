const persistable_object_utils = require('../../DocumentPersister/persistable_object_utils')
//
// Constants
const CollectionName = 'FundsRequests'
exports.CollectionName = CollectionName
//
// Utility functions
function HydrateInstance (
  instance,
  plaintextDocument
) {
  const self = instance
  //
  // console.log("plaintextDocument", plaintextDocument)
  function _isNonNil_dateStr (v) {
    return v != null && typeof v !== 'undefined' && v !== ''
  }
  {
    const dateStr = plaintextDocument.dateCreated
    self.dateCreated = _isNonNil_dateStr(dateStr) ? new Date(dateStr) : null
  }
  self.from_fullname = plaintextDocument.from_fullname
  self.to_walletHexColorString = plaintextDocument.to_walletHexColorString
  self.to_address = plaintextDocument.to_address
  self.payment_id = plaintextDocument.payment_id
  self.amount = plaintextDocument.amount
  self.amountCcySymbol = plaintextDocument.amountCcySymbol
  self.message = plaintextDocument.message
  self.description = plaintextDocument.description
  self.is_displaying_local_wallet = plaintextDocument.is_displaying_local_wallet
}
exports.HydrateInstance = HydrateInstance

function SaveToDisk (instance) {
  return new Promise((resolve, reject) => {
    const self = instance
    console.log('📝  Saving fundsRequest to disk ', self.Description())

    const persistencePassword = self.persistencePassword
    if (persistencePassword === null || typeof persistencePassword === 'undefined' || persistencePassword === '') {
      const errStr = '❌  Cannot save fundsRequest to disk as persistencePassword was missing.'
      const err = new Error(errStr)
      reject(err)
      return
    }
    if (typeof self.dateCreated === 'undefined') {
      self.dateCreated = new Date()
    }
    const plaintextDocument =
    {
      dateCreated: self.dateCreated.toString(), // must do toString else we will get exception on encrypting
      //
      from_fullname: self.from_fullname || '',
      to_walletHexColorString: self.to_walletHexColorString || '',
      to_address: self.to_address,
      payment_id: self.payment_id,
      amount: self.amount != null && self.amount != '' ? '' + self.amount : self.amount, // storing this as an optional String
      amountCcySymbol: self.amountCcySymbol,
      message: self.message || '',
      description: self.description || '',
      is_displaying_local_wallet: self.is_displaying_local_wallet == true
    }
    persistable_object_utils.write(self.context.persister, self, CollectionName, plaintextDocument, persistencePassword)
      .then(() => {
        resolve()
      })
      .catch((err) => {
        reject(err)
      })
  })
}
exports.SaveToDisk = SaveToDisk
//
function DeleteFromDisk (instance, fn) {
  const self = instance
  console.log('📝  Deleting fundsRequest ', self.Description())
  self.context.persister.RemoveDocumentsWithIds(CollectionName, [self._id])
    .then((numRemoved) => {
      if (numRemoved === 0) {
        fn(new Error("❌  Number of documents removed by _id'd remove was 0"))
        return // bail
      }
      console.log('🗑  Deleted saved fundsRequest with _id ' + self._id + '.')
      fn()
    })
    .catch((err) => {
      console.error('Error while removing fundsRequest:', err)
      fn(err)
    })
}
exports.DeleteFromDisk = DeleteFromDisk
