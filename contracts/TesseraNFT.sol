pragma solidity  ^0.8.5;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol"; 

contract TesseraNFT is ERC721URIStorage { 

    uint public tokenIDCounter; 
    constructor() ERC721 ("Tessera", "TES") {
        tokenIDCounter = 1;
    }

    function createNFT(string memory _tokenURI) public returns (uint) {
        _safeMint(msg.sender, tokenIDCounter);
        _setTokenURI(tokenIDCounter, _tokenURI);
        tokenIDCounter += 1;
    }
}