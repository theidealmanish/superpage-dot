'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getAccessToken, usePrivy } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import Head from 'next/head';

// ERC20 ABI for token operations
const ERC20_ABI = [
	'function name() view returns (string)',
	'function symbol() view returns (string)',
	'function decimals() view returns (uint8)',
	'function totalSupply() view returns (uint256)',
	'function balanceOf(address) view returns (uint256)',
	'function transfer(address to, uint256 amount) returns (bool)',
];

// Chain configuration
const ASSET_HUB_CONFIG = {
	chainId: 420420422,
	rpcUrl: 'https://testnet-passet-hub-eth-rpc.polkadot.io',
	name: 'Polkadot Asset Hub Testnet',
};

interface TokenBalance {
	address: string;
	name: string;
	symbol: string;
	decimals: number;
	balance: string;
	formattedBalance: string;
}

interface SendFormData {
	tokenAddress: string;
	recipientAddress: string;
	amount: string;
}

async function verifyToken() {
	const url = '/api/verify';
	const accessToken = await getAccessToken();
	const result = await fetch(url, {
		headers: {
			...(accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined),
		},
	});

	return await result.json();
}

// Function to get native token balance (PAS)
async function getNativeBalance(
	provider: ethers.JsonRpcProvider,
	address: string
) {
	try {
		const balance = await provider.getBalance(address);
		return {
			address: 'native',
			name: 'Polkadot Asset Hub Testnet Token',
			symbol: 'PAS',
			decimals: 18,
			balance: balance.toString(),
			formattedBalance: ethers.formatEther(balance),
		};
	} catch (error) {
		console.error('Error fetching native balance:', error);
		return null;
	}
}

// Function to get ERC20 token balance with real names
async function getTokenBalance(
	provider: ethers.JsonRpcProvider,
	tokenAddress: string,
	walletAddress: string
): Promise<TokenBalance | null> {
	try {
		const tokenContract = new ethers.Contract(
			tokenAddress,
			ERC20_ABI,
			provider
		);

		const [name, symbol, decimals, balance] = await Promise.all([
			tokenContract.name(),
			tokenContract.symbol(),
			tokenContract.decimals(),
			tokenContract.balanceOf(walletAddress),
		]);

		return {
			address: tokenAddress,
			name: name,
			symbol: symbol,
			decimals: Number(decimals),
			balance: balance.toString(),
			formattedBalance: ethers.formatUnits(balance, decimals),
		};
	} catch (error) {
		console.error(`Error fetching token balance for ${tokenAddress}:`, error);
		return null;
	}
}

// Function to scan for all token transfers to find tokens the user has interacted with
async function scanForUserTokens(
	provider: ethers.JsonRpcProvider,
	walletAddress: string
): Promise<string[]> {
	try {
		const latestBlock = await provider.getBlockNumber();
		const fromBlock = Math.max(0, latestBlock - 10000);

		const transferTopic = ethers.id('Transfer(address,address,uint256)');

		const filter = {
			fromBlock,
			toBlock: 'latest',
			topics: [transferTopic, null, ethers.zeroPadValue(walletAddress, 32)],
		};

		const logs = await provider.getLogs(filter);
		const tokenAddresses = [...new Set(logs.map((log) => log.address))];

		return tokenAddresses;
	} catch (error) {
		console.error('Error scanning for user tokens:', error);
		return [];
	}
}

// Function to fetch all token balances
async function fetchAllTokenBalances(
	walletAddress: string
): Promise<TokenBalance[]> {
	try {
		const provider = new ethers.JsonRpcProvider(ASSET_HUB_CONFIG.rpcUrl);

		const nativeBalance = await getNativeBalance(provider, walletAddress);
		const balances: TokenBalance[] = nativeBalance ? [nativeBalance] : [];

		const discoveredTokens = await scanForUserTokens(provider, walletAddress);

		const knownTokens = [];

		const allTokens = [...new Set([...knownTokens, ...discoveredTokens])];

		const tokenPromises = allTokens.map((tokenAddress) =>
			getTokenBalance(provider, tokenAddress, walletAddress)
		);

		const tokenBalances = await Promise.all(tokenPromises);
		const validTokenBalances = tokenBalances.filter(
			(balance): balance is TokenBalance =>
				balance !== null && parseFloat(balance.formattedBalance) > 0
		);

		return [...balances, ...validTokenBalances];
	} catch (error) {
		console.error('Error fetching token balances:', error);
		return [];
	}
}

// Function to send tokens
async function sendTokens(
	tokenAddress: string,
	recipientAddress: string,
	amount: string,
	decimals: number
): Promise<string> {
	// Get provider from Privy
	const provider = new ethers.BrowserProvider(window.ethereum);
	const signer = await provider.getSigner();

	if (tokenAddress === 'native') {
		// Send native token (PAS)
		const tx = await signer.sendTransaction({
			to: recipientAddress,
			value: ethers.parseEther(amount),
		});
		return tx.hash;
	} else {
		// Send ERC20 token
		const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
		const tx = await tokenContract.transfer(
			recipientAddress,
			ethers.parseUnits(amount, decimals)
		);
		return tx.hash;
	}
}

export default function DashboardPage() {
	const [verifyResult, setVerifyResult] = useState();
	const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
	const [isLoadingBalances, setIsLoadingBalances] = useState(false);
	const [showSendForm, setShowSendForm] = useState(false);
	const [sendFormData, setSendFormData] = useState<SendFormData>({
		tokenAddress: '',
		recipientAddress: '',
		amount: '',
	});
	const [isSending, setIsSending] = useState(false);
	const [sendError, setSendError] = useState<string>('');

	const router = useRouter();
	const {
		ready,
		authenticated,
		user,
		logout,
		linkEmail,
		linkWallet,
		unlinkEmail,
		linkPhone,
		unlinkPhone,
		unlinkWallet,
		linkGoogle,
		unlinkGoogle,
		linkTwitter,
		unlinkTwitter,
		linkDiscord,
		unlinkDiscord,
	} = usePrivy();

	useEffect(() => {
		if (ready && !authenticated) {
			router.push('/');
		}
	}, [ready, authenticated, router]);

	useEffect(() => {
		if (user?.wallet?.address) {
			handleFetchTokenBalances();
		}
	}, [user?.wallet?.address]);

	const handleFetchTokenBalances = async () => {
		if (!user?.wallet?.address) return;

		setIsLoadingBalances(true);
		try {
			const balances = await fetchAllTokenBalances(user.wallet.address);
			setTokenBalances(balances);
		} catch (error) {
			console.error('Failed to fetch token balances:', error);
		} finally {
			setIsLoadingBalances(false);
		}
	};

	const handleSendFormSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSendError('');
		setIsSending(true);

		try {
			// Validate form
			if (
				!sendFormData.recipientAddress ||
				!sendFormData.amount ||
				!sendFormData.tokenAddress
			) {
				throw new Error('Please fill in all fields');
			}

			if (!ethers.isAddress(sendFormData.recipientAddress)) {
				throw new Error('Invalid recipient address');
			}

			// Find the selected token
			const selectedToken = tokenBalances.find(
				(token) => token.address === sendFormData.tokenAddress
			);

			if (!selectedToken) {
				throw new Error('Selected token not found');
			}

			// Check if user has enough balance
			const requestedAmount = parseFloat(sendFormData.amount);
			const availableBalance = parseFloat(selectedToken.formattedBalance);

			if (requestedAmount > availableBalance) {
				throw new Error('Insufficient balance');
			}

			// Send the transaction
			const txHash = await sendTokens(
				sendFormData.tokenAddress,
				sendFormData.recipientAddress,
				sendFormData.amount,
				selectedToken.decimals
			);

			alert(`Transaction sent! Hash: ${txHash}`);

			// Reset form and refresh balances
			setSendFormData({
				tokenAddress: '',
				recipientAddress: '',
				amount: '',
			});
			setShowSendForm(false);
			await handleFetchTokenBalances();
		} catch (error: any) {
			console.error('Send transaction failed:', error);
			setSendError(error.message || 'Transaction failed');
		} finally {
			setIsSending(false);
		}
	};

	const numAccounts = user?.linkedAccounts?.length || 0;
	const canRemoveAccount = numAccounts > 1;

	const email = user?.email;
	const phone = user?.phone;
	const wallet = user?.wallet;

	const googleSubject = user?.google?.subject || null;
	const twitterSubject = user?.twitter?.subject || null;
	const discordSubject = user?.discord?.subject || null;

	return (
		<>
			<Head>
				<title>Privy Auth Demo</title>
			</Head>

			<main className='flex flex-col min-h-screen px-4 sm:px-20 py-6 sm:py-10 bg-privy-light-blue'>
				{ready && authenticated ? (
					<>
						<div className='flex flex-row justify-between'>
							<h1 className='text-2xl font-semibold'>Privy Auth Demo</h1>
							<button
								onClick={logout}
								className='text-sm bg-violet-200 hover:text-violet-900 py-2 px-4 rounded-md text-violet-700'
							>
								Logout
							</button>
						</div>

						{/* Token Balances Section */}
						{wallet && (
							<div className='mt-8'>
								<div className='flex items-center justify-between mb-4'>
									<h2 className='text-xl font-semibold'>Token Balances</h2>
									<div className='flex gap-2'>
										<button
											onClick={() => setShowSendForm(!showSendForm)}
											className='text-sm bg-green-600 hover:bg-green-700 py-2 px-4 rounded-md text-white'
										>
											{showSendForm ? 'Cancel Send' : 'Send Tokens'}
										</button>
										<button
											onClick={handleFetchTokenBalances}
											disabled={isLoadingBalances}
											className='text-sm bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded-md text-white disabled:opacity-50'
										>
											{isLoadingBalances ? 'Loading...' : 'Refresh Balances'}
										</button>
									</div>
								</div>

								{/* Send Form */}
								{showSendForm && (
									<div className='bg-white rounded-lg p-6 shadow-sm mb-6'>
										<h3 className='text-lg font-semibold mb-4'>Send Tokens</h3>
										<form onSubmit={handleSendFormSubmit} className='space-y-4'>
											<div>
												<label className='block text-sm font-medium text-gray-700 mb-2'>
													Select Token
												</label>
												<select
													value={sendFormData.tokenAddress}
													onChange={(e) =>
														setSendFormData({
															...sendFormData,
															tokenAddress: e.target.value,
														})
													}
													className='w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
													required
												>
													<option value=''>Select a token</option>
													{tokenBalances.map((token) => (
														<option key={token.address} value={token.address}>
															{token.name} ({token.symbol}) - Balance:{' '}
															{parseFloat(token.formattedBalance).toFixed(6)}
														</option>
													))}
												</select>
											</div>

											<div>
												<label className='block text-sm font-medium text-gray-700 mb-2'>
													Recipient Address
												</label>
												<input
													type='text'
													value={sendFormData.recipientAddress}
													onChange={(e) =>
														setSendFormData({
															...sendFormData,
															recipientAddress: e.target.value,
														})
													}
													placeholder='0x...'
													className='w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
													required
												/>
											</div>

											<div>
												<label className='block text-sm font-medium text-gray-700 mb-2'>
													Amount
												</label>
												<input
													type='number'
													step='any'
													value={sendFormData.amount}
													onChange={(e) =>
														setSendFormData({
															...sendFormData,
															amount: e.target.value,
														})
													}
													placeholder='0.0'
													className='w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
													required
												/>
											</div>

											{sendError && (
												<div className='p-3 bg-red-100 border border-red-400 text-red-700 rounded-md'>
													{sendError}
												</div>
											)}

											<div className='flex gap-3'>
												<button
													type='submit'
													disabled={isSending}
													className='flex-1 bg-blue-600 hover:bg-blue-700 py-3 px-4 rounded-md text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed'
												>
													{isSending ? 'Sending...' : 'Send Transaction'}
												</button>
												<button
													type='button'
													onClick={() => setShowSendForm(false)}
													className='px-4 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50'
												>
													Cancel
												</button>
											</div>
										</form>
									</div>
								)}

								<div className='bg-white rounded-lg p-4 shadow-sm'>
									<p className='text-sm text-gray-600 mb-3'>
										Wallet: {wallet.address}
									</p>
									<p className='text-sm text-gray-600 mb-4'>
										Chain: {ASSET_HUB_CONFIG.name} (ID:{' '}
										{ASSET_HUB_CONFIG.chainId})
									</p>

									{tokenBalances.length > 0 ? (
										<div className='space-y-3'>
											{tokenBalances.map((token, index) => (
												<div
													key={`${token.address}-${index}`}
													className='flex justify-between items-center p-3 border rounded-md'
												>
													<div>
														<div className='font-medium'>{token.name}</div>
														<div className='text-sm font-medium text-gray-800'>
															{token.symbol}
														</div>
														<div className='text-sm text-gray-600'>
															{token.address === 'native'
																? 'Native Token'
																: `Contract: ${token.address.slice(
																		0,
																		6
																  )}...${token.address.slice(-4)}`}
														</div>
													</div>
													<div className='text-right'>
														<div className='font-medium'>
															{parseFloat(token.formattedBalance).toFixed(6)}{' '}
															{token.symbol}
														</div>
														<div className='text-sm text-gray-600'>
															{token.decimals} decimals
														</div>
													</div>
												</div>
											))}
										</div>
									) : (
										<p className='text-gray-600'>
											{isLoadingBalances
												? 'Loading token balances...'
												: 'No tokens found with balance > 0'}
										</p>
									)}
								</div>
							</div>
						)}

						<div className='mt-12 flex gap-4 flex-wrap'>
							{googleSubject ? (
								<button
									onClick={() => {
										unlinkGoogle(googleSubject);
									}}
									className='text-sm border border-violet-600 hover:border-violet-700 py-2 px-4 rounded-md text-violet-600 hover:text-violet-700 disabled:border-gray-500 disabled:text-gray-500 hover:disabled:text-gray-500'
									disabled={!canRemoveAccount}
								>
									Unlink Google
								</button>
							) : (
								<button
									onClick={() => {
										linkGoogle();
									}}
									className='text-sm bg-violet-600 hover:bg-violet-700 py-2 px-4 rounded-md text-white'
								>
									Link Google
								</button>
							)}

							{twitterSubject ? (
								<button
									onClick={() => {
										unlinkTwitter(twitterSubject);
									}}
									className='text-sm border border-violet-600 hover:border-violet-700 py-2 px-4 rounded-md text-violet-600 hover:text-violet-700 disabled:border-gray-500 disabled:text-gray-500 hover:disabled:text-gray-500'
									disabled={!canRemoveAccount}
								>
									Unlink Twitter
								</button>
							) : (
								<button
									className='text-sm bg-violet-600 hover:bg-violet-700 py-2 px-4 rounded-md text-white'
									onClick={() => {
										linkTwitter();
									}}
								>
									Link Twitter
								</button>
							)}

							{discordSubject ? (
								<button
									onClick={() => {
										unlinkDiscord(discordSubject);
									}}
									className='text-sm border border-violet-600 hover:border-violet-700 py-2 px-4 rounded-md text-violet-600 hover:text-violet-700 disabled:border-gray-500 disabled:text-gray-500 hover:disabled:text-gray-500'
									disabled={!canRemoveAccount}
								>
									Unlink Discord
								</button>
							) : (
								<button
									className='text-sm bg-violet-600 hover:bg-violet-700 py-2 px-4 rounded-md text-white'
									onClick={() => {
										linkDiscord();
									}}
								>
									Link Discord
								</button>
							)}

							{email ? (
								<button
									onClick={() => {
										unlinkEmail(email.address);
									}}
									className='text-sm border border-violet-600 hover:border-violet-700 py-2 px-4 rounded-md text-violet-600 hover:text-violet-700 disabled:border-gray-500 disabled:text-gray-500 hover:disabled:text-gray-500'
									disabled={!canRemoveAccount}
								>
									Unlink email
								</button>
							) : (
								<button
									onClick={linkEmail}
									className='text-sm bg-violet-600 hover:bg-violet-700 py-2 px-4 rounded-md text-white'
								>
									Connect email
								</button>
							)}
							{wallet ? (
								<button
									onClick={() => {
										unlinkWallet(wallet.address);
									}}
									className='text-sm border border-violet-600 hover:border-violet-700 py-2 px-4 rounded-md text-violet-600 hover:text-violet-700 disabled:border-gray-500 disabled:text-gray-500 hover:disabled:text-gray-500'
									disabled={!canRemoveAccount}
								>
									Unlink wallet
								</button>
							) : (
								<button
									onClick={linkWallet}
									className='text-sm bg-violet-600 hover:bg-violet-700 py-2 px-4 rounded-md text-white border-none'
								>
									Connect wallet
								</button>
							)}
							{phone ? (
								<button
									onClick={() => {
										unlinkPhone(phone.number);
									}}
									className='text-sm border border-violet-600 hover:border-violet-700 py-2 px-4 rounded-md text-violet-600 hover:text-violet-700 disabled:border-gray-500 disabled:text-gray-500 hover:disabled:text-gray-500'
									disabled={!canRemoveAccount}
								>
									Unlink phone
								</button>
							) : (
								<button
									onClick={linkPhone}
									className='text-sm bg-violet-600 hover:bg-violet-700 py-2 px-4 rounded-md text-white border-none'
								>
									Connect phone
								</button>
							)}

							<button
								onClick={() => verifyToken().then(setVerifyResult)}
								className='text-sm bg-violet-600 hover:bg-violet-700 py-2 px-4 rounded-md text-white border-none'
							>
								Verify token on server
							</button>

							{Boolean(verifyResult) && (
								<details className='w-full'>
									<summary className='mt-6 font-bold uppercase text-sm text-gray-600'>
										Server verify result
									</summary>
									<pre className='max-w-4xl bg-slate-700 text-slate-50 font-mono p-4 text-xs sm:text-sm rounded-md mt-2'>
										{JSON.stringify(verifyResult, null, 2)}
									</pre>
								</details>
							)}
						</div>

						<p className='mt-6 font-bold uppercase text-sm text-gray-600'>
							User object
						</p>
						<pre className='max-w-4xl bg-slate-700 text-slate-50 font-mono p-4 text-xs sm:text-sm rounded-md mt-2'>
							{JSON.stringify(user, null, 2)}
						</pre>
					</>
				) : null}
			</main>
		</>
	);
}
