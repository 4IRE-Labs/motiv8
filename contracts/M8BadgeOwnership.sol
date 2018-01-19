pragma solidity ^0.4.17;

import "./ERC721.sol";
import "./M8BadgeBase.sol";

contract M8BadgeOwnership is M8BadgeBase, ERC721 {
    
    /// @notice Name and symbol of the non fungible token, as defined in ERC721.
    string public constant name = "Motiv8 Badge";
    string public constant symbol = "M8Badge";

    // Internal utility functions: These functions all assume that their input arguments
    // are valid. We leave it to public methods to sanitize their inputs and follow
    // the required logic.

    /// @dev Checks if a given address is the current owner of a particular Badge.
    /// @param _claimant the address we are validating against.
    /// @param _tokenId badge id, only valid when > 0
    function _owns(address _claimant, uint256 _tokenId) internal view returns (bool) {
        return badgeIndexToOwner[_tokenId] == _claimant;
    }

    /// @dev Checks if a given address currently has transferApproval for a particular Badge.
    /// @param _claimant the address we are confirming badge is approved for.
    /// @param _tokenId badge id, only valid when > 0
    function _approvedFor(address _claimant, uint256 _tokenId) internal view returns (bool) {
        return badgeIndexToOwner[_tokenId] == _claimant;
    }

    /// @dev Marks an address as being approved for transferFrom(), overwriting any previous
    ///  approval. Setting _approved to address(0) clears all transfer approval.
    ///  NOTE: _approve() does NOT send the Approval event. This is intentional because
    ///  _approve() and transferFrom() are used together and
    ///  there is no value in spamming the log with Approval events in that case.
    function _approve(uint256 _tokenId, address _approved) internal {
        badgeIndexToApproved[_tokenId] = _approved;
    }

    /// @notice Returns the number of Kitties owned by a specific address.
    /// @param _owner The owner address to check.
    /// @dev Required for ERC-721 compliance
    function balanceOf(address _owner) public view returns (uint256 count) {
        return ownershipTokenCount[_owner];
    }

    /// @notice Transfers a Badge to another address. If transferring to a smart
    /// contract be VERY CAREFUL to ensure that it is aware of ERC-721
    /// your Badge may be lost forever. Seriously.
    /// @param _to The address of the recipient, can be a user or contract.
    /// @param _tokenId The ID of the Badge to transfer.
    /// @dev Required for ERC-721 compliance.
    function transfer(
        address _to,
        uint256 _tokenId
    )
        external
    {
        // Safety check to prevent against an unexpected 0x0 default.
        require(_to != address(0));
        // Disallow transfers to this contract to prevent accidental misuse.
        // The contract should never own any badges (except very briefly
        // after a gen0 badge is created ).
        require(_to != address(this));

        // You can only send your own badge.
        require(_owns(msg.sender, _tokenId));

        // Reassign ownership, clear pending approvals, emit Transfer event.
        _transfer(msg.sender, _to, _tokenId);
    }

    /// @notice Grant another address the right to transfer a specific Badge via
    ///  transferFrom(). This is the preferred flow for transfering NFTs to contracts.
    /// @param _to The address to be granted transfer approval. Pass address(0) to
    ///  clear all approvals.
    /// @param _tokenId The ID of the Bagdge that can be transferred if this call succeeds.
    /// @dev Required for ERC-721 compliance.
    function approve(
        address _to,
        uint256 _tokenId
    )
        external
    {
        // Only an owner can grant transfer approval.
        require(_owns(msg.sender, _tokenId));

        // Register the approval (replacing any previous approval).
        _approve(_tokenId, _to);

        // Emit approval event.
        Approval(msg.sender, _to, _tokenId);
    }

    /// @notice Transfer a Badge owned by another address, for which the calling address
    ///  has previously been granted transfer approval by the owner.
    /// @param _from The address that owns the Badge to be transfered.
    /// @param _to The address that should take ownership of the Badge. Can be any address,
    ///  including the caller.
    /// @param _tokenId The ID of the Badge to be transferred.
    /// @dev Required for ERC-721 compliance.
    function transferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    )
        external
    {
        // Safety check to prevent against an unexpected 0x0 default.
        require(_to != address(0));
        // Disallow transfers to this contract to prevent accidental misuse.
        // The contract should never own any Badge (except very briefly
        // after a gen0 badge is created).
        require(_to != address(this));
        // Check for approval and valid ownership
        require(_approvedFor(msg.sender, _tokenId));
        require(_owns(_from, _tokenId));

        // Reassign ownership (also clears pending approvals and emits Transfer event).
        _transfer(_from, _to, _tokenId);
    }

    /// @notice Returns the total number of Badges currently in existence.
    /// @dev Required for ERC-721 compliance.
    function totalSupply() public view returns (uint) {
        return badges.length - 1;
    }

    /// @notice Returns the address currently assigned ownership of a given Badge.
    /// @dev Required for ERC-721 compliance.
    function ownerOf(uint256 _tokenId)
        external
        view
        returns (address owner)
    {
        owner = badgeIndexToOwner[_tokenId];

        require(owner != address(0));
    }

    /// @notice Returns a list of all Badge IDs assigned to an address.
    /// @param _owner The owner whose Badges we are interested in.
    /// @dev This method MUST NEVER be called by smart contract code. First, it's fairly
    ///  expensive (it walks the entire Kitty array looking for cats belonging to owner),
    ///  but it also returns a dynamic array, which is only supported for web3 calls, and
    ///  not contract-to-contract calls.
    function tokensOfOwner(address _owner) external view returns(uint256[] ownerTokens) {
        uint256 tokenCount = balanceOf(_owner);

        if (tokenCount == 0) {
            // Return an empty array
            return new uint256[](0);
        } else {
            uint256[] memory result = new uint256[](tokenCount);
            uint256 totalCats = totalSupply();
            uint256 resultIndex = 0;

            // We count on the fact that all cats have IDs starting at 1 and increasing
            // sequentially up to the totalCat count.
            uint256 catId;

            for (catId = 1; catId <= totalCats; catId++) {
                if (badgeIndexToOwner[catId] == _owner) {
                    result[resultIndex] = catId;
                    resultIndex++;
                }
            }

            return result;
        }
    }

    /// @dev Adapted from memcpy() by @arachnid (Nick Johnson <arachnid@notdot.net>)
    ///  This method is licenced under the Apache License.
    ///  Ref: https://github.com/Arachnid/solidity-stringutils/blob/2f6ca9accb48ae14c66f1437ec50ed19a0616f78/strings.sol
    function _memcpy(uint _dest, uint _src, uint _len) private view {
        // Copy word-length chunks while possible
        for(; _len >= 32; _len -= 32) {
            assembly {
                mstore(_dest, mload(_src))
            }
            _dest += 32;
            _src += 32;
        }

        // Copy remaining bytes
        uint256 mask = 256 ** (32 - _len) - 1;
        assembly {
            let srcpart := and(mload(_src), not(mask))
            let destpart := and(mload(_dest), mask)
            mstore(_dest, or(destpart, srcpart))
        }
    }

    /// @dev Adapted from toString(slice) by @arachnid (Nick Johnson <arachnid@notdot.net>)
    ///  This method is licenced under the Apache License.
    ///  Ref: https://github.com/Arachnid/solidity-stringutils/blob/2f6ca9accb48ae14c66f1437ec50ed19a0616f78/strings.sol
    function _toString(bytes32[4] _rawBytes, uint256 _stringLength) private view returns (string) {
        var outputString = new string(_stringLength);
        uint256 outputPtr;
        uint256 bytesPtr;

        assembly {
            outputPtr := add(outputString, 32)
            bytesPtr := _rawBytes
        }

        _memcpy(outputPtr, bytesPtr, _stringLength);

        return outputString;
    }
}