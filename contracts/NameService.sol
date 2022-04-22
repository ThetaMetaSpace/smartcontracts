// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @dev This interface of ThetaMetaLandContract
 */
interface ITML {
    function safeMint(address _to, uint256 _tokenId) external returns (bool);

    function balanceOf(address _owner) external view returns (uint256 _balance);

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external;

    function ownerOf(uint256 tokenId) external view returns (address owner);
}

contract ThetaMetaContract is Ownable {
    ITML public tmLandInstance;

    /**
     * @dev Set ThetaMetaLandAddress
     * @param newAddress address Contract address for ThetaMetaLand to interact, ensure this contract is minter of ThetaMetaLand contract
     */
    function setThetaMetaLandAddress(address newAddress) public onlyOwner {
        require(
            newAddress != address(0),
            "ThetaMetaLandContractAddress is not define"
        );
        tmLandInstance = ITML(newAddress);
    }
}

contract NameService is ThetaMetaContract {
    address public FINANCE_VAULT;
    uint public USERNAME_PRICE;
    uint public LANDNAME_PRICE;

    mapping(string => address) public UserNameToAddress;
    mapping(address => string) public UserAddressToName;
    mapping(string => uint) public LandNameToId;
    mapping(uint => string) public LandIdToName;

    constructor() {
        FINANCE_VAULT = _msgSender();
    }

    function setFinanceVault(address newAddress) public onlyOwner {
        FINANCE_VAULT = newAddress;
        USERNAME_PRICE = 10 * 1e18;
        LANDNAME_PRICE = 10 * 1e18;
    }

    function setPrice(uint userNamePrice, uint landNamePrice) public onlyOwner {
        USERNAME_PRICE = userNamePrice;
        LANDNAME_PRICE = landNamePrice;
    }

    function checkString(string memory str) public pure returns (bool) {
        bytes memory b = bytes(str);
        if (b.length == 0 || b.length > 64) return false;

        for (uint i; i < b.length; i++) {
            bytes1 char = b[i];

            if (
                !(char >= 0x30 && char <= 0x39) && //9-0
                !(char >= 0x61 && char <= 0x7A) //a-z
            ) return false;
        }
        return true;
    }

    function buyUserName(string memory newUserName) public payable {
        require(checkString(newUserName), "Invalid string, accept 0-9 a-z");
        require(
            UserNameToAddress[newUserName] == address(0),
            "This name is taken"
        );
        require(msg.value == USERNAME_PRICE, "Payment error");
        payable(FINANCE_VAULT).transfer(USERNAME_PRICE);
        UserNameToAddress[UserAddressToName[msg.sender]] = address(0);
        UserNameToAddress[newUserName] = msg.sender;
        UserAddressToName[msg.sender] = newUserName;
    }

    function buyLandName(uint tokenId, string memory newLandName)
        public
        payable
    {
        require(checkString(newLandName), "Invalid string, accept 0-9 a-z");
        require(
            tmLandInstance.ownerOf(tokenId) == msg.sender,
            "Cant change tokenid not owner"
        );
        require(LandNameToId[newLandName] == 0, "This name is taken");
        require(msg.value == LANDNAME_PRICE, "Payment error");
        payable(FINANCE_VAULT).transfer(LANDNAME_PRICE);
        LandNameToId[LandIdToName[tokenId]] = 0;
        LandNameToId[newLandName] = tokenId;
        LandIdToName[tokenId] = newLandName;
    }
}
