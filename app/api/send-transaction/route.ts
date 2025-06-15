import { NextRequest, NextResponse } from 'next/server';
import { PrivyClient } from '@privy-io/server-auth';

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { to, value, data, chainId = 1 } = body;

		// Validate required fields
		if (!to) {
			return NextResponse.json(
				{ error: 'Recipient address is required' },
				{ status: 400 }
			);
		}

		// Get auth token from cookies or headers
		const authToken =
			request.cookies.get('privy-token')?.value ||
			request.headers.get('authorization')?.replace('Bearer ', '');

		if (!authToken) {
			return NextResponse.json(
				{ error: 'No auth token provided' },
				{ status: 401 }
			);
		}

		// Verify the Privy auth token
		const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
		const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;

		if (!PRIVY_APP_ID || !PRIVY_APP_SECRET) {
			return NextResponse.json(
				{ error: 'Privy configuration missing' },
				{ status: 500 }
			);
		}

		const client = new PrivyClient(PRIVY_APP_ID, PRIVY_APP_SECRET);

		// Verify user and get embedded wallet
		const claims = await client.verifyAuthToken(authToken);
		const userId = claims.userId;

		const user = await client.getUser(userId);
		const embeddedWallet = user.linkedAccounts.find(
			(account) =>
				account.type === 'wallet' && account.walletClientType === 'privy'
		);

		if (!embeddedWallet) {
			return NextResponse.json(
				{
					error: 'No embedded wallet found for user',
				},
				{ status: 400 }
			);
		}

		// Prepare transaction data
		const transactionData = {
			to,
			value: value || '0',
			data: data || '0x',
			chainId,
		};

		// Send transaction using Privy SDK
		const { hash, caip2 } = await client.walletApi.ethereum.sendTransaction({
			walletId: 'insert-wallet-id',
			caip2: 'eip155:8453',
			transaction: {
				to: '0xE3070d3e4309afA3bC9a6b057685743CF42da77C',
				value: '0x2386F26FC10000',
				chainId: 8453,
			},
		});
		return NextResponse.json({
			success: true,
			transactionHash: hash,
			caip2,
		});
	} catch (error) {
		console.error('Transaction error:', error);

		// Handle specific Privy errors
		if (error.message?.includes('insufficient funds')) {
			return NextResponse.json(
				{
					error: 'Insufficient funds in wallet',
				},
				{ status: 400 }
			);
		}

		if (error.message?.includes('invalid address')) {
			return NextResponse.json(
				{
					error: 'Invalid recipient address',
				},
				{ status: 400 }
			);
		}

		return NextResponse.json(
			{
				error: 'Failed to send transaction',
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
