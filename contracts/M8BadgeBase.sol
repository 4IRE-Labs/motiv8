pragma solidity ^0.4.17;

contract M8BadgeBase {

    /// @dev Creation event is emitted every time when new badge comes into existence
    event Creation(address owner, uint256 badgeId);

    /// @dev Transfer event as defined in current draft of ERC721. Emitted every time a badge
    /// ownership is assigned
    event Transfer(address from, address to, uint256 tokenId);

    struct M8Badge {
        uint txHash;
        string challange;
        uint face;
        uint mask;
        uint color;
    }

    M8Badge[] badges; 

    /// @dev A mapping from badge IDs to _createBadge the address that owns them. All badges have
    ///  some valid owner address, even gen0 badges are created with a non-zero owner.
    mapping (uint256 => address) public badgeIndexToOwner;

    // @dev A mapping from owner address to count of tokens that address owns.
    //  Used internally inside balanceOf() to resolve ownership count.
    mapping (address => uint256) ownershipTokenCount;

    /// @dev A mapping from BadgeIDs to an address that has been approved to call
    ///  transferFrom(). Each Badge can only have one approved address for transfer
    ///  at any time. A zero value means no approval is outstanding.
    mapping (uint256 => address) public badgeIndexToApproved;

    /// @dev Assigns ownership of a specific badge to an address.
    function _transfer(address _from, address _to, uint256 _tokenId) internal {
        // Since the number of kittens is capped to 2^32 we can't overflow this
        ownershipTokenCount[_to]++;
        // transfer ownership
        badgeIndexToOwner[_tokenId] = _to;
        // When creating new kittens _from is 0x0, but we can't account that address.
        if (_from != address(0)) {
            ownershipTokenCount[_from]--;
            // clear any previously approved ownership exchange
            delete badgeIndexToApproved[_tokenId];
        }
        // Emit the transfer event.
        Transfer(_from, _to, _tokenId);
    }

    function _createBadge(uint _txHash, string _challange, address _owner) internal returns (uint) {

        M8Badge memory _badge = M8Badge({
            txHash: _txHash,
            challange: _challange,
            face: uint(keccak256(now))%8,
            mask: uint(keccak256(now + 1))%4,
            color: uint(keccak256(now + 2))%20
        });

        uint256 newBadgeId = badges.push(_badge) - 1;
        
        // It's probably never going to happen, 4 billion badges is A LOT, but
        // let's just be 100% sure we never let this happen.
        require(newBadgeId == uint256(uint32(newBadgeId)));

        Creation(_owner, newBadgeId);

        // This will assign ownership, and also emit the Transfer event as
        // per ERC721 draft
        _transfer(0, _owner, newBadgeId);

        return newBadgeId;
    }
}