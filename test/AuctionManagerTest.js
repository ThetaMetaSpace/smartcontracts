const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AuctionManager", function () {
  let Token;
  let auctionManager;
  let owner;
  let addr1;
  let addr2;
  let addr3;
  beforeEach(async function () {
    //Deploy Thetametaland first
    ThetaMetaLand = await ethers.getContractFactory("ThetaMetaLand");
    thetaMetaLand = await ThetaMetaLand.deploy();

    // Get the ContractFactory and Signers here.
    AuctionManager = await ethers.getContractFactory("AuctionManager");
    [owner, addr1, addr2, addr3] = await ethers.getSigners();

    // To deploy our contract, we just have to call Token.deploy() and await
    // for it to be deployed(), which happens once its transaction has been
    // mined.
    auctionManager = await AuctionManager.deploy();

    //Set mint role for auction manager
    const setLandAddressTx = await auctionManager.setThetaMetaLandAddress(thetaMetaLand.address);
    //Wait tx be minted
    await setLandAddressTx.wait();

    //Set mint role for auction manager
    let mintRole = await thetaMetaLand.MINTER_ROLE();
    const grantRoleAdminTx = await thetaMetaLand.grantRole(mintRole, auctionManager.address);
    //Wait tx be minted
    await grantRoleAdminTx.wait();
  });

  // You can nest describe calls to create subsections.
  describe("Admin right check", function () {
    it("Should set the right owner", async function () {
      let mintRole = await thetaMetaLand.MINTER_ROLE();
      expect(await thetaMetaLand.hasRole(mintRole, auctionManager.address)).to.equal(true);
    });
    it("Should set default bid data", async function () {
      await (await auctionManager.SetDefaultBidData(
        owner.address,
        123,
        456,
        789
      )).wait();
      const bidDefault = await auctionManager.defaultBidData();
     
      expect(bidDefault["startPrice"]).to.equal(ethers.BigNumber.from(123));
      expect(bidDefault["bidTime"]).to.equal(ethers.BigNumber.from(456));
      expect(bidDefault["bidStep"]).to.equal(ethers.BigNumber.from(789));
    });
  });

  describe("Transactions", function () {
    it("Should mint, and start bid", async function () {
      // Transfer 50 tokens from owner to addr1
      let mintTx = await auctionManager.connect(addr1).MintAndBid(0, 1, { value: ethers.utils.parseEther("20") });
      // wait until the transaction is mined
      await mintTx.wait();
      expect(await auctionManager.balance(addr1.address, 0)).to.equal(ethers.utils.parseEther("20"));

      expect(await thetaMetaLand.ownerOf(0)).to.equal(auctionManager.address);

    });
    it("Should listing, and start bid, end bid and finance", async function () {
      //Mint tokenid 123 => address 1
      await (await thetaMetaLand.mint(addr1.address, 123)).wait();
      //Listing token 123 with start price 5 TFuel and step 2, bid time is zero (meaning can claim token immediately)
      await (await thetaMetaLand.connect(addr1).approve(auctionManager.address, 123)).wait();
      await (await auctionManager.connect(addr1).NewListing(123, ethers.utils.parseEther("5"), 0, ethers.utils.parseEther("5"))).wait();
      //addr2 will bid 
      await (await auctionManager.connect(addr2).Bid(123, 1, { value: ethers.utils.parseEther("10") })).wait();

      //Get before balance
      let addr1Balance = await addr1.getBalance();
      let addr2Balance = await addr2.getBalance();
      let ownerBalance = await owner.getBalance();
      //addr3 will able to stop bid (anyone)
      await (await auctionManager.connect(addr3).EndBid(123)).wait();
      //Check
      //Addr2 will get token
      expect(await thetaMetaLand.ownerOf(123)).to.equal(addr2.address);
      //Addr1 will get money - fee
      expect(await addr1.getBalance()).to.equal(ethers.utils.parseEther("9").add(addr1Balance));
      expect(await owner.getBalance()).to.equal(ethers.utils.parseEther("1").add(ownerBalance));//10% fee

      // Transfer 50 tokens from owner to addr1
      let mintTx = await auctionManager.connect(addr1).MintAndBid(0, 1, { value: ethers.utils.parseEther("20") });
      // wait until the transaction is mined
      await mintTx.wait();
      expect(await auctionManager.balance(addr1.address, 0)).to.equal(ethers.utils.parseEther("20"));

      expect(await thetaMetaLand.ownerOf(0)).to.equal(auctionManager.address);

    });
  });
});
