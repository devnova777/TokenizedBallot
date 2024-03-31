import {
  createPublicClient,
  createWalletClient,
  http,
  formatEther,
} from "viem";
import {
  abi,
  bytecode,
} from "../artifacts/contracts/GroupOneToken.sol/MyToken.json";
import { sepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import * as dotenv from "dotenv";

dotenv.config();

const providerApiKey = process.env.ALCHEMY_API_KEY || "";
const deployerApiKey = process.env.PRIVATE_KEY || "";

async function main() {
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

  console.log("\nDeploying Token Contract");
  const hash = await deployer.deployContract({
    abi,
    bytecode: bytecode as `0x${string}`,
  });
  console.log(`Transaction hash: ${hash}`);
  console.log("Waiting for confirmations...");

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log(`\nToken Contract deployed at ${receipt.contractAddress}`);

  const tokenName = await publicClient.readContract({
    address: receipt.contractAddress as `0x${string}`,
    abi,
    functionName: "name",
  });
  const tokenSymbol = await publicClient.readContract({
    address: receipt.contractAddress as `0x${string}`,
    abi,
    functionName: "symbol",
  });

  console.log(`ERC20 Token: ${tokenName}, ${tokenSymbol}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
