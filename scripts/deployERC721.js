require("dotenv").config();
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  try {
    const signers = await hre.ethers.getSigners();
    console.log("✅ Successfully got signers");
    const deployer = signers[0];
    console.log("📤 Deploying with address:", deployer.address);

    console.log("\n4. Getting contract factory...");
    const ContractFactory = await hre.ethers.getContractFactory("ERC721_Enforced_Royalties");
    console.log("✅ Successfully got contract factory");

    const ROYALTY_FEE = 500; // 5%
    const royaltyReceiver = process.env.ROYALTY_ADDRESS;
    const validator = "0x721C002B0059009a671D00aD1700c9748146cd1B"; // Example validator

    if (!royaltyReceiver) throw new Error("Missing ROYALTY_ADDRESS in .env");

    const args = [
      deployer.address,
      validator,
      royaltyReceiver,
      ROYALTY_FEE
    ];

    console.log("\n5. Deploying contract with args:", args);
    const contract = await ContractFactory.deploy(...args);
    console.log("✅ Contract deployment transaction sent");

    console.log("\n6. Waiting for deployment...");
    await contract.waitForDeployment();
    const address = await contract.getAddress();
    console.log(`✅ ERC721_Enforced_Royalties deployed to: ${address}`);

    // Save deployment info to JSON file
    const deploymentsPath = path.join(__dirname, "..", "deployments.json");
    const networkName = hre.network.name;
    const deploymentInfo = {
      [networkName]: {
        ERC721_Enforced_Royalties: {
          address: address,
          deployer: deployer.address,
          validator: validator,
          royaltyReceiver: royaltyReceiver,
          royaltyFee: ROYALTY_FEE,
          deployedAt: new Date().toISOString()
        }
      }
    };

    // Read existing deployments if file exists
    let existingDeployments = {};
    if (fs.existsSync(deploymentsPath)) {
      existingDeployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
    }

    // Merge new deployment with existing ones
    const updatedDeployments = {
      ...existingDeployments,
      ...deploymentInfo
    };

    // Write back to file
    fs.writeFileSync(deploymentsPath, JSON.stringify(updatedDeployments, null, 2));
    console.log(`\n✅ Deployment info saved to deployments.json`);
  } catch (error) {
    console.error("❌ Error during deployment:", error);
    throw error;
  }
}

main().catch((err) => {
  console.error("❌ Deployment failed:", err);
  process.exit(1);
});

// npx hardhat run scripts/deployERC721.js --network buildbear
