# ERC721 with Enforced Royalties

This project implements an ERC721 token contract with enforced royalties using OpenSea's Seaport protocol. The contract ensures that royalty payments are properly distributed during NFT sales.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A `.env` file with the following variables:
  ```
  ROYALTY_ADDRESS=<address_to_receive_royalties>
  BUYER=<private_key_of_buyer_wallet>
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
4. Update your `hardhat.config.js` with the BuildBear network:
```javascript
module.exports = {
  networks: {
    buildbear: {
      url: "YOUR_BUILDBEAR_RPC_URL",
      chainId: YOUR_CHAIN_ID,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
}
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
Tests the full NFT lifecycle including minting and selling:
```bash
npx hardhat run scripts/interactERC721.js --network buildbear
```
This script:
- Mints a new NFT
- Sets up transfer security levels
- Creates a Seaport listing order
- Simulates a purchase with royalty distribution
- Verifies balances and ownership

### Check Royalty Payment
Verifies royalty payments:
```bash
npx hardhat run scripts/checkRoyaltyPayment.js --network buildbear
```
This script:
- Checks royalty information for a specific token
- Verifies royalty receiver and amounts
- Displays payment distribution details

## Contract Features

- ERC721 token with enforced royalties
- OpenSea Seaport integration
- Transfer security controls
- Royalty enforcement (5% by default)
- URI storage for metadata

## Network Configuration

The project is configured to work with multiple networks. Update the `hardhat.config.js` file to add your network configurations.

## Testing

Run the test suite:
```bash
npx hardhat test
```

Run tests with gas reporting:
```bash
REPORT_GAS=true npx hardhat test
```

## Project Structure

```
├── contracts/
│   ├── ERC721_Enforced_Royalties.sol    # Main NFT contract
│   └── interfaces/                      # Contract interfaces
├── scripts/
│   ├── deployERC721.js                  # Deployment script
│   ├── interactERC721.js                # Interaction script
│   └── checkRoyaltyPayment.js           # Royalty verification script
├── test/                                # Test files
└── deployments.json                     # Deployment information
```

## Notes

- The contract uses OpenSea's Seaport v1.6 for marketplace integration
- Royalties are set to 5% by default but can be modified during deployment
- Transfer security is implemented using OpenSea's validator
- For testing, use BuildBear's forked Ethereum network to avoid using real ETH
