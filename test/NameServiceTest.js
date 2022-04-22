const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Nameservice", function () {
  let Token;
  let thetaMetaLand;
  let nameService;
  let owner;
  let addr1;
  let addr2;
  let addrs;
  beforeEach(async function () {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    // Get the ContractFactory and Signers here.
    Token = await ethers.getContractFactory("ThetaMetaLand");
    thetaMetaLand = await Token.deploy();
    NameService = await ethers.getContractFactory("NameService");
    nameService = await NameService.deploy();
  });

  // You can nest describe calls to create subsections.
  // You can nest describe calls to create subsections.
  describe("Admin right check", function () {
    it("Should set the right owner", async function () {
      expect(await nameService.owner()).to.equal(owner.address);
    });
    it("Should able to set land token", async function () {
      await (await nameService.setThetaMetaLandAddress(thetaMetaLand.address)).wait();
      expect(await nameService.tmLandInstance()).to.equal(thetaMetaLand.address);
    });
  });
  describe("Transactions", async function () {
    await (await nameService.setThetaMetaLandAddress(thetaMetaLand.address)).wait();
    it("Should buy name ", async function () {
      await (await nameService.buyUserName("abc")).wait();

      expect(await nameService.UserNameToAddress("abc")).to.equal(owner.address);
      expect(await nameService.UserAddressToName(owner.address)).to.equal("abc");
    });
    it("Should buy land name ", async function () {
      await (await thetaMetaLand.mint(addr1.address, 0)).wait();

      await (await nameService.connect(addr1).buyLandName(0, "123zzz")).wait();

      expect(await nameService.LandNameToId("123zzz")).to.equal(0);
      expect(await nameService.LandIdToName(0)).to.equal("123zzz");
    });

    it("Should fail if name is wrong format [az,0..9]", async function () {
      // `require` will evaluate false and revert the transaction.
      await expect(
        nameService.connect(addr1).buyUserName("A@1")
      ).to.be.revertedWith("Invalid string, accept 0-9 a-z");

      await (await thetaMetaLand.mint(addr1.address, 0)).wait();
      await expect(
        nameService.connect(addr1).buyLandName(0, "@A.")
      ).to.be.revertedWith("Invalid string, accept 0-9 a-z");

      // Owner balance shouldn't have changed.
      expect(await hardhatToken.balanceOf(owner.address)).to.equal(0);
    });
    it("Should fail if name to long >64 chars", async function () {
      // `require` will evaluate false and revert the transaction.
      await expect(
        nameService.connect(addr1).buyUserName("a".repeat(65))
      ).to.be.revertedWith("Invalid string, accept 0-9 a-z");
    })
  });
});
