import { JsonRpcProvider, BrowserProvider, Signer } from 'ethers';

// Extend the Window interface to include ethereum
declare global {
	interface Window {
		// @ts-ignore
		ethereum?: {
			request: (args: { method: string; params?: any[] }) => Promise<any>;
			isMetaMask?: boolean;
			isCoinbaseWallet?: boolean;
			isTrust?: boolean;
		};
	}
}

export interface NetworkConfig {
	name: string;
	rpc: string;
	chainId: number;
	blockExplorer: string;
}

export const WESTEND_HUB_CONFIG: NetworkConfig = {
	name: 'Westend Hub',
	rpc: 'https://westend-asset-hub-eth-rpc.polkadot.io/', // Westend Hub testnet RPC
	chainId: 420420421, // Westend Hub testnet chainId
	blockExplorer: 'https://assethub-westend.subscan.io/', // Westend subscan explorer
};

export const getProvider = (): JsonRpcProvider => {
	return new JsonRpcProvider(WESTEND_HUB_CONFIG.rpc, {
		chainId: WESTEND_HUB_CONFIG.chainId,
		name: WESTEND_HUB_CONFIG.name,
	});
};

// Helper to get a signer from a provider
export const getSigner = async (): Promise<Signer> => {
	if (typeof window !== 'undefined' && window.ethereum) {
		await window.ethereum.request({ method: 'eth_requestAccounts' });
		const ethersProvider = new BrowserProvider(window.ethereum);
		return ethersProvider.getSigner();
	}
	throw new Error('No Ethereum browser provider detected');
};

// Helper to check if we're in a browser environment
export const isClient = (): boolean => {
	return typeof window !== 'undefined';
};

// Helper to get current network from MetaMask
export const getCurrentNetwork = async (): Promise<string | null> => {
	if (!isClient() || !window.ethereum) return null;

	try {
		const chainId = await window.ethereum.request({ method: 'eth_chainId' });
		return chainId;
	} catch (error) {
		console.error('Failed to get current network:', error);
		return null;
	}
};

// Helper to switch to Westend Hub network
export const switchToWestendHub = async (): Promise<boolean> => {
	if (!isClient() || !window.ethereum) return false;

	try {
		await window.ethereum.request({
			method: 'wallet_switchEthereumChain',
			params: [{ chainId: `0x${WESTEND_HUB_CONFIG.chainId.toString(16)}` }],
		});
		return true;
	} catch (switchError: any) {
		// If the network doesn't exist, add it
		if (switchError.code === 4902) {
			try {
				await window.ethereum.request({
					method: 'wallet_addEthereumChain',
					params: [
						{
							chainId: `0x${WESTEND_HUB_CONFIG.chainId.toString(16)}`,
							chainName: WESTEND_HUB_CONFIG.name,
							nativeCurrency: {
								name: 'WND',
								symbol: 'WND',
								decimals: 18,
							},
							rpcUrls: [WESTEND_HUB_CONFIG.rpc],
							blockExplorerUrls: [WESTEND_HUB_CONFIG.blockExplorer],
						},
					],
				});
				return true;
			} catch (addError) {
				console.error('Failed to add Westend Hub network:', addError);
				return false;
			}
		}
		console.error('Failed to switch to Westend Hub:', switchError);
		return false;
	}
};
