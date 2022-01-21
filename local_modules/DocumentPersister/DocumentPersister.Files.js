'use strict'

const async = require('async')

class DocumentPersister {
  constructor (options) {
    const self = this

    self.options = options
    {
      options = self.options
      const options_userDataAbsoluteFilepath = options.userDataAbsoluteFilepath
      if (!options_userDataAbsoluteFilepath || typeof options_userDataAbsoluteFilepath === 'undefined') {
        throw Error('options.userDataAbsoluteFilepath required')
      }
      //
      self.userDataAbsoluteFilepath = options_userDataAbsoluteFilepath
      //
      self.fs = options.fs
      if (!self.fs || typeof self.fs === 'undefined') {
        throw Error('options.fs required')
      }
    }
    // strip trailing slashes so we can just append path components with string ops internally (join is hairy on android due to it being a url instead of a path)
    let pathTo_dataSubdir = self.userDataAbsoluteFilepath // dirs are annoying in web, so using a file ext for detection instead
    while (pathTo_dataSubdir.endsWith('/')) {
      pathTo_dataSubdir = pathTo_dataSubdir.substring(0, pathTo_dataSubdir.length - 1)
    }
    self.pathTo_dataSubdir = pathTo_dataSubdir
    // console.log("self.pathTo_dataSubdir" , self.pathTo_dataSubdir)
  }

  DocumentsWithIds (collectionName, ids) {
    return new Promise((resolve, reject) => {
      const self = this
      async.map(ids, function (_id, cb) {
        const fileDescription = self._new_fileDescriptionWithComponents(collectionName, ids)
        cb(null, fileDescription)
      })
        .then((fileDescriptions) => {
          self.___read_contentStringsWithDocumentFileDescriptions(fileDescriptions)
            .then((results) => {
              resolve(results)
            })
            .catch((err) => {
              reject(err)
            })
        })
    })
  }

  IdsOfAllDocuments (collectionName) {
    return new Promise((resolve, reject) => {
      const self = this
      self.___read_collection_documentFileDescriptions(collectionName)
        .then((documentFileDescriptions) => {
          async.map(documentFileDescriptions, function (documentFileDescription, cb) {
            cb(null, documentFileDescription._id)
          })
            .then((results) => {
              resolve(results)
            })
            .catch((err) => {
              reject(err)
            })
        })
        .catch((err) => {
          reject(err)
        })
    })
  }

  AllDocuments (collectionName) {
    return new Promise((resolve, reject) => {
      const self = this
      self.___read_collection_documentFileDescriptions(collectionName)
        .then((documentFileDescriptions) => {
          self.___read_contentStringsWithDocumentFileDescriptions(documentFileDescriptions)
            .then((results) => {
              resolve(results)
            })
            .catch((err) => {
              reject(err)
            })
        })
        .catch((err) => {
          reject(err)
        })
    })
  }

  InsertDocument (collectionName, id, documentToInsert) {
    const self = this
    // you may like to be sure to specify the _id manually within your "documentToInsert"
    const fileDescription = self._new_fileDescriptionWithComponents(collectionName, id)
    return self.___write_fileDescriptionDocumentContentString(fileDescription, documentToInsert)
  }

  UpdateDocumentWithId (collectionName, id, update) {
    const self = this
    const fileDescription = self._new_fileDescriptionWithComponents(collectionName, id)
    return self.___write_fileDescriptionDocumentContentString(fileDescription, update)
  }

  RemoveDocumentsWithIds (collectionName, ids) {
    return new Promise((resolve, reject) => {
      const self = this
      let numRemoved = 0
      async.each(
        ids,
        function (id, cb) {
          const fileDescription = self._new_fileDescriptionWithComponents(
            collectionName,
            id
          )
          const fileKey = self.____fileKeyFromFileDescription(fileDescription)
          const filename = self.____filenameWithFileKey(fileKey)
          const filepath = self.pathTo_dataSubdir + '/' + filename
          self.fs.unlink(filepath, function (err) {
            if (!err) {
              numRemoved += 1
            }
            cb(err)
          })
        })
        .then(() => {
          resolve(numRemoved)
        })
        .catch((err) => {
          reject(err)
        })
    })
  }

  RemoveAllDocuments (collectionName) {
    return new Promise((resolve, reject) => {
      const self = this
      self.IdsOfAllDocuments(collectionName)
        .then((ids) => {
          self.RemoveDocumentsWithIds(collectionName, ids)
            .then((numRemoved) => {
              resolve()
            })
        })
        .catch((err) => {
          reject(err)
        })
    })
  }

  ___write_fileDescriptionDocumentContentString (fileDescription, documentToWrite) {
    return new Promise((resolve, reject) => {
      const self = this
      let stringContents = null
      if (typeof documentToWrite === 'string') {
        stringContents = documentToWrite
      } else {
        try {
          stringContents = JSON.stringify(documentToWrite)
        } catch (e) {
          reject(e)
        }
        if (!stringContents || typeof stringContents === 'undefined') { // just to be careful
          reject(new Error('Unable to stringify document for write.'))
        }
      }
      const fileKey = self.____fileKeyFromFileDescription(fileDescription)
      const filename = self.____filenameWithFileKey(fileKey)
      const filepath = self.pathTo_dataSubdir + '/' + filename
      self.fs.writeFile(filepath, stringContents, function (err) {
        err ? reject(err) : resolve(documentToWrite)
      })
    })
  }

  _new_fileDescriptionWithComponents (collectionName, _id) {
    return {
      _id: _id,
      collectionName: collectionName
    }
  }

  ___read_contentStringsWithDocumentFileDescriptions (documentFileDescriptions) {
    return new Promise((resolve, reject) => {
      const self = this
      if (!documentFileDescriptions || documentFileDescriptions.length == 0) {
        resolve([])
      }
      async.map(documentFileDescriptions, function (documentFileDescription, cb) {
        self.___read_contentStringWithDocumentFileDescription(documentFileDescription)
          .then((documentContentString) => {
            cb(null, documentContentString)
          })
          .catch((err) => {
            cb(err)
          })
      })
        .then((results) => {
          resolve(results)
        })
        .catch((err) => {
          reject(err)
        })
    })
  }

  ____fileKeyFromFileDescription (fileDescription) {
    const self = this
    const fileKeyComponentDelimiterString = self.____fileKeyComponentDelimiterString()
    //
    return `${fileDescription.collectionName}${fileKeyComponentDelimiterString}${fileDescription._id}`
  }

  ____fileKeyComponentDelimiterString () {
    return '__' // not -, because those exist in uuids
  }

  ____filenameExtension () {
    return '.mmdbdoc_v1' // just trying to pick something fairly unique, and short
  }

  ____filenameWithFileKey (fileKey) {
    const self = this
    return `${fileKey}${self.____filenameExtension()}`
  }

  ___read_contentStringWithDocumentFileDescription (documentFileDescription) {
    return new Promise((resolve, reject) => {
      const self = this
      const expected_fileKey = self.____fileKeyFromFileDescription(documentFileDescription)
      const expected_filename = self.____filenameWithFileKey(expected_fileKey)
      const filepath = self.pathTo_dataSubdir + '/' + expected_filename
      self.fs.exists(filepath, function (exists) { // ^-- this is implemented with .exists instead of .open, even though .exists is deprecated, in order to remain compatible with html5-fs for Cordova
        if (!exists) {
          reject(new Error('Document for file description does not exist.'))
          return
        }
        self.fs.readFile(
          filepath,
          { encoding: 'utf8' },
          function (err, documentToWrite) {
            err ? reject(err) : resolve(documentToWrite)
          }
        )
      })
    })
  }

  ___read_collection_documentFileDescriptions (collectionName) {
    return new Promise((resolve, reject) => {
      const self = this
      self.fs.readdir(self.pathTo_dataSubdir, function (err, files) { // filtering to what should be JSON doc files
        if (err) {
          reject(err)
        }
        const fileDescriptions = []
        const extSuffix = self.____filenameExtension()
        const extSuffix_length = extSuffix.length
        async.map(files, function (file, cb) {
          if (file.endsWith(extSuffix) !== true) {
            // we're not going to consider this an error because it could be the .DS_Store file
            cb(null, file)
            return
          }
          const filepath = self.pathTo_dataSubdir + '/' + file
          self.fs.exists(filepath, function (exists) { // going to assume it's not a directory, but only to simplify things under Cordova, and because we are checking the file extension just above
            const filename_sansExt = file.substring(0, file.length - extSuffix_length) // since we already validated that this string ends with extSuffix
            const fileKey = filename_sansExt // assumption/hope
            const fileKeyComponentDelimiterString = self.____fileKeyComponentDelimiterString()
            const fileKey_components = fileKey.split(fileKeyComponentDelimiterString)
            if (fileKey_components.length != 2) {
              cb(new Error('Unrecognized filename format in db data directory.'))
              return
            }
            const fileKey_collectionName = fileKey_components[0]
            if (fileKey_collectionName !== collectionName) {
              // console.log("Skipping file named", fileKey, "as it's not in", collectionName)
              cb(null, file) // skip
              return
            }
            const fileKey_id = fileKey_components[1]
            const fileDescription = self._new_fileDescriptionWithComponents(
              fileKey_collectionName,
              fileKey_id
            )
            fileDescriptions.push(fileDescription) // ought to be a JSON doc file
            //
            cb(null, file) // returning file but we are not using it
          })
        })
          .then((results) => {
            // but we're actually going to disregard `results` here
            // cause we filtered out directories above
            resolve(fileDescriptions)
          })
          .catch((err) => {
            reject(err)
          })
      })
    })
  }
}
module.exports = DocumentPersister
