'use client';

import { ethers } from 'ethers';
import { FACTORY_ADDRESS, CreatorTokenFactoryABI } from '@/contracts/config';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

// Ethereum provider interface
interface EthereumProvider {
	request: (args: { method: string; params?: any[] }) => Promise<any>;
	isMetaMask?: boolean;
	isTalisman?: boolean;
}

declare global {
	interface Window {
		// @ts-ignore
		ethereum?: EthereumProvider;
		talismanEth?: EthereumProvider;
	}
}

// Network configuration
interface NetworkConfig {
	chainId: string;
	chainName: string;
	nativeCurrency: {
		name: string;
		symbol: string;
		decimals: number;
	};
	rpcUrls: string[];
	blockExplorerUrls: string[];
}

const WESTEND_ASSETHUB_NETWORK: NetworkConfig = {
	chainId: '0x19135149', // 420420421 in hex
	chainName: 'Westend Asset Hub',
	nativeCurrency: {
		name: 'WND',
		symbol: 'WND',
		decimals: 18,
	},
	rpcUrls: ['https://westend-asset-hub-eth-rpc.polkadot.io'],
	blockExplorerUrls: ['https://assethub-westend.subscan.io/'],
};

export default function CreateToken() {
	const [name, setName] = useState<string>('');
	const [symbol, setSymbol] = useState<string>('');
	const [maxSupply, setMaxSupply] = useState<string>('1000000');
	const [epochMintAmount, setEpochMintAmount] = useState<string>('100');
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isConnected, setIsConnected] = useState<boolean>(false);

	const switchToWestendAssetHub = async (
		provider: EthereumProvider
	): Promise<void> => {
		try {
			// First try to switch to Westend Asset Hub network
			await provider.request({
				method: 'wallet_switchEthereumChain',
				params: [{ chainId: WESTEND_ASSETHUB_NETWORK.chainId }],
			});
		} catch (switchError: any) {
			// This error code indicates the chain hasn't been added
			if (switchError.code === 4902) {
				// Add the Westend Asset Hub network if it doesn't exist
				await provider.request({
					method: 'wallet_addEthereumChain',
					params: [WESTEND_ASSETHUB_NETWORK],
				});
			} else {
				throw switchError;
			}
		}
	};

	const connectWallet = async (): Promise<void> => {
		try {
			const provider = window.talismanEth || window.ethereum;
			if (!provider) {
				toast.error('Please install MetaMask or Talisman wallet');
				return;
			}

			// Switch to Westend Asset Hub network
			await switchToWestendAssetHub(provider);

			// Request account access
			await provider.request({ method: 'eth_requestAccounts' });
			setIsConnected(true);
			toast.success('Wallet connected to Westend Asset Hub');
		} catch (error: any) {
			console.error('Failed to connect wallet:', error);
			toast.error(`Failed to connect: ${error.message}`);
		}
	};

	const handleCreateToken = async (): Promise<void> => {
		if (!name || !symbol) {
			toast.error('Please fill in token name and symbol');
			return;
		}

		setIsLoading(true);
		try {
			const provider = window.talismanEth || window.ethereum;
			if (!provider) {
				toast.error('Please install MetaMask or Talisman wallet');
				return;
			}

			// Ensure we're on the correct network
			await switchToWestendAssetHub(provider);

			const ethersProvider = new ethers.BrowserProvider(provider);
			await ethersProvider.send('eth_requestAccounts', []);
			const signer = await ethersProvider.getSigner();

			const factory = new ethers.Contract(
				FACTORY_ADDRESS,
				CreatorTokenFactoryABI,
				signer
			);

			const tx = await factory.createToken(
				name,
				symbol,
				ethers.parseUnits(maxSupply, 18),
				ethers.parseUnits(epochMintAmount, 18)
			);

			toast.info('Transaction submitted, waiting for confirmation...');
			const receipt = await tx.wait();

			// Find the TokenCreated event
			const event = receipt?.logs?.find((log: any) => {
				try {
					const decoded = factory.interface.parseLog(log);
					return decoded?.name === 'TokenCreated';
				} catch {
					return false;
				}
			});

			if (event) {
				const decoded = factory.interface.parseLog(event);
				const tokenAddress = decoded?.args?.tokenAddress;

				toast.success(`Token created successfully! Address: ${tokenAddress}`);

				// Reset form
				setName('');
				setSymbol('');
				setMaxSupply('1000000');
				setEpochMintAmount('100');
			} else {
				toast.warning('Token created but could not find token address in logs');
			}
		} catch (error: any) {
			console.error('Failed to create token:', error);
			toast.error(`Failed to create token: ${error.message}`);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className='max-w-md mx-auto p-6'>
			<Card>
				<CardHeader>
					<CardTitle>Create Creator Token</CardTitle>
				</CardHeader>
				<CardContent className='space-y-4'>
					{!isConnected && (
						<Button onClick={connectWallet} className='w-full'>
							Connect to Westend Asset Hub
						</Button>
					)}

					{isConnected && (
						<>
							<div className='space-y-2'>
								<Label htmlFor='name'>Token Name</Label>
								<Input
									id='name'
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder='My Creator Token'
								/>
							</div>

							<div className='space-y-2'>
								<Label htmlFor='symbol'>Symbol</Label>
								<Input
									id='symbol'
									value={symbol}
									onChange={(e) => setSymbol(e.target.value.toUpperCase())}
									placeholder='MCT'
									maxLength={10}
								/>
							</div>

							<div className='space-y-2'>
								<Label htmlFor='maxSupply'>Max Supply</Label>
								<Input
									id='maxSupply'
									type='number'
									value={maxSupply}
									onChange={(e) => setMaxSupply(e.target.value)}
									placeholder='1000000'
								/>
							</div>

							<div className='space-y-2'>
								<Label htmlFor='epochMintAmount'>Epoch Mint Amount</Label>
								<Input
									id='epochMintAmount'
									type='number'
									value={epochMintAmount}
									onChange={(e) => setEpochMintAmount(e.target.value)}
									placeholder='100'
								/>
							</div>

							<Button
								onClick={handleCreateToken}
								className='w-full'
								disabled={isLoading || !name || !symbol}
							>
								{isLoading ? 'Creating Token...' : 'Create Creator Token'}
							</Button>
						</>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
