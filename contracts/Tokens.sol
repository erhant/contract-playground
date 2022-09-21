// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC777/ERC777.sol";
import "@openzeppelin/contracts/token/ERC777/IERC777Recipient.sol";
import "@openzeppelin/contracts/utils/introspection/ERC1820Implementer.sol";
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

/// A simple ERC777 token, mints all the supply to the contract creator and has no default operators
contract MyERC777 is ERC777 {
  constructor(
    string memory name_,
    string memory symbol_,
    uint256 supply_,
    address[] memory ops_
  ) ERC777(name_, symbol_, ops_) {
    _mint(msg.sender, supply_, "", "");
  }
}

/// A sample recipient contract that keeps track of last sender & how many times received
contract MyERC777Recipient is IERC777Recipient, ERC1820Implementer {
  IERC1820Registry internal constant _ERC1820_REGISTRY = IERC1820Registry(0x1820a4B7618BdE71Dce8cdc73aAB6C95905faD24);

  uint256 public numTimesReceived = 0;
  address public lastReceivedFrom;

  constructor() {
    _ERC1820_REGISTRY.setInterfaceImplementer(
      address(0),
      _ERC1820_REGISTRY.interfaceHash("ERC777TokensRecipient"),
      address(this)
    );
  }

  function tokensReceived(
    address operator,
    address from,
    address to,
    uint256 amount,
    bytes calldata userData,
    bytes calldata operatorData
  ) external override {
    lastReceivedFrom = from;
    numTimesReceived++;
    // silence compiler error
    operator;
    amount;
    to;
    userData;
    operatorData;
  }
}

contract MyERC1155 is ERC1155 {
  constructor(string memory uri_, uint256[] memory supplies_) ERC1155(uri_) {
    for (uint256 i = 0; i < supplies_.length; ++i) {
      _mint(msg.sender, i, supplies_[i], "");
    }
  }
}
