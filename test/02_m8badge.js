var M8BadgeToken = artifacts.require("./M8BadgeToken.sol");

contract('M8BadgeToken', function (accounts) {
    var contract;

    before(function() {
        M8BadgeToken.deployed().then(function(instance) {
            contract = instance;
        });
    });

    it("should check the genesis token owner is owner of the contract", function() {
        contract.ownerOf(0).then(address => {
            assert.equal(address, accounts[0], "Owner of 0 (Genesis) badge should be the contract owner.")
        });
    });

    it("should create new badge for trnsaction that doesn't exist", function() {
        contract.create("1", "New badge for Tx #1", accounts[0]).then(tx => {
            return contract.tokensOfOwner(accounts[0]);
        }).then (ids => {
            console.log("Received badges: " + JSON.stringify(ids));
            assert.equal(ids.length, 2, "Amount of tokens owned by account[0] should equal 2");
        });
    });

    it("should add new wallet to list of donation wallets", function() {    
        contract.addDonationWallet('0x5aeda56215b167893e80b4fe645ba6d5bab767de').then(tx => {
            return contract.allWallets.call();
        }).then(wallets => {
            assert.equal(wallets.length, 1, "Length of wallets list shoud equal 1");
            return contract.addDonationWallet('0x6330a553fc93768f612722bb8c2ec78ac90b3bbc');
        }).then(tx => {
            return contract.donationWallets.call();            
        }).then(tx => {            
            assert.equal(wallets.length, 2, "Length of wallets list shoud equal 2");
        });
    });
});


// it("should check the genesis token owner is owner of the contract", function() {
//     contract('M8BadgeToken', function (accounts) {
//         M8BadgeToken.deployed().then(instance => {
//             return instance.ownerOf(0);
//         }).then( address => {
//             assert.equal(address, accounts[0], "Owner of 0 (Genesis) badge should be the contract owner.")
//         });
//     });
// });

// it("should check that you cannot double create badge for same transaction id", function() {
//     contract('M8BadgeToken', function (accounts) {
//         M8BadgeToken.deployed().then(instance => {
//             return instance.create("0", "Another badge for Tx #0", accounts[0]);
//         }).then(error => {
//             assert.error("Badge should not be created");
//         });
//     });
// });

// it("should create new badge for trnsaction that doesn't exist", function(){
//     contract('M8BadgeToken', function (accounts) {
//         M8BadgeToken.deployed().then(instance => {
//             return instance.create("1", "New badge for Tx #1", accounts[0]);
//         }).then(badgeId => {
//             assert.equal(badgeId, 1, "New badge for Tx #1 should equal 1");
//             return instance.ownerOf(badgeId);
//         }).then (address => {
//             assert.equal(address, accounts[0], "Owner of #1 (new Tx) badge should be the contract owner.")            
//         });
//     });
// });

// it("should add new wallet to list of donation wallets", function() {
//     contract('M8BadgeToken', function (accounts) {
//         M8BadgeToken.deployed().then(instance => {
//             return instance.addDonationWallet('0x5aeda56215b167893e80b4fe645ba6d5bab767de');
//         }).then(walletId => {
//             assert.equal(walletId, 0, "Wallet id of added wallet should equal 0");
//             return instance.addDonationWallet('0x6330a553fc93768f612722bb8c2ec78ac90b3bbc');
//         }).then(walletId => {
//             assert.equal(walletId, 2, "Wallet id of second added wallet should equal 1");
//             return instance.deleteWallet(walletId);
//         }).then(length => {
//             assert.equal(length, 0, "Length of array should become 0 after deletion");
//         });
//     });
// });