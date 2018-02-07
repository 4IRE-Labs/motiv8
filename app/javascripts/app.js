//import jquery and bootstrap
import 'jquery';
import 'bootstrap-loader';

// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'
import { default as detectNetwork } from 'web3-detect-network'

// Import our contract artifacts and turn them into usable abstractions.
import erc20_token_artifacts from '../../build/contracts/Motiv8ERC20Token.json'
import m8BadgeToken_artifacts from '../../build/contracts/M8BadgeToken.json'

// MetaCoin is our usable abstraction, which we'll use through the code below.
var ERC20TokenContract = contract(erc20_token_artifacts);
var ERC20TokenAddress = "0x97ce88c86d9e01e381495b2632109e5c9b4d0d6a";
var M8BadgeToken = contract(m8BadgeToken_artifacts);
var M8BadgeTokenAddress = "0xbaf7ad3d6e97d843a8b5d1bc7b3cd475d5521d2c";

// var ERC20TokenContract = contract(“0x97ce88c86d9e01e381495b2632109e5c9b4d0d6a”, erc20_token_artifacts[‘abi’]);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;
var hostUrl = "https://cryptstarter.io";
var allBadgeChallenges;
var allPointsChallenges;
// var testAccount = "0x4cc120790781c9b61bb8d9893d439efdf02e2d30"

var ChallengeType = { badge: 0, points: 1 }
var isDebug = false;
var networkId = "4"; //Rinkeby network id => 4
var defaultProvider = isDebug ? "http://localhost:9545" : "https://rinkeby.infura.io/7a2aaxZR9Iu72CZzQzgt";

var getQueryParam = function(param) {
    var found;
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
        App.insertMenu();
        App.insertFooter();

        // Bootstrap the MetaCoin abstraction for Use.
        ERC20TokenContract.setProvider(web3.currentProvider);
        M8BadgeToken.setProvider(web3.currentProvider);

        // Get the initial account balance so it can be displayed.
        web3.eth.getAccounts(function (err, accs) {
            if (err != null) {
                App.createAndAppendErrorStatus(err);
                return;
            }

            if (accs.length == 0) {
                App.createAndAppendWarningStatus("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
                return;
            }

            accounts = accs;
            account = accounts[0];
            App.configureLogInDependedElements(account);
        });
    },

    // Methods to insert info to UI

    insertMenu: function () {
        $( "#header_menu" ).load( "menu.html" );
    },

    insertFooter: function () {
        $( "#footer_container" ).load( "footer.html" );
    },

    setMyAllPoints: function (message) {
        var status = document.getElementById("myAllPoints");
        status.innerHTML = message;
    },

    createAndAppendErrorStatus: function (message) {
        var div = document.createElement("div");
        div.setAttribute("class", "alert alert-danger alert-dismissible fade show");
        div.setAttribute("role", "alert");
        App.appendStatus(div, "Hmm...", message);
    },

    createAndAppendWarningStatus: function (message) {
        var div = document.createElement("div");
        div.setAttribute("class", "alert alert-warning alert-dismissible fade show");
        div.setAttribute("role", "alert");
        App.appendStatus(div, "Aha...", message);
    },

    createAndAppendSuccStatus: function (message) {
        var div = document.createElement("div");
        div.setAttribute("class", "alert alert-success alert-dismissible fade show");
        div.setAttribute("role", "alert");
        App.appendStatus(div, "OK", message);
    },

    appendStatus: function (divAlert, title, message) {
        var statusesElem = document.getElementById("statuses");
        if (!statusesElem) {
            return
        }

        divAlert.innerHTML = "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">\n" +
            "<span aria-hidden=\"true\">&times;</span>\n" +
            "</button>\n" +
            "<strong>" + title + "</strong> " + message;

        statusesElem.appendChild(divAlert);
    },

    checkMetamaskConnection: function (callBackSucc) {
        web3.version.getNetwork((err, netId) => {
            switch (netId) {
            case networkId:
                break // everithing is ok
            default:
                console.log('This is an unknown network.')
                App.redirectToUserUsingWrongNetwork()
            }
        })

        web3.eth.getAccounts(function (err, accs) {
            if (err != undefined || accs.length == 0 ) {
                App.redirectToUnlockMetamask()
            } else {
                callBackSucc(accs[0]);
            }
        });
    },

    redirectToUserUsingWrongNetwork: function () {
        window.location.replace("user-using-wrong-network.html");
    },

    redirectToUnlockMetamask: function () {
        window.location.replace("user-your-metamask-is-locked.html");
    },

    redirectToUserAccount: function () {
        window.location.replace("user-profile.html");
    },

    /**
     * MY ACCOUNT FUNCTIONS FROM HERE ON
     */
    initMyAccount: function () {
        App.checkMetamaskConnection(function (account) {
            App.updateAccountPoints(account);
            App.loadAccountChallenges(account);
        });
    },

    updateAccountPoints: function (account) {
        if (getQueryParam("account") != undefined) {
            account = getQueryParam("account");
        }
        var tokenInstance;
        ERC20TokenContract.at(ERC20TokenAddress).then(function (instance) {
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
        if (getQueryParam("account") != undefined) {
            account = getQueryParam("account");
        }
        App.loadAllChallenges(function () {
            var tokenInstance;
            M8BadgeToken.at(M8BadgeTokenAddress).then(function (instance) {
                tokenInstance = instance;
                return tokenInstance.tokensOfOwner.call(account);
            }).then(function (tokensIds) {
                if (isDebug) {
                    App.createAndAppendSuccStatus("loadAccountChallengesIds: " + JSON.stringify(tokensIds));
                }
                return App.loadBadgesByIdsPromise(tokensIds, tokenInstance);
            }).then(function(badges) {
                if (isDebug) {
                    App.createAndAppendSuccStatus("loadAccountChallengesBadges: " + JSON.stringify(badges));
                }
                // var accountChallenges = App.generateChallengesWithFullfiledBadges(badges);

                var accountChallenges = badges.map(function(badge){

                    var found = {
                        "id":badge[0],
                        "address": "0x0",
                        "title":badge[0],
                        "description":"",
                        "reward_type":0,
                        "created_at":"2018-01-21T07:41:13.459Z",
                        "updated_at":"2018-01-21T07:41:13.459Z",
                        badge: {
                            challenge: badge[0],
                            face: badge[1].toNumber()+1,
                            mask: badge[2].toNumber()+1,
                            color: badge[3].toNumber(),
                            txHash: 0
                        }
                    };

                    for (var index in allBadgeChallenges) {
                        var challange = allBadgeChallenges[index];
                        if (challange["address"].toLowerCase() == badge[0].toLowerCase()) {
                            found["address"] = challange["address"];
                            found["title"] = challange["title"];
                            found["description"] = challange["description"];
                            found["reward_type"] = challange["reward_type"];
                            found["created_at"] = challange["created_at"];
                            found["updated_at"] = challange["updated_at"];
                        }
                    }

                    return found;
                })

                App.showGeneralBadgeChallenges(accountChallenges, App.createAccountBadgeChallengeTR);
                App.drawBadges(badges);

            }).catch(function (e) {
                App.createAndAppendErrorStatus(e.message)
            });
        })
    },
    
    loadBadgesByIdsPromise: function (ids, tokenInstance) {
        return Promise.all(ids.map(function (id) {
            return tokenInstance.getBadge.call(id);
        }))
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
        divCard.setAttribute("id",  "badges-holder");
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

        var p2 = document.createElement("p");
        p2.setAttribute("class", "card-text text-secondary");
        p2.innerText = "Address: " + challenge.address;
        divCardBody.appendChild(p2);


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
            var challange = badge[0];
            var face = badge[1].toNumber()+1;
            var mask = badge[2].toNumber()+1;
            var color = badge[3].toNumber();
            var canvasId = "canvas_"+face+"_"+mask+"_"+color;

            Badge.drawBadge({
                canvasId: canvasId,
                face: face,
                mask: mask,
                color: color
            });
        })
    },

    /* End of loading account badges */


    claimBadge: function (challengeId) {
        console.log("----------" + challengeId)

        $.post( hostUrl+"/api/v1/challenges/" + challengeId + "/claim", {  "challenge[user_address]": account })
        .done(function() {
            App.createAndAppendSuccStatus("Request to claim the badge was successfully sent")
        })
        .fail(function(error) {
            App.createAndAppendErrorStatus(JSON.stringify(error))
        })
    },

    /**
     * HOME FUNCTIONS FROM HERE ON
     */
    initHome: function () {
        App.loadAllChallenges(function () {
            App.showGeneralPointsChallenges(allPointsChallenges, App.createGeneralPointChallengeTR);
            App.showGeneralBadgeChallenges(allBadgeChallenges, App.createGeneralBadgeChallengeTR);

            var isAuthorized = account != undefined;
            App.configureAuthorizationButtons(isAuthorized);
        })
    },

    loadAllChallenges: function (callback) {
        $.get( hostUrl+"/api/v1/wallets")
        .done(function(challenges) {
            if (isDebug) {
                App.createAndAppendSuccStatus("loadAllChallenges: " + JSON.stringify(challenges));
            }
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
        divCard.setAttribute("id", "badges-holder");
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

        var p2 = document.createElement("p");
        p2.setAttribute("class", "card-text text-secondary");
        p2.innerHTML = "<strong>Address:</strong> " + challenge.address;
        divCardBody.appendChild(p2);

        var button = document.createElement("button");
        button.setAttribute("name", "claimButton");
        button.setAttribute("type", "button");
        button.setAttribute("class", "btn btn-success");
        button.setAttribute("style", "display:none");
        button.innerText = "Claim";
        button.setAttribute("onclick", "App.claimBadge("+ challenge.id +");return false;");
        divCardBody.appendChild(button);

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
            App.createAndAppendSuccStatus("New challange was added");
        })
        .fail(function(error) {
            App.createAndAppendErrorStatus(JSON.stringify(error))
        })
    },

    configureLogInDependedElements: function (account) {
        var isAuthorized = account != undefined
        this.configureAuthorizationButtons(isAuthorized);

        if (account != undefined) {
            this.configureAdminMenu(account);
            this.setActiveAccountAddress(account);
        }
    },

    /* Depended authorization Menu */

    configureAdminMenu: function (currentAccount) {
        var tokenInstance;
        ERC20TokenContract.at(ERC20TokenAddress).then(function (instance) {
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
    },

    setActiveAccountAddress: function (activeAccountAddress) {
        // for debug
        console.log("Current account number: " + activeAccountAddress)
    },

    /* Depended authorization Buttons */

    configureAuthorizationButtons: function (isAuthorized) {
        var display = isAuthorized == true ? "" : "none";
        document.getElementsByName("claimButton").forEach(function (elem) {
            elem.style.display = display;
        })
    },


    /**
     * METAMASK CONFIGURATION FUNCTIONS FROM HERE ON
     */

    initMetamaskLockMonitoring: function () {
        App.monitorMetamaskLock();
    },

    monitorMetamaskLock: function () {
        web3.eth.getAccounts(function (err, accs) {
            if (accs.length != 0 ) {
                App.redirectToUserAccount();
            }
        });

        setTimeout(App.monitorMetamaskLock, 5000);
    },
    


    initMetamaskNetworkMonitoring: function () {
        App.monitorMetamaskNetwork();
    },

    monitorMetamaskNetwork: function () {
        web3.version.getNetwork((err, netId) => {
            switch (netId) {
            case networkId:
                App.redirectToUserAccount();
                break;
            default:
                break;
            }
        });

        setTimeout(App.monitorMetamaskNetwork, 5000);
    }





    // watchTokenEvents: function () {
    //     var tokenInstance;
    //     ERC20TokenContract.at(ERC20TokenAddress).then(function (instance) {
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
        console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
        // Use Mist/MetaMask's provider
        window.web3 = new Web3(web3.currentProvider);
    } else {
        // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
        window.web3 = new Web3(new Web3.providers.HttpProvider(defaultProvider));
    }

    App.start();
});
