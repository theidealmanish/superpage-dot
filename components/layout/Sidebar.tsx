import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation'; // Add useRouter
import {
	Home,
	User,
	Bell,
	Compass,
	Trophy,
	Globe,
	Menu,
	Coins,
	StoreIcon,
	Store,
	LogOut, // Add LogOut icon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUserProfile } from '@/hooks/useUserProfile';
import { toast } from 'sonner'; // Import toast for notifications
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'; // Import dropdown components

const navigation = [
	{ name: 'Home', icon: Home, href: '/home' },
	// { name: 'Explore', icon: Compass, href: '/explore' },
	{ name: 'Tokens', icon: Coins, href: '/tokens' },
	{ name: 'Loyalties', icon: Trophy, href: '/loyalties' },
	{ name: 'Notifications', icon: Bell, href: '/notifications' },
	{ name: 'Marketplace', icon: Store, href: '/marketplace' },
	// { name: 'Bounties', icon: Globe, href: '/bounties' },
	{ name: 'Profile', icon: User, href: '/profile' },
];

export const NavContent = () => {
	const pathname = usePathname();
	const router = useRouter();
	const { data: userProfile, isLoading } = useUserProfile();

	// Function to handle logout
	const handleLogout = () => {
		// Clear authentication token
		localStorage.removeItem('token');
		// Show success message
		toast.success('Logged out successfully');
		// Redirect to login page
		router.push('/login');
	};

	return (
		<div className='flex h-full flex-col justify-between'>
			<div className='space-y-2'>
				<Link href='/home' className='flex items-center p-3 mb-6'>
					<Image
						src='/images/super.png'
						alt='Logo'
						width={48}
						height={48}
						className='rounded-full'
					/>
					<span className='sr-only'>SuperPage</span>
				</Link>

				<nav className='flex flex-col space-y-1'>
					{navigation.map((item) => {
						const isActive = pathname === item.href;
						return (
							<Link
								key={item.name}
								href={item.href}
								className={cn(
									'flex items-center justify-center lg:justify-start px-3 py-3 text-gray-700 rounded-full hover:bg-gray-100 transition-colors',
									isActive && 'font-medium bg-gray-100'
								)}
							>
								<item.icon
									className={cn(
										'h-6 w-6',
										isActive ? 'text-primary' : 'text-gray-500'
									)}
								/>
								<span className='lg:ml-4 ml-0 text-lg hidden lg:inline-block'>
									{item.name}
								</span>
							</Link>
						);
					})}
				</nav>

				<Button
					className='mt-4 rounded-full flex lg:hidden justify-center items-center p-3 w-12 h-12 mx-auto'
					size='icon'
				>
					<svg
						width='24'
						height='24'
						viewBox='0 0 24 24'
						fill='none'
						xmlns='http://www.w3.org/2000/svg'
					>
						<path
							d='M22 2L11 13'
							stroke='white'
							strokeWidth='2'
							strokeLinecap='round'
							strokeLinejoin='round'
						/>
						<path
							d='M22 2L15 22L11 13L2 9L22 2Z'
							stroke='white'
							strokeWidth='2'
							strokeLinecap='round'
							strokeLinejoin='round'
						/>
					</svg>
				</Button>
			</div>

			<div className='mt-auto mb-4'>
				{isLoading ? (
					<div className='p-3 flex items-center'>
						<div className='w-10 h-10 rounded-full bg-gray-200 animate-pulse'></div>
						<div className='ml-3 hidden lg:block'>
							<div className='h-4 w-24 bg-gray-200 rounded animate-pulse'></div>
							<div className='h-3 w-16 bg-gray-200 rounded mt-1 animate-pulse'></div>
						</div>
					</div>
				) : (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<div className='flex items-center p-3 rounded-full hover:bg-gray-100 transition-colors cursor-pointer'>
								<Avatar>
									<AvatarImage src={userProfile?.user?.avatarUrl} />
									<AvatarFallback>
										{userProfile?.user?.name?.substring(0, 2) || '??'}
									</AvatarFallback>
								</Avatar>

								<div className='ml-3 hidden lg:block'>
									<p className='font-medium text-sm'>
										{userProfile?.user?.name}
									</p>
									<p className='text-gray-500 text-sm'>
										@{userProfile?.user?.username}
									</p>
								</div>

								<div className='ml-auto hidden lg:block'>
									<svg
										width='16'
										height='16'
										viewBox='0 0 16 16'
										fill='none'
										xmlns='http://www.w3.org/2000/svg'
									>
										<path d='M8 10L12 6L4 6L8 10Z' fill='#6B7280' />
									</svg>
								</div>
							</div>
						</DropdownMenuTrigger>
						<DropdownMenuContent className='w-56' align='end' forceMount>
							<DropdownMenuLabel>My Account</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuGroup>
								<DropdownMenuItem onClick={() => router.push('/profile')}>
									<User className='mr-2 h-4 w-4' />
									<span>Profile</span>
								</DropdownMenuItem>
							</DropdownMenuGroup>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onClick={handleLogout}
								className='text-red-600 focus:text-red-600'
							>
								<LogOut className='mr-2 h-4 w-4' />
								<span>Logout</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				)}
			</div>
		</div>
	);
};

export const DesktopSidebar = () => {
	return (
		<div className='hidden sticky top-0 left-0 h-screen sm:flex sm:flex-col border-r border-gray-200 w-[80px] lg:w-[280px] p-2'>
			<NavContent />
		</div>
	);
};

export const MobileSidebar = () => {
	const pathname = usePathname();

	return (
		<div className='sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 p-2'>
			<div className='flex justify-around'>
				{navigation.slice(0, 5).map((item) => {
					const isActive = pathname === item.href;
					return (
						<Link
							key={item.name}
							href={item.href}
							className='flex flex-col items-center px-3 py-2'
						>
							<item.icon
								className={cn(
									'h-6 w-6',
									isActive ? 'text-primary' : 'text-gray-500'
								)}
							/>
						</Link>
					);
				})}

				<Sheet>
					<SheetTrigger asChild>
						<Button variant='ghost' size='icon' className='rounded-full'>
							<Menu className='h-6 w-6 text-gray-500' />
						</Button>
					</SheetTrigger>
					<SheetContent side='left' className='p-0 w-[280px]'>
						<div className='h-full'>
							<NavContent />
						</div>
					</SheetContent>
				</Sheet>
			</div>
		</div>
	);
};
