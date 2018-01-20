//import jquery and bootstrap
import 'jquery';
import 'bootstrap-loader';
// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import erc20_token_artifacts from '../../build/contracts/Motiv8ERC20Token.json'

// MetaCoin is our usable abstraction, which we'll use through the code below.
var ERC20TokenContract = contract(erc20_token_artifacts);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;

window.App = {
    start: function () {
        var self = this;

        // Bootstrap the MetaCoin abstraction for Use.
        ERC20TokenContract.setProvider(web3.currentProvider);

        // Get the initial account balance so it can be displayed.
        web3.eth.getAccounts(function (err, accs) {
            if (err != null) {
                App.createAndAppendErrorStatus("There was an error fetching your accounts.");
                return;
            }

            if (accs.length == 0) {
                App.createAndAppendErrorStatus("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
                return;
            }

            accounts = accs;
            account = accounts[0];
        });
    },

    // Methods to insert info to UI

    setMyAllPoints: function (message) {
        var status = document.getElementById("myAllPoints");
        status.innerHTML = message;
    },

    setActiveAccountAddress: function (activeAccountAddress) {
        var accountAddress = document.getElementById("activeAccountAddress")
        accountAddress.innerHTML = activeAccountAddress
    },

    createAndAppendErrorStatus: function (message) {
        var div = document.createElement("div");
        div.setAttribute("class", "alert alert-danger alert-dismissible fade show");
        div.setAttribute("role", "alert");
        App.appendStatus(div, message)
    },

    appendStatus: function (divAlert, message) {
        divAlert.innerHTML = "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">\n" +
            "<span aria-hidden=\"true\">&times;</span>\n" +
            "</button>\n" +
            "<strong>Hmmm...</strong> " + message;

        document.getElementById("statuses").appendChild(divAlert);
    },

    printImportantInformation: function () {
        ERC20TokenContract.deployed().then(function (instance) {
            var divAddress = document.createElement("div");
            divAddress.appendChild(document.createTextNode("Address Token: " + instance.address));
            divAddress.setAttribute("class", "alert alert-info");
            document.getElementById("importantInformation").appendChild(divAddress);
        });

        web3.eth.getAccounts(function (err, accs) {
            App.setActiveAccountAddress(accs[0])

            // web3.eth.getBalance(accs[0], function (err1, balance) {
            //     var divAddress = document.createElement("div");
            //     var div = document.createElement("div");
            //     div.appendChild(document.createTextNode("Active Account: " + accs[0]));
            //     var div2 = document.createElement("div");
            //     div2.appendChild(document.createTextNode("Balance in Ether: " + web3.fromWei(balance, "ether")));
            //     divAddress.appendChild(div);
            //     divAddress.appendChild(div2);
            //     divAddress.setAttribute("class", "alert alert-info");
            //     document.getElementById("importantInformation").appendChild(divAddress);
            // });
        });
    },

    /**
     * MY ACCOUNT FUNCTIONS FROM HERE ON
     */
    initMyAccount: function () {
        App.updateAccountPoints();
        App.updateAccountBadges();

        // App.watchTokenEvents();
        // App.printImportantInformation();
    },
    updateAccountPoints: function () {
        var tokenInstance;
        ERC20TokenContract.deployed().then(function (instance) {
            tokenInstance = instance;
            return tokenInstance.balanceOf.call(account);
        }).then(function (value) {
            console.log(value);
            App.setMyAllPoints(value.valueOf())
        }).catch(function (e) {
            console.log(e);
            App.createAndAppendErrorStatus("Error getting points balance; see log.")
        });
    },
    updateAccountBadges: function () {

    },




    // watchTokenEvents: function () {
    //     var tokenInstance;
    //     ERC20TokenContract.deployed().then(function (instance) {
    //         tokenInstance = instance;
    //         tokenInstance.allEvents({}, {fromBlock: 0, toBlock: 'latest'}).watch(function (error, result) {
    //             var alertbox = document.createElement("div");
    //             alertbox.setAttribute("class", "alert alert-info  alert-dismissible");
    //             var closeBtn = document.createElement("button");
    //             closeBtn.setAttribute("type", "button");
    //             closeBtn.setAttribute("class", "close");
    //             closeBtn.setAttribute("data-dismiss", "alert");
    //             closeBtn.innerHTML = "<span>&times;</span>";
    //             alertbox.appendChild(closeBtn);
    //
    //             var eventTitle = document.createElement("div");
    //             eventTitle.innerHTML = '<strong>New Event: ' + result.event + '</strong>';
    //             alertbox.appendChild(eventTitle);
    //
    //
    //             var argsBox = document.createElement("textarea");
    //             argsBox.setAttribute("class", "form-control");
    //             argsBox.innerText = JSON.stringify(result.args);
    //             alertbox.appendChild(argsBox);
    //             document.getElementById("tokenEvents").appendChild(alertbox);
    //             //document.getElementById("tokenEvents").innerHTML += '<div class="alert alert-info  alert-dismissible" role="alert"> <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><div></div><div>Args: '+JSON.stringify(result.args) + '</div></div>';
    //
    //         });
    //     }).catch(function (e) {
    //         console.log(e);
    //         App.setStatus("Error getting balance; see log.");
    //     });
    // }
};

window.addEventListener('load', function () {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
        console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
        // Use Mist/MetaMask's provider
        window.web3 = new Web3(web3.currentProvider);
    } else {
        console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
        // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
        window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:9545"));
    }

    App.start();
});
