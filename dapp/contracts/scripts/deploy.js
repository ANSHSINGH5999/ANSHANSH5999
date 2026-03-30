const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("========================================");
  console.log("  NexDeFi Contract Deployment");
  console.log("========================================\n");

  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with account: ${deployer.address}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Account balance: ${ethers.formatEther(balance)} ETH\n`);

  // ============ Deploy NexToken ============
  console.log("1. Deploying NexToken...");
  const NexToken = await ethers.getContractFactory("NexToken");
  const nexToken = await NexToken.deploy(deployer.address);
  await nexToken.waitForDeployment();

  const nexTokenAddress = await nexToken.getAddress();
  console.log(`   NexToken deployed to: ${nexTokenAddress}`);

  const initialSupply = await nexToken.totalSupply();
  console.log(`   Initial supply: ${ethers.formatEther(initialSupply)} NEX\n`);

  // ============ Deploy NexStaking ============
  console.log("2. Deploying NexStaking...");
  const NexStaking = await ethers.getContractFactory("NexStaking");
  const nexStaking = await NexStaking.deploy(nexTokenAddress, deployer.address);
  await nexStaking.waitForDeployment();

  const nexStakingAddress = await nexStaking.getAddress();
  console.log(`   NexStaking deployed to: ${nexStakingAddress}\n`);

  // ============ Fund Reward Pool ============
  console.log("3. Funding staking reward pool with 500,000 NEX...");
  const rewardAmount = ethers.parseEther("500000");

  // Approve staking contract to spend tokens
  const approveTx = await nexToken.approve(nexStakingAddress, rewardAmount);
  await approveTx.wait();
  console.log(`   Approved ${ethers.formatEther(rewardAmount)} NEX for staking contract`);

  // Fund the reward pool
  const fundTx = await nexStaking.fundRewardPool(rewardAmount);
  await fundTx.wait();

  const rewardPool = await nexStaking.rewardPool();
  console.log(`   Reward pool funded: ${ethers.formatEther(rewardPool)} NEX\n`);

  // ============ Verify Deployment ============
  console.log("4. Verifying deployment...");
  const deployerNexBalance = await nexToken.balanceOf(deployer.address);
  const stakingNexBalance = await nexToken.balanceOf(nexStakingAddress);

  console.log(`   Deployer NEX balance: ${ethers.formatEther(deployerNexBalance)} NEX`);
  console.log(`   Staking contract NEX balance: ${ethers.formatEther(stakingNexBalance)} NEX`);
  console.log(`   Total staked: ${ethers.formatEther(await nexStaking.totalStaked())} NEX\n`);

  // ============ Save Deployment Info ============
  const network = await ethers.provider.getNetwork();
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      NexToken: {
        address: nexTokenAddress,
        deployTxHash: nexToken.deploymentTransaction()?.hash || "",
      },
      NexStaking: {
        address: nexStakingAddress,
        deployTxHash: nexStaking.deploymentTransaction()?.hash || "",
      },
    },
  };

  // Save to frontend constants directory
  const frontendConstantsDir = path.join(__dirname, "../../frontend/src/constants");
  if (!fs.existsSync(frontendConstantsDir)) {
    fs.mkdirSync(frontendConstantsDir, { recursive: true });
  }

  const deploymentsPath = path.join(frontendConstantsDir, "deployments.json");
  fs.writeFileSync(deploymentsPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`5. Deployment info saved to: ${deploymentsPath}`);

  // Also save to contracts directory
  const contractsDeploymentsPath = path.join(__dirname, "../deployments.json");
  fs.writeFileSync(contractsDeploymentsPath, JSON.stringify(deploymentInfo, null, 2));

  console.log("\n========================================");
  console.log("  Deployment Summary");
  console.log("========================================");
  console.log(`Network:       ${network.name} (Chain ID: ${network.chainId})`);
  console.log(`NexToken:      ${nexTokenAddress}`);
  console.log(`NexStaking:    ${nexStakingAddress}`);
  console.log("========================================\n");

  console.log("Next steps:");
  console.log("1. Copy the contract addresses above");
  console.log("2. Update frontend/.env with:");
  console.log(`   VITE_NEX_TOKEN_ADDRESS=${nexTokenAddress}`);
  console.log(`   VITE_NEX_STAKING_ADDRESS=${nexStakingAddress}`);
  console.log("3. Update backend/.env with the same addresses");
  console.log("\nIf deploying to Sepolia, verify contracts with:");
  console.log(`   npx hardhat verify --network sepolia ${nexTokenAddress} "${deployer.address}"`);
  console.log(`   npx hardhat verify --network sepolia ${nexStakingAddress} "${nexTokenAddress}" "${deployer.address}"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
