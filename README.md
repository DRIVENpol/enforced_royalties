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

## Available Scripts

### Compile Contracts
```bash
npx hardhat compile
```

### Deploy Contract
Deploys the ERC721 contract with enforced royalties:
```bash
npx hardhat run scripts/deployERC721.js --network <network_name>
```
This script:
- Deploys the ERC721 contract with enforced royalties
- Sets up the transfer validator
- Configures royalty settings (5% by default)
- Saves deployment information to `deployments.json`

### Interact with Contract
Tests the full NFT lifecycle including minting and selling:
```bash
npx hardhat run scripts/interactERC721.js --network <network_name>
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
npx hardhat run scripts/checkRoyaltyPayment.js --network <network_name>
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
