var Motiv8ERC20Token = artifacts.require("./Motiv8ERC20Token.sol");

contract('Motiv8ERC20Token', async function(accounts) {

    
    // it("1 - First account must own all tokens", async function() {        
    //     var myTokenInstance = await Motiv8ERC20Token.deployed();
    //     var totalSupply = await myTokenInstance.totalSupply.call();
    //     var balance = await myTokenInstance.balanceOf(accounts[0]);
    //     assert.equal(balance.toNumber(), totalSupply.toNumber(), "Total Amount of tokens is owned by owner");
    // });

    it("2 - Second account must own no tokens", async function() {
        var myTokenInstance = await Motiv8ERC20Token.deployed();
        var balance = await myTokenInstance.balanceOf(accounts[1]);
        assert.equal(balance.toNumber(), 0, "Total Amount of tokens is owned by some other address");

        console.log("ERC20 Address: " + myTokenInstance.address);
    });

    it("3 - Must send tokens correctly", async function() {        
        var account_one = accounts[0];
        var account_two = accounts[1];
        var myTokenInstance = await Motiv8ERC20Token.deployed();
        
        var account_one_starting_balance = (await myTokenInstance.balanceOf.call(account_one)).toNumber();
        var account_two_starting_balance = (await myTokenInstance.balanceOf.call(account_two)).toNumber();

        var amount = 10;
        await myTokenInstance.transfer(account_two, amount);

        var account_one_ending_balance = (await myTokenInstance.balanceOf.call(account_one)).toNumber();
        var account_two_ending_balance = (await myTokenInstance.balanceOf.call(account_two)).toNumber();

        assert.equal(account_one_ending_balance, account_one_starting_balance - amount, "Amount wasn't correctly taken from the sender");
        assert.equal(account_two_ending_balance, account_two_starting_balance + amount, "Amount wasn't correctly sent to the receiver");
    });

});