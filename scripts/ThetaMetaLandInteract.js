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
  const thetaMetaLand = await ThetaMetaLand.attach("0xd97D5Cd86C48B44D62d78c5D41bcBbfca9F6307F");
  const mintRole = await thetaMetaLand.MINTER_ROLE();
  const auctionAddress = "0xE2E6b352877B4779De8e344D72CBa2166caDd925";
  const grantRoleTx = await thetaMetaLand.grantRole(mintRole, auctionAddress);
  await grantRoleTx.wait();
  console.log("Set role status ", await thetaMetaLand.hasRole(mintRole, auctionAddress));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
