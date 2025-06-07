'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown, Home, LogOut, User } from 'lucide-react';
import axios from '@/lib/axios';
import Image from 'next/image';

interface MainNavProps {
	className?: string;
}

interface UserData {
	username: string;
	name: string;
}

const MainNav: React.FC<MainNavProps> = ({ className }) => {
	const [isScrolled, setIsScrolled] = useState(false);
	const [isVisible, setIsVisible] = useState(true);
	const [lastScrollY, setLastScrollY] = useState(0);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [user, setUser] = useState<UserData | null>(null);
	const pathname = usePathname();
	const router = useRouter();

	// Check if user is logged in when component mounts
	useEffect(() => {
		const checkLoggedInStatus = () => {
			const token = localStorage.getItem('token');
			console.log(token);
			if (token) {
				setIsLoggedIn(true);
				axios
					.get('/auth/current-user')
					.then((res) => {
						console.log('User data:', res.data.data);
						setUser(res.data.data);
					})
					.catch((error) => {
						console.error('Error fetching user data:', error);
						setIsLoggedIn(false);
					});
			} else {
				setIsLoggedIn(false);
			}
		};

		// Only run in browser environment
		if (typeof window !== 'undefined') {
			checkLoggedInStatus();
		}
	}, []);

	useEffect(() => {
		const controlNavbar = () => {
			if (typeof window !== 'undefined') {
				if (window.scrollY > 50) {
					setIsScrolled(true);
				} else {
					setIsScrolled(false);
				}

				if (window.scrollY > lastScrollY + 20) {
					setIsVisible(false);
				} else if (window.scrollY < lastScrollY - 20) {
					setIsVisible(true);
				}

				setLastScrollY(window.scrollY);
			}
		};

		window.addEventListener('scroll', controlNavbar);

		// Cleanup event listener
		return () => {
			window.removeEventListener('scroll', controlNavbar);
		};
	}, [lastScrollY]);

	const handleLogout = () => {
		// Clear auth token and user data
		localStorage.removeItem('token');

		// Update state
		setIsLoggedIn(false);

		// Redirect to home page
		router.push('/');
	};

	// Get initial letters for avatar fallback
	const getInitials = (name: string) => {
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	};

	return (
		<nav
			className={cn(
				'fixed top-4 w-11/12 max-w-6xl mx-auto left-0 right-0 z-50 px-6 py-4 transition-all duration-300 rounded-full',
				isScrolled
					? 'bg-white/50 backdrop-blur-sm shadow-md'
					: 'bg-transparent',
				isVisible ? 'transform translate-y-0' : 'transform -translate-y-[150%]',
				className
			)}
		>
			<div className='flex items-center justify-between'>
				<Link href='/' className='font-bold text-xl text-primary'>
					<Image
						src='/images/super.png'
						alt='SuperPage Logo'
						width={48}
						height={48}
						className='mr-2'
					/>
				</Link>

				<div className='flex items-center space-x-4'>
					{isLoggedIn && user ? (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant='ghost'
									className='flex items-center gap-2 px-3 hover:bg-secondary'
								>
									<span>@{user.username}</span>
									<ChevronDown className='h-4 w-4 text-muted-foreground' />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align='end' className='w-56'>
								<Link href={`/home`}>
									<DropdownMenuItem className='cursor-pointer'>
										<Home className='mr-2 h-4 w-4' />
										<span>Home</span>
									</DropdownMenuItem>
									<DropdownMenuItem className='cursor-pointer'>
										<User className='mr-2 h-4 w-4' />
										<span>My Profile</span>
									</DropdownMenuItem>
								</Link>

								<DropdownMenuSeparator />

								<DropdownMenuItem
									className='cursor-pointer text-red-600 focus:text-red-600'
									onClick={handleLogout}
								>
									<LogOut className='mr-2 h-4 w-4' />
									<span>Log out</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						<>
							<Link
								href='/login'
								className={cn(
									'px-4 py-2 rounded-md transition-colors',
									'hover:bg-primary/10',
									pathname === '/login'
										? 'font-medium text-primary'
										: 'text-gray-700'
								)}
							>
								Log in
							</Link>

							<Link
								href='/register'
								className={cn(
									'px-4 py-2 text-white bg-primary rounded-full',
									'hover:bg-orange/90 transition-colors'
								)}
							>
								Register
							</Link>
						</>
					)}
				</div>
			</div>
		</nav>
	);
};

export default MainNav;
