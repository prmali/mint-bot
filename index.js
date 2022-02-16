import ethers from "ethers";
import "dotenv/config";
const privateKey = process.env.PRIVATE_KEY;
const alchemyApiKey = process.env.ALCHEMY_API_KEY;
const contractAddress = "0xc657c2a3bd558716b3f6b843ef09c0fc628e4977";
const abi = [
	{
		inputs: [
			{
				internalType: "uint256",
				name: "_amount",
				type: "uint256",
			},
		],
		name: "mintCosmicCats",
		outputs: [],
		stateMutability: "payable",
		type: "function",
	},
	{
		inputs: [],
		name: "saleActive",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool",
			},
		],
		stateMutability: "view",
		type: "function",
	},
];
/* const provider = ethers.providers.getDefaultProvider(); */
/* const provider = new ethers.providers.JsonRpcProvider(
	"https://polygon-rpc.com/"
); */
const provider = new ethers.providers.AlchemyProvider(null, alchemyApiKey);
const wallet = new ethers.Wallet(privateKey, provider);
const contract = new ethers.Contract(contractAddress, abi, wallet);

const timer = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const grabSaleState = async () => {
	const saleState = await contract.saleActive();
	console.log("[saleActive]", saleState);

	return saleState;
};

const mint = async (quantity, mintPrice) => {
	console.log("ATTEMPTING MINT");
	const gasPrice = await provider.getGasPrice();
	const submittingPrice = gasPrice.mul(2);

	console.log(
		"[CURRENT NETWORK GAS]",
		ethers.utils.formatUnits(gasPrice, "gwei"),
		"gwei"
	);
	console.log(
		"[TXN GAS]",
		ethers.utils.formatUnits(submittingPrice, "gwei"),
		"gwei"
	);

	const mintTxn = await contract.mintCosmicCats(quantity, {
		value: ethers.utils.parseEther(quantity * mintPrice),
		gasPrice: ethers.utils.parseUnits(submittingPrice, "gwei"),
	});
	console.log("[SUBMITTED TXN]", mintTxn);
	await mintTxn.wait();
	console.log("[PROCESSED TXN]", mintTxn);
};

const main = async (quantity, mintPrice) => {
	while ((await grabSaleState()) === false) {
		await timer(1000);
	}

	mint(quantity, mintPrice);
};

main(1, 0.04);
