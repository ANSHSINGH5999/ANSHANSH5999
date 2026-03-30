// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title NexStaking
 * @dev Staking contract for NEX tokens
 * - APY: 12% annually (calculated per second)
 * - Minimum stake: 100 NEX
 * - Lock period: 7 days
 */
contract NexStaking is Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable nexToken;

    uint256 public constant APY_RATE = 12;                     // 12% APY
    uint256 public constant APY_PRECISION = 100;
    uint256 public constant SECONDS_PER_YEAR = 365 days;
    uint256 public constant MIN_STAKE = 100 * 10 ** 18;        // 100 NEX
    uint256 public constant LOCK_PERIOD = 7 days;

    struct StakeInfo {
        uint256 stakedAmount;
        uint256 rewardDebt;         // Accumulated rewards already claimed
        uint256 stakeTimestamp;
        uint256 lastRewardTimestamp;
    }

    mapping(address => StakeInfo) public stakeInfos;

    uint256 public totalStaked;
    uint256 public rewardPool;

    event Staked(address indexed user, uint256 amount, uint256 timestamp);
    event Unstaked(address indexed user, uint256 amount, uint256 timestamp);
    event RewardsClaimed(address indexed user, uint256 amount, uint256 timestamp);
    event RewardPoolFunded(address indexed funder, uint256 amount);
    event EmergencyWithdrawn(address indexed user, uint256 amount);

    constructor(address _nexToken, address initialOwner) Ownable(initialOwner) {
        require(_nexToken != address(0), "NexStaking: Invalid token address");
        nexToken = IERC20(_nexToken);
    }

    /**
     * @dev Fund the reward pool. Owner transfers NEX to this contract as rewards.
     * @param amount Amount of NEX to add to reward pool
     */
    function fundRewardPool(uint256 amount) external onlyOwner {
        nexToken.safeTransferFrom(msg.sender, address(this), amount);
        rewardPool += amount;
        emit RewardPoolFunded(msg.sender, amount);
    }

    /**
     * @dev Stake NEX tokens.
     * @param amount Amount to stake (must be >= MIN_STAKE)
     */
    function stake(uint256 amount) external nonReentrant whenNotPaused {
        require(amount >= MIN_STAKE, "NexStaking: Amount below minimum stake");

        StakeInfo storage info = stakeInfos[msg.sender];

        // If user already has a stake, claim existing rewards first
        if (info.stakedAmount > 0) {
            uint256 pendingRewards = _calculateRewards(msg.sender);
            if (pendingRewards > 0 && rewardPool >= pendingRewards) {
                rewardPool -= pendingRewards;
                info.rewardDebt += pendingRewards;
                nexToken.safeTransfer(msg.sender, pendingRewards);
                emit RewardsClaimed(msg.sender, pendingRewards, block.timestamp);
            }
        }

        nexToken.safeTransferFrom(msg.sender, address(this), amount);

        info.stakedAmount += amount;
        info.stakeTimestamp = block.timestamp;
        info.lastRewardTimestamp = block.timestamp;
        totalStaked += amount;

        emit Staked(msg.sender, amount, block.timestamp);
    }

    /**
     * @dev Unstake all NEX tokens. Must be past lock period.
     */
    function unstake() external nonReentrant whenNotPaused {
        StakeInfo storage info = stakeInfos[msg.sender];
        require(info.stakedAmount > 0, "NexStaking: No active stake");
        require(
            block.timestamp >= info.stakeTimestamp + LOCK_PERIOD,
            "NexStaking: Lock period not over"
        );

        uint256 amount = info.stakedAmount;
        uint256 pendingRewards = _calculateRewards(msg.sender);

        totalStaked -= amount;
        info.stakedAmount = 0;
        info.lastRewardTimestamp = block.timestamp;

        // Transfer staked tokens back
        nexToken.safeTransfer(msg.sender, amount);
        emit Unstaked(msg.sender, amount, block.timestamp);

        // Transfer rewards if available
        if (pendingRewards > 0 && rewardPool >= pendingRewards) {
            rewardPool -= pendingRewards;
            info.rewardDebt += pendingRewards;
            nexToken.safeTransfer(msg.sender, pendingRewards);
            emit RewardsClaimed(msg.sender, pendingRewards, block.timestamp);
        }
    }

    /**
     * @dev Claim pending staking rewards without unstaking.
     */
    function claimRewards() external nonReentrant whenNotPaused {
        StakeInfo storage info = stakeInfos[msg.sender];
        require(info.stakedAmount > 0, "NexStaking: No active stake");

        uint256 pendingRewards = _calculateRewards(msg.sender);
        require(pendingRewards > 0, "NexStaking: No rewards to claim");
        require(rewardPool >= pendingRewards, "NexStaking: Insufficient reward pool");

        rewardPool -= pendingRewards;
        info.rewardDebt += pendingRewards;
        info.lastRewardTimestamp = block.timestamp;

        nexToken.safeTransfer(msg.sender, pendingRewards);
        emit RewardsClaimed(msg.sender, pendingRewards, block.timestamp);
    }

    /**
     * @dev Calculate pending rewards for a user.
     * @param user User address
     * @return Pending reward amount in wei
     */
    function getRewards(address user) external view returns (uint256) {
        return _calculateRewards(user);
    }

    /**
     * @dev Get full stake info for a user.
     * @param user User address
     * @return stakedAmount, pendingRewards, stakeTimestamp, lockEnds, canUnstake
     */
    function getStakeInfo(address user) external view returns (
        uint256 stakedAmount,
        uint256 pendingRewards,
        uint256 stakeTimestamp,
        uint256 lockEnds,
        bool canUnstake
    ) {
        StakeInfo storage info = stakeInfos[user];
        stakedAmount = info.stakedAmount;
        pendingRewards = _calculateRewards(user);
        stakeTimestamp = info.stakeTimestamp;
        lockEnds = info.stakeTimestamp + LOCK_PERIOD;
        canUnstake = info.stakedAmount > 0 && block.timestamp >= info.stakeTimestamp + LOCK_PERIOD;
    }

    /**
     * @dev Emergency withdraw: bypass lock period. Owner only. Sends tokens back to user.
     * @param user Address to emergency withdraw for
     */
    function emergencyWithdraw(address user) external onlyOwner {
        StakeInfo storage info = stakeInfos[user];
        require(info.stakedAmount > 0, "NexStaking: No stake to withdraw");

        uint256 amount = info.stakedAmount;
        totalStaked -= amount;
        info.stakedAmount = 0;
        info.lastRewardTimestamp = block.timestamp;

        nexToken.safeTransfer(user, amount);
        emit EmergencyWithdrawn(user, amount);
    }

    /**
     * @dev Pause the contract. Owner only.
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the contract. Owner only.
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Withdraw excess reward tokens from the pool. Owner only.
     * @param amount Amount to withdraw
     */
    function withdrawExcessRewards(uint256 amount) external onlyOwner {
        require(amount <= rewardPool, "NexStaking: Amount exceeds reward pool");
        rewardPool -= amount;
        nexToken.safeTransfer(owner(), amount);
    }

    /**
     * @dev Internal calculation of pending rewards.
     */
    function _calculateRewards(address user) internal view returns (uint256) {
        StakeInfo storage info = stakeInfos[user];
        if (info.stakedAmount == 0) return 0;

        uint256 timeElapsed = block.timestamp - info.lastRewardTimestamp;
        // rewards = stakedAmount * APY_RATE / APY_PRECISION * timeElapsed / SECONDS_PER_YEAR
        uint256 rewards = (info.stakedAmount * APY_RATE * timeElapsed) /
            (APY_PRECISION * SECONDS_PER_YEAR);

        return rewards;
    }
}
