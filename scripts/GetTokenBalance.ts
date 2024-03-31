import { createPublicClient, formatEther, http } from "viem";
import { sepolia } from "viem/chains";
import { abi } from "../artifacts/contracts/GroupOneToken.sol/MyToken.json";
import * as dotenv from "dotenv";

dotenv.config();

const providerApiKey = process.env.ALCHEMY_API_KEY || "";

async function main() {
  console.log("Getting Token Balance...");

  const parameters = process.argv.slice(2);
  if (!parameters || parameters.length != 2)
    throw new Error("Two Arguments required: Contract Address, Wallet Address");

  const contractAddress = parameters[0] as `0x${string}`;
  if (!contractAddress) throw new Error("Contract address not provided");
  if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress))
    throw new Error("Invalid contract address");

  const walletAddress = parameters[1] as `0x${string}`;
  if (!walletAddress) throw new Error("Wallet address not provided");
  if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress))
    throw new Error("Invalid wallet address");

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
  });

  const balance = (await publicClient.readContract({
    address: contractAddress,
    abi,
    functionName: "balanceOf",
    args: [walletAddress],
  })) as bigint;

  console.log(`\n${walletAddress} has ${formatEther(balance)} tokens`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
