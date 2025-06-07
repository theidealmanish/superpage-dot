import { Contract, Signer, Provider, InterfaceAbi } from 'ethers';
import SuperPageTippingABI from '../abis/SuperPageTipping.json';

// Contract constants
export const CONTRACT_ADDRESS =
	'0x1cD53569aa2f38c34555FB313D35126C5489f34F' as const;
export const CONTRACT_ABI = SuperPageTippingABI.abi as InterfaceAbi;

// Provider getter (adapt as needed for your app)
export const getProvider = (): Provider => {
	if (typeof window !== 'undefined' && (window as any).ethereum) {
		const { ethers } = require('ethers');
		return new ethers.BrowserProvider((window as any).ethereum);
	}
	throw new Error('No Ethereum provider found');
};

export const getContract = (): Contract => {
	const provider = getProvider();
	return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
};

export const getSignedContract = (signer: Signer): Contract => {
	return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
};

// 🟢 Typed wrapper for contract interaction
export class SuperPageTippingClient {
	contract: Contract;
	constructor(signerOrProvider: Signer | Provider) {
		this.contract = new Contract(
			CONTRACT_ADDRESS,
			CONTRACT_ABI,
			signerOrProvider
		);
	}

	async tip(creator: string, token: string, amount: bigint) {
		return await this.contract.tip(creator, token, amount);
	}
	async platformFeeBps(): Promise<number> {
		return await this.contract.platformFeeBps();
	}
	async treasury(): Promise<string> {
		return await this.contract.treasury();
	}
	async setPlatformFee(bps: number) {
		return await this.contract.setPlatformFee(bps);
	}
	async setTreasury(addr: string) {
		return await this.contract.setTreasury(addr);
	}
	// Add more methods as needed
}

// Usage:
// const client = new SuperPageTippingClient(providerOrSigner);
// await client.tip(...);
// const fee = await client.platformFeeBps();
