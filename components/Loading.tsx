import React from 'react';
import Image from 'next/image';

interface LoadingProps {
	fullScreen?: boolean;
	message?: string;
}

export default function Loading({
	fullScreen = true,
	message = 'Loading...',
}: LoadingProps) {
	return (
		<div
			className={`flex flex-col items-center justify-center ${
				fullScreen ? 'min-h-screen' : 'h-full py-12'
			}`}
		>
			<div className='flex flex-col items-center'>
				{/* Logo with pulse animation */}
				<div className='relative w-16 h-16 mb-6'>
					<div className='absolute inset-0 rounded-full bg-primary/10 animate-ping'></div>
					<div className='relative z-10'>
						<Image
							src='/images/super.png'
							alt='SuperPage'
							width={64}
							height={64}
							className='rounded-full'
						/>
					</div>
				</div>

				{/* Spinner animation */}
				<div className='flex space-x-1 mb-4'>
					<div
						className='w-2 h-2 bg-primary rounded-full animate-bounce'
						style={{ animationDelay: '0ms' }}
					></div>
					<div
						className='w-2 h-2 bg-primary rounded-full animate-bounce'
						style={{ animationDelay: '150ms' }}
					></div>
					<div
						className='w-2 h-2 bg-primary rounded-full animate-bounce'
						style={{ animationDelay: '300ms' }}
					></div>
				</div>

				{/* Message */}
				<p className='text-sm text-gray-500 animate-pulse'>{message}</p>
			</div>
		</div>
	);
}
