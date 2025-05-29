require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.27",
  networks: {
    buildbear: {
      url: process.env.BUILDBEAR_RPC_URL,
      chainId: parseInt(process.env.BUILDBEAR_CHAIN_ID),
      accounts: [process.env.DEPLOYER, process.env.BUYER, process.env.SELLER].filter(Boolean)
    }
  }
};
