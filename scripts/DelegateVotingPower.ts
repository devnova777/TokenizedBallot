import { createPublicClient, createWalletClient, http } from "viem";
import { sepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import * as dotenv from "dotenv";
import { abi } from "../artifacts/contracts/GroupOneToken.sol/MyToken.json";

dotenv.config();

const providerApiKey = process.env.ALCHEMY_API_KEY || "";
const deployerApiKey = process.env.PRIVATE_KEY || "";

async function main() {
  const parameters = process.argv.slice(2);
  if (!parameters || parameters.length != 2)
    throw new Error(
      "Two Arguments required: Contract Address, Delegatee Address"
    );

  const contractAddress = parameters[0] as `0x${string}`;
  if (!contractAddress) throw new Error("Contract address not provided");
  if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress))
    throw new Error("Invalid contract address");

  const delegateeAddress = parameters[1] as `0x${string}`;
  if (!delegateeAddress) throw new Error("Delegatee address not provided");
  if (!/^0x[a-fA-F0-9]{40}$/.test(delegateeAddress))
    throw new Error("Invalid delegatee address");

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
  });

  const tokenName = await publicClient.readContract({
    address: contractAddress,
    abi,
    functionName: "name",
  });

  const account = privateKeyToAccount(`0x${deployerApiKey}`);
  const deployer = createWalletClient({
    account,
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
  });

  console.log("Delegating Votes...");
  const hash = await deployer.writeContract({
    address: contractAddress,
    abi,
    functionName: "delegate",
    args: [delegateeAddress],
  });
  console.log("Transaction hash:", hash);
  console.log("Waiting for confirmations...");
  const receipt = await publicClient.getTransactionReceipt({ hash });
  console.log("Transaction confirmed.");
  console.log(
    `\n${deployer.account.address} successfully delegated to ${delegateeAddress}`
  );

  const votingPower = await publicClient.readContract({
    address: contractAddress,
    abi,
    functionName: "getVotes",
    args: [delegateeAddress],
  });
  console.log(
    `${delegateeAddress} now has ${votingPower} voting power for ${tokenName} at ${contractAddress}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
