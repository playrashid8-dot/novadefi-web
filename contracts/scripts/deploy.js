const { ethers } = require("hardhat");

async function main() {

  const initialOwner = "0x1BE1eC372fB1a72a9058bC96C1A8E3662465Ca29";
  const token = "0x55d398326f99059fF775485246999027B3197955"; // BSC USDT
  const treasury1 = "0x709355C104a739C63603d2Ca84720275b0624BF0";
  const treasury2 = "0xF81a8f14dF101BB1f680aFEB50786a0362D4bFA2";

  console.log("Deploying NovaDeFi...");

  const Factory = await ethers.getContractFactory("NovaDeFi");

  const contract = await Factory.deploy(
    initialOwner,
    token,
    treasury1,
    treasury2
  );

  await contract.waitForDeployment();

  const address = await contract.getAddress();

  console.log("NovaDeFi deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});