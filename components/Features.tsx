'use client';

import { useRef } from 'react';
import {
	User,
	Chrome,
	Coins,
	Crown,
	ImageIcon,
	BarChart4,
	ChevronLeft,
	ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Feature data with icons
const features = [
	{
		title: 'Unified Creator Profiles',
		description:
			'Consolidate your social media presence into a single, seamless hub. Link your YouTube, GitHub, Instagram, and more, making it effortless for fans to discover and support your work across all platforms.',
		icon: <User className='h-6 w-6' />,
		color: 'bg-blue-500/10 text-blue-500',
	},
	{
		title: 'Superpay Chrome Extension',
		description:
			"Instantly empower creators with the 'Superpay' button on your favorite social platforms. Send direct, secure, and instant web3 tips, bypassing traditional middlemen and ensuring your support reaches creators directly.",
		icon: <Chrome className='h-6 w-6' />,
		color: 'bg-purple-500/10 text-purple-500',
	},
	{
		title: 'Web3 Powered Transactions',
		description:
			'Experience the transparency and security of blockchain technology. All transactions are conducted via web3 addresses, ensuring direct, low-fee, and trustworthy interactions between creators and supporters.',
		icon: <Coins className='h-6 w-6' />,
		color: 'bg-green-500/10 text-green-500',
	},
	{
		title: 'Tiered Memberships & Exclusive Content',
		description:
			'Unlock exclusive content and perks by supporting creators through tiered memberships. Gain access to behind-the-scenes content, personalized experiences, and deeper connections with your favorite creators.',
		icon: <Crown className='h-6 w-6' />,
		image: '/images/membership-icon.svg',
		color: 'bg-amber-500/10 text-amber-500',
	},
	{
		title: 'NFT Integration',
		description:
			'Own a piece of digital history. Creators can mint and sell NFTs, representing exclusive content, digital art, or unique experiences. Collect and trade these digital assets, showing your support in a tangible and innovative way.',
		icon: <ImageIcon className='h-6 w-6' />,
		image: '/images/nft-icon.svg',
		color: 'bg-pink-500/10 text-pink-500',
	},
	{
		title: 'Creator Analytics and Insights',
		description:
			'Creators, gain valuable insights into your audience and earnings. Track your performance, understand your supporters, and optimize your content strategy to maximize your impact.',
		icon: <BarChart4 className='h-6 w-6' />,
		image: '/images/analytics-icon.svg',
		color: 'bg-indigo-500/10 text-indigo-500',
	},
];

export default function Features() {
	const carouselRef = useRef<HTMLDivElement>(null);

	return (
		<section id='features' className='py-16 md:py-24'>
			<div className='container px-4 md:px-6'>
				<div className='text-center mb-12'>
					<Badge variant='outline' className='mb-2'>
						Powerful Features
					</Badge>
					<h2 className='text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4'>
						Everything You Need to{' '}
						<span className='text-primary'>Create & Support</span>
					</h2>
					<p className='text-muted-foreground max-w-3xl mx-auto'>
						Superpa.ge empowers creators and supporters with innovative tools
						for direct engagement, interactive, and meaningful connections.
					</p>
				</div>

				{/* Feature Grid - Desktop & Tablet */}
				<div className='hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6'>
					{features.map((feature, index) => (
						<Card
							key={index}
							className={cn(
								'h-full transition-all duration-200 border overflow-hidden hover:shadow-md',
								'group',
								'border-border hover:border-primary/50'
							)}
						>
							<CardContent className='p-6 flex flex-col h-full'>
								<div
									className={cn(
										'w-12 h-12 rounded-lg flex items-center justify-center mb-6 transition-transform group-hover:scale-110',
										feature.color
									)}
								>
									{feature.icon}
								</div>
								<div className='flex-1 flex flex-col'>
									<h3 className='text-xl font-semibold mb-3'>
										{feature.title}
									</h3>
									<p className='text-muted-foreground text-sm flex-grow'>
										{feature.description}
									</p>
								</div>
							</CardContent>
						</Card>
					))}
				</div>

				{/* Feature Showcase - Mobile Only */}
				<div className='sm:hidden mt-8'>
					<div className='relative'>
						<div
							className='flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-4 pb-6'
							ref={carouselRef}
						>
							{features.map((feature, index) => (
								<div
									key={index}
									className='snap-center shrink-0 w-[85%] max-w-sm'
								>
									<Card
										className={cn(
											'h-full cursor-pointer transition-all',

											'border-muted'
										)}
									>
										<CardContent className='p-6 flex flex-col h-full'>
											<div
												className={cn(
													'w-12 h-12 rounded-lg flex items-center justify-center mb-4',
													feature.color
												)}
											>
												{feature.icon}
											</div>
											<h3 className='text-xl font-semibold mb-2'>
												{feature.title}
											</h3>
											<p className='text-muted-foreground text-sm flex-grow'>
												{feature.description}
											</p>
										</CardContent>
									</Card>
								</div>
							))}
						</div>

						{/* Navigation buttons - Mobile */}
						<div className='mt-6 flex justify-center items-center gap-4'>
							<Button variant='outline' size='icon' className='rounded-full'>
								<ChevronLeft className='h-5 w-5' />
							</Button>
							<div className='flex gap-1.5'>
								{features.map((_, index) => (
									<button
										key={index}
										aria-label={`Go to feature ${index + 1}`}
									/>
								))}
							</div>
							<Button variant='outline' size='icon' className='rounded-full'>
								<ChevronRight className='h-5 w-5' />
							</Button>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
