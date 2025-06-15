import { ethers } from 'ethers';

declare global {
	interface Window {
		ethereum?: {
			request: (args: { method: string; params?: any[] }) => Promise<any>;
			on: (event: string, callback: (data: any) => void) => void;
			removeListener: (event: string, callback: (data: any) => void) => void;
			removeAllListeners: (event: string) => void;
			isMetaMask?: boolean;
			isTalisman?: boolean;
			isConnected?: () => boolean;
			selectedAddress?: string;
			chainId?: string;
			networkVersion?: string;
			enable?: () => Promise<string[]>;
		};
	}
}

export interface EthereumProvider {
	request: (args: { method: string; params?: any[] }) => Promise<any>;
	on: (event: string, callback: (data: any) => void) => void;
	removeListener: (event: string, callback: (data: any) => void) => void;
	isMetaMask?: boolean;
	isTalisman?: boolean;
}
