'use strict'

const images_filenames =
[
  'addButtonIcon_10@3x.png',
  'backButtonIcon@3x.png',
  'contactPicker_xBtnIcn@3x.png',
  'detectedCheckmark@3x.png',
  'inlineMessageDialog_closeBtn@3x.png',
  'list_rightside_chevron@3x.png',
  'wallet-00C6FF@3x.png',
  'wallet-00F4CD@3x.png',
  'wallet-6B696B@3x.png',
  'wallet-CFCECF@3x.png',
  'wallet-D975E1@3x.png',
  'wallet-EACF12@3x.png',
  'wallet-EB8316@3x.png',
  'wallet-F97777@3x.png'
]
const cached_preloadedImages = []
function PreLoadImages (context) {
  for (let i = 0; i < images_filenames.length; i++) {
    const filename = images_filenames[i]
    const imageURL = `../../../assets/img/${filename}`
    const image = new Image()
    image.src = imageURL
    cached_preloadedImages.push(image)
  }
}
exports.PreLoadImages = PreLoadImages
