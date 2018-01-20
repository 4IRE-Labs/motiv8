pragma solidity ^0.4.17;
import "./M8BadgeOwnership.sol";
import 'node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol';

contract M8BadgeToken is M8BadgeOwnership, Ownable {    

    address[] donationWallets;
    mapping(uint=>bool) claimedTransactions;
    mapping(string=>uint[]) challengeTransactions;

    function M8BadgeToken() public {
        create(0, "Challange 0", msg.sender);
    }

    function create(uint _txHash, string _challangeId, address _owner ) onlyOwner public returns (uint) {
        require(!claimedTransactions[_txHash]);  
        //@dev TODO: implement merkle proof protection              
        claimedTransactions[_txHash] = true;
        challengeTransactions[_challangeId].push(_txHash);
        return _createBadge(_txHash, _challangeId, _owner);
    }

    function claimedChallengeTransactions(string _challangeId) public view returns (uint[] txHashes) {
        uint[] storage txs = challengeTransactions[_challangeId];
        txHashes = txs;
    }

    /// @dev returns badge information
    function getBadge(uint256 _tokenId) public view returns (string challange, uint face, uint mask, uint color, uint txHash) {
        require(badges.length > _tokenId);
        M8Badge storage badge = badges[_tokenId];
        challange = string(badge.challange);
        face = uint(badge.face);
        mask = uint(badge.mask);
        color = uint(badge.color);
        txHash = uint(badge.txHash);
    }

    function addDonationWallet(address wallet) onlyOwner public returns(uint256) {
        for (uint256 index = 0; index < donationWallets.length; index ++) {
            require(donationWallets[index] != wallet);
        }
        return donationWallets.push(wallet) - 1;
    }

    function deleteWallet(uint256 walletId) onlyOwner public returns(uint256) {
        require(walletId >= donationWallets.length);   

        for (uint i = walletId; i<donationWallets.length-1; i++) {
            donationWallets[i] = donationWallets[i+1];
        }
        delete donationWallets[donationWallets.length-1];
        donationWallets.length--;
        return donationWallets.length;
    }

    function allWallets() public view returns (address[]) {
        return donationWallets;
    }
}