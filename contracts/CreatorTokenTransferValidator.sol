// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract CreatorTokenTransferValidator is Ownable {
    error CreatorTokenTransferValidator__CallerMustBeWhitelisted();
    error CreatorTokenTransferValidator__InvalidSecurityLevel();
    error CreatorTokenTransferValidator__InvalidWhitelistId();

    // Security levels
    uint8 public constant LEVEL_0 = 0; // No restrictions
    uint8 public constant LEVEL_1 = 1; // Operator blacklist
    uint8 public constant LEVEL_2 = 2; // Operator whitelist
    uint8 public constant LEVEL_3 = 3; // Operator whitelist with OTC enabled

    // Collection security settings
    struct CollectionSecurityPolicy {
        uint8 securityLevel;
        bool isAuthorizationMode;
        bool allowWildcardOperators;
        bool disableAccountFreezing;
    }

    // Whitelist IDs
    uint8 public constant OPERATOR_WHITELIST = 0;
    uint8 public constant OPERATOR_BLACKLIST = 1;

    // Mapping from collection to security policy
    mapping(address => CollectionSecurityPolicy) public collectionSecurityPolicies;
    
    // Mapping from collection to whitelist ID to operator to whitelist status
    mapping(address => mapping(uint8 => mapping(address => bool))) public whitelistedOperators;

    constructor(
        address defaultOwner,
        address eoaRegistry,
        string memory name,
        string memory version
    ) Ownable(defaultOwner) {}

    function setTransferSecurityLevelOfCollection(
        address collection,
        uint8 level,
        bool isAuthorizationMode,
        bool allowWildcardOperators,
        bool disableAccountFreezing
    ) external onlyOwner {
        if (level > LEVEL_3) revert CreatorTokenTransferValidator__InvalidSecurityLevel();
        
        collectionSecurityPolicies[collection] = CollectionSecurityPolicy({
            securityLevel: level,
            isAuthorizationMode: isAuthorizationMode,
            allowWildcardOperators: allowWildcardOperators,
            disableAccountFreezing: disableAccountFreezing
        });
    }

    function addAccountsToWhitelist(
        uint8 whitelistId,
        address[] calldata accounts
    ) external onlyOwner {
        if (whitelistId > OPERATOR_BLACKLIST) revert CreatorTokenTransferValidator__InvalidWhitelistId();
        
        for (uint256 i = 0; i < accounts.length; i++) {
            whitelistedOperators[msg.sender][whitelistId][accounts[i]] = true;
        }
    }

    function removeAccountsFromWhitelist(
        uint8 whitelistId,
        address[] calldata accounts
    ) external onlyOwner {
        if (whitelistId > OPERATOR_BLACKLIST) revert CreatorTokenTransferValidator__InvalidWhitelistId();
        
        for (uint256 i = 0; i < accounts.length; i++) {
            whitelistedOperators[msg.sender][whitelistId][accounts[i]] = false;
        }
    }

    function validateTransfer(
        address caller,
        address from,
        address to,
        uint256 tokenId
    ) external view {
        CollectionSecurityPolicy memory policy = collectionSecurityPolicies[msg.sender];
        
        // If security level is 0, allow all transfers
        if (policy.securityLevel == LEVEL_0) return;
        
        // For OTC transfers (direct from owner), allow if security level is 3
        if (from == owner() && policy.securityLevel == LEVEL_3) return;
        
        // Check if caller is whitelisted
        if (!whitelistedOperators[msg.sender][OPERATOR_WHITELIST][caller]) {
            revert CreatorTokenTransferValidator__CallerMustBeWhitelisted();
        }
    }
} 