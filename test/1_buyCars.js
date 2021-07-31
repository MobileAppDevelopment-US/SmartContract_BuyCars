const truffleAssert = require('truffle-assertions') 
const BuyCars = artifacts.require("BuyCars")

contract("BuyCars", accounts => { 

    it("Add minter to token", async () => {
        const buyCars = await BuyCars.deployed()
        const bonusToken = await BonusToken.deployed()
        await bonusToken.addMinter(buyCars.address)
        const minter = await bonusToken.Minters(buyCars.address)
        assert.equal(minter, true, "Not correct minter")
    })

    it("Add accounter", async () => {
        const buyCars = await BuyCars.deployed()
        await buyCars.addAccounter(accounts[6])
        const accounter = await buyCars.accounter()
        assert.equal(accounter, accounts[6], "Not correct accounter")
    })

    it("is Bonus Token address presented", async () => {
        const buyCars = await BuyCars.deployed() 
        const bonusToken = await BonusToken.deployed()
        const bonusTokenAddress = await buyCars.bonusTokenAddress() 
        assert.equal(bonusTokenAddress, bonusToken.address, "Address isn't correct")
    })

    it("Add cars", async () => {
        const buyCars = await BuyCars.deployed()
        await buyCars.addCar("BMW", "X7", 150000)
        assert.equal(currentCar.brand, "BMW", "brand error")
        assert.equal(currentCar.model, "X7", "model error")
        assert.equal(currentCar.price, 150000, "price error")
    })

    it("Add cars not owner", async () => {
        const buyCars = await BuyCars.deployed()
        await truffleAssert.reverts(buyCars.addCar("BMW", "X7", 150000, { from: accounts[1] })) 
    })

    it("Add user", async () => {
        const buyCars = await BuyCars.deployed()
        await buyCars.addUser("Jonn", accounts[5]) 
        const currentUser = await buyCars.Users(accounts[5]) 
        assert.equal(currentUser.name, "Jonn", "Name wrong")
        assert.equal(currentUser.tokens, 0, "Tokens wrong")
    })

    it("Add user not owner", async () => {
        const buyCars = await BuyCars.deployed()
        await truffleAssert.reverts(buyCars.addUser("Jonn", accounts[5], { from: accounts[1] })) 
    })

    it("Add order", async () => {
        const buyCars = await BuyCars.deployed()
        await buyCars.createOrder(1, 1) // id car + id user
        const currentOrder = await buyCars.Orders(1)

        assert.equal(currentOrder.userID, 1, "userID error")
        assert.equal(currentOrder.carID, 1, "carID error")
        assert.equal(currentOrder.active, true, "active error")
        assert.equal(currentOrder.tokens, 1500, "tokens error")
    })

    it("Check user's BT balance", async () => {
        const bonusToken = await BonusToken.deployed()
        const balance = await bonusToken.balanceOf(accounts[5])

        let sum = web3.utils.toWei(web3.utils.toBN(1500))
        assert.equal(BigInt(balance), BigInt(sum), "Not correct balance")
    })

    it("Create service order", async () => {
        const buyCars = await BuyCars.deployed()
        await buyCars.createServiceOrder(accounts[5], 1000)

        const currentServiceOrder = await buyCars.ServiceOrders(1)
        assert.equal(currentServiceOrder.userAddress, accounts[5], "User address error")
        assert.equal(currentServiceOrder.price, 1000, "Price error")
    })

    it("Bonus token approve", async () => {
        const bonusToken = await BonusToken.deployed()
        const buyCars = await BuyCars.deployed()

        let sum = web3.utils.toWei(web3.utils.toBN(1500)) 
        await bonusToken.approve(buyCars.address, sum, { from: accounts[5] });

        const allow = await bonusToken.allowance(accounts[5], buyCars.address)
        assert.equal(BigInt(allow), BigInt(sum), "Sum isn't approve")
    })

    it("Initial totalSupply", async () => {
        const bonusToken = await BonusToken.deployed()

        let sum = web3.utils.toWei(web3.utils.toBN(1500))
        const totalSupply = await bonusToken.totalSupply() 
        assert.equal(BigInt(totalSupply), BigInt(sum), "Initial totalSupply error")
    })

    it("Service order payment", async () => {
        const bonusToken = await BonusToken.deployed()
        const buyCars = await BuyCars.deployed()

        await buyCars.payByTokens(1, { from: accounts[5] })
        const accounterBalance = await bonusToken.balanceOf(accounts[6])
        let sum = web3.utils.toWei(web3.utils.toBN(1000))

        const user = await buyCars.Users(accounts[5])
        assert.equal(user.tokens, 500, "Payment error")
    })

    it("Create service order 2", async () => {
        const buyCars = await BuyCars.deployed()
        await buyCars.createServiceOrder(accounts[5], 1000)

        const currentServiceOrder = await buyCars.ServiceOrders(2)
        assert.equal(currentServiceOrder.userAddress, accounts[5], "User address error2")
        assert.equal(currentServiceOrder.price, 1000, "Price error2")
    })

    it("Service order payment error2", async () => {
        const buyCars = await BuyCars.deployed()

        let sum = web3.utils.toWei(web3.utils.toBN(1000))
        await truffleAssert.reverts(buyCars.payByTokens(2, { from: accounts[5] }))
    })

    //NFT

    it("Check deploy collection TesseraNFT", async () => {
        const tesseraNft = await TesseraNFT.deployed()
        const nameNFT = await tesseraNft.name()
        const symbol = await tesseraNft.symbol()
        assert.equal(nameNFT, "Tessera", "Not correct collection name")
        assert.equal(symbol, "TES")
    })

    it("Check create token mint add tokenURI", async () => {
        const tesseraNft = await TesseraNFT.deployed()
        await tesseraNft.createNFT("https://https://github.com/Serik-IOS/SmartContract_BuyCars.git")
        const tokenURI = await tesseraNft.tokenURI(1) 
        assert.equal(tokenURI, "https://https://github.com/Serik-IOS/SmartContract_BuyCars.git", "notCorrectURI")
    })

})

