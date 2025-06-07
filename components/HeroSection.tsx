'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface HeroSectionProps {
	className?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ className }) => {
	const [username, setUsername] = useState('');
	const [isChecking, setIsChecking] = useState(false);
	const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
	const router = useRouter();

	const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''));
		setIsAvailable(null);
	};

	const checkAvailability = async () => {
		if (!username) return;

		setIsChecking(true);

		try {
			// Mock API call - replace with your actual API
			await new Promise((resolve) => setTimeout(resolve, 800));
			const isUsernameTaken = ['admin', 'superpage', 'test'].includes(username);

			if (isUsernameTaken) {
				setIsAvailable(false);
				toast.error('This username is already taken');
			}

			if (!isUsernameTaken) {
				router.push(`/register?username=${username}`);
			}
		} catch (error) {
			toast.error('Error checking username availability. Please try again.');
			setIsAvailable(false);
		} finally {
			setIsChecking(false);
		}
	};

	return (
		<div
			className={cn(
				'relative min-h-[90vh] w-full flex items-center justify-center overflow-hidden',
				className
			)}
		>
			{/* Gradient background */}
			<div className='absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-background z-0'></div>

			{/* Decorative elements */}
			<div className='absolute top-20 left-10 w-64 h-64 rounded-full bg-primary/10 blur-3xl'></div>
			<div className='absolute bottom-10 right-10 w-80 h-80 rounded-full bg-primary/20 blur-3xl'></div>

			{/* Content container */}
			<div className='relative z-10 container mx-auto px-4 py-12 sm:px-6 lg:px-8 text-center'>
				<div className='max-w-3xl mx-auto'>
					<h1 className='text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-primary'>
						Superpage: Your frontpage on the web3
					</h1>

					<p className='text-xl text-gray-700 mb-10 max-w-2xl mx-auto'>
						Web3 tools for creators and their communities.
					</p>

					{/* Username claim field */}
					<div className='max-w-md mx-auto mb-10'>
						<div className='flex flex-col sm:flex-row gap-3'>
							<div className='relative flex-grow'>
								<div className='p-2 flex items-center border-2 rounded-full overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary bg-white'>
									<span className='pl-4 pr-0 text-gray-800 font-medium text-sm sm:text-base'>
										superpa.ge/
									</span>
									<input
										type='text'
										value={username}
										onChange={handleUsernameChange}
										placeholder='your_username'
										autoComplete='off'
										className='border-0 focus:ring-0 focus:outline-none w-full px-2 py-1 text-gray-900 placeholder:text-gray-400'
									/>
								</div>
							</div>

							<Button
								onClick={checkAvailability}
								className='p-6 bg-primary cursor-pointer text-white font-medium rounded-full'
							>
								{isChecking ? <>Checking...</> : <>Claim It</>}
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* Wave pattern at the bottom */}
			<div className='absolute bottom-0 left-0 right-0 h-16 bg-wave-pattern bg-repeat-x bg-contain opacity-10'></div>
		</div>
	);
};

export default HeroSection;
