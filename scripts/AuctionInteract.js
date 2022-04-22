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

  // console.log("TOken0 owner: "+ await thetaMetaLand.ownerOf(0));
  
  const Contract = await hre.ethers.getContractFactory("AuctionManager");
  const contract = await Contract.attach("0xE2E6b352877B4779De8e344D72CBa2166caDd925");
  const owner = (await ethers.getSigners())[0].address;
  await (await contract.SetDefaultBidData(
    owner,
    ethers.utils.parseEther("1"),
    60,
    ethers.utils.parseEther("1")
  )).wait();
  console.log(await contract.defaultBidData())

  // console.log("Role status ", await contract.hasRole(mintRole, auctionAddress));
  // const data = await contract.tokenIdToBidData(0);
  // console.log(data);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
