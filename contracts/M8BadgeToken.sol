pragma solidity ^0.4.17;
import "./M8BadgeOwnership.sol";
import 'node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol';

contract M8BadgeToken is M8BadgeOwnership, Ownable {    

    address[] donationWallets;
    mapping(string=>bool) claimedTransactions;

    function M8BadgeToken() public {
        create("0", "Initialization Badge", msg.sender);
    }

    function create(string _donationTransactionId, string _name, address _owner ) onlyOwner public returns (uint) {
        require(!claimedTransactions[_donationTransactionId]);  
        //@dev TODO: implement merkle proof protection              
        claimedTransactions[_donationTransactionId] = true;
        return _createBadge(_donationTransactionId, _name, _owner);
    }

    function addDonationWallet(address wallet) onlyOwner public returns(uint256) {
        for (uint256 index = 0; index < donationWallets.length; index ++) {
            require(donationWallets[index] != wallet);
        }
        return donationWallets.push(wallet) - 1;
    }

    function deleteWallet(uint256 walletId) onlyOwner public returns(uint256){
        require(walletId < donationWallets.length);        
        delete donationWallets[walletId];
        return donationWallets.length;
    }

    function allWallets() public view returns (address[]) {
        return donationWallets;
    }
}