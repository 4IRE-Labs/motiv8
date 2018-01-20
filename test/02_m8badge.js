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
    
    // @dev fix this b implementing ThrowerProxy contract
    // it("should check that you cannot double create badge for same transaction id", function() {
    //     contract.create("0", "Another badge for Tx #0", accounts[0]).then(error => {
    //         assert.equal(true, "Badge should not be created", error != undefined);
    //     });
    // });

    it("should create new badge for trnsaction that doesn't exist", function() {                    
        contract.create("1", "New badge for Tx #1", accounts[0]).then(tx => {            
            return contract.tokensOfOwner.call(accounts[0]);            
        }).then(tokens => {
            assert.equal(tokens.length, 2, "Balance of account should equal 1");
        });
    });

    it("should estimate gas", function(){
        contract.create.estimateGas("3", "New badge for Tx #3", accounts[0]).then(gas => {            
            console.log("Estimated gas: " + gas);
            assert.equal(gas > 0, true, "Gas should be more then 0");
        });
    }); 

    it("should return badge with correct name", function(){
        contract.getBadge.call("1").then(badge => {
            console.log("Badge #1 name: " + badge);
            assert.equal(badge, "New badge for Tx #1", "Badge name should be equal as previousely created");
        });
    });

    it("should add new wallet to list of donation wallets", function() {
        contract.addDonationWallet('0x5aeda56215b167893e80b4fe645ba6d5bab767de').then(tx => {
            return contract.allWallets.call()
        }).then(wallets => {
            assert.equal(wallets.length, 1, "Number of wallets should become 1");
            assert.equal(wallets[0], '0x5aeda56215b167893e80b4fe645ba6d5bab767de', 'Wallet should be successfully added');
        });
    });

    it("should delete item from list of donation wallets", function(){
        var walletsBeforeDeletion = 0;
        contract.allWallets.call().then(wallets => {
            console.log("# of wallets in array is: " + wallets.length);
            walletsBeforeDeletion = wallets.length;
            return contract.deleteWallet(wallets[0]);
        }).then(tx => {
            return contract.allWallets.call()
        }).then(wallets => {
            assert.equal(walletsBeforeDeletion - wallets.length, 1, "Number of wallets after deletion should be 1 less then before");
        });
    });

});