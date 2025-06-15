// components/ClaimBurnCard.tsx
'use client';

import React, { useState } from 'react';
import { useSuperPageToken } from '@/hooks/useSuperPageToken';
import { Gift, Coins, Flame, Calendar, Users, Wallet } from 'lucide-react';

interface TokenClaimerProps {
	contractAddress: string;
}

const TokenClaimer: React.FC<TokenClaimerProps> = ({ contractAddress }) => {
	const [burnAmount, setBurnAmount] = useState<string>('');
	const [burnReason, setBurnReason] = useState<string>('');

	const {
		tokenInfo,
		userInfo,
		loading,
		error,
		account,
		isConnected,
		claimTokens,
		burnTokens,
		connectWallet,
	} = useSuperPageToken(contractAddress);

	const handleClaim = async (): Promise<void> => {
		try {
			const tx = await claimTokens();
			alert(`Claim successful! Transaction: ${tx.hash}`);
		} catch (err) {
			console.error('Claim failed:', err);
			const errorMsg =
				err instanceof Error ? err.message : 'Unknown error occurred';
			alert(`Claim failed: ${errorMsg}`);
		}
	};

	const handleBurn = async (): Promise<void> => {
		if (!burnAmount.trim()) {
			alert('Please enter burn amount');
			return;
		}

		if (isNaN(Number(burnAmount)) || Number(burnAmount) <= 0) {
			alert('Please enter a valid amount');
			return;
		}

		try {
			const tx = await burnTokens(burnAmount, burnReason);
			alert(`Burn successful! Transaction: ${tx.hash}`);
			setBurnAmount('');
			setBurnReason('');
		} catch (err) {
			console.error('Burn failed:', err);
			const errorMsg =
				err instanceof Error ? err.message : 'Unknown error occurred';
			alert(`Burn failed: ${errorMsg}`);
		}
	};

	const handleBurnAmountChange = (
		e: React.ChangeEvent<HTMLInputElement>
	): void => {
		setBurnAmount(e.target.value);
	};

	const handleBurnReasonChange = (
		e: React.ChangeEvent<HTMLInputElement>
	): void => {
		setBurnReason(e.target.value);
	};

	if (loading && !tokenInfo) {
		return (
			<div className='flex items-center justify-center py-12'>
				<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
				<span className='ml-2 text-sm text-gray-600'>
					Loading token contract...
				</span>
			</div>
		);
	}

	// Show connect wallet if not connected
	if (!isConnected) {
		return (
			<div className='max-w-lg mx-auto bg-white rounded-xl shadow-sm border border-gray-200'>
				<div className='px-6 py-8 text-center'>
					<Wallet className='w-12 h-12 text-gray-400 mx-auto mb-4' />
					<h2 className='text-lg font-semibold text-gray-900 mb-2'>
						Connect Your Wallet
					</h2>
					<p className='text-gray-600 mb-6'>
						Connect MetaMask or Talisman to claim tokens
					</p>
					<button
						onClick={connectWallet}
						className='bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors'
					>
						Connect Wallet
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className='max-w-lg mx-auto bg-white rounded-xl shadow-sm border border-gray-200'>
			{/* Header */}
			<div className='px-6 py-4 border-b border-gray-100'>
				<div className='flex items-center space-x-3'>
					<div className='w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center'>
						<Coins className='w-5 h-5 text-white' />
					</div>
					<div>
						<h2 className='text-lg font-semibold text-gray-900'>
							{tokenInfo?.name || 'Creator Token'}
						</h2>
						<p className='text-sm text-gray-500'>{tokenInfo?.symbol}</p>
					</div>
				</div>
			</div>

			{/* Token Info */}
			{tokenInfo && (
				<div className='px-6 py-4 bg-gray-50'>
					<div className='grid grid-cols-2 gap-4 text-sm'>
						<div className='flex items-center space-x-2'>
							<Calendar className='w-4 h-4 text-gray-400' />
							<div>
								<p className='text-gray-600'>Current Epoch</p>
								<p className='font-medium'>{tokenInfo.currentEpoch}</p>
							</div>
						</div>
						<div className='flex items-center space-x-2'>
							<Gift className='w-4 h-4 text-gray-400' />
							<div>
								<p className='text-gray-600'>Claim Amount</p>
								<p className='font-medium'>
									{tokenInfo.epochMintAmount} {tokenInfo.symbol}
								</p>
							</div>
						</div>
						<div className='flex items-center space-x-2'>
							<Users className='w-4 h-4 text-gray-400' />
							<div>
								<p className='text-gray-600'>Total Supply</p>
								<p className='font-medium'>
									{parseFloat(tokenInfo.totalSupply).toLocaleString()}
								</p>
							</div>
						</div>
						<div className='flex items-center space-x-2'>
							<Coins className='w-4 h-4 text-gray-400' />
							<div>
								<p className='text-gray-600'>Max Supply</p>
								<p className='font-medium'>
									{parseFloat(tokenInfo.maxSupply).toLocaleString()}
								</p>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* User Info & Actions */}
			<div className='px-6 py-4'>
				{error && (
					<div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-lg'>
						<p className='text-sm text-red-600'>{error}</p>
					</div>
				)}

				{/* User Balance */}
				{userInfo && (
					<div className='mb-6 p-4 bg-blue-50 rounded-lg'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm text-blue-700'>Your Balance</p>
								<p className='text-xl font-semibold text-blue-900'>
									{parseFloat(userInfo.balance).toLocaleString()}{' '}
									{tokenInfo?.symbol}
								</p>
							</div>
							<div className='text-right'>
								<p className='text-xs text-blue-600'>Last Claimed</p>
								<p className='text-sm font-medium text-blue-800'>
									Epoch {userInfo.lastClaimedEpoch || 'Never'}
								</p>
							</div>
						</div>
					</div>
				)}

				{/* Claim Section */}
				<div className='space-y-4'>
					<div>
						<h3 className='font-medium mb-3 flex items-center space-x-2'>
							<Gift className='w-4 h-4' />
							<span>Claim Tokens</span>
						</h3>

						{userInfo?.canClaim ? (
							<button
								onClick={handleClaim}
								disabled={loading}
								className='w-full bg-green-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-600 disabled:bg-gray-300 transition-colors'
							>
								{loading
									? 'Claiming...'
									: `Claim ${tokenInfo?.epochMintAmount} ${tokenInfo?.symbol}`}
							</button>
						) : (
							<div className='text-center py-4 px-4 bg-gray-100 rounded-lg'>
								<p className='text-sm text-gray-600'>
									{userInfo?.lastClaimedEpoch === tokenInfo?.currentEpoch
										? 'Already claimed for this epoch'
										: 'No tokens available to claim'}
								</p>
							</div>
						)}
					</div>

					{/* Burn Section */}
					<div className='border-t pt-4'>
						<h3 className='font-medium mb-3 flex items-center space-x-2'>
							<Flame className='w-4 h-4' />
							<span>Burn Tokens</span>
						</h3>

						<div className='space-y-3'>
							<input
								type='number'
								placeholder='Amount to burn'
								value={burnAmount}
								onChange={handleBurnAmountChange}
								className='w-full border rounded-lg px-3 py-2 text-sm'
								min='0'
								step='0.001'
							/>
							<input
								type='text'
								placeholder='Reason (optional)'
								value={burnReason}
								onChange={handleBurnReasonChange}
								className='w-full border rounded-lg px-3 py-2 text-sm'
								maxLength={100}
							/>
							<button
								onClick={handleBurn}
								disabled={loading || !burnAmount.trim()}
								className='w-full bg-red-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-600 disabled:bg-gray-300 transition-colors'
							>
								{loading ? 'Burning...' : 'Burn Tokens'}
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Wallet Info */}
			<div className='px-6 py-3 border-t bg-gray-50 rounded-b-xl'>
				<p className='text-xs text-gray-500'>
					Connected: {account?.slice(0, 6)}...{account?.slice(-4)}
				</p>
			</div>
		</div>
	);
};

export default TokenClaimer;
