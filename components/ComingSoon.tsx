'use client';

import React from 'react';
import { RocketIcon } from 'lucide-react';

interface ComingSoonProps {
	title?: string;
	description?: string;
}

export default function ComingSoon({
	title = 'Coming Soon',
	description = 'This feature is currently under development',
}: ComingSoonProps) {
	return (
		<div className='h-full w-full flex flex-col items-center justify-center p-8 text-center'>
			<div className='bg-primary/10 p-4 rounded-full mb-6'>
				<span className='text-5xl text-primary'>🚀</span>
			</div>

			<h2 className='text-3xl font-bold text-gray-800 mb-3'>{title}</h2>

			<p className='text-gray-500 max-w-md mb-8'>{description}</p>

			<div className='flex space-x-3 mt-2'>
				<div className='h-2 w-2 rounded-full bg-primary/40 animate-pulse'></div>
				<div className='h-2 w-2 rounded-full bg-primary/60 animate-pulse delay-150'></div>
				<div className='h-2 w-2 rounded-full bg-primary/80 animate-pulse delay-300'></div>
			</div>
		</div>
	);
}
