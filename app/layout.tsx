'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import { PrivyProvider } from '@privy-io/react-auth';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

const queryClient = new QueryClient();

export default function App({ children }: { children: React.ReactNode }) {
	return (
		<QueryClientProvider client={queryClient}>
			<html lang='en'>
				<body
					className={`${geistSans.variable} ${geistMono.variable} antialiased`}
				>
					<PrivyProvider
						appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
						config={{
							embeddedWallets: {
								ethereum: {
									createOnLogin: 'all-users',
								},
								solana: {
									createOnLogin: 'all-users',
								},
							},
						}}
					>
						{children}
						<Toaster richColors />
					</PrivyProvider>
				</body>
			</html>
		</QueryClientProvider>
	);
}
