require('dotenv').config();
const { notarize } = require('electron-notarize');

exports.default = async function notarizing(context) {
    const { electronPlatformName, appOutDir } = context;
    if (electronPlatformName !== 'darwin') {
        return;
    }

    const appName = context.packager.appInfo.productFilename;

    return await notarize({
        appBundleId: 'com.mymonero.mymonero-desktop',
        appPath: `${appOutDir}/${appName}.app`,
        appleId: 'devin@blackhat.co.za',
        appleIdPassword: 'erjp-shkl-vehk-graj',
        ascProvider: 'NLN5D623Y3'
    });
};