// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SuperPageCreatorToken is ERC20, Ownable {
    uint256 public immutable maxSupply;
    uint256 public currentEpoch;
    uint256 public epochMintAmount;
    mapping(address => uint256) public lastClaimedEpoch;

    event EpochAdvanced(uint256 newEpoch);
    event FanClaimed(address indexed fan, uint256 epoch, uint256 amount);
    event TokensBurned(address indexed user, uint256 amount, string reason);

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 _maxSupply,
        uint256 _epochMintAmount,
        address creator_
    ) ERC20(name_, symbol_) Ownable(creator_) {
        require(creator_ != address(0), "Invalid creator");
        maxSupply = _maxSupply;
        epochMintAmount = _epochMintAmount;
        currentEpoch = 1;
    }

    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= maxSupply, "Exceeds max supply");
        _mint(to, amount);
    }

    function claim() external {
        require(lastClaimedEpoch[msg.sender] < currentEpoch, "Already claimed this epoch");
        require(totalSupply() + epochMintAmount <= maxSupply, "Exceeds max supply");

        lastClaimedEpoch[msg.sender] = currentEpoch;
        _mint(msg.sender, epochMintAmount);
        emit FanClaimed(msg.sender, currentEpoch, epochMintAmount);
    }

    function advanceEpoch() external onlyOwner {
        currentEpoch += 1;
        emit EpochAdvanced(currentEpoch);
    }

    /// @notice Fans can burn tokens directly when redeeming marketplace items
    /// @param amount Amount of tokens to burn
    /// @param reason Optional reason, like "redeem:book" or "redeem:meetup"
    function burn(uint256 amount, string calldata reason) external {
        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount, reason);
    }
}
