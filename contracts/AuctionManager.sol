// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @dev This interface of ThetaMetaLandContract
 */
interface ITML {
    function mint(address _to, uint256 _tokenId) external;

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

contract SellerTokensEnumerable {
    mapping(address => uint256[]) private _sellerTokens;
    mapping(uint256 => uint256) private _sellerTokensIndex;
    uint public totalSellerTokens;

    /**
     * @dev Show total token for sell of owner
     */
    function tokenOfSellerTokensLength(address owner)
        public
        view
        returns (uint)
    {
        return _sellerTokens[owner].length;
    }

    /**
     * @dev Get token in index positon of owner
     */
    function tokenOfSellerTokensByIndex(address owner, uint256 index)
        public
        view
        returns (uint256)
    {
        require(index < _sellerTokens[owner].length, "index out of bounds");
        return _sellerTokens[owner][index];
    }

    /**
     * @dev Add tokenId to list token of owner for sale
     * Just using internal
     */
    function addTokenToSellerEnumeration(address owner, uint256 tokenId)
        internal
    {
        _sellerTokensIndex[tokenId] = _sellerTokens[owner].length;
        _sellerTokens[owner].push(tokenId);
        totalSellerTokens++;
    }

    /**
     * @dev Remove tokenId to list token of owner for sale
     * Just using internal
     */
    function removeTokenFromSellerEnumeration(address owner, uint256 tokenId)
        internal
    {
        // To prevent a gap in owner's tokens array, we store the last token in the index of the token to delete, and
        // then delete the last slot (swap and pop).
        uint256 lastTokenIndex = _sellerTokens[owner].length - 1;
        uint256 tokenIndex = _sellerTokensIndex[tokenId];

        // When the token to delete is the last token, the swap operation is unnecessary
        if (tokenIndex != lastTokenIndex) {
            uint256 lastTokenId = _sellerTokens[owner][lastTokenIndex];

            _sellerTokens[owner][tokenIndex] = lastTokenId; // Move the last token to the slot of the to-delete token
            _sellerTokensIndex[lastTokenId] = tokenIndex; // Update the moved token's index
        }

        // This also deletes the contents at the last position of the array
        _sellerTokens[owner].pop();
        // Since tokenId will be deleted, we can clear its slot in _sellerTokensIndex to trigger a gas refund
        delete _sellerTokensIndex[tokenId];
        totalSellerTokens--;
        // Note that _sellerTokensIndex[tokenId] hasn't been cleared: it still points to the old slot (block.timestamp occupied by
        // lastTokenId, or just over the end of the array if the token was the last one).
    }
}

contract BidderTokensEnumerable {
    mapping(address => uint256[]) private _bidderTokens;
    mapping(uint256 => uint256) private _bidderTokensIndex;
    uint public totalBidderTokens;

    /**
     * @dev Show total token bid of owner
     */
    function tokenOfBidderTokensLength(address owner)
        public
        view
        returns (uint)
    {
        return _bidderTokens[owner].length;
    }

    /**
     * @dev Show tokenId of owner in list bid tokens
     */
    function tokenOfBidderTokensByIndex(address owner, uint256 index)
        public
        view
        returns (uint256)
    {
        require(index < _bidderTokens[owner].length, "index out of bounds");
        return _bidderTokens[owner][index];
    }

    /**
     * @dev Add tokenId to list bid tokens of owner
     */
    function addTokenToBidderEnumeration(address owner, uint256 tokenId)
        internal
    {
        _bidderTokensIndex[tokenId] = _bidderTokens[owner].length;
        _bidderTokens[owner].push(tokenId);
        totalBidderTokens++;
    }

    /**
     * @dev Remove tokenId from list bid tokens of owner
     */
    function removeTokenFromBidderEnumeration(address owner, uint256 tokenId)
        internal
    {
        // To prevent a gap in from's tokens array, we store the last token in the index of the token to delete, and
        // then delete the last slot (swap and pop).
        uint256 lastTokenIndex = _bidderTokens[owner].length - 1;
        uint256 tokenIndex = _bidderTokensIndex[tokenId];

        // When the token to delete is the last token, the swap operation is unnecessary
        if (tokenIndex != lastTokenIndex) {
            uint256 lastTokenId = _bidderTokens[owner][lastTokenIndex];

            _bidderTokens[owner][tokenIndex] = lastTokenId; // Move the last token to the slot of the to-delete token
            _bidderTokensIndex[lastTokenId] = tokenIndex; // Update the moved token's index
        }

        // This also deletes the contents at the last position of the array
        _bidderTokens[owner].pop();
        // Since tokenId will be deleted, we can clear its slot in _bidderTokensIndex to trigger a gas refund
        delete _bidderTokensIndex[tokenId];
        totalBidderTokens--;
        // Note that _bidderTokensIndex[tokenId] hasn't been cleared: it still points to the old slot (block.timestamp occupied by
        // lastTokenId, or just over the end of the array if the token was the last one).
    }
}

contract AuctionManager is
    ThetaMetaContract,
    SellerTokensEnumerable,
    BidderTokensEnumerable
{
    address public FINANCE_VAULT;

    struct BidData {
        address owner;
        uint startPrice;
        uint listingTime;
        uint bidTime;
        uint bidStep;
        uint startTime;
        uint endTime;
        address topBidder;
        uint topPrice;
    }
    mapping(uint => BidData) public tokenIdToBidData;
    mapping(address => mapping(uint => uint)) public balance;

    BidData public defaultBidData;
    uint public feeRatio; // 1/1000: feeRatio = 10 => 10/1000=> 1%

    constructor() {
        FINANCE_VAULT = _msgSender();

        defaultBidData.owner = FINANCE_VAULT;
        defaultBidData.startPrice = 10 * 1e18; //10 TFUEL
        defaultBidData.bidTime = 1 hours;
        defaultBidData.bidStep = 10 * 1e18; //10 TFUEL

        feeRatio = 100; //10% =>
    }

    function setFinanceVault(address newAddress) public onlyOwner {
        FINANCE_VAULT = newAddress;
        defaultBidData.owner = FINANCE_VAULT;
    }

    function SetDefaultBidData(
        address _owner,
        uint _startPrice,
        uint _bidTime,
        uint _bidStep
    ) public onlyOwner {
        defaultBidData.owner = _owner;
        defaultBidData.startPrice = _startPrice;
        defaultBidData.bidTime = _bidTime;
        defaultBidData.bidStep = _bidStep;
    }

    function SetfeeRatio(uint _feeRatio) public onlyOwner {
        feeRatio = _feeRatio;
    }

    function NewListing(
        uint _tokenId,
        uint _startPrice,
        uint _bidTime,
        uint _bidStep
    ) public {
        tmLandInstance.transferFrom(_msgSender(), address(this), _tokenId);
        require(
            tmLandInstance.ownerOf(_tokenId) == address(this),
            "Transfer ThetaMetaLand not success"
        );
        tokenIdToBidData[_tokenId] = BidData(
            _msgSender(),
            _startPrice,
            block.timestamp,
            _bidTime,
            _bidStep,
            0,
            0,
            address(0),
            0
        );
        addTokenToSellerEnumeration(_msgSender(), _tokenId);
    }

    function DeListing(uint _tokenId) public {
        require(
            _msgSender() == tokenIdToBidData[_tokenId].owner,
            "Just owner can DeListing"
        );
        require(
            tokenIdToBidData[_tokenId].startTime == 0,
            "Auction is start cant DeListing"
        );
        tmLandInstance.transferFrom(address(this), _msgSender(), _tokenId);
        require(
            tmLandInstance.ownerOf(_tokenId) == _msgSender(),
            "tokenId cant transfer back to owner"
        );
        delete tokenIdToBidData[_tokenId];
        removeTokenFromSellerEnumeration(_msgSender(), _tokenId);
    }

    function MintAndBid(uint _tokenId, uint _stepNum) public payable {
        tmLandInstance.mint(address(this), _tokenId);
        require(
            tmLandInstance.ownerOf(_tokenId) == address(this),
            "Mint token is not success. Maybe not have right or token is exits"
        );
        tokenIdToBidData[_tokenId] = BidData(
            defaultBidData.owner,
            defaultBidData.startPrice,
            block.timestamp,
            defaultBidData.bidTime,
            defaultBidData.bidStep,
            0,
            0,
            address(0),
            0
        );
        Bid(_tokenId, _stepNum);
        addTokenToSellerEnumeration(defaultBidData.owner, _tokenId);
    }

    function Bid(uint _tokenId, uint _stepNum) public payable {
        //Check bid is available
        BidData memory tokenBidData = tokenIdToBidData[_tokenId];
        require(tokenBidData.listingTime != 0, "Token not listing");
        if (tokenBidData.startTime > 0)
            require(
                tokenBidData.startTime + tokenBidData.bidTime >=
                    block.timestamp,
                "Bid is end"
            ); //Bid end
        require(tokenBidData.endTime == 0, "Bid end and tokenid not available"); //Bid end and token transfer to winner

        require(_stepNum > 0, "Step must be great than 0");

        uint currentBalanceForThisToken = balance[_msgSender()][_tokenId];
        uint requireBalanceForBid = 0;
        if (tokenBidData.topPrice == 0)
            requireBalanceForBid =
                tokenBidData.startPrice +
                _stepNum *
                tokenBidData.bidStep;
        else
            requireBalanceForBid =
                tokenBidData.topPrice +
                _stepNum *
                tokenBidData.bidStep;
        if (requireBalanceForBid > currentBalanceForThisToken) {
            uint balanceNeedToDeposit = requireBalanceForBid -
                currentBalanceForThisToken;
            require(
                msg.value == balanceNeedToDeposit,
                "Not enough TFUEL to bid"
            );
            balance[_msgSender()][_tokenId] = requireBalanceForBid;
        }
        tokenIdToBidData[_tokenId].topBidder = _msgSender();
        tokenIdToBidData[_tokenId].topPrice = requireBalanceForBid;
        tokenIdToBidData[_tokenId].startTime = block.timestamp;

        addTokenToBidderEnumeration(_msgSender(), _tokenId);
    }

    function QuitBidIfNotWin(uint _tokenId) public payable {
        //
        BidData memory tokenBidData = tokenIdToBidData[_tokenId];
        require(
            _msgSender() != tokenBidData.topBidder,
            "You are topBidder, cant quit"
        );
        uint userBalanceForThisBid = balance[_msgSender()][_tokenId];
        require(userBalanceForThisBid > 0, "You are not join this Auction");
        balance[_msgSender()][_tokenId] = 0;
        payable(_msgSender()).transfer(userBalanceForThisBid);
        removeTokenFromBidderEnumeration(_msgSender(), _tokenId);
    }

    function EndBid(uint _tokenId) public payable {
        //anyone can call this to end bid and transfer every thing to winner and owner
        BidData memory tokenBidData = tokenIdToBidData[_tokenId];
        require(tokenBidData.endTime == 0, "Bid end and tokenid not available"); //Bid end and token transfer to winner
        require(
            tokenBidData.startTime + tokenBidData.bidTime < block.timestamp,
            "Bid is not end"
        );
        uint topBidderBalance = balance[tokenBidData.topBidder][_tokenId];
        balance[tokenBidData.topBidder][_tokenId] = 0;
        tokenIdToBidData[_tokenId].endTime = block.timestamp;
        if (tokenBidData.owner == FINANCE_VAULT) {
            payable(FINANCE_VAULT).transfer(topBidderBalance);
        } else {
            uint feeFillBid = (topBidderBalance * feeRatio) / 1000;
            uint restBalanceToOwner = topBidderBalance - feeFillBid;
            payable(tokenBidData.owner).transfer(restBalanceToOwner);
            if (feeFillBid > 0) payable(FINANCE_VAULT).transfer(feeFillBid);
        }

        tmLandInstance.transferFrom(
            address(this),
            tokenBidData.topBidder,
            _tokenId
        );
        require(
            tmLandInstance.ownerOf(_tokenId) == tokenBidData.topBidder,
            "tokenId cant transfer to this winner"
        );
        removeTokenFromBidderEnumeration(tokenBidData.topBidder, _tokenId);
        removeTokenFromSellerEnumeration(tokenBidData.owner, _tokenId);
    }
}
