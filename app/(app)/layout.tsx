'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import '@/app/globals.css';
import { DesktopSidebar, MobileSidebar } from '@/components/layout/Sidebar';
import { QueryProvider } from '@/providers/QueryProvider';
import Loading from '@/components/Loading';

interface AuthLayoutProps {
	children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
	const pathname = usePathname();
	const router = useRouter();
	const [isLoading, setIsLoading] = React.useState(true);

	// check if the token exists in local storage
	React.useEffect(() => {
		// Use try-catch for safety with localStorage
		try {
			const token = localStorage.getItem('token');

			if (!token && pathname !== '/login') {
				router.push('/login');
			} else {
				setIsLoading(false);
			}
		} catch (error) {
			console.error('Error accessing localStorage:', error);
			setIsLoading(false);
		}
	}, [pathname, router]);

	if (isLoading) {
		return <Loading />;
	}

	return (
		<QueryProvider>
			<div className='flex min-h-screen'>
				<DesktopSidebar />
				<MobileSidebar />

				{/* Main Content */}
				<div className='flex-1'>{children}</div>
			</div>
		</QueryProvider>
	);
}
