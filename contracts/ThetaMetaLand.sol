// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/// @custom:security-contact dev@thetameta.space
contract ThetaMetaLand is ERC721, ERC721Enumerable, ERC721Burnable, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    constructor() ERC721("ThetaMetaLand", "TML") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    string BASE_URI = "https://uri.thetameta.space/";

    function updateBaseUri(string memory newUri) public onlyRole(DEFAULT_ADMIN_ROLE) {
        BASE_URI = newUri;
    }

    function _baseURI() internal view override returns (string memory) {
        return BASE_URI;
    }

    function safeMint(address to, uint256 tokenId) public onlyRole(MINTER_ROLE) {
        _safeMint(to, tokenId);
    }

    function mint(address to, uint256 tokenId) public onlyRole(MINTER_ROLE) {
        _mint(to, tokenId);
    }

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
