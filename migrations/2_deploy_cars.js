const BonusToken = artifacts.require("ERC20");
const BuyCars = artifacts.require("BuyCars");

module.exports = async function (deployer) {
  await deployer.deploy(BonusToken, "BonusToken", "BT");
  await deployer.deploy(BuyCars, BonusToken.address);
};
