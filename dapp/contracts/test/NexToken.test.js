const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NexToken", function () {
  let NexToken;
  let nexToken;
  let owner;
  let addr1;
  let addr2;

  const INITIAL_SUPPLY = ethers.parseEther("1000000"); // 1,000,000 NEX
  const MAX_SUPPLY = ethers.parseEther("10000000");    // 10,000,000 NEX

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    NexToken = await ethers.getContractFactory("NexToken");
    nexToken = await NexToken.deploy(owner.address);
    await nexToken.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await nexToken.name()).to.equal("NexToken");
      expect(await nexToken.symbol()).to.equal("NEX");
    });

    it("Should have 18 decimals", async function () {
      expect(await nexToken.decimals()).to.equal(18);
    });

    it("Should mint initial supply to deployer", async function () {
      const ownerBalance = await nexToken.balanceOf(owner.address);
      expect(ownerBalance).to.equal(INITIAL_SUPPLY);
    });

    it("Should set correct total supply", async function () {
      expect(await nexToken.totalSupply()).to.equal(INITIAL_SUPPLY);
    });

    it("Should set correct max supply", async function () {
      expect(await nexToken.MAX_SUPPLY()).to.equal(MAX_SUPPLY);
    });

    it("Should set deployer as owner", async function () {
      expect(await nexToken.owner()).to.equal(owner.address);
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint tokens", async function () {
      const mintAmount = ethers.parseEther("100000");
      await nexToken.mint(addr1.address, mintAmount);

      expect(await nexToken.balanceOf(addr1.address)).to.equal(mintAmount);
      expect(await nexToken.totalSupply()).to.equal(INITIAL_SUPPLY + mintAmount);
    });

    it("Should emit TokensMinted event on mint", async function () {
      const mintAmount = ethers.parseEther("50000");
      await expect(nexToken.mint(addr1.address, mintAmount))
        .to.emit(nexToken, "TokensMinted")
        .withArgs(addr1.address, mintAmount);
    });

    it("Should reject minting beyond max supply", async function () {
      const overSupplyAmount = MAX_SUPPLY - INITIAL_SUPPLY + ethers.parseEther("1");
      await expect(nexToken.mint(addr1.address, overSupplyAmount))
        .to.be.revertedWith("NexToken: Max supply exceeded");
    });

    it("Should allow minting up to max supply exactly", async function () {
      const exactAmount = MAX_SUPPLY - INITIAL_SUPPLY;
      await nexToken.mint(addr1.address, exactAmount);
      expect(await nexToken.totalSupply()).to.equal(MAX_SUPPLY);
    });

    it("Should reject minting by non-owner", async function () {
      const mintAmount = ethers.parseEther("100");
      await expect(nexToken.connect(addr1).mint(addr1.address, mintAmount))
        .to.be.revertedWithCustomError(nexToken, "OwnableUnauthorizedAccount");
    });
  });

  describe("Burning", function () {
    it("Should allow token holders to burn their tokens", async function () {
      const burnAmount = ethers.parseEther("100000");
      await nexToken.burn(burnAmount);

      expect(await nexToken.totalSupply()).to.equal(INITIAL_SUPPLY - burnAmount);
      expect(await nexToken.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY - burnAmount);
    });

    it("Should reject burning more than balance", async function () {
      const tooMuch = ethers.parseEther("2000000");
      await expect(nexToken.burn(tooMuch))
        .to.be.revertedWithCustomError(nexToken, "ERC20InsufficientBalance");
    });

    it("Should allow burnFrom with allowance", async function () {
      const burnAmount = ethers.parseEther("10000");
      await nexToken.transfer(addr1.address, burnAmount);
      await nexToken.connect(addr1).approve(owner.address, burnAmount);
      await nexToken.burnFrom(addr1.address, burnAmount);

      expect(await nexToken.balanceOf(addr1.address)).to.equal(0);
    });
  });

  describe("Pausing", function () {
    it("Should allow owner to pause transfers", async function () {
      await nexToken.pause();
      expect(await nexToken.paused()).to.be.true;
    });

    it("Should reject transfers when paused", async function () {
      await nexToken.pause();
      await expect(nexToken.transfer(addr1.address, ethers.parseEther("100")))
        .to.be.revertedWithCustomError(nexToken, "EnforcedPause");
    });

    it("Should reject minting when paused", async function () {
      await nexToken.pause();
      await expect(nexToken.mint(addr1.address, ethers.parseEther("100")))
        .to.be.revertedWithCustomError(nexToken, "EnforcedPause");
    });

    it("Should allow owner to unpause", async function () {
      await nexToken.pause();
      await nexToken.unpause();
      expect(await nexToken.paused()).to.be.false;
    });

    it("Should allow transfers after unpause", async function () {
      await nexToken.pause();
      await nexToken.unpause();

      const transferAmount = ethers.parseEther("1000");
      await nexToken.transfer(addr1.address, transferAmount);
      expect(await nexToken.balanceOf(addr1.address)).to.equal(transferAmount);
    });

    it("Should reject pause by non-owner", async function () {
      await expect(nexToken.connect(addr1).pause())
        .to.be.revertedWithCustomError(nexToken, "OwnableUnauthorizedAccount");
    });
  });

  describe("Transfers", function () {
    it("Should transfer tokens between accounts", async function () {
      const amount = ethers.parseEther("5000");
      await nexToken.transfer(addr1.address, amount);
      expect(await nexToken.balanceOf(addr1.address)).to.equal(amount);
    });

    it("Should approve and transferFrom", async function () {
      const amount = ethers.parseEther("3000");
      await nexToken.approve(addr1.address, amount);
      await nexToken.connect(addr1).transferFrom(owner.address, addr2.address, amount);

      expect(await nexToken.balanceOf(addr2.address)).to.equal(amount);
      expect(await nexToken.allowance(owner.address, addr1.address)).to.equal(0);
    });

    it("Should emit Transfer event", async function () {
      const amount = ethers.parseEther("1000");
      await expect(nexToken.transfer(addr1.address, amount))
        .to.emit(nexToken, "Transfer")
        .withArgs(owner.address, addr1.address, amount);
    });
  });
});
