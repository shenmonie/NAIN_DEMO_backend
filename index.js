const express = require('express');
const app = express();
const Web3 = require('web3');
const dotenv = require("dotenv")
dotenv.config()
const rmrkNestableAbi = require('./abi/RMRKNestableFacet.json');


const contractAddress = process.env.CONTRACT_ADDRESS;
const rpcUrl = process.env.ALCHEMY_API_URL;

const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));
console.log('rpcUrl: ', rpcUrl, " contractAddress: ", contractAddress)
const contract = new web3.eth.Contract(rmrkNestableAbi.abi, contractAddress);

app.get('/query/balance/:address', async (req, res) => {
    const { address } = req.params;
    const balance = await contract.methods.balanceOf(address).call();
    res.json({ balance });
});

app.get('/query/collection/:address', async(req, res) => {
    const { address } = req.params;
    const balance = await contract.methods.balanceOf(address).call();

    const collection = []

    if (balance == 0) {
        res.json({ collection })
        return
    }
    
    for (let i = 0; i < balance; i++) {
        let {tokenId, tokenUri} = await contract.methods.getOwnerCollectionByIndex(address, i).call()
        // fetch tokenUri
        let tokenInfo = await (await fetch(tokenUri)).json()
        collection.push({id: tokenId, ...tokenInfo})
    }

    res.json({ collection })
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
