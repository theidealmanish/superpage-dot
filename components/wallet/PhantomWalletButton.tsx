'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface PhantomWalletButtonProps {
	onAddressSelect: (addresses: {
		solana?: string;
		ethereum?: string;
		sui?: string;
		polygon?: string;
	}) => void;
}

interface PhantomProvider {
	isPhantom?: boolean;
	connect: () => Promise<{ publicKey: { toString: () => string } }>;
	disconnect: () => Promise<void>;
	on: (event: string, callback: () => void) => void;
	signTransaction: (transaction: any) => Promise<any>;
	signAllTransactions: (transactions: any[]) => Promise<any[]>;
	signMessage: (message: Uint8Array) => Promise<{ signature: Uint8Array }>;
}

interface WindowWithPhantom extends Window {
	phantom?: {
		solana?: PhantomProvider;
		ethereum?: any;
		sui?: any;
		polygon?: any;
	};
	solana?: PhantomProvider;
}

declare var window: WindowWithPhantom;

export default function PhantomWalletButton({
	onAddressSelect,
}: PhantomWalletButtonProps) {
	const [phantom, setPhantom] = useState<any>(null);
	const [connecting, setConnecting] = useState(false);

	// Check if Phantom is installed
	useEffect(() => {
		if (typeof window !== 'undefined') {
			const provider = window.phantom?.solana;
			setPhantom(provider);
		}
	}, []);

	const connectWallet = async () => {
		try {
			setConnecting(true);

			// Check if Phantom is installed
			if (!phantom) {
				toast.error(
					'Phantom wallet not found! Please install the browser extension.'
				);
				window.open('https://phantom.app/', '_blank');
				return;
			}

			// Object to store addresses from different networks
			const addresses: {
				solana?: string;
				ethereum?: string;
				sui?: string;
				polygon?: string;
			} = {};

			// Connect to Solana
			try {
				const { publicKey } = await phantom.connect();
				addresses.solana = publicKey.toString();
			} catch (error) {
				console.error('Error connecting to Solana:', error);
			}

			// Check if Ethereum is available
			if (window.phantom?.ethereum) {
				try {
					const ethAccounts = await window.phantom.ethereum.request({
						method: 'eth_requestAccounts',
					});
					addresses.ethereum = ethAccounts[0];
				} catch (error) {
					console.error('Error connecting to Ethereum:', error);
				}
			}

			// Check if Sui is available
			if (window.phantom?.sui) {
				try {
					console.log(await window.phantom.sui.requestAccount());
					const suiAccounts = await window.phantom.sui.requestAccount(
						'standard:connect'
					);
					console.log(suiAccounts);
					addresses.sui = suiAccounts.publicKey;
				} catch (error) {
					console.error('Error connecting to Sui:', error);
				}
			}

			// Set the addresses through callback
			if (Object.keys(addresses).length > 0) {
				onAddressSelect(addresses);
				toast.success('Wallet connected successfully!');
			} else {
				toast.error('No blockchain accounts were found or connected.');
			}
		} catch (error: any) {
			console.error('Error connecting to Phantom wallet:', error);
			toast.error(error.message || 'Failed to connect wallet');
		} finally {
			setConnecting(false);
		}
	};

	return (
		<Button
			type='button'
			variant='outline'
			onClick={connectWallet}
			disabled={connecting}
			title='Connect Phantom Wallet'
			className='h-10 px-3 gap-2'
		>
			{connecting ? (
				<svg
					className='animate-spin h-4 w-4'
					xmlns='http://www.w3.org/2000/svg'
					fill='none'
					viewBox='0 0 24 24'
				>
					<circle
						className='opacity-25'
						cx='12'
						cy='12'
						r='10'
						stroke='currentColor'
						strokeWidth='4'
					></circle>
					<path
						className='opacity-75'
						fill='currentColor'
						d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
					></path>
				</svg>
			) : (
				<svg
					width='16'
					height='16'
					viewBox='0 0 128 128'
					fill='none'
					xmlns='http://www.w3.org/2000/svg'
				>
					<path
						d='M64 128C99.3462 128 128 99.3462 128 64C128 28.6538 99.3462 0 64 0C28.6538 0 0 28.6538 0 64C0 99.3462 28.6538 128 64 128Z'
						fill='#AB9FF2'
					/>
					<path
						d='M108.14 67.0057H95.4937C95.4937 51.3054 82.7252 38.5714 67.0057 38.5714C51.3054 38.5714 38.5714 51.3063 38.5714 67.0057C38.5714 82.706 51.3063 95.44 67.0057 95.44H108.14C110.113 95.44 111.714 93.8394 111.714 91.8663V70.58C111.714 68.6068 110.113 67.0063 108.14 67.0063V67.0057Z'
						fill='white'
					/>
					<path
						d='M66.9971 82.8445C61.4463 82.8445 56.9416 78.34 56.9416 72.7891C56.9416 67.2383 61.4463 62.7336 66.9971 62.7336C72.5479 62.7336 77.0526 67.2383 77.0526 72.7891C77.0526 78.34 72.5479 82.8445 66.9971 82.8445Z'
						fill='#AB9FF2'
					/>
				</svg>
			)}
			Connect Phantom
		</Button>
	);
}
