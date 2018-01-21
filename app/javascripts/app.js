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
import m8BadgeToken_artifacts from '../../build/contracts/M8BadgeToken.json'

// MetaCoin is our usable abstraction, which we'll use through the code below.
var ERC20TokenContract = contract("0x97ce88c86d9e01e381495b2632109e5c9b4d0d6a", erc20_token_artifacts['abi']);
var M8BadgeToken = contract("0xbaf7ad3d6e97d843a8b5d1bc7b3cd475d5521d2c", m8BadgeToken_artifacts['abi']);

// var ERC20TokenContract = contract(“0x97ce88c86d9e01e381495b2632109e5c9b4d0d6a”, erc20_token_artifacts[‘abi’]);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;
var hostUrl = "http://cryptstarter.io";
var allBadgeChallenges;
var allPointsChallenges;
var testAccount = "0x4cc120790781c9b61bb8d9893d439efdf02e2d30"

var ChallengeType = { badge: 0, points: 1 }

var getQueryParam = function(param) {
    var found = {};
    window.location.search.substr(1).split("&").forEach(function(item) {
        if (param ==  item.split("=")[0]) {
            found = item.split("=")[1];
        }
    });
    return found;
};

window.App = {
    start: function () {
        var self = this;

        // Bootstrap the MetaCoin abstraction for Use.
        ERC20TokenContract.setProvider(web3.currentProvider);
        M8BadgeToken.setProvider(web3.currentProvider);

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
        var accountAddress = document.getElementById("activeAccountAddress");
        accountAddress.innerHTML = "Account: " + activeAccountAddress;
    },

    createAndAppendErrorStatus: function (message) {
        var div = document.createElement("div");
        div.setAttribute("class", "alert alert-danger alert-dismissible fade show");
        div.setAttribute("role", "alert");
        App.appendStatus(div, "Hmm...", message);
    },

    createAndAppendSuccStatus: function (message) {
        var div = document.createElement("div");
        div.setAttribute("class", "alert alert-success alert-dismissible fade show");
        div.setAttribute("role", "alert");
        App.appendStatus(div, "OK", message);
    },

    appendStatus: function (divAlert, title, message) {
        divAlert.innerHTML = "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">\n" +
            "<span aria-hidden=\"true\">&times;</span>\n" +
            "</button>\n" +
            "<strong>" + title + "</strong> " + message;

        document.getElementById("statuses").appendChild(divAlert);
    },

    printImportantInformation: function () {
        web3.eth.getAccounts(function (err, accs) {
            App.setActiveAccountAddress(accs[0]);
        });
    },

    checkMetamaskConnection: function (callBackSucc) {
        web3.eth.getAccounts(function (err, accs) {
            if (err != undefined || accs.length == 0) {
                window.location.replace("/user-using-wrong-network.html");
            } else {
                callBackSucc(accs[0]);
            }
        });
    },

    /**
     * MY ACCOUNT FUNCTIONS FROM HERE ON
     */
    initMyAccount: function () {
        App.checkMetamaskConnection(function (account) {
            App.printImportantInformation();
            App.updateAccountPoints();
            App.loadAccountChallenges(account);
        });
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

    /* Start of loading account badges */

    loadAccountChallenges: function (account) {
        App.loadAllChallenges(function () {
            var tokenInstance;
            M8BadgeToken.deployed().then(function (instance) {
                tokenInstance = instance;
                return tokenInstance.tokensOfOwner.call(account);
            }).then(function (tokensIds) {
                App.createAndAppendSuccStatus("loadAccountChallengesIds: " + JSON.stringify(tokensIds));
                return App.loadBadgesByIdsPromise(tokensIds, tokenInstance);
            }).then(function(badges) {
                App.createAndAppendSuccStatus("loadAccountChallengesBadges: " + JSON.stringify(badges));
                // var accountChallenges = App.generateChallengesWithFullfiledBadges(badges);
                var accountChallenges = [{"id":14,
                    "address": "0x99a4572656eb49FFEEFbe9588f8e7ab0F8D6Eb5e",
                    "title":"TEst",
                    "description":" kadfk ahf sjhfkjas lfdsflaskf ",
                    "reward_type":0,
                    "created_at":"2018-01-21T07:41:13.459Z",
                    "updated_at":"2018-01-21T07:41:13.459Z",
                    badge: {
                        challenge: "14",
                        face: 2,
                        mask: 4,
                        color: 4,
                        txHash: 35
                    }}]

                App.showGeneralBadgeChallenges(accountChallenges, App.createAccountBadgeChallengeTR);
                App.drawBadges(badges);

            }).catch(function (e) {
                App.createAndAppendErrorStatus(e.message)
            });
        })
    },
    
    loadBadgesByIdsPromise: function (ids, tokenInstance) {
        ids.map(function (id) {
            return tokenInstance.getBadge.call(id);
        })
        return Promise.all(ids)
    },

    generateChallengesWithFullfiledBadges: function (badges) {
        return badges.map(function (badge) {
            var challenge = App.findChallengeForBadge(badge);
            challenge.badge = badge;
        }).filter(function (challenge) {
            return challenge != undefined;
        })
    },

    findChallengeForBadge: function (badge) {
        return allBadgeChallenges.find(function (challenge) {
            return challenge.id.toString() == badge.challenge;
        })
    },

    createAccountBadgeChallengeTR: function (challenge) {
        var badge = challenge.badge
        var canvasId = "canvas_"+badge.face+"_"+badge.mask+"_"+badge.color;
        var canvas = document.createElement("canvas");
        canvas.setAttribute("id", canvasId);
        canvas.setAttribute("width", 200);
        canvas.setAttribute("height", 200);
        canvas.setAttribute("alt", "card image");
        canvas.setAttribute("class", "card-img mx-auto");

        // document.body.appendChild(canvas);


        var div = document.createElement("div");
        div.setAttribute("class", "col-sm-4");

        var divCard = document.createElement("div");
        divCard.setAttribute("class", "card pt-4");
        divCard.appendChild(canvas);
        div.appendChild(divCard);

        var divCardBody = document.createElement("div");
        divCardBody.setAttribute("class", "card-body");
        divCard.appendChild(divCardBody);

        var h5 = document.createElement("h5");
        h5.setAttribute("class", "card-title text-uppercase text-secondary");
        h5.innerText = challenge.title;
        divCardBody.appendChild(h5);

        var p = document.createElement("p");
        p.setAttribute("class", "card-text text-secondary");
        p.innerText = challenge.description;
        divCardBody.appendChild(p);


        // div.innerHTML =
            // '<div class="card pt-4">' +
            // '<img class="card-img mx-auto" src="images/card-img-1.svg" alt="card image">' +
            // '<div class="card-body">' +
            // '<h5 class="card-title text-uppercase text-secondary">' +  + '</h5>' +
            // '<p class="card-text text-secondary">'+challenge.description+'</p>' +
            // '</div>' +
            // '</div>';
        return div
    },

    drawBadges: function (badges) {
        badges.forEach(function (badge) {
            var canvasId = "canvas_"+badge.face+"_"+badge.mask+"_"+badge.color;
            Badge.drawBadge({
                canvasId: canvasId,
                face: badge.face,
                mask: badge.mask,
                color: badge.color
            });
        })
    },

    /* End of loading account badges */


    claimBadge: function (event) {
        var challengeId = event.target.getAttribute('dataChallengeId');
        console.log("----------" + challengeId)
        // var target = event.target
        //
        // $.post( hostUrl+"/api/v1/wallets/check-donation", {  address: testAccount })
        // .done(function(data) {
        //     App.createAndAppendSuccStatus("updateAccountBadges: " + JSON.stringify(data) )
        // })
        // .fail(function(error) {
        //     App.createAndAppendErrorStatus(JSON.stringify(error))
        // })
    },

    /**
     * HOME FUNCTIONS FROM HERE ON
     */
    initHome: function () {
        App.printImportantInformation();
        App.loadAllChallenges(function (challenges) {
            App.showGeneralPointsChallenges(allPointsChallenges, App.createGeneralPointChallengeTR);
            App.showGeneralBadgeChallenges(allBadgeChallenges, App.createGeneralBadgeChallengeTR);
        })
    },

    loadAllChallenges: function (callback) {
        $.get( hostUrl+"/api/v1/wallets")
        .done(function(challenges) {
            App.createAndAppendSuccStatus("loadAllChallenges: " + JSON.stringify(challenges) );
            allBadgeChallenges = App.filterChallenges(challenges, ChallengeType.badge);
            allPointsChallenges = App.filterChallenges(challenges, ChallengeType.points);
            callback(challenges)
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

    showGeneralPointsChallenges: function (pointsChallenges, constructorFunc) {
        var pointsChallengesElem = document.getElementById("pointsChallenges")
        pointsChallenges.forEach(function (challenge) {
            pointsChallengesElem.appendChild(constructorFunc(challenge))
        })
    },

    showGeneralBadgeChallenges: function (badgeChallenges, constructorFunc) {
        var pointsChallengesElem = document.getElementById("allBadgeChallengesContainer")
        badgeChallenges.forEach(function (challenge) {
            pointsChallengesElem.appendChild(constructorFunc(challenge))
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

        var divCard = document.createElement("div");
        divCard.setAttribute("class", "card pt-4");
        div.appendChild(divCard);

        var img = document.createElement("img");
        img.setAttribute("class", "card-img mx-auto");
        img.setAttribute("src", "images/card-img-1.svg");
        img.setAttribute("alt", "card image");
        divCard.appendChild(img);

        var divCardBody = document.createElement("div");
        divCardBody.setAttribute("class", "card-body");
        divCard.appendChild(divCardBody);

        var h5 = document.createElement("h5");
        h5.setAttribute("class", "card-title text-uppercase text-secondary");
        h5.innerText = challenge.title;
        divCardBody.appendChild(h5);

        var p = document.createElement("p");
        p.setAttribute("class", "card-text text-secondary");
        p.innerText = challenge.description;
        divCardBody.appendChild(p);

        var button = document.createElement("button");
        button.setAttribute("type", "button");
        button.setAttribute("class", "btn btn-success");
        button.innerText = "Claim";
        button.setAttribute("dataChallengeId", challenge.id);
        button.setAttribute("onclick", "App.claimBadge();return false;");
        divCardBody.appendChild(button);



        // var div = document.createElement("div");
        // div.setAttribute("class", "col-sm-4");
        // div.innerHTML =
        //     '<div class="card pt-4">' +
        //
        //     '<div class="card-body">' +
        //     '<h5 class="card-title text-uppercase text-secondary">' + challenge.title + '</h5>' +
        //     '<p class="card-text text-secondary">'+challenge.description+'</p>' +
        //     '<button type="button" class="" onclick="App.claimBadge(\'' + challenge + '\');return false;">Claim</button>'
        //     '</div>' +
        //     '</div>';
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
