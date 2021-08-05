const truffleAssert = require('truffle-assertions') 
const TesseraNFT = artifacts.require("TesseraNFT")
const BonusToken = artifacts.require("ERC20")
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
        const currentCar = await buyCars.Cars(1) 
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
        //console.log(currentOrder)

        assert.equal(currentOrder.userID, 1, "userID error")
        assert.equal(currentOrder.carID, 1, "carID error")
        assert.equal(currentOrder.active, true, "active error")
        assert.equal(currentOrder.tokens, 1500, "tokens error")
    })

    it("Check tokens in Users (mapping by address)", async () => {
        const buyCars = await BuyCars.deployed();
        const currUser = await buyCars.Users(accounts[5])
        const currUserList = await buyCars.UserList(0)
        assert.equal(currUserList.tokens.toNumber(), 1500, "Token error")
        assert.equal(currUser.tokens.toNumber(), 1500, "Token error")
    })

    it("Check user's BT balance", async () => {
        const bonusToken = await BonusToken.deployed()
        const balance = await bonusToken.balanceOf(accounts[5])

        // toWei  прибавляем 10 в 18 степени (18 нулей)
        let sum = web3.utils.toWei(web3.utils.toBN(1500))
        assert.equal(BigInt(balance), BigInt(sum), "Not correct balance")
        //console.log(BigInt(balance), BigInt(sum))
    })

    it("Create service order", async () => {
        const buyCars = await BuyCars.deployed()
        await buyCars.createServiceOrder(accounts[5], 1000)

        const currentServiceOrder = await buyCars.ServicesOrders(1)
        assert.equal(currentServiceOrder.userAddress, accounts[5], "User address error")
        assert.equal(currentServiceOrder.price, 1000, "Price error")
        //console.log(BigInt(currentServiceOrder.price))
    })

    it("Bonus token approve", async () => {
        const bonusToken = await BonusToken.deployed()
        const buyCars = await BuyCars.deployed()

        let sum = web3.utils.toWei(web3.utils.toBN(1000)) 
        await bonusToken.approve(buyCars.address, sum, { from: accounts[5] });

        const allow = await bonusToken.allowance(accounts[5], buyCars.address)
        assert.equal(allow.toString(), sum.toString(), "Sum is not approved");
        //console.log(BigInt(allow), BigInt(sum))
    })

    // check totalSupply == 1500 токенов
    it("Initial totalSupply", async () => {
        const bonusToken = await BonusToken.deployed()

        let sum = web3.utils.toWei(web3.utils.toBN(500)) // lost 500 from 1500
        const totalSupply = await bonusToken.totalSupply() 
        assert.equal(totalSupply.toString(), sum.toString(), "Initial totalSupply error");
        //console.log(totalSupply.toString(), sum.toString())
    })

    it("Check users list after Service Order", async () => {
        const buyCars = await BuyCars.deployed();
        const currUser = await buyCars.Users(accounts[5])
        const currUserList = await buyCars.UserList(0)
        assert.equal(currUserList.tokens.toNumber(), 500, "Trn wrong")
        assert.equal(currUser.tokens.toNumber(), 500, "Tkn wrong")
    })

    it("Create service order 2", async () => {
        const buyCars = await BuyCars.deployed();
        await buyCars.createServiceOrder(accounts[5], 200);

        const currSO = await buyCars.ServicesOrders(2);
        assert.equal(currSO.userAddress, accounts[5], "User addr error");
        assert.equal(currSO.price, 200, "Price error");
    });

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
        await tesseraNft.createNFT("https://github.com/stepanetssergey/solidity_cars.git")
        const tokenURI = await tesseraNft.tokenURI(1) /
        assert.equal(tokenURI, "https://github.com/stepanetssergey/solidity_cars.git", "notCorrectURI")
    })

    // frontend
    it("Check car list", async () => {
        const buyCars = await BuyCars.deployed();
        const CarList = await buyCars.viewCarsList()
        //console.log(CarList)
    })

})

