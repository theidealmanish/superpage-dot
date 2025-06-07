'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserRoundPlus, Chrome, Coins, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const howItWorks = [
	{
		title: 'Create Your Superpage Profile',
		description:
			'Creators, begin by setting up your personalized Superpa.ge profile. Link all your social media accounts to consolidate your online presence. Share your links easily, making it simple for fans to find all your content.',
		icon: <UserRoundPlus className='h-6 w-6' />,
		cta: 'Create Profile',
		link: '/register',
	},
	{
		title: 'Install the Superpay Chrome Extension',
		description:
			"Fans, download the Superpay Chrome extension to unlock instant support. A 'Superpay' button will appear on supported social media platforms. Click it to send direct, secure, and instant web3 tips.",
		icon: <Chrome className='h-6 w-6' />,
		cta: 'Install Extension',
		link: 'https://chrome.google.com/webstore',
	},
	{
		title: 'Connect and Support Directly',
		description:
			"Experience the power of direct support. Your tips go straight to the creator's web3 address, ensuring transparency and eliminating middlemen. Explore exclusive content, NFTs, and tiered memberships to deepen your engagement.",
		icon: <Coins className='h-6 w-6' />,
		cta: 'Learn More',
		link: '/about',
	},
];

export default function HowItWorks() {
	const [activeIndex, setActiveIndex] = useState(0);

	return (
		<section
			id='how-it-works'
			className='py-10 sm:py-16 md:py-20 bg-background'
		>
			<div className='container px-4 sm:px-6'>
				<div className='text-center mb-8 sm:mb-12'>
					<h2 className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter'>
						How It Works
					</h2>
					<p className='mt-3 sm:mt-4 text-muted-foreground max-w-2xl mx-auto px-4'>
						Superpage makes supporting creators simple and direct through web3
						technology.
					</p>
				</div>

				{/* Tabs for all screen sizes */}
				<div className='flex justify-center mb-8 overflow-x-auto scrollbar-hide'>
					<div className='flex gap-2 p-1'>
						{howItWorks.map((step, index) => (
							<button
								key={index}
								onClick={() => setActiveIndex(index)}
								className={cn(
									'flex items-center gap-2 px-4 py-2 rounded-full transition-all whitespace-nowrap',
									activeIndex === index
										? 'bg-primary text-primary-foreground'
										: 'bg-muted/50 hover:bg-muted text-foreground'
								)}
							>
								<div className='flex items-center justify-center'>
									{step.icon}
								</div>
								<span className='font-medium'>{step.title}</span>
							</button>
						))}
					</div>
				</div>

				{/* Content area */}
				<div className='max-w-5xl mx-auto'>
					<Card className='overflow-hidden border border-border/50'>
						<motion.div
							key={activeIndex}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.3 }}
							className='w-full'
						>
							<div className='flex flex-col lg:flex-row items-center'>
								{/* Content - Below image on mobile, right side on desktop */}
								<div className='w-full lg:w-1/2 lg:order-1 p-6 sm:p-8'>
									<div className='space-y-4'>
										<div className='inline-flex items-center justify-center rounded-full bg-primary/10 text-primary px-3 py-1 text-sm font-medium'>
											Step {activeIndex + 1}
										</div>

										<h3 className='text-xl sm:text-2xl font-bold'>
											{howItWorks[activeIndex].title}
										</h3>

										<p className='text-muted-foreground text-sm sm:text-base'>
											{howItWorks[activeIndex].description}
										</p>

										<Button
											variant='default'
											className='mt-2 rounded-full'
											asChild
										>
											<a href={howItWorks[activeIndex].link}>
												{howItWorks[activeIndex].cta}{' '}
												<ArrowRight className='ml-2 h-4 w-4' />
											</a>
										</Button>
									</div>
								</div>
							</div>
						</motion.div>
					</Card>
				</div>

				{/* Step indicator dots */}
				<div className='flex justify-center mt-6'>
					{howItWorks.map((_, index) => (
						<button
							key={index}
							onClick={() => setActiveIndex(index)}
							className={cn(
								'w-3 h-3 mx-1 rounded-full transition-all',
								activeIndex === index
									? 'bg-primary scale-110'
									: 'bg-muted hover:bg-primary/50'
							)}
							aria-label={`Go to step ${index + 1}`}
						/>
					))}
				</div>
			</div>
		</section>
	);
}
