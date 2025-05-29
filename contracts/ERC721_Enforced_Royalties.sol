// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

// Step 1: Import ERC2981
import {ERC2981} from "@openzeppelin/contracts/token/common/ERC2981.sol";

// Step 2: Declare the ERC721-C interfaces (for Seaport compatibility)
interface ICreatorToken {
    event TransferValidatorUpdated(address oldValidator, address newValidator);
    function getTransferValidator() external view returns (address);
    function getTransferValidationFunction() external view returns (bytes4, bool);
    function setTransferValidator(address validator) external;
}

// Step 3: Inherit from ERC2981 and ERC721-C interfaces
contract ERC721_Enforced_Royalties is ERC721, ERC721Enumerable, ERC721URIStorage, ERC2981, ICreatorToken, Ownable {

    // Step 4: Declare the transferValidator variable
    address private _transferValidator;
    uint256 private _nextTokenId;

    constructor(
        address initialOwner,
        // Step 5: Add the required variables on deployment
        address initialTransferValidator,
        address initialRoyaltyRecipient,
        uint96 royalties
        )
        ERC721("MyToken", "MTK")
        Ownable(initialOwner)
    {
         _transferValidator = initialTransferValidator;
         _setDefaultRoyalty(initialRoyaltyRecipient, royalties);
         _nextTokenId = 1; // Start token IDs from 1

         // Step 6: Emit the TransferValidatorUpdated event
         emit TransferValidatorUpdated(address(0), initialTransferValidator);
    }

    // Step 7: Implement the ICreatorToken interface
    function getTransferValidator() external view override returns (address) {
        return _transferValidator;
    }

    function getTransferValidationFunction() external pure override returns (bytes4, bool) {
        return (bytes4(keccak256("validateTransfer(address,address,address,uint256)")), true);
    }

    function setTransferValidator(address validator) external override onlyOwner{
        emit TransferValidatorUpdated(_transferValidator, validator);
        _transferValidator = validator;
    }

    // Other functions
    function safeMint(address to, string memory uri)
        public
        onlyOwner
        returns (uint256)
    {
        uint256 tokenId = _nextTokenId++;
        _mint(to, tokenId);
        _setTokenURI(tokenId, uri);
        return tokenId;
    }

    // OVERRIDES
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
