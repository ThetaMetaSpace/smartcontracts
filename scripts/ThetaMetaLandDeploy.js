async function main() {
  if (network.name === "hardhat") {
    console.warn(
      "You are trying to deploy a contract to the Hardhat Network, which" +
      "gets automatically created and destroyed every time. Use the Hardhat" +
      " option '--network theta_testnet'"
    );
  }

  const [deployer] = await ethers.getSigners();
  console.log(
    "Deploying the contracts with the account:",
    await deployer.getAddress()
  );
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // We get the contract to deploy
  const ThetaMetaLand = await ethers.getContractFactory("ThetaMetaLand");
  const thetaMetaLand = await ThetaMetaLand.deploy();

  await thetaMetaLand.deployed();

  console.log("thetaMetaLand deployed to:", thetaMetaLand.address);
  console.log("ThetaMetaLand tokenName:", await thetaMetaLand.symbol());
  console.log("Account balance:", (await deployer.getBalance()).toString());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
