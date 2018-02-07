pragma solidity ^0.4.17;

import "./M8BadgeOwnership.sol";
import "./Motiv8ERC20Token.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";

contract M8BadgeToken is M8BadgeOwnership, Ownable {

    enum BadgeType { Badge, Points }

    Motiv8ERC20Token public erc20Token;
    mapping(uint=>bool) claimedTransactions;
    mapping(string=>uint[]) challengeTransactions;

    function M8BadgeToken() public {        
        create(0, "Challenge 0", msg.sender, 0);        
    }

    function setToken(address _erc20Token) {
        erc20Token = Motiv8ERC20Token(_erc20Token);
    }

    function create(uint _txHash, string _challengeId, address forUser, uint8 _badgeType) onlyOwner public returns (uint) {
        BadgeType badgeType = BadgeType(_badgeType);
        require(!claimedTransactions[_txHash]);  
        //@dev TODO: implement merkle proof protection              
        claimedTransactions[_txHash] = true;
        challengeTransactions[_challengeId].push(_txHash);

        if (badgeType == BadgeType.Badge) {
            return _createBadge(_txHash, _challengeId, forUser);
        } else {
            erc20Token.transfer(forUser, 10);
        }

        return 1;
    }

    function claimedChallengeTransactions(string _challengeId) public view returns (uint[] txHashes) {
        uint[] storage txs = challengeTransactions[_challengeId];
        txHashes = txs;
    }

    /// @dev returns badge information
    function getBadge(uint256 _tokenId) public view returns (string challenge, uint face, uint mask, uint color, uint txHash) {
        require(badges.length > _tokenId);
        M8Badge storage badge = badges[_tokenId];
        challenge = string(badge.challenge);
        face = uint(badge.face);
        mask = uint(badge.mask);
        color = uint(badge.color);
        txHash = uint(badge.txHash);
    }

    function getPoints(address user) public view returns (uint) {
        erc20Token.balanceOf(user);
    }

}