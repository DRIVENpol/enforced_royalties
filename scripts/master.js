require("dotenv").config();
const { execSync } = require("child_process");
const path = require("path");

async function main() {
  try {
    console.log("🚀 Starting master script execution...\n");

    // Step 1: Deploy ERC721 Contract
    console.log("📦 Step 1: Deploying ERC721 Contract...");
    execSync("npx hardhat run scripts/deployERC721.js --network buildbear", { stdio: "inherit" });
    console.log("✅ ERC721 Contract deployment completed\n");

    // Step 2: Interact with ERC721 Contract
    console.log("🤝 Step 2: Interacting with ERC721 Contract...");
    execSync("npx hardhat run scripts/interactERC721.js --network buildbear", { stdio: "inherit" });
    console.log("✅ ERC721 Contract interaction completed\n");

    // Step 3: Check Royalty Payment
    console.log("💰 Step 3: Checking Royalty Payment...");
    execSync("npx hardhat run scripts/checkRoyaltyPayment.js --network buildbear", { stdio: "inherit" });
    console.log("✅ Royalty payment check completed\n");

    console.log("🎉 All steps completed successfully!");
  } catch (error) {
    console.error("❌ Error in master script:", error.message);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("❌ Master script failed:", err);
  process.exit(1);
}); 

// npx hardhat run scripts/master.js --network buildbear