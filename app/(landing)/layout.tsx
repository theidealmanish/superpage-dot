import type { Metadata } from 'next';
import '../globals.css';
import MainNav from '@/components/layout/MainNav';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
	title: 'SuperPage',
	description: 'Your front page on internet and web3',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<>
			<MainNav />
			<main>{children}</main>
			<Toaster richColors />
		</>
	);
}
