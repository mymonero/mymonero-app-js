'use strict'

const fs = require('fs')

class FilesytemUI {
  constructor (options, context) {
    const self = this
    {
      self.options = options
      self.context = context
    }
  }

  PresentDialogToSaveBase64ImageStringAsImageFile (
    imgData_base64String,
    title,
    defaultFilename_sansExt,
    fn // (err?) -> Void
  ) {
    const self = this
    //
    const ext = imgData_base64String.split(';')[0].match(/jpeg|png|gif/)[0]
    const data_base64String = imgData_base64String.replace(/^data:image\/\w+;base64,/, '') // strip off the data: url prefix to get just the base64-encoded bytes
    const buffer = new Buffer.from(data_base64String, 'base64')
    //
    const extensions = [ext]
    if (ext === 'jpg') {
      extensions.push('jpeg')
    }
    const remote = require('electron').remote
    const dialog = remote.dialog
    const electronWindow = remote.getCurrentWindow()
    const options =
		{
		  title: title || 'Save File',
		  defaultPath: `${defaultFilename_sansExt || 'image'}.${ext}`,
		  filters: [
		    { name: 'Images', extensions: [ext] }
		  ]
		}
    const path = dialog.showSaveDialogSync(
      electronWindow,
      options
    )
    if (path === undefined) {
      console.log('No path. Canceled?')
      fn(null)
      return
    }
    console.log('Saving to path', path)
    fs.writeFile(
      path,
      buffer,
      function (err) {
        fn(err)
      }
    )
  }

  PresentDialogToSaveTextFile (
    contentString,
    title,
    defaultFilename_sansExt,
    ext,
    fn,
    optl_uriContentPrefix // this can be undefined for electron since we're saving the file directly
  ) {
    const buffer = new Buffer.from(contentString, 'utf8')
    const extensions = [ext]
    const remote = require('electron').remote
    const dialog = remote.dialog
    const electronWindow = remote.getCurrentWindow()
    const options =
		{
		  title: title || 'Save File',
		  defaultPath: `${defaultFilename_sansExt || 'file'}.${ext}`,
		  filters: [
		    { name: 'CSVs', extensions: [ext] }
		  ]
		}
    const path = dialog.showSaveDialogSync(
      electronWindow,
      options
    )
    if (path === undefined) {
      console.log('No path. Canceled?')
      fn(null)
      return
    }
    console.log('Saving to path', path)
    fs.writeFile(
      path,
      buffer,
      function (err) {
        fn(err)
      }
    )
  }

  PresentDialogToOpenOneImageFile (
    title,
    fn // (err?, absoluteFilePath?) -> Void
  ) {
    const self = this
    //
    const remote = require('electron').remote
    const dialog = remote.dialog
    const electronWindow = remote.getCurrentWindow()
    const options =
		{
		  title: title || 'Open File',
		  filters: [
		    { name: 'Images', extensions: ['png', 'jpg', 'jpeg'] }
		  ]
		}
    let path = dialog.showOpenDialogSync(
      electronWindow,
      options
    )
    if (path === undefined) {
      console.log('No path. Canceled?')
      fn(null)
      return
    }
    if (typeof path !== 'string') {
      if (Array.isArray(path)) {
        path = path[0] // select first
      } else {
        throw Error('Unknown `path` return type ' + typeof path + ' from showOpenDialog')
      }
    }
    console.log('Open file at path', path)
    fn(null, path)
  }
}
module.exports = FilesytemUI
