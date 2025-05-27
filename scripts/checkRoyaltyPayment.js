require("dotenv").config();
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

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

  // Connect to the contract
  const contract = await hre.ethers.getContractAt("ERC721_Enforced_Royalties", contractAddress);
  console.log("✅ Connected to ERC721 contract");

  // Get royalty info for token ID 2 (the one we just sold)
  const tokenId = 2;
  const royaltyInfo = await contract.royaltyInfo(tokenId, hre.ethers.parseEther("1.0"));
  const royaltyReceiver = royaltyInfo[0];
  const royaltyAmount = royaltyInfo[1];
  
  console.log("\n📝 Royalty Info:");
  console.log("Receiver:", royaltyReceiver);
  console.log("Amount for 1 ETH:", hre.ethers.formatEther(royaltyAmount), "ETH");

  // Get ETH balance of royalty receiver
  const ethBalance = await hre.ethers.provider.getBalance(royaltyReceiver);
  console.log("\n💰 Royalty Receiver Balance:");
  console.log("ETH Balance:", hre.ethers.formatEther(ethBalance), "ETH");

  // Get transaction history for the royalty receiver
  console.log("\n📜 Recent Transactions for Royalty Receiver:");
  console.log("------------------------");
  
  // Get the latest block
  const latestBlock = await hre.ethers.provider.getBlockNumber();
  
  // Get transactions from the last 1000 blocks
  const startBlock = Math.max(0, latestBlock - 1000);
  
  // Get all transactions in the range
  const filter = {
    fromBlock: startBlock,
    toBlock: latestBlock,
    address: royaltyReceiver
  };

  const logs = await hre.ethers.provider.getLogs(filter);
  
  if (logs.length === 0) {
    console.log("No recent transactions found");
  } else {
    for (const log of logs.slice(-5)) { // Show last 5 transactions
      const tx = await hre.ethers.provider.getTransaction(log.transactionHash);
      const receipt = await hre.ethers.provider.getTransactionReceipt(log.transactionHash);
      
      console.log(`\nTransaction: ${log.transactionHash}`);
      console.log(`From: ${tx.from}`);
      console.log(`To: ${tx.to}`);
      console.log(`Value: ${hre.ethers.formatEther(tx.value)} ETH`);
      console.log(`Status: ${receipt.status === 1 ? 'Success' : 'Failed'}`);
      
      // If this is a Seaport transaction, show more details
      if (tx.to === "0x0000000000000068F116a894984e2DB1123eB395") {
        console.log("Seaport Transaction Details:");
        console.log("Gas Used:", receipt.gasUsed.toString());
        console.log("Block Number:", receipt.blockNumber);
      }
    }
  }
}

main().catch((err) => {
  console.error("❌ Balance check failed:", err);
  process.exit(1);
});

// npx hardhat run scripts/checkRoyaltyPayment.js --network buildbear 