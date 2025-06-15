'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
	Coins,
	Check,
	Wallet,
	Clock,
	AlertCircle,
	ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';
import formatTokenAmount from '@/lib/formatNumberToString';
import { useSuperPageToken } from '@/hooks/useSuperPageToken';

interface Creator {
	_id: string;
	name: string;
	username: string;
	avatarUrl: string;
	earnedPoints: number;
	engagements: number;
	token?: {
		_id: string;
		name: string;
		symbol: string;
		imageUrl?: string;
		totalSupply?: number;
		circulatingSupply?: number;
		decimals?: number;
		description?: string;
		contractAddress: string;
	};
}

interface TokenHoldingCardProps {
	selectedCreator: Creator | null;
	userWalletAddress?: string;
	tokenClaimed: string;
	chainId?: number;
}

interface ClaimStatus {
	status: 'idle' | 'pending' | 'success' | 'error';
	txHash?: string;
	message?: string;
}

export default function TokenHoldingCard({
	selectedCreator,
	userWalletAddress,
	tokenClaimed,
	chainId = 1,
}: TokenHoldingCardProps) {
	const [claimStatus, setClaimStatus] = useState<ClaimStatus>({
		status: 'idle',
	});

	// Get contract address from creator's token
	const contractAddress = selectedCreator?.token?.contractAddress || '';

	const {
		tokenInfo,
		userInfo,
		loading,
		error,
		account,
		isConnected,
		claimTokens,
		connectWallet,
	} = useSuperPageToken(contractAddress, chainId);

	// Get formatted token symbol
	const tokenSymbol =
		selectedCreator?.token?.symbol || tokenInfo?.symbol || 'TOKEN';
	const formattedTokenSymbol = tokenSymbol.startsWith('$')
		? tokenSymbol
		: `$${tokenSymbol}`;

	// Get Subscan explorer URL
	const getExplorerUrl = (txHash: string): string => {
		return `https://assethub-westend.subscan.io/extrinsic/${txHash}`;
	};

	// Handle token claim using the smart contract
	const claimToken = async () => {
		if (!isConnected) {
			toast.error('Please connect your wallet first');
			return;
		}

		if (!userInfo?.canClaim) {
			toast.error('You have already claimed tokens for this epoch');
			return;
		}

		setClaimStatus({ status: 'pending', message: 'Preparing transaction...' });

		try {
			setClaimStatus({
				status: 'pending',
				message: 'Confirm transaction in your wallet...',
			});

			const tx = await claimTokens();

			setClaimStatus({
				status: 'pending',
				message: 'Transaction submitted, waiting for confirmation...',
				txHash: tx.hash,
			});

			// Wait for confirmation
			const receipt = await tx.wait();

			if (receipt?.status === 1) {
				setClaimStatus({
					status: 'success',
					txHash: tx.hash,
					message: `Successfully claimed ${tokenInfo?.epochMintAmount} ${tokenInfo?.symbol} tokens!`,
				});
				toast.success('Token claimed successfully!');
			} else {
				throw new Error('Transaction failed');
			}
		} catch (err) {
			console.error('Claim failed:', err);
			const errorMsg =
				err instanceof Error ? err.message : 'Unknown error occurred';
			setClaimStatus({
				status: 'error',
				message: errorMsg,
			});
			toast.error(`Failed to claim token: ${errorMsg}`);
		}
	};

	const resetClaimStatus = (): void => {
		setClaimStatus({ status: 'idle' });
	};

	// Status Message Component
	const StatusMessage: React.FC = () => {
		if (claimStatus.status === 'idle') return null;

		const getStatusIcon = () => {
			switch (claimStatus.status) {
				case 'pending':
					return <Clock className='h-4 w-4 text-blue-500 animate-spin' />;
				case 'success':
					return <Check className='h-4 w-4 text-green-500' />;
				case 'error':
					return <AlertCircle className='h-4 w-4 text-red-500' />;
				default:
					return null;
			}
		};

		const getStatusColor = () => {
			switch (claimStatus.status) {
				case 'pending':
					return 'bg-blue-50 border-blue-200 text-blue-700';
				case 'success':
					return 'bg-green-50 border-green-200 text-green-700';
				case 'error':
					return 'bg-red-50 border-red-200 text-red-700';
				default:
					return '';
			}
		};

		return (
			<div className={`mb-3 p-3 border rounded-lg ${getStatusColor()}`}>
				<div className='flex items-center space-x-2'>
					{getStatusIcon()}
					<p className='text-sm flex-1'>{claimStatus.message}</p>
					{claimStatus.status !== 'pending' && (
						<button
							onClick={resetClaimStatus}
							className='text-xs opacity-70 hover:opacity-100'
						>
							✕
						</button>
					)}
				</div>
				{claimStatus.txHash && (
					<div className='mt-2'>
						<a
							href={getExplorerUrl(claimStatus.txHash)}
							target='_blank'
							rel='noopener noreferrer'
							className='inline-flex items-center space-x-1 text-xs hover:underline'
						>
							<span>View on Subscan Explorer</span>
							<ExternalLink className='h-3 w-3' />
						</a>
					</div>
				)}
			</div>
		);
	};

	// Show loading state while contract is initializing
	if (loading && !tokenInfo && contractAddress) {
		return (
			<Card>
				<CardHeader className='pb-3'>
					<CardTitle className='flex items-center gap-2 text-xl'>
						<Coins className='h-5 w-5 text-amber-500' />
						{formattedTokenSymbol} Holding
					</CardTitle>
					<CardDescription>
						Summary of your token holdings from @{selectedCreator?.username}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className='flex items-center justify-center py-8'>
						<Clock className='h-6 w-6 animate-spin text-blue-500 mr-2' />
						<span className='text-sm text-gray-600'>
							Loading token contract...
						</span>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader className='pb-3'>
				<CardTitle className='flex items-center gap-2 text-xl'>
					<Coins className='h-5 w-5 text-amber-500' />
					{formattedTokenSymbol} Holding
				</CardTitle>
				<CardDescription>
					Summary of your token holdings from @{selectedCreator?.username}
				</CardDescription>
			</CardHeader>

			<CardContent>
				{/* Connection Status */}
				{!isConnected && contractAddress && (
					<div className='mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg'>
						<div className='flex items-center space-x-2'>
							<Wallet className='h-4 w-4 text-yellow-600' />
							<p className='text-sm text-yellow-700'>
								Connect your wallet to claim tokens
							</p>
						</div>
					</div>
				)}

				{/* Contract Error */}
				{error && (
					<div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-lg'>
						<p className='text-sm text-red-600'>{error}</p>
					</div>
				)}

				{/* Current Balance Display */}
				<div className='flex justify-between items-baseline mb-6'>
					<div className='text-4xl font-bold'>
						{isConnected && userInfo
							? formatTokenAmount(parseFloat(userInfo.balance))
							: formatTokenAmount(selectedCreator?.earnedPoints || 0)}
					</div>
					<div className='text-sm text-gray-500'>
						{isConnected && userInfo
							? `${tokenInfo?.symbol || 'tokens'} balance`
							: `From ${selectedCreator?.engagements || 0} engagements`}
					</div>
				</div>

				<div className='space-y-6'>
					<div>
						{/* Show blockchain data if connected */}
						{isConnected && tokenInfo && userInfo ? (
							<>
								<div className='flex justify-between text-sm mb-1'>
									<span className='text-gray-500'>Current Epoch</span>
									<span className='font-medium'>{tokenInfo.currentEpoch}</span>
								</div>
								<div className='flex justify-between text-sm mb-1'>
									<span className='text-gray-500'>Your Balance</span>
									<span className='font-medium'>
										{userInfo.balance} {tokenInfo.symbol}
									</span>
								</div>
								<div className='flex justify-between text-sm mb-1'>
									<span className='text-gray-500'>Last Claimed</span>
									<span className='font-medium'>
										{userInfo.lastClaimedEpoch
											? `Epoch ${userInfo.lastClaimedEpoch}`
											: 'Never'}
									</span>
								</div>
								<div className='flex justify-between text-sm'>
									<span className='text-gray-500'>Claimable Amount</span>
									<span className='font-medium text-amber-600'>
										{userInfo.canClaim
											? `${tokenInfo.epochMintAmount} ${tokenInfo.symbol}`
											: 'None'}
									</span>
								</div>
							</>
						) : (
							<>
								<div className='flex justify-between text-sm mb-1'>
									<span className='text-gray-500'>Loyalty Points</span>
									<span className='font-medium'>
										{selectedCreator?.earnedPoints || 0} points
									</span>
								</div>
								<div className='flex justify-between text-sm'>
									<span className='text-gray-500'>Token Claimed</span>
									<span className='font-medium'>{tokenClaimed || 0}</span>
								</div>
								<div className='flex justify-between text-sm'>
									<span className='text-gray-500'>Estimated Value</span>
									<span className='font-medium text-amber-600'>
										≈{' '}
										{Math.round(
											(selectedCreator?.earnedPoints || 0) * 0.01 * 100
										) / 100}{' '}
										{formattedTokenSymbol}
									</span>
								</div>
							</>
						)}
					</div>
				</div>
			</CardContent>

			<CardFooter className='flex flex-col space-y-3'>
				{/* Status Message */}
				<StatusMessage />

				{/* Connect Wallet Button */}
				{!isConnected && contractAddress ? (
					<Button
						onClick={connectWallet}
						disabled={loading}
						className='w-full'
						variant='outline'
					>
						<Wallet className='h-4 w-4 mr-2' />
						{loading ? 'Connecting...' : 'Connect Wallet'}
					</Button>
				) : null}

				{/* Claim Button */}
				{isConnected && contractAddress ? (
					userInfo?.canClaim ? (
						<Button
							disabled={claimStatus.status === 'pending' || loading}
							onClick={claimToken}
							className='w-full'
						>
							{claimStatus.status === 'pending' ? (
								<>
									<Clock className='h-4 w-4 mr-2 animate-spin' />
									Processing...
								</>
							) : (
								`Claim ${tokenInfo?.epochMintAmount || '0'} ${
									tokenInfo?.symbol || 'Tokens'
								}`
							)}
						</Button>
					) : (
						<Button variant='outline' className='w-full' disabled>
							{userInfo?.lastClaimedEpoch === tokenInfo?.currentEpoch
								? 'Already Claimed This Epoch'
								: 'No Tokens Available'}
						</Button>
					)
				) : !contractAddress ? (
					<Button
						variant='outline'
						className='w-full'
						disabled
						onClick={() => {
							toast.error('Token contract not available for this creator');
						}}
					>
						Token Contract Not Available
					</Button>
				) : null}

				{/* Fallback for legacy claim (if no contract address) */}
				{!contractAddress && selectedCreator?.token?._id && (
					<Button
						variant='outline'
						className='w-full'
						disabled
						onClick={() => {
							toast.error('Please use the new token claiming system');
						}}
					>
						Legacy Token - Use New Claim System
					</Button>
				)}

				{/* Explorer link if transaction exists */}
				{claimStatus.status === 'success' && claimStatus.txHash && (
					<div className='w-full'>
						<a
							href={getExplorerUrl(claimStatus.txHash)}
							target='_blank'
							rel='noopener noreferrer'
							className='flex items-center justify-center gap-2 text-green-600 hover:text-green-800 text-sm hover:underline'
						>
							<Check className='h-4 w-4' />
							<span>View Transaction on Subscan</span>
							<ExternalLink className='h-4 w-4' />
						</a>
					</div>
				)}
			</CardFooter>
		</Card>
	);
}
