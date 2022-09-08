// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract Counter {
  uint256 private count = 0;

  event CountedTo(uint256 newCount);

  function getCount() external view returns (uint256) {
    return count;
  }

  function countUp() external returns (uint256) {
    uint256 newCount = count + 1;
    require(newCount > count, "Uint256 overflow");

    count = newCount;

    emit CountedTo(count);
    return count;
  }

  function countDown() external returns (uint256) {
    // require(count > 0, "Count is already 0.");
    count = count - 1;
    emit CountedTo(count);
    return count;
  }
}
