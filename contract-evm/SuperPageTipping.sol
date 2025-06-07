// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SuperPageTipping is Ownable {
    uint256 public platformFeeBps = 200; // 2% default (200 bps)
    address public treasury;

    event TipSent(
        address indexed fan,
        address indexed creator,
        address indexed token,
        uint256 amount,
        uint256 fee
    );

    constructor(address operator, address _treasury) Ownable(operator) {
        require(_treasury != address(0), "Invalid treasury");
        treasury = _treasury;
    }

    /// @notice Set the platform fee in basis points (bps)
    /// @param _bps The fee in basis points (100 bps = 1%)
    function setPlatformFee(uint256 _bps) external onlyOwner {
        require(_bps <= 10000, "Fee too high");
        platformFeeBps = _bps;
    }

    /// @notice Set the treasury address where platform fees are sent
    /// @param _treasury The address of the treasury
    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid address");
        treasury = _treasury;
    }

    /// @notice Tip a creator with an ERC20 token (e.g., USDC, DAI, etc.)
    /// @param creator The creator's address
    /// @param token The address of the ERC20 token
    /// @param amount The amount (in token decimals)
    function tip(address creator, address token, uint256 amount) external {
        require(creator != address(0), "Invalid creator");
        require(amount > 0, "Amount must be positive");

        uint256 fee = (amount * platformFeeBps) / 10000;
        uint256 creatorAmount = amount - fee;

        require(IERC20(token).transferFrom(msg.sender, creator, creatorAmount), "Tip transfer failed");
        require(IERC20(token).transferFrom(msg.sender, treasury, fee), "Fee transfer failed");

        emit TipSent(msg.sender, creator, token, amount, fee);
    }
}
