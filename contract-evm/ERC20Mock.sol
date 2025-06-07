// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Mock is ERC20 {
    constructor(
        string memory name,
        string memory symbol,
        address initialAccount,
        uint256 initialBalance,
        uint8 decimals_
    ) ERC20(name, symbol) {
        _mint(initialAccount, initialBalance);
        _decimals = decimals_;
    }

    uint8 private _decimals;

    function decimals() public view override returns (uint8) {
        return _decimals;
    }
}
