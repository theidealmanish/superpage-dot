import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { SuperPageCreatorTokenContract } from '@/lib/superPageCreatorToken';

interface TokenInfo {
	name: string;
	symbol: string;
	decimals: number;
	totalSupply: string;
	maxSupply: string;
	currentEpoch: number;
	epochMintAmount: string;
}

interface UserInfo {
	balance: string;
	lastClaimedEpoch: number;
	canClaim: boolean;
}

interface UseSuperpageTokenReturn {
	contract: SuperPageCreatorTokenContract | null;
	tokenInfo: TokenInfo | null;
	userInfo: UserInfo | null;
	loading: boolean;
	error: string | null;
	account: string | null;
	isConnected: boolean;
	claimTokens: () => Promise<ethers.TransactionResponse>;
	burnTokens: (
		amount: string,
		reason?: string
	) => Promise<ethers.TransactionResponse>;
	connectWallet: () => Promise<void>;
	loadUserInfo: () => Promise<void>;
	loadTokenInfo: () => Promise<void>;
	switchNetwork: (chainId: number) => Promise<void>;
}

export function useSuperPageToken(
	contractAddress: string,
	chainId: number = 1
): UseSuperpageTokenReturn {
	const [contract, setContract] =
		useState<SuperPageCreatorTokenContract | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
	const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
	const [account, setAccount] = useState<string | null>(null);
	const [isConnected, setIsConnected] = useState<boolean>(false);

	const handleAccountsChanged = useCallback((accounts: string[]) => {
		if (accounts.length === 0) {
			setAccount(null);
			setIsConnected(false);
			setUserInfo(null);
		} else {
			setAccount(accounts[0]);
			setIsConnected(true);
		}
	}, []);

	const handleChainChanged = useCallback((_chainId: string) => {
		window.location.reload();
	}, []);

	const checkConnection = useCallback(async (): Promise<void> => {
		if (typeof window !== 'undefined' && window.ethereum) {
			try {
				const accounts = (await window.ethereum.request({
					method: 'eth_accounts',
				})) as string[];

				if (accounts.length > 0) {
					setAccount(accounts[0]);
					setIsConnected(true);
				}
			} catch (error) {
				console.error('Error checking connection:', error);
				setError('Failed to check wallet connection');
			}
		}
	}, []);

	const connectWallet = useCallback(async (): Promise<void> => {
		if (typeof window === 'undefined' || !window.ethereum) {
			const errorMsg = 'Please install MetaMask or Talisman wallet';
			setError(errorMsg);
			throw new Error(errorMsg);
		}

		try {
			setLoading(true);
			setError(null);

			const accounts = (await window.ethereum.request({
				method: 'eth_requestAccounts',
			})) as string[];

			if (accounts.length > 0) {
				setAccount(accounts[0]);
				setIsConnected(true);
			}
		} catch (error) {
			const errorMsg =
				error instanceof Error ? error.message : 'Failed to connect wallet';
			console.error('Failed to connect wallet:', error);
			setError(errorMsg);
			throw new Error(errorMsg);
		} finally {
			setLoading(false);
		}
	}, []);

	const switchNetwork = useCallback(
		async (targetChainId: number): Promise<void> => {
			if (typeof window === 'undefined' || !window.ethereum) {
				throw new Error('Wallet not available');
			}

			try {
				await window.ethereum.request({
					method: 'wallet_switchEthereumChain',
					params: [{ chainId: `0x${targetChainId.toString(16)}` }],
				});
			} catch (error: any) {
				if (error.code === 4902) {
					// Chain not added to wallet
					throw new Error('Please add this network to your wallet');
				}
				throw error;
			}
		},
		[]
	);

	const initContract = useCallback(async (): Promise<void> => {
		try {
			setLoading(true);
			setError(null);

			const rpcUrl = getRpcUrl(chainId);
			const provider = new ethers.JsonRpcProvider(rpcUrl);

			let signer: ethers.Signer | undefined;
			if (typeof window !== 'undefined' && window.ethereum && isConnected) {
				try {
					const browserProvider = new ethers.BrowserProvider(window.ethereum);
					signer = await browserProvider.getSigner();
				} catch (signerError) {
					console.warn(
						'Could not get signer, using read-only mode:',
						signerError
					);
				}
			}

			const tokenContract = new SuperPageCreatorTokenContract(
				contractAddress,
				provider,
				signer
			);
			setContract(tokenContract);

			// Load token info
			const info = await tokenContract.getTokenInfo();
			setTokenInfo(info);
		} catch (err) {
			const errorMsg =
				err instanceof Error ? err.message : 'Failed to initialize contract';
			console.error('Failed to initialize contract:', err);
			setError(errorMsg);
		} finally {
			setLoading(false);
		}
	}, [contractAddress, chainId, isConnected]);

	const loadUserInfo = useCallback(async (): Promise<void> => {
		if (!contract || !account) return;

		try {
			const [balance, lastClaimedEpoch, canClaim] = await Promise.all([
				contract.getBalance(account),
				contract.getLastClaimedEpoch(account),
				contract.canClaim(account),
			]);

			setUserInfo({ balance, lastClaimedEpoch, canClaim });
		} catch (err) {
			console.error('Failed to load user info:', err);
			setError('Failed to load user information');
		}
	}, [contract, account]);

	const loadTokenInfo = useCallback(async (): Promise<void> => {
		if (!contract) return;

		try {
			const info = await contract.getTokenInfo();
			setTokenInfo(info);
		} catch (err) {
			console.error('Failed to load token info:', err);
			setError('Failed to load token information');
		}
	}, [contract]);

	const claimTokens =
		useCallback(async (): Promise<ethers.TransactionResponse> => {
			if (!contract) throw new Error('Contract not initialized');
			if (!account) throw new Error('Wallet not connected');
			if (typeof window === 'undefined' || !window.ethereum) {
				throw new Error('Wallet not available');
			}

			setLoading(true);
			setError(null);

			try {
				// Get fresh signer for the transaction
				const browserProvider = new ethers.BrowserProvider(window.ethereum);
				const signer = await browserProvider.getSigner();

				// Create a new contract instance with the signer
				const contractWithSigner = new SuperPageCreatorTokenContract(
					contract.contract.target as string,
					browserProvider,
					signer
				);

				const tx = await contractWithSigner.claim();
				await tx.wait();

				// Refresh data
				await Promise.all([loadTokenInfo(), loadUserInfo()]);

				return tx;
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : 'Claim failed';
				setError(errorMessage);
				throw new Error(errorMessage);
			} finally {
				setLoading(false);
			}
		}, [contract, account, loadTokenInfo, loadUserInfo]);

	const burnTokens = useCallback(
		async (
			amount: string,
			reason: string = ''
		): Promise<ethers.TransactionResponse> => {
			if (!contract) throw new Error('Contract not initialized');
			if (!account) throw new Error('Wallet not connected');
			if (typeof window === 'undefined' || !window.ethereum) {
				throw new Error('Wallet not available');
			}

			setLoading(true);
			setError(null);

			try {
				// Get fresh signer for the transaction
				const browserProvider = new ethers.BrowserProvider(window.ethereum);
				const signer = await browserProvider.getSigner();

				// Create a new contract instance with the signer
				const contractWithSigner = new SuperPageCreatorTokenContract(
					contract.contract.target as string,
					browserProvider,
					signer
				);

				const tx = await contractWithSigner.burn(amount, reason);
				await tx.wait();

				// Refresh data
				await Promise.all([loadTokenInfo(), loadUserInfo()]);

				return tx;
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : 'Burn failed';
				setError(errorMessage);
				throw new Error(errorMessage);
			} finally {
				setLoading(false);
			}
		},
		[contract, account, loadTokenInfo, loadUserInfo]
	);

	useEffect(() => {
		checkConnection();
	}, [checkConnection]);

	useEffect(() => {
		initContract();
	}, [initContract]);

	useEffect(() => {
		if (contract && account) {
			loadUserInfo();
		}
	}, [contract, account, loadUserInfo]);

	useEffect(() => {
		if (typeof window !== 'undefined' && window.ethereum) {
			window.ethereum.on('accountsChanged', handleAccountsChanged);
			window.ethereum.on('chainChanged', handleChainChanged);

			return () => {
				if (window.ethereum) {
					window.ethereum.removeListener(
						'accountsChanged',
						handleAccountsChanged
					);
					window.ethereum.removeListener('chainChanged', handleChainChanged);
				}
			};
		}
	}, [handleAccountsChanged, handleChainChanged]);

	return {
		contract,
		tokenInfo,
		userInfo,
		loading,
		error,
		account,
		isConnected,
		claimTokens,
		burnTokens,
		connectWallet,
		loadUserInfo,
		loadTokenInfo,
		switchNetwork,
	};
}

function getRpcUrl(chainId: number = 420420421): string {
	const rpcUrls: Record<number, string> = {
		420420421: 'https://westend-asset-hub-eth-rpc.polkadot.io/',
	};

	return rpcUrls[chainId] || rpcUrls[420420421];
}
