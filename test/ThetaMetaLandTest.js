const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ThetaMetaLand", function () {
  let Token;
  let hardhatToken;
  let owner;
  let addr1;
  let addr2;
  let addrs;
  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    Token = await ethers.getContractFactory("ThetaMetaLand");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // To deploy our contract, we just have to call Token.deploy() and await
    // for it to be deployed(), which happens once its transaction has been
    // mined.
    hardhatToken = await Token.deploy();
  });

  // You can nest describe calls to create subsections.
  describe("Deployment", function () {
    // `it` is another Mocha function. This is the one you use to define your
    // tests. It receives the test name, and a callback function.

    // If the callback function is async, Mocha will `await` it.
    it("Should set the right owner", async function () {
      // Expect receives a value, and wraps it in an Assertion object. These
      // objects have a lot of utility methods to assert values.

      // This test expects the owner variable stored in the contract to be equal
      // to our Signer's owner.
      let adminRole = await hardhatToken.DEFAULT_ADMIN_ROLE();
      let mintRole = await hardhatToken.MINTER_ROLE();

      expect(await hardhatToken.hasRole(adminRole, owner.address)).to.equal(true);
      expect(await hardhatToken.hasRole(mintRole, owner.address)).to.equal(true);
    });
  });

  // You can nest describe calls to create subsections.
  describe("Check role function", function () {
    // `it` is another Mocha function. This is the one you use to define your
    // tests. It receives the test name, and a callback function.

    // If the callback function is async, Mocha will `await` it.
    it("Should set the right for another", async function () {
      // Expect receives a value, and wraps it in an Assertion object. These
      // objects have a lot of utility methods to assert values.

      // This test expects the owner variable stored in the contract to be equal
      // to our Signer's owner.
      const adminRole = await hardhatToken.DEFAULT_ADMIN_ROLE();
      const mintRole = await hardhatToken.MINTER_ROLE();
      const grantRoleAdminTx = await hardhatToken.grantRole(adminRole, addr1.address);
      //Wait tx be minted
      await grantRoleAdminTx.wait();
      expect(await hardhatToken.hasRole(adminRole, addr1.address)).to.equal(true);
      
      const grantRoleMintTx = await hardhatToken.grantRole(mintRole, addr1.address);
      //Wait tx be minted
      await grantRoleMintTx.wait();
      expect(await hardhatToken.hasRole(mintRole, addr1.address)).to.equal(true);
      
      //try to mint with new role
      const mintTx = await hardhatToken.connect(addr1).safeMint(addr2.address, 123);
      //wait tx minted
      await mintTx.wait();
      expect(await hardhatToken.ownerOf(123)).to.equal(addr2.address);
    });

  });

  describe("Transactions", function () {
    it("Should mint, transfer tokens ", async function () {
      // Transfer 50 tokens from owner to addr1
      let mintTx = await hardhatToken.safeMint(addr1.address, 0);
      // wait until the transaction is mined
      await mintTx.wait();
      expect(await hardhatToken.balanceOf(addr1.address)).to.equal(1);

      expect(await hardhatToken.ownerOf(0)).to.equal(addr1.address);

      // Transfer 50 tokens from addr1 to addr2
      // We use .connect(signer) to send a transaction from another account
      let transferTx = await hardhatToken.connect(addr1).transferFrom(addr1.address, addr2.address, 0);
      // wait until the transaction is mined
      await transferTx.wait();
      expect(await hardhatToken.ownerOf(0)).to.equal(addr2.address);
      expect(await hardhatToken.balanceOf(addr1.address)).to.equal(0);
      expect(await hardhatToken.balanceOf(addr2.address)).to.equal(1);
    });

    it("Should fail if sender doesn’t have enough tokens", async function () {

      // `require` will evaluate false and revert the transaction.
      await expect(
        hardhatToken.connect(addr1).transferFrom(addr1.address, owner.address, 1)
      ).to.be.revertedWith("ERC721: operator query for nonexistent token");

      // Owner balance shouldn't have changed.
      expect(await hardhatToken.balanceOf(owner.address)).to.equal(0);
    });
    it("Should return the new uri once it's changed", async function () {
      const mintTx = await hardhatToken.safeMint(addr1.address, 0);
      // wait until the transaction is mined
      await mintTx.wait();

      const setURITx = await hardhatToken.updateBaseUri("https://uri2.thetameta.space/");
      // wait until the transaction is mined
      await setURITx.wait();
      expect(await hardhatToken.tokenURI(0)).to.equal("https://uri2.thetameta.space/0");
    });
  });
});
