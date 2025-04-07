"use client";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { Address, formatUnits, hexToString, Abi, fromHex } from "viem";
import { useAccount, useBalance, useReadContract, useReadContracts, useSignMessage } from "wagmi";

// global variables are ugly code
const tokenAddress = "0x5e691869bd13b7d8adf8658e8d18f4e2163ddc90";
let ballotAddress = "0x6286467ccbc7030a5a3676e7a135a478c8713c1c";

// number of proposals in the ballot. If I could change the code of the ballot contract, it would be nice
// to add a getter for this. However, I'm sticking to the TokenizedBallot provided in week3, so we have
// to hardcode this
const numberOfProposals = 3;

const tokenAbi = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true, // read only function
    inputs: [], // takes zero parameters
    name: "name", // name of this function of the ABI
    outputs: [ // returns a single string
      {
        name: "",
        type: "string",
      },
    ],
    payable: false,
    stateMutability: "view", // this function is a view function
    type: "function", // contract function, not an event or constructor
  },
];

const ballotAbi = [
  {
    name: "winningProposal",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "winningProposal_", type: "uint256" }],
  },
  {
    name: "winnerName",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "winnerName_", type: "bytes32" }],
  },
  {
    name: "proposals",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [
      { name: "name", type: "bytes32" },
      { name: "voteCount", type: "uint256" },
    ],
  },
] as const satisfies Abi;

const Home: NextPage = () => {
  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center mb-8">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">Scaffold-ETH 2</span>
          </h1>
          <p className="text-center text-lg">
            Get started by editing{" "}
            <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
              packages/nextjs/pages/index.tsx
            </code>
          </p>
          <PageBody></PageBody>
        </div>
      </div>
    </>
  );
};

function PageBody() {
    return (
    <>
      <WalletInfo/>
    </>

  );
  /*return (
    <>
      <p className="text-center text-lg">Here we are! I'm here</p>
      <WalletInfo/>
      <RandomWord></RandomWord>
    </>

  );*/
}

function WalletInfo() {
  const { address, isConnecting, isDisconnected, chain } = useAccount();
  if (address)
    return (
      <div>
        <p>Your account address is {address}</p>
        <p>Connected to the network {chain?.name}</p>
        <TokenInfo address={address as `0x${string}`}></TokenInfo>
        <ProposalsInfo/>
        <UserTokens address={address as `0x${string}`}></UserTokens>
      </div>
    );
  if (isConnecting)
    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  if (isDisconnected)
    return (
      <div>
        <p>Wallet disconnected. Connect wallet to continue</p>
      </div>
    );
  return (
    <div>
      <p>Connect wallet to continue</p>
    </div>
  );
}

function ProposalsInfo() {
  return (
    <div className="card w-96 bg-primary text-primary-content mt-4">
      <div className="card-body">
        <h2 className="card-title">Proposals Info</h2>
        <DisplayVotingResults/>
        <DisplayProposals/>
      </div>
    </div>
  );
}

function DisplayVotingResults() {
  if (ballotAddress == "")
    return ;
  const { data, isLoading, isError } = useReadContracts({
    contracts: [
      {
        address: ballotAddress,
        abi: ballotAbi,
        functionName: "winningProposal",
      },
      {
        address: ballotAddress,
        abi: ballotAbi,
        functionName: "winnerName",
      },
    ],
  });

  if (isLoading) return <div>Loading winner info...</div>;
  if (isError || !data || data.length != 2)
    return <div>Error loading winner info</div>;
  const winningProposalNumber = data[0].result as bigint;
  const proposalNameBytes32 = data[1].result as `0x${string}`;
  const winningProposalName = hexToString(proposalNameBytes32, { size: 32 }).replace(/\0/g, '');
  return <div>winningProposalNumber is {winningProposalNumber} and proposal is {winningProposalName}</div>
}

function DisplayProposals() {
  if (ballotAddress == "")
    return;
  const proposalCalls = Array.from({ length: numberOfProposals }, (_, i) => ({
    address: ballotAddress,
    abi: ballotAbi,
    functionName: "proposals",
    args: [BigInt(i)],
  }));

  const {
    data: proposalsData,
    isLoading,
    isError,
  } = useReadContracts({
    contracts: proposalCalls,
    allowFailure: true,
  });

  if (isLoading) return <div>Loading proposals…</div>;
  if (isError || !proposalsData) return <div>Error loading proposals</div>;

  return (
    <div>
      <ul>
      {proposalsData.map((res, i) => {
  if (!res.result || !Array.isArray(res.result)) {
    return <li key={i}>Error loading proposal #{i}</li>;
  }

  const [nameBytes, voteCount] = res.result as unknown as [`0x${string}`, bigint];
  const name = fromHex(nameBytes, "string");

  return (
    <li key={i}>
      <strong>{name}</strong> — Votes: {voteCount.toString()}
    </li>
  );
})}      </ul>
    </div>
  );
}

/*
function WalletInfo() {
  const { address, isConnecting, isDisconnected, chain } = useAccount();
  if (address)
    return (
      <div>
        <p>Your account address is {address}</p>
        <p>Connected to the network {chain?.name}</p>
        <WalletAction></WalletAction>
        <WalletBalance address={address as `0x${string}`}></WalletBalance>
        <TokenInfo address={address as `0x${string}`}></TokenInfo>
        <ApiData address={address as `0x${string}`}></ApiData>
      </div>
    );
  if (isConnecting)
    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  if (isDisconnected)
    return (
      <div>
        <p>Wallet disconnected. Connect wallet to continue</p>
      </div>
    );
  return (
    <div>
      <p>Connect wallet to continue</p>
    </div>
  );
}*/

/*
  This function receives some text input, and then cryptographically signs it with the user's private key (). The message is not
  sent anywhere, it's literally just the cryptographic operation. This can be useful for authentication, to prove that the user
  has a private key, and for doing off-chain operations that need to be signed.
  Note that this does not generate any transaction, and no gas is spent. When you try to sign a message, MetaMask asks you to
  confirm that you want to perform the operation, as Metamask has the private key in your laptop
*/
function WalletAction() {
  const [signatureMessage, setSignatureMessage] = useState("");
  const { data, isError, isPending, isSuccess, signMessage } = useSignMessage();
  return (
    <div className="card w-96 bg-primary text-primary-content mt-4">
      <div className="card-body">
        <h2 className="card-title">Testing signatures</h2>
        <div className="form-control w-full max-w-xs my-4">
          <label className="label">
            <span className="label-text">Enter the message to be signed:</span>
          </label>
          <input
            type="text"
            placeholder="Type here"
            className="input input-bordered w-full max-w-xs"
            value={signatureMessage}
            onChange={e => setSignatureMessage(e.target.value)}
          />
        </div>
        <button
          className="btn btn-active btn-neutral"
          disabled={isPending}
          onClick={() =>
            signMessage({
              message: signatureMessage,
            })
          }
        >
          Sign message
        </button>
        {isSuccess && <div>Signature: {data}</div>}
        {isError && <div>Error signing message</div>}
      </div>
    </div>
  );
}


/*
  Receives an address in the network, shows how much native currency (not like ERC20 token) it has
  Uses the wagmi useBalance hook
 */
function WalletBalance(params: { address: `0x${string}` }) {
  // wagmi knows which chain to read from based on
  // scaffold.config.ts file, which loads into wagmiConfig.tsx
  const { data, isError, isLoading } = useBalance({
    address: params.address,
  });

  if (isLoading) return <div>Fetching balance…</div>;
  if (isError) return <div>Error fetching balance</div>;
  return (
    <div className="card w-96 bg-primary text-primary-content mt-4">
      <div className="card-body">
        <h2 className="card-title">Testing useBalance wagmi hook</h2>
        Balance: {data?.formatted} {data?.symbol}
      </div>
    </div>
  );
}

function TokenInfo() {
  return (
    <div className="card w-96 bg-primary text-primary-content mt-4">
      <div className="card-body">
        <h2 className="card-title">Token Info</h2>
        <TokenName></TokenName>
        <TokenAddressFromApi></TokenAddressFromApi>
      </div>
    </div>
  );
}

/**
 * Uses the wagmi useReadContract hook, a hook for calling a read-only (pure or view) function on a contract, and returning the response.
 * In this scenario, we don't pay for gas
 * In this case, it calls the "name" function, which takes no parameters
 * 
 */
function TokenName() {
  const { data, isError, isLoading } = useReadContract({
    address: tokenAddress, // deployed contract's address
    abi: tokenAbi,
    functionName: "name", // name of the function to call from the ABI provided
  });

  const name = typeof data === "string" ? data : 0;

  if (isLoading) return <div>Fetching name…</div>;
  if (isError) return <div>Error fetching name</div>;
  return <div>Token name: {name}</div>;
}

/**
 * Uses the wagmi useReadContract hook, a hook for calling a read-only (pure or view) function on a contract, and returning the response.
 * In this scenario, we don't pay for gas
 * In this case, the function has an argument
 * 
 */
function TokenBalance(params: { address: `0x${string}` }) {
  const { data, isError, isLoading } = useReadContracts({
    contracts: [
      {
        address: tokenAddress,
        abi: tokenAbi,
        functionName: "decimals",
      },
      {
        address: tokenAddress,
        abi: tokenAbi,
        functionName: "balanceOf",
        args: [params.address],
      },
    ],
  });

  if (isLoading) return <div>Fetching balance…</div>;
  if (isError || !data || !data[0].result || ! data[1].result) return <div>Error fetching balance</div>;

  const decimals = Number(data[0].result);
    // the code had a bug and it was originally
  //   const balance = typeof data === "number" ? data : 0;
  // I was getting 0 all the time
  const balance = data[1].result as bigint;
  const balance_formatted = formatUnits(balance, decimals);

  return (<div>
          <div>Your balance raw: {balance.toString()}</div>
          <div>Your balance formatted: {balance_formatted}</div>
          </div>);
}

function UserTokens(params: { address: `0x${string}` }) {
  return (
    <div className="card w-96 bg-primary text-primary-content mt-4">
      <div className="card-body">
        <h2 className="card-title">Your tokens</h2>
        <RequestTokens address={params.address}></RequestTokens>
      </div>
    </div>
  );
}

/**
 * Simple example of calling a GET method from our backend located at localhost:3001
 */
function TokenAddressFromApi() {
  const [data, setData] = useState<{ result: string }>();
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3001/contract-address")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      });
  }, []);

  if (isLoading) return <p>Loading token address from API...</p>;
  if (!data) return <p>No token address information</p>;

  return (
    <div>
      <p>Token address from API: {data.result}</p>
    </div>
  );
}

/**
 * Code for the POST request to mint tokens. 
 * address is the address to which we want to send the newly minted tokens. 
 * Contains frontend logic with a button
 * @todo If I have more time to play with the frontend, I would like to make it so that we don't have
 * to refresh the page to request tokens more times
 */
function RequestTokens(params: { address: `0x${string}` }) {
  // data stores the backend response
  const [data, setData] = useState<{ result: string }>();
  // isLoading will be changed to true when we click the button
  // to do the POST request. 
  const [isLoading, setLoading] = useState(false);

  // create a hashmap with the address to where we want to
  // send the newly minted tokens. In the call to fetch()
  // this hashmap is converted to a JSON
  const body = { address: params.address };

  // this is when the user has pressed the button to request tokens,
  // but we are waiting for the backend to respond
  if (isLoading) return (
    <div>
        <p>Requesting tokens from API...</p></div>);

  // when there is no data to show, because the user still hasn't clicked the
  // button to request tokens
  if (!data)
    return (
      <div>        <TokenBalance address={params.address}></TokenBalance>
      <button
        className="btn btn-active btn-neutral"
        onClick={() => {
          setLoading(true);
          fetch("http://localhost:3001/mint-tokens", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body), // we are sending the address as a JSON
          })
            .then((res) => res.json())
            .then((data) => {
              setData(data);
              setLoading(false);
            });
        }}
      >
        Request tokens
      </button></div>
    );

  // this is when the backend has replied to a previous POST request.
  return (
    <div>
      <TokenBalance address={params.address}></TokenBalance>
      <p>Last mint transaction: {data.result}</p>
      <button
        className="btn btn-active btn-neutral"
        onClick={() => {
          setLoading(true);
          fetch("http://localhost:3001/mint-tokens", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body), // we are sending the address as a JSON
          })
            .then((res) => res.json())
            .then((data) => {
              setData(data);
              setLoading(false);
            });
        }}
      >
        Request tokens
      </button>    </div>
  );
}

/**
 * Just a simple example of fetching a JSON from the randomuser.me API and then displaying
 * some data from the retrieved JSON 
 */
function RandomWord() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://randomuser.me/api/")
      .then(res => res.json())
      .then(data => {
        setData(data.results[0]);
        setLoading(false);
      });
  }, []);

  if (isLoading) return <p>Loading...</p>;
  if (!data) return <p>No profile data</p>;

  return (
    <div className="card w-96 bg-primary text-primary-content mt-4">
      <div className="card-body">
        <h2 className="card-title">Testing useState and useEffect from React library</h2>
        <h1>
          Name: {data.name.title} {data.name.first} {data.name.last}
        </h1>
        <p>Email: {data.email}</p>
      </div>
    </div>
  );
}

export default Home;