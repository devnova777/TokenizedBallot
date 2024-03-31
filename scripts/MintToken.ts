import { createPublicClient, createWalletClient, http, parseEther } from "viem";
import { sepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { abi } from "../artifacts/contracts/GroupOneToken.sol/MyToken.json";
import * as dotenv from "dotenv";

dotenv.config();

const providerApiKey = process.env.ALCHEMY_API_KEY || "";
const deployerApiKey = process.env.PRIVATE_KEY || "";

async function main() {
  const parameters = process.argv.slice(2);
  if (!parameters || parameters.length != 3)
    throw new Error(
      "One Argument required: Contract Address, Amount, Receiver Address"
    );

  const contractAddress = parameters[0] as `0x${string}`;
  if (!contractAddress) throw new Error("Contract address not provided");
  if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress))
    throw new Error("Invalid contract address");

  const amountToBeMinted = parameters[1];
  if (isNaN(Number(amountToBeMinted))) throw new Error("Invalid amount");

  const receiverAddress = parameters[2] as `0x${string}`;
  if (!receiverAddress) throw new Error("Receiver address not provided");
  if (!/^0x[a-fA-F0-9]{40}$/.test(receiverAddress))
    throw new Error("Invalid receiver address");

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

  console.log("Minting tokens...");
  const hash = await deployer.writeContract({
    address: contractAddress,
    abi,
    functionName: "mint",
    args: [receiverAddress, parseEther(amountToBeMinted)],
  });
  console.log(`Transaction Hash:`, hash);
  console.log("Waiting for confirmations...");
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log("Transaction confirmed");
  console.log(`${deployer.account.address} successfully minted ${tokenName}`);

  const eventLogs = await publicClient.getContractEvents({
    address: contractAddress,
    abi,
  });
  console.log(eventLogs);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
