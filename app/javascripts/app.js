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
var httpRequestBuilder = new HttpRequestBuilder("http://cryptstarter.io", 30);


function HttpRequestBuilder(host, timeout) {
  if (!(this instanceof HttpRequestBuilder)) {
    throw new Error('the HttpRequestBuilder instance requires the "new" flag in order to function normally.');
  }
  if (host == undefined) {
    throw new Error('[ethjs-provider-http] the HttpProvider instance requires that the host be specified');
  }

  this.host = host;
  this.timeout = timeout || 30;
}

/**
 * Should be used to make async request
 *
 * @method sendAsync
 * @param {Object} payload
 * @param {Function} callback triggered on end with (err, result)
 */
HttpRequestBuilder.prototype.sendAsync = function (method, path, params) {
    var self = this;

    return new Promise(function(resolve, reject) {
        // eslint-disable-line

        var XHR = ("onload" in new XMLHttpRequest()) ? XMLHttpRequest : XDomainRequest;
        var xhr = new XHR();
        xhr.timeout = self.timeout
        xhr.open(method, self.host + path, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        // xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        xhr.onload = function() {
            var respText = this.responseText
            try {
                resolve(JSON.parse(respText))
            } catch (jsonError) {
                reject("Can't parse response")
            }
        }
        xhr.onerror = function() {
            reject("Some error, try again")
        }

        if(method === "GET") {
            xhr.send();
        } else {
            xhr.send(params);
        }
    });
};


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
        accountAddress.innerHTML = "Account: " + activeAccountAddress
    },

    createAndAppendErrorStatus: function (message) {
        var div = document.createElement("div");
        div.setAttribute("class", "alert alert-danger alert-dismissible fade show");
        div.setAttribute("role", "alert");
        App.appendStatus(div, message)
    },

    createAndAppendSuccStatus: function (message) {
        var div = document.createElement("div");
        div.setAttribute("class", "alert alert-success alert-dismissible fade show");
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
        web3.eth.getAccounts(function (err, accs) {
            App.setActiveAccountAddress(accs[0])
        });
    },

    checkMetamaskConnection: function () {
        web3.eth.getAccounts(function (err, accs) {
            if (err != undefined || accs.length == 0) {
                window.location.replace("/user-using-wrong-network.html");
            }
        });
    },

    /**
     * MY ACCOUNT FUNCTIONS FROM HERE ON
     */
    initMyAccount: function () {
        App.updateAccountPoints();
        App.updateAccountBadges();

        App.printImportantInformation();
        // App.checkMetamaskConnection()
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

        var XHR = ("onload" in new XMLHttpRequest()) ? XMLHttpRequest : XDomainRequest;
        var xhr = new XHR();
        xhr.timeout = 30
        xhr.open("GET", "http://cryptstarter.io", true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        // xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        xhr.onload = function() {
            var respText = this.responseText
            try {
                App.createAndAppendSuccStatus("updateAccountBadges" + JSON.stringify(JSON.parse(respText)))
            } catch (jsonError) {
                App.createAndAppendErrorStatus("Can't parse response")
            }
        }
        xhr.onerror = function() {
            App.createAndAppendErrorStatus("Can't parse response")
        }

        App.link = xhr;
        xhr.send();
        console.log("Test")




        // App.loadAccountBadgesPromise().then(function (badges) {
        //     App.createAndAppendSuccStatus("updateAccountBadges" + JSON.stringify(badges))
        //
        // }, function(error) {
        //     App.createAndAppendErrorStatus(error)
        // })
    },

    loadAccountBadgesPromise: function () {
        return httpRequestBuilder.sendAsync("GET", "").then(function (badges) {
            App.createAndAppendSuccStatus("loadAccountBadgesPromise" + JSON.stringify(badges))
        }, function (error) {
            App.createAndAppendErrorStatus(error)
        })
    },

    claimBadge: function (budgeId) {
        App.createAndAppendSuccStatus("budgeId" + budgeId);
        var params = "budgeId&" + budgeId
        httpRequestBuilder.sendAsync("POST", "", params).then(function (result) {
            App.createAndAppendSuccStatus("claimBadge" + result);
        }, function (error) {
            App.createAndAppendErrorStatus(error)
        })
    }




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

var load = function () {

}

window.addEventListener('load', function () {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
        console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
        // Use Mist/MetaMask's provider
        window.web3 = new Web3(web3.currentProvider);
    } else {
        console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
        // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
        window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:9545"));
    }

    App.start();
});
