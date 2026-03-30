// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title INexStaking
 * @dev Interface for the NexStaking contract
 */
interface INexStaking {
    // ============ Events ============

    event Staked(address indexed user, uint256 amount, uint256 timestamp);
    event Unstaked(address indexed user, uint256 amount, uint256 timestamp);
    event RewardsClaimed(address indexed user, uint256 amount, uint256 timestamp);
    event RewardPoolFunded(address indexed funder, uint256 amount);
    event EmergencyWithdrawn(address indexed user, uint256 amount);

    // ============ External Functions ============

    /**
     * @dev Stake NEX tokens into the contract.
     * @param amount Amount of NEX to stake (must be >= MIN_STAKE)
     */
    function stake(uint256 amount) external;

    /**
     * @dev Unstake all tokens after lock period expires.
     * Also claims any pending rewards.
     */
    function unstake() external;

    /**
     * @dev Claim pending staking rewards without unstaking.
     */
    function claimRewards() external;

    /**
     * @dev Fund the reward pool with NEX tokens.
     * @param amount Amount to add to the reward pool
     */
    function fundRewardPool(uint256 amount) external;

    /**
     * @dev Emergency withdraw for a user. Owner only.
     * @param user Address of user to emergency withdraw for
     */
    function emergencyWithdraw(address user) external;

    /**
     * @dev Pause all staking operations. Owner only.
     */
    function pause() external;

    /**
     * @dev Unpause staking operations. Owner only.
     */
    function unpause() external;

    /**
     * @dev Withdraw excess reward pool tokens. Owner only.
     * @param amount Amount to withdraw
     */
    function withdrawExcessRewards(uint256 amount) external;

    // ============ View Functions ============

    /**
     * @dev Get pending rewards for a user.
     * @param user Address to query
     * @return Pending reward amount in wei
     */
    function getRewards(address user) external view returns (uint256);

    /**
     * @dev Get comprehensive stake information for a user.
     * @param user Address to query
     * @return stakedAmount User's staked token amount
     * @return pendingRewards Claimable rewards
     * @return stakeTimestamp When the user last staked
     * @return lockEnds Timestamp when lock period ends
     * @return canUnstake Whether user can currently unstake
     */
    function getStakeInfo(address user) external view returns (
        uint256 stakedAmount,
        uint256 pendingRewards,
        uint256 stakeTimestamp,
        uint256 lockEnds,
        bool canUnstake
    );

    /**
     * @dev Total amount of NEX currently staked in the contract.
     */
    function totalStaked() external view returns (uint256);

    /**
     * @dev Current reward pool balance.
     */
    function rewardPool() external view returns (uint256);

    /**
     * @dev Minimum stake amount (100 NEX).
     */
    function MIN_STAKE() external view returns (uint256);

    /**
     * @dev Lock period duration (7 days).
     */
    function LOCK_PERIOD() external view returns (uint256);

    /**
     * @dev Annual percentage yield rate (12).
     */
    function APY_RATE() external view returns (uint256);
}
