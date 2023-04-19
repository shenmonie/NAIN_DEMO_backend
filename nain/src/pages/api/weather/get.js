// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

const Web3 = require("web3");
const abi = JSON.parse(`[{"anonymous":false,"inputs":[{"indexed":true,"internalType":"string","name":"weather","type":"string"},{"indexed":true,"internalType":"string","name":"temperature","type":"string"}],"name":"CurrentCondition","type":"event"},{"inputs":[{"internalType":"bytes32","name":"_requestId","type":"bytes32"},{"internalType":"bytes","name":"_currentConditionsResult","type":"bytes"}],"name":"fulfillCurrentConditions","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"_specId","type":"bytes32"},{"internalType":"uint256","name":"_payment","type":"uint256"},{"internalType":"uint256","name":"_locationKey","type":"uint256"},{"internalType":"string","name":"_units","type":"string"},{"internalType":"uint256","name":"_token","type":"uint256"}],"name":"requestCurrentConditions","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"nonpayable","type":"function"}]`)

export default async function handler(req, res) {
    const query = req.query;
    const web3 = new Web3(
        new Web3.providers.HttpProvider(
            `https://${process.env.NETWORK}.infura.io/v3/${process.env.NETWORK_KEY}`
        )
    );
    // Creating a signing account from a private key
    const signer = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
    web3.eth.accounts.wallet.add(signer);
    // Creating a Contract instance
    const contract = new web3.eth.Contract(
        abi,
        // Replace this with the address of your deployed contract
        process.env.CONTRACT_ADDRESS,
    );

    try {
        const tx = await contract.methods.requestCurrentConditions(process.env.NETWORK, 1, query["locationKay"], "metric", query["token"]);
        const receipt = await tx
            .send({
                from: process.env.ACCOUNT,
                gas: await tx.estimateGas(),
            }).once("transactionHash", (txhash) => {
                console.log(`Mining transaction ...`);
                console.log(`https://${process.env.NETWORK}.etherscan.io/tx/${txhash}`);
            });
        // console.log(receipt)
        const token = receipt["events"]["Transfer"]["returnValues"]["tokenId"]
        // The transaction is now on chain!
        console.log(`Mined in block ${receipt.blockNumber}`);
        res.status(200).json({
            message: ``,
            data: {
                "weather": receipt["events"]["CurrentCondition"]["returnValues"]["weather"],
                "tempreture": receipt["events"]["CurrentCondition"]["returnValues"]["temperature"],
            }
        })
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: `${err}`
        })
    }
}
