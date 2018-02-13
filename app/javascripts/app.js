//import jquery and bootstrap
import 'jquery';

// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/bootstrap.css";
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'
import { default as detectNetwork } from 'web3-detect-network'

// Import our contract artifacts and turn them into usable abstractions.
import m8BadgeToken_artifacts from '../../build/contracts/M8BadgeToken.json'

// MetaCoin is our usable abstraction, which we'll use through the code below.
var M8BadgeToken = contract(m8BadgeToken_artifacts);
var M8BadgeTokenAddress = "0xbaf7ad3d6e97d843a8b5d1bc7b3cd475d5521d2c";


// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;
var hostUrl = "https://cryptstarter.io";
var etherscanUrl = "https://rinkeby.etherscan.io/tx/"
var allBadgeChallenges;
var allPointsChallenges;

var ChallengeType = { badge: 0, points: 1 }
var isDebug = false;
var networkId = "4"; //Rinkeby network id => 4
var defaultProvider = isDebug ? "http://localhost:9545" : "https://rinkeby.infura.io/7a2aaxZR9Iu72CZzQzgt";
var currentPage = function () { };

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
        currentPage = App.replaceByAboutPage;
        App.insertMenu();
        App.insertFooter();
        App.replaceByAboutPage();
        App.configureWeb3();
        App.monitorMetamaskLock();
    },

    configureWeb3: function () {
        // Checking if Web3 has been injected by the browser (Mist/MetaMask)
        if (typeof web3 !== 'undefined') {
            console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
            // Use Mist/MetaMask's provider
            window.web3 = new Web3(web3.currentProvider);
        } else {
            // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
            window.web3 = new Web3(new Web3.providers.HttpProvider(defaultProvider));
        }

        // Bootstrap the MetaCoin abstraction for Use.
        M8BadgeToken.setProvider(web3.currentProvider);

        // Get the initial account balance so it can be displayed.
        web3.eth.getAccounts(function (err, accs) {
            if (err != null) {
                App.createAndAppendErrorStatus(err);
                return;
            }

            if (accs.length == 0) {
                App.createAndAppendWarningStatus("Couldn't get any accounts! Make sure your Ethereum client is configured correctly. " + "<a href='faq.html'>See details.</a>");
                return;
            }

            accounts = accs;
            account = accounts[0];
            App.configureLogInDependedElements(account);
        });
    },

    // Inner contents

    replaceByMainPage: function () {
        currentPage = App.replaceByMainPage;
        var filename = "innerPages/main.html";
        $('#container_page_inner').fadeOut(function() {
           $(this).load( filename, function () {
               App.initHome();
               $('#container_page_inner').fadeIn();
           }).hide();
        });
    },

    replaceByProfilePage: function () {
        currentPage = App.replaceByProfilePage;
        App.checkMetamaskConnection(function (account) {
            if (!account) { return }

            var filename = "innerPages/user-profile.html";
            $('#container_page_inner').fadeOut(function() {
               $(this).load( filename, function () {
                   App.initMyAccount();
                    $('#container_page_inner').fadeIn();
                }).hide();
            });
        });
    },

    replaceByFAQPage: function () {
        currentPage = App.replaceByFAQPage;
        var filename = "innerPages/faq.html";
        $('#container_page_inner').fadeOut(function() {
           $(this).load( filename, function () {
               $('#container_page_inner').fadeIn();
           }).hide();
           setTimeout(App.findToggles, 500);
        });
    },

    replaceByTermsOfUsePage: function () {
        currentPage = App.replaceByTermsOfUsePage;
        var filename = "innerPages/terms_of_use.html";
        $('#container_page_inner').fadeOut(function() {
           $(this).load( filename, function () {
               $('#container_page_inner').fadeIn();
           }).hide();
           App.findToggles();
        });
    },

    replaceByPrivacyPolicyPage: function () {
        currentPage = App.replaceByPrivacyPolicyPage;
        var filename = "innerPages/privacy_policy.html";
        $('#container_page_inner').fadeOut(function() {
           $(this).load( filename, function () {
               $('#container_page_inner').fadeIn();
           }).hide();
           App.findToggles();
        });
    },

    findToggles: function () {
        $('.accordion').find('.accordion-toggle').click(function() {
            $(this).next().slideToggle('600');
            $(".accordion-content").not($(this).next()).slideUp('600');
        });
        $('.accordion-toggle').on('click', function() {
            $(this).toggleClass('active').siblings().removeClass('active');
        });
    },

    replaceByAboutPage: function () {
        currentPage = App.replaceByAboutPage;
        var filename = "innerPages/about.html";
        $('#container_page_inner').fadeOut(function() {
           $(this).load( filename, function () {
               $('#container_page_inner').fadeIn();
           }).hide();
        });
    },

    replaceByAddNewChallengePage: function () {
        currentPage = App.replaceByAddNewChallengePage;
        var filename = "innerPages/admin-challenge-add.html";
        $('#container_page_inner').fadeOut(function() {
           $(this).load( filename, function () {
               $('#container_page_inner').fadeIn();
           }).hide();
        });
    },

    replaceByAddingUserUsingWrongNetworkPage: function() {
        currentPage = App.replaceByProfilePage;
        var filename = "innerPages/user-using-wrong-network.html";
        $('#container_page_inner').fadeOut(function() {
           $(this).load( filename, function () {
               App.initMetamaskNetworkMonitoring();
               $('#container_page_inner').fadeIn();
           }).hide();
        });
    },

    replaceByUnlockMetamaskPage: function() {
        currentPage = App.replaceByProfilePage;
        var filename = "innerPages/user-your-metamask-is-locked.html";
        $('#container_page_inner').fadeOut(function() {
           $(this).load( filename, function () {
               $('#container_page_inner').fadeIn();
           }).hide();
        });
    },

    replaceByUserUseUnsupportedBrowserPage: function() {
        currentPage = App.replaceByUserUseUnsupportedBrowserPage;
        var filename = "innerPages/wrong_browser.html";
        $('#container_page_inner').fadeOut(function() {
           $(this).load( filename, function () {
               $('#container_page_inner').fadeIn();
           }).hide();
        });
    },

    replaceByNoBadgesPage: function () {
        currentPage = App.replaceByProfilePage;
        var filename = "innerPages/no_badges.html";
        $('#container_page_inner').fadeOut(function() {
           $(this).load( filename, function () {
               $('#container_page_inner').fadeIn();
           }).hide();
        });
    },

    replaceByLoadingPage: function () {
        var filename = "innerPages/loading.html";
        $('#container_page_inner').fadeOut(function() {
           $(this).load( filename, function () {
               $('#container_page_inner').fadeIn();
           }).hide();
        });
    },


    // Methods to insert info to UI

    insertMenu: function () {
        $( "#header_menu" ).load( "menu.html" );
    },

    insertFooter: function () {
        $( "#footer_container" ).load( "footer.html" );
    },

    createAndAppendErrorStatus: function (message) {
        var div = document.createElement("div");
        div.setAttribute("class", "alert alert-danger alert-dismissible fade show");
        div.setAttribute("role", "alert");
        App.appendStatus(div, message);
    },

    createAndAppendWarningStatus: function (message) {
        var div = document.createElement("div");
        div.setAttribute("class", "alert alert-warning alert-dismissible fade show");
        div.setAttribute("role", "alert");
        App.appendStatus(div, message);
    },

    createAndAppendSuccStatus: function (message) {
        var div = document.createElement("div");
        div.setAttribute("class", "alert alert-success alert-dismissible fade show");
        div.setAttribute("role", "alert");
        App.appendStatus(div, message);
    },

    appendStatus: function (divAlert, message) {
        var statusesElem = document.getElementById("statuses");
        if (!statusesElem) { return }
        var closeButton = "";
        if (isDebug) {
            closeButton = "<span aria-hidden=\"true\">&times;</span>\n";
        }

        divAlert.innerHTML = "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">\n" +
             closeButton +
            "</button>\n" + message;

        statusesElem.appendChild(divAlert);
    },

    checkMetamaskConnection: function (callBackSucc) {
        var checkMetamask = function () {
            if (accounts == undefined || accounts.length == 0 ) {
                var isSafari = window.safari !== undefined;
                if (isSafari) {
                    App.replaceByUserUseUnsupportedBrowserPage();
                } else {
                    App.replaceByUnlockMetamaskPage()
                }
            } else {
                callBackSucc(account);
            }
        }

        web3.version.getNetwork((err, netId) => {
            switch (netId) {
            case networkId:
                checkMetamask();
                break;
            default:
                console.log('This is an unknown network.')
                App.replaceByAddingUserUsingWrongNetworkPage();
            }
        });
    },

    hideLoading: function () {
        $('#loading_alert').remove();
    },


    /**
     * MY ACCOUNT FUNCTIONS FROM HERE ON
     */
    initMyAccount: function () {
        App.loadAccountChallenges(account);
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

                if(accountChallenges.length > 0) {
                    App.showGeneralBadgeChallenges(accountChallenges, App.createAccountBadgeChallengeTR);
                    App.drawBadges(badges);
                } else {
                    App.replaceByNoBadgesPage();
                }
                App.hideLoading();

            }).catch(function (e) {
                App.createAndAppendErrorStatus(e.message);
            });
        })
    },
    
    loadBadgesByIdsPromise: function (ids, tokenInstance) {
        return Promise.all(ids.map(function (id) {
            return tokenInstance.getBadge.call(id);
        }))
    },

    // generateChallengesWithFullfiledBadges: function (badges) {
    //     return badges.map(function (badge) {
    //         var challenge = App.findChallengeForBadge(badge);
    //         challenge.badge = badge;
    //     }).filter(function (challenge) {
    //         return challenge != undefined;
    //     })
    // },

    // findChallengeForBadge: function (badge) {
    //     return allBadgeChallenges.find(function (challenge) {
    //         return challenge.id.toString() == badge.challenge;
    //     })
    // },

    createAccountBadgeChallengeTR: function (challenge) {
        var badge = challenge.badge
        var canvasId = "canvas_"+badge.face+"_"+badge.mask+"_"+badge.color;
        var canvas = document.createElement("canvas");
        canvas.setAttribute("id", canvasId);
        canvas.setAttribute("width", 200);
        canvas.setAttribute("height", 200);
        canvas.setAttribute("alt", "card image");
        canvas.setAttribute("class", "card-img mx-auto");

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

        return div
    },

    drawBadges: function (badges) {
        badges.forEach(function (badge) {
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

    donate: function (challengeId) {
        console.log("----------" + challengeId)
        var challenge = App.findChallengeWithId(challengeId)
        if (challenge == undefined) {
            return
        }

        var receiver = challenge.address;
        var amount = web3.toWei(0.01, "ether");
        web3.eth.sendTransaction({from: account, to: receiver, value: amount}, function(error, result){
            if(!error) {
                var url = etherscanUrl + result
                App.createAndAppendSuccStatus("Many thanks! After your donation will be mined, you have to tap on 'Claim' " +
                    "to finish the challenge! To see status of your transaction <a href="+ url+ " target='_blank'>go here</a>.");
            } else {
                App.createAndAppendErrorStatus("Something is wrong. Donation was not successful 😥");
            }
        });
    },

    findChallengeWithId: function (challengeId) {
        return allBadgeChallenges.find(function (challenge) {
            return challenge.id.toString() == challengeId;
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
            App.hideLoading();
        })
        .fail(function(error) {
            App.createAndAppendErrorStatus(JSON.stringify(error));
        })
    },

    filterChallenges: function (allChallenges, type) {
        return allChallenges.filter(function (challenge) {
            return challenge.reward_type == type;
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

        var button = document.createElement("button");
        button.setAttribute("name", "claimButton");
        button.setAttribute("type", "button");
        button.setAttribute("class", "btn btn-primary");
        button.setAttribute("style", "display:none");
        button.innerText = "Claim";
        button.setAttribute("onclick", "App.claimBadge("+ challenge.id +");return false;");
        divCardBody.appendChild(button);

        button = document.createElement("button");
        button.setAttribute("name", "claimButton");
        button.setAttribute("type", "button");
        button.setAttribute("class", "btn btn-success");
        button.setAttribute("style", "display:none");
        button.innerText = "Donate";
        button.setAttribute("onclick", "App.donate("+ challenge.id +");return false;");
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
            console.log("Current account number: " + account)
        }
    },

    /* Depended authorization Menu */

    configureAdminMenu: function (currentAccount) {
        var tokenInstance;
        M8BadgeToken.at(M8BadgeTokenAddress).then(function (instance) {
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

    monitorMetamaskLock: function () {
        web3.eth.getAccounts(function (err, accs) {
            if (accs.length != 0 && account == undefined) {
                App.configureWeb3();
                App.replaceByProfilePage();
            } else if (accs.length == 0 && account != undefined) {
                account = undefined;
                accounts = undefined;
                App.replaceByUnlockMetamaskPage();
            } else if (accs.length != 0 && account != accs[0]) {
                App.configureWeb3();
                currentPage();
            }
            setTimeout(App.monitorMetamaskLock, 5000);
        });
    },

    initMetamaskNetworkMonitoring: function () {
        App.monitorMetamaskNetwork();
    },

    monitorMetamaskNetwork: function () {
        web3.version.getNetwork((err, netId) => {
            switch (netId) {
            case networkId:
                App.configureWeb3();
                App.replaceByProfilePage();
                break;
            default:
                setTimeout(App.monitorMetamaskNetwork, 5000);
                break;
            }
        });
    }
};

window.addEventListener('load', function () {
    App.start();
});
