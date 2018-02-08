pragma solidity ^0.4.8;

import "zeppelin-solidity/contracts/token/StandardToken.sol";


/**
 * @title Motiv8 Standarted ERC20 Token
 *
 * @dev Implementation of the basic standard token.
 * @dev https://github.com/ethereum/EIPs/issues/20
 */
contract Motiv8ERC20Token is StandardToken {

  string public constant symbol = "MTV8"; //MTVB - badge, MTVP - points
  string public constant name = "Motiv8";
  uint8 public constant decimals = 0;
  uint256 public totalSupply = 100000000000000;

  event Transfer(address indexed from, address indexed to, uint256 value);

  function Motiv8ERC20Token() public {
    balances[msg.sender] = totalSupply;
  }

}