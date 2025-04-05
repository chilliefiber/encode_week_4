"use client";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { Address, hexToString } from "viem";
import { useAccount, useBalance, useReadContract, useSignMessage } from "wagmi";

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

/**
 * Frontend function to group TokenName and TokenBalance
 */
function TokenInfo(params: { address: `0x${string}` }) {
  return (
    <div className="card w-96 bg-primary text-primary-content mt-4">
      <div className="card-body">
        <h2 className="card-title">Testing useReadContract wagmi hook</h2>
        <TokenName></TokenName>
        <TokenBalance address={params.address}></TokenBalance>
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
    address: "0x5e691869bd13b7d8adf8658e8d18f4e2163ddc90", // deployed contract's address
    abi: [
      // inside the "{}" is the ABI for one function in this contract. We could
      // have multiple such brackets, and then we would have to choose which one
      // to call using functionName. In this case, it is redundant to use functionName
      // because we only give one of the functions of the ABI
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
    ],
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
 * In this case, the function 
 * 
 */
function TokenBalance(params: { address: `0x${string}` }) {
  const { data, isError, isLoading } = useReadContract({
    address: "0x5e691869bd13b7d8adf8658e8d18f4e2163ddc90", // address of the token contract
    abi: [
      {
        constant: true,
        inputs: [
          {
            name: "_owner", // note that it is the owner of a particular balance, not necessarily the owner of the contract
            type: "address",
          },
        ],
        name: "balanceOf",
        outputs: [
          {
            name: "balance",
            type: "uint256",
          },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "balanceOf",
    args: [params.address], // use the address provided as a parameter to TokenBalance as the argument to the function balanceOf
  });

  if (isLoading) return <div>Fetching balance…</div>;
  if (isError) return <div>Error fetching balance</div>;
    // the code had a bug and it was originally
  //   const balance = typeof data === "number" ? data : 0;
  // I was getting 0 all the time
  const balance = (data as bigint).toString();

  return <div>Balance: {balance}</div>;
}

/**
 * Frontend wrapper for showing the results of TokenAddressFromApi and RequestTokens
 */
function ApiData(params: { address: Address }) {
  return (
    <div className="card w-96 bg-primary text-primary-content mt-4">
      <div className="card-body">
        <h2 className="card-title">Testing API Coupling</h2>
        <TokenAddressFromApi></TokenAddressFromApi>
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
function RequestTokens(params: { address: string }) {
  // data stores the backend response
  const [data, setData] = useState<{ result: boolean }>();
  // isLoading will be changed to true when we click the button
  // to do the POST request. 
  const [isLoading, setLoading] = useState(false);

  // create a hashmap with the address to where we want to
  // send the newly minted tokens. In the call to fetch()
  // this hashmap is converted to a JSON
  const body = { address: params.address };

  // this is when the user has pressed the button to request tokens,
  // but we are waiting for the backend to respond
  if (isLoading) return <p>Requesting tokens from API...</p>;

  // when there is no data to show, because the user still hasn't clicked the
  // button to request tokens
  if (!data)
    return (
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
      </button>
    );

  // this is when the backend has replied to a previous POST request.
  return (
    <div>
      <p>Result from API: {data.result ? "worked" : "failed"}</p>
      <p>If you want to request more tokens, refresh the page</p>
    </div>
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