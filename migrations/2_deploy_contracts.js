var Motiv8ERC20Token = artifacts.require("./Motiv8ERC20Token.sol");
var M8BadgeToken = artifacts.require("./M8BadgeToken.sol");

module.exports = function(deployer) {
  deployer.deploy(Motiv8ERC20Token);
  deployer.deploy(M8BadgeToken);
};




