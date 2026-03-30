const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("NexStaking", function () {
  let NexToken, NexStaking;
  let nexToken, nexStaking;
  let owner, user1, user2;

  const MIN_STAKE = ethers.parseEther("100");
  const LOCK_PERIOD = 7 * 24 * 60 * 60; // 7 days in seconds
  const REWARD_POOL = ethers.parseEther("500000");

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy NexToken
    NexToken = await ethers.getContractFactory("NexToken");
    nexToken = await NexToken.deploy(owner.address);
    await nexToken.waitForDeployment();

    // Deploy NexStaking
    NexStaking = await ethers.getContractFactory("NexStaking");
    nexStaking = await NexStaking.deploy(await nexToken.getAddress(), owner.address);
    await nexStaking.waitForDeployment();

    // Fund the reward pool
    await nexToken.approve(await nexStaking.getAddress(), REWARD_POOL);
    await nexStaking.fundRewardPool(REWARD_POOL);

    // Transfer tokens to test users
    await nexToken.transfer(user1.address, ethers.parseEther("10000"));
    await nexToken.transfer(user2.address, ethers.parseEther("10000"));
  });

  describe("Deployment", function () {
    it("Should set the correct NEX token address", async function () {
      expect(await nexStaking.nexToken()).to.equal(await nexToken.getAddress());
    });

    it("Should set correct constants", async function () {
      expect(await nexStaking.MIN_STAKE()).to.equal(MIN_STAKE);
      expect(await nexStaking.LOCK_PERIOD()).to.equal(LOCK_PERIOD);
      expect(await nexStaking.APY_RATE()).to.equal(12);
    });

    it("Should have correct reward pool after funding", async function () {
      expect(await nexStaking.rewardPool()).to.equal(REWARD_POOL);
    });

    it("Should have zero total staked initially", async function () {
      expect(await nexStaking.totalStaked()).to.equal(0);
    });
  });

  describe("Staking", function () {
    it("Should allow users to stake tokens", async function () {
      const stakeAmount = ethers.parseEther("1000");
      await nexToken.connect(user1).approve(await nexStaking.getAddress(), stakeAmount);
      await nexStaking.connect(user1).stake(stakeAmount);

      expect(await nexStaking.totalStaked()).to.equal(stakeAmount);

      const info = await nexStaking.getStakeInfo(user1.address);
      expect(info.stakedAmount).to.equal(stakeAmount);
    });

    it("Should emit Staked event", async function () {
      const stakeAmount = ethers.parseEther("500");
      await nexToken.connect(user1).approve(await nexStaking.getAddress(), stakeAmount);

      await expect(nexStaking.connect(user1).stake(stakeAmount))
        .to.emit(nexStaking, "Staked")
        .withArgs(user1.address, stakeAmount, await time.latest() + 1);
    });

    it("Should reject staking below minimum", async function () {
      const belowMin = ethers.parseEther("50");
      await nexToken.connect(user1).approve(await nexStaking.getAddress(), belowMin);

      await expect(nexStaking.connect(user1).stake(belowMin))
        .to.be.revertedWith("NexStaking: Amount below minimum stake");
    });

    it("Should reject staking without approval", async function () {
      const stakeAmount = ethers.parseEther("500");
      await expect(nexStaking.connect(user1).stake(stakeAmount))
        .to.be.revertedWithCustomError(nexToken, "ERC20InsufficientAllowance");
    });

    it("Should deduct tokens from user balance on stake", async function () {
      const stakeAmount = ethers.parseEther("1000");
      const balanceBefore = await nexToken.balanceOf(user1.address);

      await nexToken.connect(user1).approve(await nexStaking.getAddress(), stakeAmount);
      await nexStaking.connect(user1).stake(stakeAmount);

      expect(await nexToken.balanceOf(user1.address)).to.equal(balanceBefore - stakeAmount);
    });
  });

  describe("Unstaking", function () {
    const stakeAmount = ethers.parseEther("1000");

    beforeEach(async function () {
      await nexToken.connect(user1).approve(await nexStaking.getAddress(), stakeAmount);
      await nexStaking.connect(user1).stake(stakeAmount);
    });

    it("Should prevent unstaking before lock period", async function () {
      await expect(nexStaking.connect(user1).unstake())
        .to.be.revertedWith("NexStaking: Lock period not over");
    });

    it("Should allow unstaking after lock period", async function () {
      await time.increase(LOCK_PERIOD + 1);

      const balanceBefore = await nexToken.balanceOf(user1.address);
      await nexStaking.connect(user1).unstake();

      // User should get back their stake (+ rewards)
      const balanceAfter = await nexToken.balanceOf(user1.address);
      expect(balanceAfter).to.be.gt(balanceBefore + stakeAmount - ethers.parseEther("1"));
    });

    it("Should emit Unstaked event", async function () {
      await time.increase(LOCK_PERIOD + 1);

      await expect(nexStaking.connect(user1).unstake())
        .to.emit(nexStaking, "Unstaked")
        .withArgs(user1.address, stakeAmount, await time.latest() + 1);
    });

    it("Should reset staked amount after unstaking", async function () {
      await time.increase(LOCK_PERIOD + 1);
      await nexStaking.connect(user1).unstake();

      const info = await nexStaking.getStakeInfo(user1.address);
      expect(info.stakedAmount).to.equal(0);
    });

    it("Should reduce totalStaked after unstaking", async function () {
      await time.increase(LOCK_PERIOD + 1);
      await nexStaking.connect(user1).unstake();

      expect(await nexStaking.totalStaked()).to.equal(0);
    });

    it("Should reject unstaking with no active stake", async function () {
      await expect(nexStaking.connect(user2).unstake())
        .to.be.revertedWith("NexStaking: No active stake");
    });
  });

  describe("Rewards", function () {
    const stakeAmount = ethers.parseEther("10000");

    beforeEach(async function () {
      await nexToken.connect(user1).approve(await nexStaking.getAddress(), stakeAmount);
      await nexStaking.connect(user1).stake(stakeAmount);
    });

    it("Should accrue rewards over time", async function () {
      await time.increase(30 * 24 * 60 * 60); // 30 days

      const rewards = await nexStaking.getRewards(user1.address);
      expect(rewards).to.be.gt(0);
    });

    it("Should calculate approximately correct APY rewards", async function () {
      const oneYear = 365 * 24 * 60 * 60;
      await time.increase(oneYear);

      const rewards = await nexStaking.getRewards(user1.address);
      const expectedRewards = (stakeAmount * 12n) / 100n; // 12% of staked amount

      // Allow 1% tolerance due to block timing
      const tolerance = expectedRewards / 100n;
      expect(rewards).to.be.closeTo(expectedRewards, tolerance);
    });

    it("Should allow claiming rewards without unstaking", async function () {
      await time.increase(LOCK_PERIOD);

      const pendingRewards = await nexStaking.getRewards(user1.address);
      const balanceBefore = await nexToken.balanceOf(user1.address);

      await nexStaking.connect(user1).claimRewards();

      const balanceAfter = await nexToken.balanceOf(user1.address);
      expect(balanceAfter - balanceBefore).to.be.closeTo(pendingRewards, ethers.parseEther("0.01"));
    });

    it("Should emit RewardsClaimed event", async function () {
      await time.increase(LOCK_PERIOD);

      await expect(nexStaking.connect(user1).claimRewards())
        .to.emit(nexStaking, "RewardsClaimed");
    });

    it("Should reject claim with no active stake", async function () {
      await expect(nexStaking.connect(user2).claimRewards())
        .to.be.revertedWith("NexStaking: No active stake");
    });

    it("Should accrue rewards again after claiming", async function () {
      await time.increase(LOCK_PERIOD);
      await nexStaking.connect(user1).claimRewards();

      // Rewards should be near zero right after claiming
      const rewardsAfterClaim = await nexStaking.getRewards(user1.address);
      expect(rewardsAfterClaim).to.be.lt(ethers.parseEther("0.01"));

      // Accrue more rewards
      await time.increase(30 * 24 * 60 * 60);
      const newRewards = await nexStaking.getRewards(user1.address);
      expect(newRewards).to.be.gt(0);
    });
  });

  describe("Pause/Unpause", function () {
    it("Should allow owner to pause staking", async function () {
      await nexStaking.pause();
      expect(await nexStaking.paused()).to.be.true;
    });

    it("Should reject staking when paused", async function () {
      await nexStaking.pause();

      const stakeAmount = ethers.parseEther("500");
      await nexToken.connect(user1).approve(await nexStaking.getAddress(), stakeAmount);

      await expect(nexStaking.connect(user1).stake(stakeAmount))
        .to.be.revertedWithCustomError(nexStaking, "EnforcedPause");
    });

    it("Should allow owner to unpause", async function () {
      await nexStaking.pause();
      await nexStaking.unpause();
      expect(await nexStaking.paused()).to.be.false;
    });

    it("Should reject pause by non-owner", async function () {
      await expect(nexStaking.connect(user1).pause())
        .to.be.revertedWithCustomError(nexStaking, "OwnableUnauthorizedAccount");
    });
  });

  describe("Emergency Withdraw", function () {
    const stakeAmount = ethers.parseEther("1000");

    beforeEach(async function () {
      await nexToken.connect(user1).approve(await nexStaking.getAddress(), stakeAmount);
      await nexStaking.connect(user1).stake(stakeAmount);
    });

    it("Should allow owner to emergency withdraw for a user", async function () {
      const balanceBefore = await nexToken.balanceOf(user1.address);
      await nexStaking.emergencyWithdraw(user1.address);

      const balanceAfter = await nexToken.balanceOf(user1.address);
      expect(balanceAfter - balanceBefore).to.equal(stakeAmount);
    });

    it("Should emit EmergencyWithdrawn event", async function () {
      await expect(nexStaking.emergencyWithdraw(user1.address))
        .to.emit(nexStaking, "EmergencyWithdrawn")
        .withArgs(user1.address, stakeAmount);
    });

    it("Should bypass lock period for emergency withdraw", async function () {
      // Should NOT revert even within lock period
      await expect(nexStaking.emergencyWithdraw(user1.address)).to.not.be.reverted;
    });

    it("Should reject emergency withdraw by non-owner", async function () {
      await expect(nexStaking.connect(user1).emergencyWithdraw(user1.address))
        .to.be.revertedWithCustomError(nexStaking, "OwnableUnauthorizedAccount");
    });

    it("Should reject emergency withdraw when no stake", async function () {
      await expect(nexStaking.emergencyWithdraw(user2.address))
        .to.be.revertedWith("NexStaking: No stake to withdraw");
    });
  });

  describe("Multiple Users", function () {
    it("Should correctly track multiple stakers", async function () {
      const stake1 = ethers.parseEther("1000");
      const stake2 = ethers.parseEther("2000");

      await nexToken.connect(user1).approve(await nexStaking.getAddress(), stake1);
      await nexStaking.connect(user1).stake(stake1);

      await nexToken.connect(user2).approve(await nexStaking.getAddress(), stake2);
      await nexStaking.connect(user2).stake(stake2);

      expect(await nexStaking.totalStaked()).to.equal(stake1 + stake2);

      const info1 = await nexStaking.getStakeInfo(user1.address);
      const info2 = await nexStaking.getStakeInfo(user2.address);

      expect(info1.stakedAmount).to.equal(stake1);
      expect(info2.stakedAmount).to.equal(stake2);
    });
  });
});
