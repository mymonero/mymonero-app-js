const uuidV1 = require('uuid/v1')
const string_cryptor = require('../symmetric_cryptor/symmetric_string_cryptor')

function read (persister, CollectionName, persistableObject) {
  return new Promise((resolve, reject) => {
    const self = persistableObject
    persister.DocumentsWithIds(CollectionName, [self._id])
      .then((docs) => {
        if (docs.length === 0) {
          const errStr = '❌  Record with that _id not found.'
          const err = new Error(errStr)
          console.error(errStr)
          reject(err)
        }
        const encryptedDocument = docs[0]
        __proceedTo_decryptEncryptedDocument(encryptedDocument)
      })
      .catch((err) => {
        console.error(err.toString())
        reject(err)
      })

    function __proceedTo_decryptEncryptedDocument (encryptedBase64String) {
      string_cryptor.New_DecryptedString__Async(encryptedBase64String, self.persistencePassword)
        .then((plaintextString) => {
          let plaintextDocument
          try {
            plaintextDocument = JSON.parse(plaintextString)
          } catch (e) {
            const errStr = 'Error while parsing JSON: ' + e
            console.error('❌  ' + errStr)
            reject(errStr)
            return
          }
          resolve(plaintextDocument)
        })
        .catch((err) => {
          console.error('❌  Decryption err: ' + err.toString())
          reject(err)
        })
    }
  })
}
exports.read = read

function write (persister, persistableObject, CollectionName, plaintextDocument, persistencePassword) {
  return new Promise((resolve, reject) => {
    const self = persistableObject
    let _id = plaintextDocument._id
    if (typeof _id === 'undefined' || _id == null || _id == '') {
      _id = uuidV1()
      plaintextDocument._id = _id
    }
    const plaintextJSONString = JSON.stringify(plaintextDocument)
    string_cryptor.New_EncryptedBase64String__Async(plaintextJSONString, persistencePassword)
      .then((encryptedBase64String) => {
        if (self._id === null) {
          _proceedTo_insertNewDocument(encryptedBase64String)
        } else {
          _proceedTo_updateExistingDocument(encryptedBase64String)
        }
      })
      .catch((err) => {
        console.error('Error while saving :', err)
        reject(err)
      })

    function _proceedTo_insertNewDocument (encryptedBase64String) {
      persister.InsertDocument(CollectionName, plaintextDocument._id, encryptedBase64String)
        .then((documentToWrite) => {
          self._id = plaintextDocument._id // so we have it in runtime memory now…
          console.log('✅  Saved newly inserted object with _id ' + self._id + '.')
          resolve()
        })
        .catch((err) => {
          console.error('Error while saving object:', err)
          reject(err)
        })
    }

    function _proceedTo_updateExistingDocument (encryptedBase64String) {
      persister.UpdateDocumentWithId(CollectionName, self._id, encryptedBase64String)
        .then((documentToWrite) => {
          console.log('✅  Saved update to object with _id ' + self._id + '.')
          resolve()
        })
        .catch((err) => {
          console.error('Error while saving record:', err)
          reject(err)
        })
    }
  })
}
exports.write = write
