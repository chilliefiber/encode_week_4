import { Injectable } from '@nestjs/common';
import * as tokenJson from "./assets/MyToken.json";
import { Address, createPublicClient, createWalletClient, formatEther, http } from 'viem';
import { sepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

@Injectable()
export class AppService {
  publicClient; 
  walletClient;

  constructor() {
    this.publicClient = createPublicClient({
      chain: sepolia,
      // note that we should put this in an .env and use it like so:
      // process.env.RPC_ENDPOINT_URL
      transport: http(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`),
    });

    const account = privateKeyToAccount(`0x${process.env.PRIVATE_KEY_DEPLOYER}`);
    this.walletClient = createWalletClient({
      transport: http(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`),
      chain: sepolia,
      account: account,
    });

  }

  async getTransactionReceipt(hash: string) {
    const receipt = await this.publicClient.getTransactionReceipt({
      hash: hash as Address,
    });
    return receipt;
  }

  async getTokenBalance(address: string) {
    const balance = await this.publicClient.readContract({
      // could also be
      // address: this.getContractAddress() as `0x${string}`, 
      address: this.getContractAddress() as Address,
      abi: tokenJson.abi,
      functionName: "balanceOf",
      args: [address as Address],
    });
    const balanceFormatted = formatEther(balance as bigint);
    return balanceFormatted;
  }
  async getTotalSupply() {
    const totalSupplyBN = await this.publicClient.readContract({
      // could also be
      // address: this.getContractAddress() as `0x${string}`, 
      address: this.getContractAddress() as Address,
      abi: tokenJson.abi,
      functionName: "totalSupply"
    });
    const totalSupply = formatEther(totalSupplyBN as bigint);
    return totalSupply;
  }
  getHello(): string {
    return 'Hello World!';
  }
  getContractAddress(): string {

    return process.env.TOKEN_ADDRESS as string;

  }

  async getTokenName(): Promise<string> {

    const name = await this.publicClient.readContract({
      // could also be
      // address: this.getContractAddress() as `0x${string}`, 
      address: this.getContractAddress() as Address,
      abi: tokenJson.abi,
      functionName: "name"
    });
    return name as string;
  }

  getServerWalletAddress(): string {
    return this.walletClient.account.address;
  }

  async checkMinterRole(address: string): Promise<boolean> {
    const MINTER_ROLE = "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";
    // const MINTER_ROLE =  await this.publicClient.readContract({
    //   address: this.getContractAddress(),
    //   abi: tokenJson.abi,
    //   functionName: 'MINTER_ROLE'
    // });
    const hasRole = await this.publicClient.readContract({
      address: this.getContractAddress(),
      abi: tokenJson.abi,
      functionName: 'hasRole',
      args: [MINTER_ROLE, address],
    });
    return hasRole;
  }

  mintTokens(address: any) {
    // TODO: implement mintTokens using server wallet
    // we put this in the server because we are doing the
    // minting with our account
    return {result:true,
            address: address};
  }
  /*
  return {
    success: true,
    result: {
      message: "Tokens minted successfully",
      address: address,
      hash: "0x-example-hash",
    },
  };
  */

}

