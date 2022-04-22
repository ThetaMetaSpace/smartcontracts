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
  const NameService = await ethers.getContractFactory("NameService");
  const nameService = await NameService.attach("0xEB35949676B0d79FCcc402F834C5F5E1E279f368");
  // await (await nameService.setThetaMetaLandAddress("0xDB7017EE4Bc114DE3672744309C89e895ddb7eD3")).wait();
  // await (await nameService.buyLandName(0, "metaspace")).wait();

  console.log("PriceName: "+ await nameService.USERNAME_PRICE());
  console.log("PriceLandName: "+ await nameService.LANDNAME_PRICE());
  console.log("MyNam: "+ await nameService.UserAddressToName(deployer.getAddress()));
  console.log("Loc 0,0 name: "+ await nameService.LandIdToName(0));
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
