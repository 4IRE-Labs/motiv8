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
var hostUrl = "http://cryptstarter.io";
var testAccount = "0x4cc120790781c9b61bb8d9893d439efdf02e2d30"

var ChallengeType = { badge: 0, points: 1 }

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
            App.configureAdminMenu(account)
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
            App.setActiveAccountAddress(accs[0]);
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
        App.printImportantInformation();
        App.updateAccountPoints();
        App.updateAccountBadges();

        App.checkMetamaskConnection()
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
        $.post( hostUrl+"/api/v1/wallets/check-donation", {  address: testAccount })
        .done(function(data) {
            App.createAndAppendSuccStatus("updateAccountBadges: " + JSON.stringify(data) )
        })
        .fail(function(error) {
            App.createAndAppendErrorStatus(JSON.stringify(error))
        })
    },

    claimBadge: function (budgeId) {

    },

    /**
     * HOME FUNCTIONS FROM HERE ON
     */
    initHome: function () {
        App.printImportantInformation();
        App.loadAllChallenges()
    },

    loadAllChallenges: function () {
        $.get( hostUrl+"/api/v1/wallets")
        .done(function(challenges) {
            App.createAndAppendSuccStatus("loadAllChallenges: " + JSON.stringify(challenges) );

            App.showGeneralPointsChallenges(App.filterChallenges(challenges, ChallengeType.points));
            App.showGeneralBadgeChallenges(App.filterChallenges(challenges, ChallengeType.badge));
        })
        .fail(function(error) {
            App.createAndAppendErrorStatus(JSON.stringify(error))
        })
    },

    filterChallenges: function (allChallenges, type) {
        return allChallenges.filter(function (challenge) {
            return challenge.reward_type == type
        })
    },

    showGeneralPointsChallenges: function (pointsChallenges) {
        var pointsChallengesElem = document.getElementById("pointsChallenges")
        pointsChallenges.forEach(function (challenge) {
            pointsChallengesElem.appendChild(App.createGeneralPointChallengeTR(challenge))
        })
    },

    showGeneralBadgeChallenges: function (badgeChallenges) {
        var pointsChallengesElem = document.getElementById("allBadgeChallengesContainer")
        badgeChallenges.forEach(function (challenge) {
            pointsChallengesElem.appendChild(App.createGeneralBadgeChallengeTR(challenge))
        })
    },

    createGeneralPointChallengeTR: function (challenge) {
        var tr = document.createElement("tr");

        var fTd = document.createElement("td");
        fTd.setAttribute("scope", "row");
        fTd.innerText = new Date(challenge.created_at).toDateString();

        var sTd = document.createElement("td");
        sTd.innerText = challenge.title;

        var tTd = document.createElement("td");
        tTd.setAttribute("class", "text-right");
        tTd.innerText = challenge.address;

        tr.appendChild(fTd);
        tr.appendChild(sTd);
        tr.appendChild(tTd);
        return tr;
    },

    createGeneralBadgeChallengeTR: function (challenge) {
        var div = document.createElement("div");
        div.setAttribute("class", "col-sm-4");
        div.innerHTML =
            '<div class="card pt-4">' +
            '<img class="card-img mx-auto" src="images/card-img-1.svg" alt="card image">' +
            '<div class="card-body">' +
            '<h5 class="card-title text-uppercase text-secondary">' + challenge.title + '</h5>' +
            '<p class="card-text text-secondary">'+challenge.description+'</p>' +
            '</div>' +
            '</div>';
        return div
    },


    /**
     * ADMIN FUNCTIONS FROM HERE ON
     */

    createNewChallenge: function () {
        var title = document.getElementById("inputTitle");
        var description = document.getElementById("descriptionTextarea");

        var badgeRation = document.getElementById("inlineRadio1");
        // var pointsRation = document.getElementById("inlineRadio2");

        var wallet = document.getElementById("inputWallet");

        var params = {}
        params["wallet[title]"] = title.value;
        params["wallet[description]"] = description.value;
        params["wallet[address]"] = wallet.value;
        params["wallet[reward_type]"] = badgeRation.checked == true ? ChallengeType.badge : ChallengeType.points;

        $.post( hostUrl+"/api/v1/wallets", params)
        .done(function(newChallenge) {
            App.createAndAppendSuccStatus("createNewChallenge: " + JSON.stringify(newChallenge) );
        })
        .fail(function(error) {
            App.createAndAppendErrorStatus(JSON.stringify(error))
        })
    },
    
    configureAdminMenu: function (currentAccount) {
        var tokenInstance;
        ERC20TokenContract.deployed().then(function (instance) {
            tokenInstance = instance;
            return tokenInstance.owner.call();
        }).then(function (value) {
            App.configureMenuAsAdmin(value == currentAccount)
        }).catch(function (e) {
            App.createAndAppendErrorStatus("Error getting points balance; see log.")
        });
    },

    configureMenuAsAdmin: function (isAdmin) {
        var display = isAdmin == true ? "" : "none";
        document.getElementById("addNewChallenge").style.display = display;

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
