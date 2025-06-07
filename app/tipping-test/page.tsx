'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
	Select,
	SelectTrigger,
	SelectContent,
	SelectItem,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner'; // or any toast lib
import { SuperPageTippingClient } from '@/lib/SuperPageTippingContract'; // Adjust import path!
import { ethers } from 'ethers';

const TOKENS = [
	{
		symbol: 'ETH',
		address: '0x0000000000000000000000000000000000000000', // Native ETH, use payable for tips
		decimals: 18,
	},
	{
		symbol: 'USDC',
		address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Fill in for the current network!
		decimals: 6,
	},
];

// Helper to get signer from MetaMask
const getSigner = async () => {
	if (typeof window !== 'undefined' && (window as any).ethereum) {
		const provider = new ethers.BrowserProvider((window as any).ethereum);
		return await provider.getSigner();
	}
	throw new Error('No Ethereum wallet found');
};

export default function TipPage() {
	const [selectedToken, setSelectedToken] = React.useState(TOKENS[0]);
	const [amount, setAmount] = React.useState('');
	const [loading, setLoading] = React.useState(false);
	const [creator, setCreator] = React.useState(''); // Or set this programmatically

	// Example: Set default creator address for demo
	React.useEffect(() => {
		setCreator('0xCreatorAddress');
	}, []);

	const handleTip = async () => {
		setLoading(true);
		try {
			if (!creator) throw new Error('Creator address not set');
			if (!amount || isNaN(Number(amount)) || Number(amount) <= 0)
				throw new Error('Invalid amount');
			const signer = await getSigner();
			const tipping = new SuperPageTippingClient(signer);

			let tipAmount;
			if (selectedToken.symbol === 'ETH') {
				// For native ETH, you'd need a different contract or payable fallback, skip for now
				toast.error('ETH tipping not implemented in this contract. Use USDC.');
				setLoading(false);
				return;
			} else {
				// USDC or ERC20
				tipAmount = BigInt(
					Math.floor(Number(amount) * 10 ** selectedToken.decimals)
				);
			}

			// Approve first if needed! (Not shown here, do this in real flow)
			const tx = await tipping.tip(creator, selectedToken.address, tipAmount);
			await tx.wait();

			toast.success('Tip sent!');
		} catch (err: any) {
			toast.error(err.message || 'Error sending tip');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg mt-12 space-y-6'>
			<h2 className='text-2xl font-bold mb-2'>Tip Your Favorite Creator</h2>
			<div className='space-y-2'>
				<label className='block text-gray-700'>Select Token</label>
				<Select
					value={selectedToken.symbol}
					onValueChange={(val) =>
						setSelectedToken(TOKENS.find((t) => t.symbol === val)!)
					}
				>
					<SelectTrigger>{selectedToken.symbol}</SelectTrigger>
					<SelectContent>
						{TOKENS.map((token) => (
							<SelectItem key={token.symbol} value={token.symbol}>
								{token.symbol}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className='space-y-2'>
				<label className='block text-gray-700'>Creator Address</label>
				<Input
					value={creator}
					onChange={(e) => setCreator(e.target.value)}
					placeholder='0xCreatorAddress'
				/>
			</div>

			<div className='space-y-2'>
				<label className='block text-gray-700'>Amount</label>
				<Input
					type='number'
					min='0'
					value={amount}
					onChange={(e) => setAmount(e.target.value)}
					placeholder={`Amount in ${selectedToken.symbol}`}
				/>
			</div>

			<Button onClick={handleTip} disabled={loading}>
				{loading ? 'Sending...' : `Tip ${selectedToken.symbol}`}
			</Button>
		</div>
	);
}
