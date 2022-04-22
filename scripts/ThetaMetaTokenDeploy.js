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
  const ThetaMetaToken = await ethers.getContractFactory("ThetaMetaToken");
  const thetaMetaToken = await ThetaMetaToken.deploy();

  await thetaMetaToken.deployed();

  console.log("thetaMetaToken deployed to:", thetaMetaToken.address);
  console.log("thetaMetaToken tokenName:", await thetaMetaToken.symbol());
  console.log("Account balance:", (await deployer.getBalance()).toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
