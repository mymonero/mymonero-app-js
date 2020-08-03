
//const BrowserWindow = 
const electron = require('electron');
const app = electron.app;
console.log(electron);
const doc = electron.webFrame;
doc.insertText('text test');
console.log(doc);

//const WalletsListView = require('../../WalletsList/')
// class myDoc extends EventListener {
//     constructor()
// 	{
//         super(options, context)
//         this.document = electron.webFrame.context.document;
//         console.log(this);
//     }
// }

// const localDoc = new doc();

// console.log(localDoc);

var ipc = require('electron').ipcRenderer;
var sendFundsButton = doc.getElementById('sendFunds');

// sendFundsButton.addEventListener('click', function(){
//     // ipc.once('actionReply', function(event, response){
//     //     processResponse(response);
//     // })
//     // ipc.send('invokeAction', 'someData');
//     console.log("Hello from click event");
// });

const options = {}
const SendTabContentView = require('../../SendFundsTab/Views/SendFundsView.Full.web')
const view = document.getElementById('main-body');
//self.sendTabContentView = view

function bindListeners() {
    console.log(doc);
    const sendFunds = doc.getElementById('sendFunds');
    console.log(sendFunds);
    sendFundsButton.addEventListener('click', () => {
        console.log('sendFunds got clicked');
        view.innerHTML(SendTabContentView.renderHTML());
    });    
    console.log('We have run');
}

doc.addEventListener('ready', bindListeners());



{/* <div id="walletsList" style="-webkit-app-region: no-drag; width: 100%; height: 100%; border: none; background-image: url('../../../assets/img/icon_tabBar_wallets__active@3x.png'); background-position: center center; background-repeat: no-repeat; background-size: 24px 24px; opacity: 0.3;"></div>
</a>
<a style="display: inline-block; position: relative; -webkit-app-region: no-drag; -webkit-tap-highlight-color: rgba(0, 0, 0, 0); width: 79px; height: 56px;">
    <div id="sendFunds" */}