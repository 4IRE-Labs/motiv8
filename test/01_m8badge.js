const expectThrow = require('./helpers/expectThrow');
var M8BadgeToken = artifacts.require("./M8BadgeToken.sol");


contract('M8BadgeToken', async function (accounts) {

    var contract;
    const challengeId = "Challenge 0";

    before(async function () {
        contract = await M8BadgeToken.deployed();
    });

    it("1 - Should check that the genesis token owner is owner of the contract", async function() {
        var owner = await contract.ownerOf(0);
        assert.equal(owner, accounts[0], "Owner of 0 (Genesis) badge should be the contract owner.")
    });

    it("2 - Should create new badge for transaction that doesn't exist", async function() {
        var txId = web3.toDecimal('0xee9f087ca77195ec40a79cd9b44626fc50e5183cb7dbfdf447cf36c9a6892025');        
        await contract.create(txId, challengeId, accounts[0]);

        var tokens = await contract.tokensOfOwner.call(accounts[0]);
        assert.equal(tokens.length, 2, "Balance of account should equal 2 (Genesis Token and New one)");
    });

    it("3 - Should return list of claimed transaction for Challenge 0", async function() {
        var txHashes = await contract.claimedChallengeTransactions.call(challengeId);
        assert.equal(txHashes.length, 2, "Number of transactions should equal number of badges for this challenge.");
    });

    it("4 - Should estimate gas", async function() {
        var gas = await contract.create.estimateGas("3", "New badge for Tx #3", accounts[0]);
        assert.equal(gas > 0, true, "Gas should be more then 0");
        // console.log("Estimated gas: " + gas);
    }); 

    it("5 - Should return badge with correct name", async function(){
        const badgeId = "1";
        var badge = await contract.getBadge.call(badgeId);
        assert.equal(badge[0], challengeId, "Badge challenge should be equal as previousely created");

        // console.log("Badge #1 txHash: " + badge[0]);
        // console.log("Badge #1 face: " + badge[1]);
        // console.log("Badge #1 mask: " + badge[2]);
        // console.log("Badge #1 color: " + badge[3]);
    });

    it("6 - Should check that you cannot double create badge for same transaction id", async function() {
        var txId0 = web3.toDecimal('0x0');
        expectThrow(contract.create(txId0, challengeId, accounts[0]) );
    });

});