import {
  createPublicClient,
  createWalletClient,
  http,
  parseEther,
  formatEther,
  hexToString,
} from "viem";
import { sepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import * as dotenv from "dotenv";
import { abi } from "../artifacts/contracts/TokenizedBallot.sol/TokenizedBallot.json";
// import { abi as token_abi } from "../artifacts/contracts/GroupOneToken.sol/MyToken.json";
//TODO: dynamically fetch for tokenContract's states (external call?) from ballotContract. possible without abi?

dotenv.config();

const providerApiKey = process.env.ALCHEMY_API_KEY || "";
const deployerApiKey = process.env.PRIVATE_KEY || "";

async function main() {
  const parameters = process.argv.slice(2);
  if (!parameters || parameters.length != 1)
    throw new Error("One argument required: Ballot contract address");

  const ballotContractAddress = parameters[0] as `0x${string}`;
  if (!ballotContractAddress)
    throw new Error("TokenContract address not provided");
  if (!/^0x[a-fA-F0-9]{40}$/.test(ballotContractAddress))
    throw new Error("Invalid ballotContract address");

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

  console.log("Getting user info...");
  const deployerBalance = await publicClient.getBalance({
    address: deployer.account.address,
  });
  const tokenContractAddress = (await publicClient.readContract({
    address: ballotContractAddress,
    abi,
    functionName: "tokenContract",
  })) as `0x${string}`;
  console.log({ tokenContractAddress });

  const targetBlockNumber = await publicClient.readContract({
    address: ballotContractAddress,
    abi,
    functionName: "targetBlockNumber",
  });
  console.log({ targetBlockNumber });

  // const deployerPastVotes = (await publicClient.readContract({
  //   address: tokenContractAddress,
  //   abi: token_abi,
  //   functionName: "getPastVotes",
  //   args: [deployer.account.address, targetBlockNumber],
  // })) as bigint;
  // console.log({ deployerPastVotes });

  // const votingPower = (await publicClient.readContract({
  //   address: ballotContractAddress,
  //   abi,
  //   functionName: "votePowerSent",
  //   args: [deployer.account.address],
  // })) as bigint;
  // console.log({ votingPower });

  // const currentVotingPower = deployerPastVotes - votingPower;

  // const deployerTokenBalance = (await publicClient.readContract({
  //   address: tokenContractAddress,
  //   abi: token_abi,
  //   functionName: "balanceOf",
  //   args: [deployer.account.address],
  // })) as bigint;

  console.log(`\nUser: ${deployer.account.address}`);
  console.log(
    `  has ${formatEther(deployerBalance)} ${
      publicClient.chain.nativeCurrency.name
    } (${publicClient.chain.nativeCurrency.symbol})`
  );

  console.log("\nHere are the proposals:");
  // const proposals = (await publicClient.readContract({
  //   address: ballotContractAddress,
  //   abi,
  //   functionName: "getAllProposals",
  // })) as any;

  // for (let index = 0; index < proposals.length; index++) {
  //   const element = proposals[index];
  //   console.log(
  //     `At index ${index}: ${hexToString(element.name)} with ${Number(
  //       element.voteCount
  //     )} votes`
  //   );
  // }

  console.log("\nWhat do you want to vote for? Enter the index:");
  const stdin = process.openStdin();

  let votingForIndex = true;
  let voteIndex: string;

  stdin.addListener("data", async function (d) {
    if (votingForIndex) {
      // Collecting the index of the proposal to vote for
      voteIndex = d.toString().trim();
      if (voteIndex.toLowerCase() != "n") {
        console.log("Enter the amount you want to vote with:");
        votingForIndex = false; // Next input will be the amount
      } else {
        console.log("Operation cancelled");
        process.exit();
      }
    } else {
      // Collecting the amount to vote with
      const amount = d.toString().trim();
      if (amount.toLowerCase() != "n") {
        const hash = await deployer.writeContract({
          address: ballotContractAddress,
          abi,
          functionName: "vote",
          args: [BigInt(voteIndex), parseEther(amount)],
        });

        console.log("\nTransaction hash:", hash);
        console.log("Waiting for confirmations...");
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        console.log("Transaction confirmed");
        console.log(
          `Address ${deployer.account.address} voted for proposal at index ${voteIndex} with amount ${amount}`
        );
      } else {
        console.log("Operation cancelled");
      }
      process.exit();
    }
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
