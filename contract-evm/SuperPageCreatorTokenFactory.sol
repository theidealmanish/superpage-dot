// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./SuperPageCreatorToken.sol";

contract SuperPageCreatorTokenFactory {
    event TokenCreated(address indexed creator, address tokenAddress, string name, string symbol);

    address[] public allTokens;

    function createToken(
        string memory name,
        string memory symbol,
        uint256 maxSupply,
        uint256 epochMintAmount
    ) external returns (address) {
        SuperPageCreatorToken token = new SuperPageCreatorToken(
            name,
            symbol,
            maxSupply,
            epochMintAmount,
            msg.sender
        );

        allTokens.push(address(token));
        emit TokenCreated(msg.sender, address(token), name, symbol);
        return address(token);
    }

    function getAllTokens() external view returns (address[] memory) {
        return allTokens;
    }
}
