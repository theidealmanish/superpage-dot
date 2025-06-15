import { ethers } from 'ethers';

// ABI for SuperPageCreatorToken
export const SUPER_PAGE_CREATOR_TOKEN_ABI = [
  // Read functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function maxSupply() view returns (uint256)",
  "function currentEpoch() view returns (uint256)",
  "function epochMintAmount() view returns (uint256)",
  "function lastClaimedEpoch(address user) view returns (uint256)",
  "function owner() view returns (address)",
  
  // Write functions
  "function claim() external",
  "function burn(uint256 amount, string reason) external",
  "function mint(address to, uint256 amount) external", // Owner only
  "function advanceEpoch() external", // Owner only
  
  // Events
  "event EpochAdvanced(uint256 newEpoch)",
  "event FanClaimed(address indexed fan, uint256 epoch, uint256 amount)",
  "event TokensBurned(address indexed user, uint256 amount, string reason)",
  "event Transfer(address indexed from, address indexed to, uint256 value)"
] as const;

export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  maxSupply: string;
  currentEpoch: number;
  epochMintAmount: string;
}

export class SuperPageCreatorTokenContract {
  public readonly contract: ethers.Contract;
  private readonly provider: ethers.Provider;
  private readonly signer?: ethers.Signer;

  constructor(
    contractAddress: string,
    provider: ethers.Provider,
    signer?: ethers.Signer
  ) {
    if (!ethers.isAddress(contractAddress)) {
      throw new Error('Invalid contract address');
    }

    this.provider = provider;
    this.signer = signer;
    this.contract = new ethers.Contract(
      contractAddress,
      SUPER_PAGE_CREATOR_TOKEN_ABI,
      signer || provider
    );
  }

  // Read functions
  async getTokenInfo(): Promise<TokenInfo> {
    try {
      const [name, symbol, decimals, totalSupply, maxSupply, currentEpoch, epochMintAmount] = await Promise.all([
        this.contract.name() as Promise<string>,
        this.contract.symbol() as Promise<string>,
        this.contract.decimals() as Promise<bigint>,
        this.contract.totalSupply() as Promise<bigint>,
        this.contract.maxSupply() as Promise<bigint>,
        this.contract.currentEpoch() as Promise<bigint>,
        this.contract.epochMintAmount() as Promise<bigint>
      ]);

      return {
        name,
        symbol,
        decimals: Number(decimals),
        totalSupply: ethers.formatEther(totalSupply),
        maxSupply: ethers.formatEther(maxSupply),
        currentEpoch: Number(currentEpoch),
        epochMintAmount: ethers.formatEther(epochMintAmount)
      };
    } catch (error) {
      throw new Error(`Failed to get token info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getBalance(address: string): Promise<string> {
    if (!ethers.isAddress(address)) {
      throw new Error('Invalid address');
    }

    try {
      const balance = await this.contract.balanceOf(address) as bigint;
      return ethers.formatEther(balance);
    } catch (error) {
      throw new Error(`Failed to get balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getLastClaimedEpoch(address: string): Promise<number> {
    if (!ethers.isAddress(address)) {
      throw new Error('Invalid address');
    }

    try {
      const epoch = await this.contract.lastClaimedEpoch(address) as bigint;
      return Number(epoch);
    } catch (error) {
      throw new Error(`Failed to get last claimed epoch: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async canClaim(address: string): Promise<boolean> {
    if (!ethers.isAddress(address)) {
      throw new Error('Invalid address');
    }

    try {
      const [currentEpoch, lastClaimedEpoch] = await Promise.all([
        this.contract.currentEpoch() as Promise<bigint>,
        this.contract.lastClaimedEpoch(address) as Promise<bigint>
      ]);
      return Number(lastClaimedEpoch) < Number(currentEpoch);
    } catch (error) {
      console.error('Error checking claim eligibility:', error);
      return false;
    }
  }

  async getOwner(): Promise<string> {
    try {
      return await this.contract.owner() as string;
    } catch (error) {
      throw new Error(`Failed to get owner: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Write functions (require signer)
  async claim(): Promise<ethers.TransactionResponse> {
    if (!this.signer) {
      throw new Error('Signer required for claiming tokens');
    }
    
    try {
      return await this.contract.claim() as ethers.TransactionResponse;
    } catch (error) {
      throw new Error(`Failed to claim tokens: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async burn(amount: string, reason: string = ''): Promise<ethers.TransactionResponse> {
    if (!this.signer) {
      throw new Error('Signer required for burning tokens');
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      throw new Error('Invalid burn amount');
    }
    
    try {
      const amountInWei = ethers.parseEther(amount);
      return await this.contract.burn(amountInWei, reason) as ethers.TransactionResponse;
    } catch (error) {
      throw new Error(`Failed to burn tokens: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Owner only functions
  async mint(to: string, amount: string): Promise<ethers.TransactionResponse> {
    if (!this.signer) {
      throw new Error('Signer required for minting');
    }

    if (!ethers.isAddress(to)) {
      throw new Error('Invalid recipient address');
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      throw new Error('Invalid mint amount');
    }
    
    try {
      const amountInWei = ethers.parseEther(amount);
      return await this.contract.mint(to, amountInWei) as ethers.TransactionResponse;
    } catch (error) {
      throw new Error(`Failed to mint tokens: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async advanceEpoch(): Promise<ethers.TransactionResponse> {
    if (!this.signer) {
      throw new Error('Signer required for advancing epoch');
    }
    
    try {
      return await this.contract.advanceEpoch() as ethers.TransactionResponse;
    } catch (error) {
      throw new Error(`Failed to advance epoch: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}