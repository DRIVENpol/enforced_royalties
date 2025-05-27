require("dotenv").config();
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
const { Seaport } = require("@opensea/seaport-js");

// ItemType enum values from Seaport.js
const ItemType = {
  NATIVE: 0,
  ERC20: 1,
  ERC721: 2,
  ERC1155: 3,
  ERC721_WITH_CRITERIA: 4,
  ERC1155_WITH_CRITERIA: 5
};


async function main() {
  // Read deployments file
  const deploymentsPath = path.join(__dirname, "..", "deployments.json");
  if (!fs.existsSync(deploymentsPath)) {
    throw new Error("deployments.json not found. Please deploy the contract first.");
  }

  const deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  const networkName = hre.network.name;
  
  if (!deployments[networkName]?.ERC721_Enforced_Royalties?.address) {
    throw new Error(`No deployment found for network ${networkName}`);
  }

  const contractAddress = deployments[networkName].ERC721_Enforced_Royalties.address;
  console.log(`📝 Using contract at: ${contractAddress}`);

  // Get signers
  const [deployer, buyer] = await hre.ethers.getSigners();
  console.log("📤 Using deployer address:", deployer.address);
  console.log("📤 Using buyer address:", buyer.address);

  // Check balances
  const deployerBalance = await hre.ethers.provider.getBalance(deployer.address);
  const buyerBalance = await hre.ethers.provider.getBalance(buyer.address);
  console.log("\n💰 Initial Balances:");
  console.log("Deployer:", hre.ethers.formatEther(deployerBalance), "ETH");
  console.log("Buyer:", hre.ethers.formatEther(buyerBalance), "ETH");

  // Connect to the contracts
  const contract = await hre.ethers.getContractAt("ERC721_Enforced_Royalties", contractAddress);
  console.log("✅ Connected to ERC721 contract");

  // Verify ownership
  const owner = await contract.owner();
  console.log("📝 Contract owner:", owner);
  if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
    throw new Error("Deployer is not the contract owner");
  }

  // Get the transfer validator
  const validatorAddress = await contract.getTransferValidator();
  console.log("📝 Transfer validator:", validatorAddress);
  
  const validator = await hre.ethers.getContractAt("CreatorTokenTransferValidator", validatorAddress);
  console.log("✅ Connected to validator contract");

  // Set transfer security level
  console.log("\nSetting transfer security level...");
  try {
    const tx = await validator.setTransferSecurityLevelOfCollection(
      contractAddress,
      2, // Level 2: Operator Allowlist
      false, // disableOperatorFilterRegistry
      false, // disableSecurityPolicy
      false  // disableTransferValidator
    );
    await tx.wait();
    console.log("✅ Transfer security level set");
  } catch (error) {
    console.error("❌ Error setting transfer security level:", error.message);
    throw error;
  }

  // Initialize Seaport
  console.log("\nInitializing Seaport...");
  const seaport = new Seaport(deployer);
  console.log("✅ Seaport initialized");

  // Mint a token and create order
  console.log("\nMinting token and creating order...");
  try {
    const tokenURI = "ipfs://QmYourTokenURI";
    console.log("📝 Minting token with URI:", tokenURI);
    console.log("📝 To address:", deployer.address);
    
    const tx3 = await contract.safeMint(deployer.address, tokenURI);
    console.log("📝 Transaction sent:", tx3.hash);
    const receipt = await tx3.wait();
    
    // Get the token ID from the Transfer event
    const transferEvent = receipt.logs.find(log => 
      log.fragment && log.fragment.name === 'Transfer' && 
      log.args.from === hre.ethers.ZeroAddress
    );
    const tokenId = transferEvent ? transferEvent.args.tokenId : 'unknown';
    
    console.log(`✅ Token ${tokenId} minted to ${deployer.address}`);

    // Verify ownership
    const tokenOwner = await contract.ownerOf(tokenId);
    console.log(`\nToken ${tokenId} owner: ${tokenOwner}`);

    // Get royalty info
    const oneEth = hre.ethers.parseEther("1.0");
    const royaltyInfo = await contract.royaltyInfo(tokenId, oneEth);
    const royaltyReceiver = royaltyInfo[0];
    const royaltyAmount = royaltyInfo[1];
    console.log("\n📝 Royalty Info:");
    console.log("Receiver:", royaltyReceiver);
    console.log("Amount for 1 ETH:", hre.ethers.formatEther(royaltyAmount), "ETH");

    // Calculate amounts for 50 ETH sale
    const salePrice = hre.ethers.parseEther("50.0");
    const royaltyAmountForSale = royaltyAmount * salePrice / oneEth;
    const sellerAmount = salePrice - royaltyAmountForSale;

    console.log("\n📝 Sale Breakdown:");
    console.log("Total Price:", hre.ethers.formatEther(salePrice), "ETH");
    console.log("Royalty Amount:", hre.ethers.formatEther(royaltyAmountForSale), "ETH");
    console.log("Seller Amount:", hre.ethers.formatEther(sellerAmount), "ETH");

    // Approve Seaport to handle the NFT
    console.log("\nApproving Seaport to handle NFT...");
    const seaportAddress = "0x0000000000000068F116a894984e2DB1123eB395"; // Seaport v1.6
    const approveTx = await contract.approve(seaportAddress, tokenId);
    await approveTx.wait();
    console.log("✅ Seaport approved to handle NFT");

    // Fetch the current block timestamp from the blockchain
    const block = await hre.ethers.provider.getBlock("latest");
    const currentTime = block.timestamp;
    const startTime = currentTime - 60; // Start 1 minute ago
    const endTime = currentTime + 86400; // End 1 day later
    console.log("Current block timestamp:", currentTime);

    // Create a listing order
    console.log("\nCreating listing order...");
    const { executeAllActions } = await seaport.createOrder(
      {
        offer: [
          {
            itemType: ItemType.ERC721,
            token: contractAddress,
            identifier: tokenId.toString()
          }
        ],
        consideration: [
          {
            amount: sellerAmount.toString(),
            recipient: deployer.address
          },
          {
            amount: royaltyAmountForSale.toString(),
            recipient: royaltyReceiver
          }
        ],
        startTime: startTime.toString(), // Start 1 minute ago
        endTime: endTime.toString(),     // End 1 day later
      },
      deployer.address
    );

    const order = await executeAllActions();
    console.log("Order:", JSON.stringify(order, null, 2));
    console.log("Order parameters consideration:", order.parameters.consideration);
    order.parameters.consideration.forEach((item, idx) => {
      if (typeof item.startAmount === 'undefined') {
        console.error(`❌ Consideration item ${idx} is missing 'startAmount':`, item);
      }
    });
    if (
      order.parameters.consideration.length >= 2 &&
      order.parameters.consideration[0].startAmount &&
      order.parameters.consideration[1].startAmount
    ) {
      const totalConsideration = BigInt(order.parameters.consideration[0].startAmount) +
                                 BigInt(order.parameters.consideration[1].startAmount);
      console.log("Total consideration:", hre.ethers.formatEther(totalConsideration));
      if (totalConsideration !== salePrice) {
        console.error("❌ Total consideration does not match sale price! Seaport will revert.");
      }
    } else {
      console.error("❌ One or more consideration items are missing 'startAmount'.");
      console.log("Consideration array:", order.parameters.consideration);
    }

    // Use a real Wallet for the buyer
    const buyerPrivateKey = process.env.BUYER;
    if (!buyerPrivateKey) {
      throw new Error("BUYER not set in .env file");
    }
    const buyerWallet = new hre.ethers.Wallet(buyerPrivateKey, hre.ethers.provider);
    const seaportBuyer = new Seaport(buyerWallet);

    // Use fulfillOrder with extraRecipients: [] to force advanced path
    const { executeAllActions: executeAllFulfillActions } = await seaportBuyer.fulfillOrder({
      order,
      accountAddress: buyerWallet.address,
      extraRecipients: [], // 👈 Force advanced fulfillment
    });

    console.log("⚠️ Sending ETH with order fulfillment:", hre.ethers.formatEther(salePrice));
    const transaction = await executeAllFulfillActions({ value: salePrice });
    console.log("✅ Order fulfilled:", transaction);

    // Check final balances
    const finalDeployerBalance = await hre.ethers.provider.getBalance(deployer.address);
    const finalBuyerBalance = await hre.ethers.provider.getBalance(buyer.address);
    console.log("\n💰 Final Balances:");
    console.log("Deployer:", hre.ethers.formatEther(finalDeployerBalance), "ETH");
    console.log("Buyer:", hre.ethers.formatEther(finalBuyerBalance), "ETH");
  } catch (error) {
    console.error("❌ Error during minting or order creation:", error.message);
    if (error.data) {
      console.error("Error data:", error.data);
    }
    if (error.transaction) {
      console.error("Transaction hash:", error.transaction.hash);
    }
    throw error;
  }
}

main().catch((err) => {
  console.error("❌ Interaction failed:", err);
  process.exit(1);
});

// npx hardhat run scripts/interactERC721.js --network buildbear