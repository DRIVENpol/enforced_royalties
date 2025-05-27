require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

const deployerKey = process.env.DEPLOYER;
const buyerKey = process.env.BUYER;
const sellerKey = process.env.SELLER;

module.exports = {
  solidity: "0.8.27",
  networks: {
    buildbear: {
      url: "https://rpc.buildbear.io/tasty-carnage-74b19342",
      chainId: 26409,
      accounts: [deployerKey, buyerKey, sellerKey]
    }
  }
};
