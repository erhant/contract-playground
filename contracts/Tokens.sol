// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC777/ERC777.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/// A simple ERC20 token, mints all the supply to the contract creator.
contract MyERC20 is ERC20 {
  constructor(
    string memory name_,
    string memory symbol_,
    uint256 supply_
  ) ERC20(name_, symbol_) {
    _mint(msg.sender, supply_);
  }
}

/// A simple ERC721 token, gives the owner ability to mint tokens one at a time.
contract MyERC721 is ERC721, Ownable {
  using Counters for Counters.Counter;

  Counters.Counter private _tokenIdCounter;
  uint256 public maxSupply;

  constructor(
    string memory name_,
    string memory symbol_,
    uint256 supply_
  ) ERC721(name_, symbol_) {
    maxSupply = supply_;
  }

  function safeMint(address to) public onlyOwner {
    require(_tokenIdCounter.current() <= maxSupply, "Max Supply Reached");
    uint256 tokenId = _tokenIdCounter.current();
    _tokenIdCounter.increment();
    _safeMint(to, tokenId);
  }
}
