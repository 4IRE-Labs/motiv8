var Motiv8ERC20Token = artifacts.require("./Motiv8ERC20Token.sol");

module.exports = function(deployer) {
  deployer.deploy([
    [Motiv8ERC20Token, {overwrite: false}]    
  ]);
};