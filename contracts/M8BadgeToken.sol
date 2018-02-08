pragma solidity ^0.4.17;

import "./M8BadgeOwnership.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";

contract M8BadgeToken is M8BadgeOwnership, Ownable {

    mapping(uint=>bool) claimedTransactions;
    mapping(string=>uint[]) challengeTransactions;

    function M8BadgeToken() public {
        create(0, "Challenge 0", msg.sender);
    }

    function create(uint _txHash, string _challengeId, address forUser) onlyOwner public {
        require(!claimedTransactions[_txHash]);
        //@dev TODO: implement merkle proof protection
        claimedTransactions[_txHash] = true;
        challengeTransactions[_challengeId].push(_txHash);
        _createBadge(_txHash, _challengeId, forUser);
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

}