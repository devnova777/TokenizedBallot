import { createPublicClient, http, hexToString } from "viem";
import { sepolia } from "viem/chains";
import { abi } from "../artifacts/contracts/TokenizedBallot.sol/TokenizedBallot.json";
import * as dotenv from "dotenv";

dotenv.config();

const providerApiKey = process.env.ALCHEMY_API_KEY || "";

async function main() {
  console.log("Getting winning proposal...");

  const parameters = process.argv.slice(2);
  if (!parameters || parameters.length != 1)
    throw new Error("One Argument required: Contract Address");

  const contractAddress = parameters[0] as `0x${string}`;
  if (!contractAddress) throw new Error("Contract address not provided");
  if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress))
    throw new Error("Invalid contract address");

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
  });

  const proposalName = (await publicClient.readContract({
    address: contractAddress,
    abi,
    functionName: "winnerName",
  })) as `0x${string}`;

  console.log(
    `\nThe winner of Ballot at ${contractAddress} \n  - ${hexToString(
      proposalName
    )}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
