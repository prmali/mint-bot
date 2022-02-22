import ethers from "ethers";
import "dotenv/config";

const privateKey = process.env.PRIVATE_KEY;
const alchemyApiKey = process.env.ALCHEMY_API_KEY;

const contractAddress = "";

const isSaleActiveName = "publicSaleIsOpen";
const mintFunctionName = "publicSaleMint";

const abi = [
	{
		inputs: [
			{
				internalType: "uint256",
				name: "count",
				type: "uint256",
			},
		],
		name: mintFunctionName,
		outputs: [],
		stateMutability: "payable",
		type: "function",
	},
	{
		inputs: [],
		name: isSaleActiveName,
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

const provider = new ethers.providers.AlchemyProvider(null, alchemyApiKey);
const wallet = new ethers.Wallet(privateKey, provider);
const contract = new ethers.Contract(contractAddress, abi, wallet);
const timer = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const grabSaleState = async () => {
	const saleState = await contract[isSaleActiveName]();
	console.log(`[${isSaleActiveName}]`, saleState);

	return saleState;
};

const mint = async (quantity, mintPrice) => {
	const gasMultiplier = 2;
	const gasPrice = await provider.getGasPrice();
	const submittingPrice = gasPrice.add(
		gasPrice.div(ethers.BigNumber.from(gasMultiplier.toString()))
	);

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
	console.log("[SENDING TXN]");

	const mintTxn = await contract[mintFunctionName](quantity, {
		value: ethers.utils.parseEther((quantity * mintPrice).toString()),
		gasPrice: submittingPrice,
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
