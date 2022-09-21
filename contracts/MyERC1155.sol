// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/// A simple ERC1155 token, gives the owner ability to mint tokens one at a time.
contract MyERC1155 is ERC1155, Ownable {
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIdCounter;

  constructor(string memory uri_) ERC1155(uri_) {}

  function safeMint(
    address to,
    uint256 supply,
    bytes memory data
  ) public onlyOwner {
    uint256 tokenId = _tokenIdCounter.current();
    _tokenIdCounter.increment();
    _mint(to, tokenId, supply, data);
  }
}
