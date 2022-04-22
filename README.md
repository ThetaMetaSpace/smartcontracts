
# ThetaMetaSpace Hardhat Project

This project a ThetaMeta Contract. It comes with a contract, a test for that contract, a script that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
```
To deploy smartcontract, you must put your private token on ```hardhat.config.js``` file, and run following command: 
```
npx hardhat run scripts/ThetaMetaDeployAll.js --network theta_testnet
```
ThetaMetaSpace have 4 contracts:

**1. ThetaMetaLand.sol**

This is present for land on ThetaMetaSpace with ERC721 standard, location is contain in token id. 
  With format 
  
  **`{x} - {y} - {sigX}{signY}`**
 ``` 
  - {x} range 0-999999
  - {y} range 0-999999
  - {signX} 0 or 1
  - {signY} 0 or 1
  ```
  Example: token id: 100000101 => x: 1, y=1, signX=0, signY=1 => location 1,-1

  **2. AuctionManager.sol**

  ThetaMetaSpace have built in auction system. With this contract, players can: request minting with genesis price, listing token, bidding and claim token

  **3. NameService.sol**

  All player and land in smartcontract just numbers, it's hard to remember. We implement ThetaMetaSpace Name services to resolve tokenid or player address to readable name. 
  All name are mapping to token than it's unique. 
  Name format is [a-z][0-9] and less than 64 characters

  **4. ThetaMetaToken.sol**

  This is ulities token for ThetaMetaSpace, it will share revenue of this platform, using for DAO and more in futures. 