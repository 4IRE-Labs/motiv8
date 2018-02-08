var M8BadgeToken = artifacts.require("./M8BadgeToken.sol");

module.exports = function(deployer) {
    deployer.deploy(M8BadgeToken);
};