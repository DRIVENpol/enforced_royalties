# ERC721 with Enforced Royalties

This project implements an ERC721 token contract with enforced royalties using OpenSea's Seaport protocol. The contract ensures that royalty payments are properly distributed during NFT sales.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A `.env` file with the following variables:
  ```
  ROYALTY_ADDRESS=<address_to_receive_royalties>
  BUYER=<private_key_of_buyer_wallet>
  DEPLOYER=<private_key_of_deployer_wallet>
  BUILDBEAR_RPC_URL=<your_buildbear_rpc_url>
  BUILDBEAR_CHAIN_ID=<your_buildbear_chain_id>
  ```

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

## Using BuildBear for Testing

1. Go to [BuildBear.io](https://buildbear.io)
2. Fork Ethereum mainnet
3. Once forked, you'll get:
   - RPC URL
   - Chain ID
   - Explorer URL
4. Update your `.env` file with the BuildBear credentials:
```
BUILDBEAR_RPC_URL=your_rpc_url
BUILDBEAR_CHAIN_ID=your_chain_id
```

### Getting Test ETH

Before running the scripts:
1. Go to your BuildBear dashboard
2. Use the faucet to send test ETH to:
   - Your deployer address (for contract deployment)
   - Your buyer address (for testing purchases)
   - Your royalty receiver address

## Available Scripts

### Compile Contracts
```bash
npx hardhat compile
```

### Deploy Contract
Deploys the ERC721 contract with enforced royalties:
```bash
npx hardhat run scripts/deployERC721.js --network buildbear
```
This script:
- Deploys the ERC721 contract with enforced royalties
- Sets up the transfer validator
- Configures royalty settings (5% by default)
- Saves deployment information to `deployments.json`

### Interact with Contract
Tests the full NFT lifecycle including minting, selling, and royalty verification:
```bash
npx hardhat run scripts/interactERC721.js --network buildbear
```
This script:
- Mints a new NFT
- Sets up transfer security levels
- Creates a Seaport listing order
- Simulates a purchase with royalty distribution
- Verifies balances and ownership
- Checks royalty payments by comparing initial and final balances
- Provides detailed transaction information and status

## Contract Features

- ERC721 token with enforced royalties
- OpenSea Seaport integration
- Transfer security controls
- Royalty enforcement (5% by default)
- URI storage for metadata
- Automatic royalty verification

## Network Configuration

The project is configured to work with BuildBear's forked Ethereum network. The configuration is handled through environment variables in the `.env` file.

## Project Structure

```
├── contracts/
│   └── ERC721_Enforced_Royalties.sol    # Main NFT contract
├── scripts/
│   ├── deployERC721.js                  # Deployment script
│   └── interactERC721.js                # Interaction and royalty verification script
└── deployments.json                     # Deployment information
```

## Notes

- The contract uses OpenSea's Seaport v1.6 for marketplace integration
- Royalties are set to 5% by default but can be modified during deployment
- Transfer security is implemented using OpenSea's validator
- For testing, use BuildBear's forked Ethereum network to avoid using real ETH
- The interaction script now includes built-in royalty verification
- All transactions and balances are logged for easy tracking
