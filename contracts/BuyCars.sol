// SPDX-License-Identifier: MIT
pragma solidity ^0.8.5;

import "./IERC20.sol";

contract BuyCars {
    address public owner;
    address public bonusTokenAddress;
    address public accounter;

    event createOrderEvent(uint256 _tokens);

    constructor(address _bonusTokenAddress) {
        owner = msg.sender;
        bonusTokenAddress = _bonusTokenAddress;
    }

    modifier onlyOwner() {
        require(owner == msg.sender, "Only owner can do this");
        _;
    }

    uint256 public UserID;
    uint256 public CarID;
    uint256 public OrderID;
    uint256 public ServiceOrderID;

    struct car {
        uint256 price;
        string brand;
        string model;
    }

    struct order {
        uint256 userID;
        uint256 carID;
        uint256 date;
        bool active;
        uint256 tokens;
    }

    struct serviceOrder {
        address userAddress;
        uint price;
        uint date;
    }

    struct user {
        string name;
        uint256 tokens;
        uint256[] orders;
    }

    mapping(address => user) public Users;
    mapping(uint256 => address) public UserIDs;
    mapping(uint256 => car) public Cars;
    mapping(uint256 => order) public Orders;
    mapping(uint => serviceOrder) public ServiceOrders;

    //FUNCTIONS

    function setBonusTokenAddress(address _address) public onlyOwner {
        bonusTokenAddress = _address;
    }

    function addAccounter(address _address) public onlyOwner {
        accounter = _address;
    }

    function addUser(string memory _name, address _userAddress)
        public
        onlyOwner
    {
        UserID += 1;
        Users[_userAddress].name = _name;
        UserIDs[UserID] = _userAddress;
    }

    function addCar(
        string memory _brand,
        string memory _model,
        uint256 _price
    ) public onlyOwner {
        CarID += 1;
        Cars[CarID].brand = _brand;
        Cars[CarID].model = _model;
        Cars[CarID].price = _price;
    }

    function createOrder(uint256 _car_id, uint256 _user_id) public onlyOwner {
        OrderID += 1;
        Orders[OrderID].userID = _user_id;
        Orders[OrderID].carID = _car_id;
        Orders[OrderID].date = block.timestamp;
        Orders[OrderID].active = true;
        address _user_address = UserIDs[_user_id];
        Users[_user_address].orders.push(OrderID);
        uint256 _tokens = Cars[_car_id].price / 100;
        Orders[OrderID].tokens = _tokens;
        Users[_user_address].tokens = _tokens;
        IERC20 _bonusToken = IERC20(bonusTokenAddress);
        _bonusToken.mint(_user_address, _tokens * 10**18);
        emit createOrderEvent(_tokens);
    }

    function createServiceOrder(address _address, uint _price) public onlyOwner {
        ServiceOrderID += 1;
        ServiceOrders[ServiceOrderID].userAddress = _address;
        ServiceOrders[ServiceOrderID].price = _price;
        ServiceOrders[ServiceOrderID].date = block.timestamp;
    }

    function checkUserTokens(uint256 _order_id, uint256 _user_id)
        public
        onlyOwner
    {}

    function payByTokens(uint _serviceOrderID) public {
        uint _serviceAmount = ServiceOrders[_serviceOrderID].price;
        require(Users[msg.sender].tokens >= _serviceAmount, "Not enought tokens"); 

        IERC20 _bon_token = IERC20(bonusTokenAddress); 
        _bon_token.transferFrom(msg.sender, accounter, _serviceAmount * 10**18); 

        Users[msg.sender].tokens -= _serviceAmount; 
    }

}
