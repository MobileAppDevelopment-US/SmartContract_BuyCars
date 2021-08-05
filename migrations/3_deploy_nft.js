const TesNFT = artifacts.require("TesseraNFT.sol")

module.exports = async function (deployer) {
    deployer.deploy(TesNFT)
}