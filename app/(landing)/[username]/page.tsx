'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

import {
	Globe,
	Twitter,
	Facebook,
	Linkedin,
	Github,
	MapPin,
	Loader2,
	ExternalLink,
	Mail,
	Calendar,
	Youtube,
} from 'lucide-react';
import { getUsername } from '@/lib/getUsername';
import { getProfileFromUsername } from '@/api/profile';
import Loading from '@/components/Loading';

// Define the Profile interface
interface Profile {
	user: {
		_id: string;
		name: string;
		username: string;
		email: string;
		avatar?: string;
		createdAt: Date;
	};
	bio: string;
	country: string;
	socials: {
		x: string;
		youtube: string;
		linkedin: string;
		github: string;
	};
	createdAt: string;
	updatedAt: string;
}

export default function UserProfilePage() {
	const params = useParams();
	const username = getUsername(params.username as string);

	const [profile, setProfile] = useState<Profile | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchProfileData() {
			setIsLoading(true);
			try {
				getProfileFromUsername(username)
					.then((res) => {
						console.log('Profile data:', res.data);
						setError(null);
						setProfile(res.data);
						setIsLoading(false);
					})
					.catch((err) => {
						console.error('Error fetching profile:', err);
						setError('Failed to load profile');
						setIsLoading(false);
					});
			} catch (err) {
				console.error('Error fetching profile:', err);
				setError(err instanceof Error ? err.message : 'Failed to load profile');
				setIsLoading(false);
			}
		}

		if (username) {
			fetchProfileData();
		}
	}, [username]);

	// Handle loading state
	if (isLoading) {
		return <Loading />;
	}

	// Handle error state
	if (error || !profile) {
		return (
			<div className='min-h-screen flex items-center justify-center p-4'>
				<div className='text-center max-w-md'>
					<h1 className='text-2xl font-bold mb-2'>Profile Not Found</h1>
					<p className='text-muted-foreground mb-6'>
						The profile you're looking for doesn't exist or is unavailable.
					</p>
					<Button asChild>
						<Link href='/'>Return Home</Link>
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen flex flex-col items-center py-12 px-4 bg-gray-50 '>
			<div className='w-full max-w-md mx-auto mt-16'>
				{/* Profile Header */}
				<div className='flex flex-col items-center text-center mb-8'>
					{/* Avatar */}
					<div className='mb-4'>
						<div className='h-24 w-24 rounded-full overflow-hidden border-4 border-white shadow-md'>
							{profile.user?.avatar ? (
								<Image
									src={profile.user.avatar}
									alt={profile.user.name}
									width={96}
									height={96}
									className='object-cover'
								/>
							) : (
								<div className='bg-gradient-to-br from-primary to-primary/70 h-full w-full flex items-center justify-center text-2xl font-bold text-white'>
									{profile.user.name.charAt(0).toUpperCase()}
								</div>
							)}
						</div>
					</div>

					{/* Profile Name and Username */}
					<h1 className='text-2xl font-bold'>{profile.user.name}</h1>
					<p className='text-muted-foreground mb-2'>@{profile.user.username}</p>

					{/* Location if available */}
					{profile.country && (
						<div className='flex items-center justify-center text-sm text-muted-foreground mb-4'>
							<div className='mr-6 flex items-center'>
								<MapPin className='h-4 w-4 mr-1' />
								<span>{profile.country}</span>
							</div>
							<div className='flex items-center'>
								<Calendar className='h-4 w-4 mr-1' />
								<p className='text-sm text-muted-foreground'>
									Joined{' '}
									{new Intl.DateTimeFormat('en-US', {
										year: 'numeric',
										month: 'long',
										day: 'numeric',
									}).format(new Date(profile.user.createdAt))}
								</p>
							</div>
						</div>
					)}

					{/* Bio */}
					{profile.bio && (
						<p className='text-center max-w-md mb-6'>{profile.bio}</p>
					)}
				</div>
				<div className='space-y-3'>
					{/* Email Button */}
					<Button
						variant='outline'
						className='w-full bg-white hover:bg-gray-100 h-12'
						asChild
					>
						<a
							href={`mailto:${profile.user.email}`}
							target='_blank'
							rel='noopener noreferrer'
						>
							<Mail className='h-5 w-5 mr-2' />
							Contact via Email
							<ExternalLink className='h-4 w-4 ml-auto' />
						</a>
					</Button>

					{/* Social Media Links */}
					{profile.socials?.x && (
						<Button
							variant='outline'
							className='w-full bg-white hover:bg-[#1DA1F2]/10 border-[#1DA1F2]/30 h-12'
							asChild
						>
							<a
								href={`https://x.com/${profile.socials.x}`}
								target='_blank'
								rel='noopener noreferrer'
							>
								<Twitter className='h-5 w-5 mr-2 text-[#1DA1F2]' />
								Twitter (X)
								<ExternalLink className='h-4 w-4 ml-auto' />
							</a>
						</Button>
					)}

					{profile.socials?.github && (
						<Button
							variant='outline'
							className='w-full bg-white hover:bg-gray-100 h-12'
							asChild
						>
							<a
								href={`https://github.com/${profile.socials.github}`}
								target='_blank'
								rel='noopener noreferrer'
							>
								<Github className='h-5 w-5 mr-2' />
								GitHub
								<ExternalLink className='h-4 w-4 ml-auto' />
							</a>
						</Button>
					)}

					{profile.socials?.linkedin && (
						<Button
							variant='outline'
							className='w-full bg-white hover:bg-[#0A66C2]/10 border-[#0A66C2]/30 h-12'
							asChild
						>
							<a
								href={`https://linkedin.com/in/${profile.socials.linkedin}`}
								target='_blank'
								rel='noopener noreferrer'
							>
								<Linkedin className='h-5 w-5 mr-2 text-[#0A66C2]' />
								LinkedIn
								<ExternalLink className='h-4 w-4 ml-auto' />
							</a>
						</Button>
					)}

					{profile.socials?.youtube && (
						<Button
							variant='outline'
							className='w-full bg-white hover:bg-[#1877F2]/10 border-[#1877F2]/30 h-12'
							asChild
						>
							<a
								href={`https://www.youtube.com/@${profile.socials.youtube}`}
								target='_blank'
								rel='noopener noreferrer'
							>
								<Youtube className='h-5 w-5 mr-2 text-[#1877F2]' />
								Youtube
								<ExternalLink className='h-4 w-4 ml-auto' />
							</a>
						</Button>
					)}
				</div>

				{/* Coming Soon Features Card */}
				<div className='mt-12'>
					<div className='bg-white rounded-xl shadow-sm border p-6 transition-all hover:shadow-md'>
						<h2 className='text-xl font-semibold mb-4 flex items-center'>
							<span className='mr-2'>✨</span> Coming Soon Features
						</h2>

						<div className='space-y-4'>
							<div className='flex items-start'>
								<span className='text-2xl mr-3'>🎨</span>
								<div>
									<h3 className='font-medium'>NFT Social Media Content</h3>
									<p className='text-sm text-muted-foreground'>
										Create and sell digital art as NFTs directly from your
										profile.
									</p>
								</div>
							</div>

							<div className='flex items-start'>
								<span className='text-2xl mr-3'>💰</span>
								<div>
									<h3 className='font-medium'>Recurring Subscriptions</h3>
									<p className='text-sm text-muted-foreground'>
										Offer premium content to your subscribers with monthly
										membership plans.
									</p>
								</div>
							</div>

							<div className='flex items-start'>
								<span className='text-2xl mr-3'>🛍️</span>
								<div>
									<h3 className='font-medium'>Digital Stores</h3>
									<p className='text-sm text-muted-foreground'>
										Set up your own store to sell digital products and
										merchandise.
									</p>
								</div>
							</div>

							{/* Animated "Live" indicator */}
							<div className='mt-6 flex items-center'>
								<span className='relative flex h-3 w-3 mr-2'>
									<span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75'></span>
									<span className='relative inline-flex rounded-full h-3 w-3 bg-green-500'></span>
								</span>
								<span className='text-sm font-medium text-green-600'>
									In active development
								</span>
							</div>

							{/* Early access signup button */}
							<Button
								className='w-full mt-2'
								onClick={() =>
									window.alert(
										'Thanks for your interest! Early access signup will be available soon.'
									)
								}
							>
								Get Early Access
							</Button>
						</div>
					</div>
				</div>

				<div className='mt-12 text-center'>
					<p className='text-sm text-muted-foreground mt-1'>
						Powered by <span className='font-medium'>SuperPage</span>
					</p>
				</div>
			</div>
		</div>
	);
}
