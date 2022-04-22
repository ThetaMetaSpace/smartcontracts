// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const ThetaMetaLand = await hre.ethers.getContractFactory("ThetaMetaLand");
  const thetaMetaLand = await ThetaMetaLand.deploy();
  await thetaMetaLand.deployed();
  console.log("ThetaMetaLand deployed to:", thetaMetaLand.address);
  
  const AuctionManager = await hre.ethers.getContractFactory("AuctionManager");
  const auctionManager = await AuctionManager.deploy();
  await auctionManager.deployed();
  console.log("AuctionManager deployed to:", auctionManager.address);  

  const NameService = await hre.ethers.getContractFactory("AuctionManager");
  const nameService = await NameService.deploy();
  await nameService.deployed();
  console.log("nameService deployed to:", nameService.address);

  const ThetaMetaToken = await ethers.getContractFactory("ThetaMetaToken");
  const thetaMetaToken = await ThetaMetaToken.deploy();

  await thetaMetaToken.deployed();
  console.log("thetaMetaToken deployed to:", thetaMetaToken.address);

   //Set mint role for auction manager
   const setLandAddressTx = await auctionManager.setThetaMetaLandAddress(thetaMetaLand.address);
   //Wait tx be minted
   await setLandAddressTx.wait();

   //Set mint role for nameService manager
   const setLandAddressTx2 = await nameService.setThetaMetaLandAddress(thetaMetaLand.address);
   //Wait tx be minted
   await setLandAddressTx2.wait();

   //Set mint role for auction manager
   let mintRole = await thetaMetaLand.MINTER_ROLE();
   const grantRoleAdminTx = await thetaMetaLand.grantRole(mintRole, auctionManager.address);
   //Wait tx be minted
   await grantRoleAdminTx.wait();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
