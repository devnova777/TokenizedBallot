import {
  createPublicClient,
  createWalletClient,
  http,
  formatEther,
  toHex,
} from "viem";
import {
  abi,
  bytecode,
} from "../artifacts/contracts/TokenizedBallot.sol/TokenizedBallot.json";
import { sepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import * as dotenv from "dotenv";

dotenv.config();

const providerApiKey = process.env.ALCHEMY_API_KEY || "";
const deployerApiKey = process.env.PRIVATE_KEY || "";

async function main() {
  const parameters = process.argv.slice(2);
  if (!parameters || parameters.length < 3)
    throw new Error(
      "Three or more arguments required: Contract Address of token, BlockNumber, Proposals"
    );

  const [tokenContractAddress, targetBlockNumber, ...proposals] = parameters;

  // const tokenContractAddress = parameters[0] as `0x${string}`;
  if (!tokenContractAddress)
    throw new Error("TokenContract address not provided");
  if (!/^0x[a-fA-F0-9]{40}$/.test(tokenContractAddress))
    throw new Error("Invalid tokenContract address");

  // const targetBlockNumber = parameters[1];
  if (isNaN(Number(targetBlockNumber)))
    throw new Error("Invalid targetBlockNumber");

  console.log("Connecting to RPC...");
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
  });

  const account = privateKeyToAccount(`0x${deployerApiKey}`);
  const deployer = createWalletClient({
    account,
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
  });
  console.log(`Deployer account address: ${deployer.account.address}`);

  const deployerBalance = await publicClient.getBalance({
    address: deployer.account.address,
  });
  console.log(
    `Deployer Wallet Balance: ${formatEther(deployerBalance)} ${
      deployer.chain.nativeCurrency.name
    }`
  );

  console.log("\nDeploying Ballot Contract");
  const hash = await deployer.deployContract({
    abi,
    bytecode: bytecode as `0x${string}`,
    args: [
      proposals.map((prop) => toHex(prop, { size: 32 })),
      tokenContractAddress,
      targetBlockNumber,
    ],
  });
  console.log(`Transaction hash: ${hash}`);
  console.log("Waiting for confirmations...");

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log(`\Ballot Contract deployed at ${receipt.contractAddress}`);

  const deployedProposals = (await publicClient.readContract({
    address: receipt.contractAddress!,
    abi,
    functionName: "getAllProposals",
  })) as string[];

  for (let index = 0; index < deployedProposals.length; index++) {
    const proposal = deployedProposals[index];
    console.log(proposal);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
