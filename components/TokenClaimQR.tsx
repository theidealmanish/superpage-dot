'use client';

import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import axios from '@/lib/axios';

interface TokenClaimQRProps {
	tokenId: string;
	tokenName: string;
	tokenSymbol: string;
	amount?: number;
	recipientAddress?: string;
}

export default function TokenClaimQR({
	tokenId,
	tokenName,
	tokenSymbol,
	amount = 0,
	recipientAddress,
}: TokenClaimQRProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [walletAddress, setWalletAddress] = useState(recipientAddress || '');
	const [isLoading, setIsLoading] = useState(false);
	const [claimed, setClaimed] = useState(false);
	const [txId, setTxId] = useState<string | null>(null);
	const qrRef = useRef<HTMLDivElement>(null);

	// QR code data for claiming tokens
	const claimData = JSON.stringify({
		action: 'claim',
		tokenId,
		recipientAddress: walletAddress,
	});

	// Listen to scan results
	useEffect(() => {
		// This function would be triggered when the QR code is scanned and the claim request is processed
		const handleMessage = async (event: MessageEvent) => {
			if (typeof event.data === 'string' && event.data.startsWith('claim:')) {
				const claimResponse = event.data.replace('claim:', '');

				try {
					const data = JSON.parse(claimResponse);
					if (data.success) {
						setClaimed(true);
						setTxId(data.transactionId);
						toast.success('Tokens claimed successfully!');
					} else {
						toast.error(`Claim failed: ${data.error || 'Unknown error'}`);
					}
				} catch (error) {
					console.error('Invalid claim response', error);
				}
			}
		};

		window.addEventListener('message', handleMessage);
		return () => window.removeEventListener('message', handleMessage);
	}, []);

	// Function to manually trigger the claim process (for testing or direct API call)
	const handleManualClaim = async () => {
		if (!walletAddress) {
			toast.error('Please enter a recipient wallet address');
			return;
		}

		try {
			setIsLoading(true);
			const response = await axios.post('/tokens/claim', {
				tokenId,
				recipientAddress: walletAddress,
			});

			setClaimed(true);
			setTxId(response.data.transactionId);
			toast.success('Tokens claimed successfully!');
		} catch (error: any) {
			toast.error(
				`Claim failed: ${
					error.response?.data?.message || error.message || 'Unknown error'
				}`
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			<Button onClick={() => setIsOpen(true)} variant='outline'>
				Claim Tokens
			</Button>

			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogContent className='sm:max-w-[425px]'>
					<DialogHeader>
						<DialogTitle>Claim {tokenName} Tokens</DialogTitle>
						<DialogDescription>
							Scan this QR code with your wallet app to claim your {tokenSymbol}{' '}
							tokens.
						</DialogDescription>
					</DialogHeader>

					{claimed ? (
						<div className='flex flex-col items-center justify-center py-6'>
							<div className='h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4'>
								<svg
									xmlns='http://www.w3.org/2000/svg'
									width='24'
									height='24'
									viewBox='0 0 24 24'
									fill='none'
									stroke='currentColor'
									strokeWidth='2'
									strokeLinecap='round'
									strokeLinejoin='round'
									className='text-green-600'
								>
									<path d='M20 6L9 17l-5-5' />
								</svg>
							</div>
							<h3 className='text-lg font-medium text-center'>
								Tokens Claimed Successfully
							</h3>
							{amount > 0 && (
								<p className='text-sm text-gray-500 text-center mt-1'>
									{amount} {tokenSymbol} tokens have been sent to your wallet
								</p>
							)}
							{txId && (
								<div className='mt-4 text-center'>
									<p className='text-sm text-gray-500'>Transaction ID:</p>
									<p className='text-xs font-mono break-all mt-1 bg-gray-50 p-2 rounded border'>
										{txId}
									</p>
								</div>
							)}
						</div>
					) : (
						<>
							<div className='flex flex-col items-center justify-center py-2'>
								<div ref={qrRef} className='bg-white p-4 rounded-lg'>
									<QRCodeSVG
										value={claimData}
										size={200}
										bgColor={'#ffffff'}
										fgColor={'#000000'}
										level={'L'}
										includeMargin={false}
									/>
								</div>
								<p className='text-sm text-gray-500 mt-4 text-center'>
									This QR code contains the information needed to claim your
									tokens
								</p>
							</div>
						</>
					)}

					<DialogFooter className='flex flex-col gap-2 sm:flex-row mt-2'>
						{!claimed ? (
							<>
								<div className='grid w-full gap-1.5'>
									<p className='text-sm text-gray-500'>
										Recipient address: {walletAddress || 'Not set'}
									</p>
								</div>
								<Button
									type='button'
									variant='outline'
									onClick={() => setIsOpen(false)}
								>
									Cancel
								</Button>
							</>
						) : (
							<Button
								type='button'
								onClick={() => setIsOpen(false)}
								className='w-full'
							>
								Close
							</Button>
						)}
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
