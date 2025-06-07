'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Loading from '@/components/Loading';
import { useForm } from 'react-hook-form';
import {
	Edit2,
	Save,
	Globe,
	MapPin,
	Twitter,
	Youtube,
	Linkedin,
	Github,
	Loader2,
	Copy,
} from 'lucide-react';

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams, useRouter } from 'next/navigation';
import { getUsername } from '@/lib/getUsername';
import { toast } from 'sonner';
import PhantomWalletButton from '@/components/wallet/PhantomWalletButton';

// Define the Profile interface
interface Profile {
	_id?: string;
	user: string;
	bio: string;
	country: string;
	socials: {
		x: string;
		youtube: string;
		linkedin: string;
		github: string;
	};
	wallets: {
		sui: string;
		solana: string;
		ethereum: string;
	};
}

// Create form validation schema
const profileSchema = z.object({
	bio: z
		.string()
		.min(1, { message: 'Bio is required' })
		.max(500, { message: 'Bio must be less than 500 characters' }),
	country: z.string().min(1, { message: 'Please select a country' }),
	socials: z.object({
		x: z.string().optional(),
		youtube: z.string().optional(),
		linkedin: z.string().optional(),
		github: z.string().optional(),
	}),
	wallets: z.object({
		solana: z.string().optional(),
		sui: z.string().optional(),
		ethereum: z.string().optional(),
	}),
});

// List of countries for dropdown
const countries = [
	'United States',
	'Canada',
	'United Kingdom',
	'Australia',
	'Germany',
	'France',
	'Japan',
	'Nepal',
	'India',
	'Brazil',
	'Nigeria',
	'South Africa',
	'China',
	'Russia',
	'Mexico',
	'Spain',
	'Italy',
	'South Korea',
];

const formatWalletAddress = (address: string): string => {
	if (!address) return '';
	if (address.length <= 14) return address;
	return `${address.substring(0, 6)}...${address.substring(
		address.length - 4
	)}`;
};

export default function ProfilePage() {
	const [profile, setProfile] = useState<Profile | null>(null);
	const [user, setUser] = useState<any | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const router = useRouter();

	let { username } = useParams();
	username = getUsername(username);

	const form = useForm<z.infer<typeof profileSchema>>({
		resolver: zodResolver(profileSchema),
		defaultValues: {
			bio: '',
			country: '',
			socials: {
				x: '',
				youtube: '',
				linkedin: '',
				github: '',
			},
			wallets: {
				solana: '',
				sui: '',
				ethereum: '',
			},
		},
	});

	// Fetch profile data
	useEffect(() => {
		const fetchProfile = async () => {
			try {
				setIsLoading(true);

				// First get user info
				const userResponse = await axios.get('/auth/current-user');
				setUser(userResponse.data.data);
				console.log(userResponse.data.data);

				// Then get profile
				const profileResponse = await axios.get(`/profile/me`);
				setProfile(profileResponse.data.data);
				console.log(profileResponse.data.data);

				// Set form values
				form.reset({
					bio: profileResponse.data.data.bio,
					country: profileResponse.data.data.country,
					socials: {
						x: profileResponse.data.data.socials?.x || '',
						youtube: profileResponse.data.data.socials?.youtube || '',
						linkedin: profileResponse.data.data.socials?.linkedin || '',
						github: profileResponse.data.data.socials?.github || '',
					},
					wallets: {
						solana: profileResponse.data.data.wallets?.solana || '',
						sui: profileResponse.data.data?.wallets?.sui || '',
						ethereum: profileResponse.data.data.wallets?.ethereum || '',
					},
				});
				setError(null);
			} catch (err) {
				console.error('Error fetching profile:', err);
				toast.error('No profile found, Please create one.');
			} finally {
				setIsLoading(false);
			}
		};

		fetchProfile();
	}, []);

	const onSubmit = async (values: z.infer<typeof profileSchema>) => {
		setIsSaving(true);

		console.log('Form values:', values);
		try {
			const response = await axios.post('/profile', values);
			console.log('Profile updated:', response.data);

			// Update the profile state with the response data
			// Make sure to get the correct data path based on your API response
			const updatedProfile = response.data.data || response.data;
			setProfile(updatedProfile);

			// Show success message
			toast.success('Profile updated successfully');

			// Close edit mode
			setIsEditing(false);
			setError(null);
		} catch (err) {
			console.error('Failed to update profile:', err);
			setError('Failed to update profile. Please try again.');
			toast.error('Failed to update profile. Please try again.');
		} finally {
			setIsSaving(false);
			// Remove the redirect to keep user on the profile page
			// router.push('/home');
		}
	};

	return (
		<div className='container mx-auto py-10 mt-16'>
			<div className='max-w-3xl mx-auto'>
				<div className='flex flex-col sm:flex-row sm:items-center gap-4 mb-8'>
					<Avatar className='h-16 w-16 sm:h-20 sm:w-20'>
						<AvatarImage
							src={
								user?.photo && user?.photo !== ''
									? user.photo
									: `https://api.dicebear.com/7.x/initials/svg?seed=${
											user?.name || 'User'
									  }`
							}
						/>
					</Avatar>

					<div>
						<h1 className='text-2xl font-bold'>{user?.name || 'User'}</h1>
						<p className='text-gray-500'>@{user?.username || 'username'}</p>
						{profile?.country && (
							<div className='flex items-center gap-2 text-sm text-gray-500 mt-1'>
								<MapPin size={14} />
								<span>{profile.country}</span>
							</div>
						)}
					</div>

					<div className='sm:ml-auto'>
						<Button
							variant={isEditing ? 'outline' : 'default'}
							onClick={() => setIsEditing(!isEditing)}
							disabled={isSaving}
							className='gap-2'
						>
							{isEditing ? (
								<>Cancel</>
							) : (
								<>
									<Edit2 size={16} />
									Edit Profile
								</>
							)}
						</Button>
					</div>
				</div>

				<Tabs defaultValue='profile'>
					<TabsList className='mb-6'>
						<TabsTrigger value='profile'>Profile</TabsTrigger>
						<TabsTrigger value='activity'>Activity</TabsTrigger>
						<TabsTrigger value='settings'>Settings</TabsTrigger>
					</TabsList>

					<TabsContent value='profile'>
						<Card>
							<CardHeader>
								<CardTitle>Profile Information</CardTitle>
								<CardDescription>
									{isEditing
										? 'Edit your profile information below.'
										: 'View your profile information.'}
								</CardDescription>
							</CardHeader>

							<Form {...form}>
								<form onSubmit={form.handleSubmit(onSubmit)}>
									<CardContent className='space-y-6'>
										{/* Bio */}
										<FormField
											control={form.control}
											name='bio'
											render={({ field }) => (
												<FormItem>
													<FormLabel>Bio</FormLabel>
													{isEditing ? (
														<>
															<FormControl>
																<Textarea
																	placeholder='Tell us about yourself...'
																	className='resize-none'
																	rows={4}
																	{...field}
																/>
															</FormControl>
															<FormDescription>
																Brief description about yourself. Max 500
																characters.
															</FormDescription>
															<FormMessage />
														</>
													) : (
														<div className='p-4 bg-gray-50 rounded-md text-gray-700'>
															{profile?.bio || 'No bio provided.'}
														</div>
													)}
												</FormItem>
											)}
										/>

										{/* Country */}
										<FormField
											control={form.control}
											name='country'
											render={({ field }) => (
												<FormItem>
													<FormLabel>Country</FormLabel>
													{isEditing ? (
														<>
															<Select
																onValueChange={field.onChange}
																defaultValue={field.value}
															>
																<FormControl>
																	<SelectTrigger>
																		<SelectValue placeholder='Select your country' />
																	</SelectTrigger>
																</FormControl>
																<SelectContent>
																	{countries.map((country) => (
																		<SelectItem key={country} value={country}>
																			{country}
																		</SelectItem>
																	))}
																</SelectContent>
															</Select>
															<FormMessage />
														</>
													) : (
														<div className='flex items-center gap-2 text-gray-700'>
															<Globe size={16} />
															{profile?.country || 'Not specified'}
														</div>
													)}
												</FormItem>
											)}
										/>

										{/* Social Links */}
										<div>
											<h3 className='text-lg font-medium mb-3'>Social Links</h3>
											<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
												{/* Twitter */}
												<FormField
													control={form.control}
													name='socials.x'
													render={({ field }) => (
														<FormItem>
															<FormLabel className='flex items-center gap-2'>
																<Twitter size={16} className='text-[#1DA1F2]' />
																Twitter (X)
															</FormLabel>
															{isEditing ? (
																<>
																	<FormControl>
																		<Input placeholder='username' {...field} />
																	</FormControl>
																	<FormMessage />
																</>
															) : profile?.socials?.x ? (
																<a
																	href={'https://x.com/' + profile.socials.x}
																	target='_blank'
																	rel='noopener noreferrer'
																	className='hover:underline'
																>
																	{profile.socials.x}
																</a>
															) : (
																<span className='text-gray-400'>
																	Not linked
																</span>
															)}
														</FormItem>
													)}
												/>

												{/* Facebook */}
												<FormField
													control={form.control}
													name='socials.youtube'
													render={({ field }) => (
														<FormItem>
															<FormLabel className='flex items-center gap-2'>
																<Youtube size={16} className='text-[#FF0000]' />
																Youtube
															</FormLabel>
															{isEditing ? (
																<>
																	<FormControl>
																		<Input placeholder='@username' {...field} />
																	</FormControl>
																	<FormMessage />
																</>
															) : profile?.socials?.youtube ? (
																<a
																	href={
																		'https://youtube.com/@' +
																		profile.socials.youtube
																	}
																	target='_blank'
																	rel='noopener noreferrer'
																	className='hover:underline'
																>
																	{profile.socials.youtube}
																</a>
															) : (
																<span className='text-gray-400'>
																	Not linked
																</span>
															)}
														</FormItem>
													)}
												/>

												{/* LinkedIn */}
												<FormField
													control={form.control}
													name='socials.linkedin'
													render={({ field }) => (
														<FormItem>
															<FormLabel className='flex items-center gap-2'>
																<Linkedin
																	size={16}
																	className='text-[#0A66C2]'
																/>
																LinkedIn
															</FormLabel>
															{isEditing ? (
																<>
																	<FormControl>
																		<Input placeholder='username' {...field} />
																	</FormControl>
																	<FormMessage />
																</>
															) : profile?.socials?.linkedin ? (
																<a
																	href={
																		'https://github.com/' +
																		profile.socials.github
																	}
																	target='_blank'
																	rel='noopener noreferrer'
																	className='hover:underline'
																>
																	{profile.socials.linkedin}
																</a>
															) : (
																<span className='text-gray-400'>
																	Not linked
																</span>
															)}
														</FormItem>
													)}
												/>

												{/* GitHub */}
												<FormField
													control={form.control}
													name='socials.github'
													render={({ field }) => (
														<FormItem>
															<FormLabel className='flex items-center gap-2'>
																<Github size={16} />
																GitHub
															</FormLabel>
															{isEditing ? (
																<>
																	<FormControl>
																		<Input placeholder='username' {...field} />
																	</FormControl>
																	<FormMessage />
																</>
															) : profile?.socials?.github ? (
																<a
																	href={
																		'https://github.com/' +
																		profile.socials.github
																	}
																	target='_blank'
																	rel='noopener noreferrer'
																	className='hover:underline'
																>
																	{profile.socials.github}
																</a>
															) : (
																<span className='text-gray-400'>
																	Not linked
																</span>
															)}
														</FormItem>
													)}
												/>
											</div>
										</div>

										{/* Wallet Section */}
										<div>
											<h3 className='text-lg font-medium mb-3'>Wallets</h3>
											<div className='space-y-4'>
												{isEditing && (
													<div className='mb-4'>
														<PhantomWalletButton
															onAddressSelect={(addresses) => {
																if (addresses.solana) {
																	form.setValue(
																		'wallets.solana',
																		addresses.solana
																	);
																}
																if (addresses.sui) {
																	form.setValue('wallets.sui', addresses.sui);
																}
																if (addresses.ethereum) {
																	form.setValue(
																		'wallets.ethereum',
																		addresses.ethereum
																	);
																}
															}}
														/>
														<p className='text-sm text-gray-500 mt-2'>
															Connect your Phantom wallet to automatically fill
															in addresses from multiple networks
														</p>
													</div>
												)}

												{/* Phantom Solana Wallet */}
												<FormField
													control={form.control}
													name='wallets.solana'
													render={({ field }) => (
														<FormItem>
															<FormLabel className='flex items-center gap-2'>
																<div className='w-4 h-4 rounded-full bg-purple-500'></div>
																Solana
															</FormLabel>
															{isEditing ? (
																<>
																	<div className='flex space-x-2'>
																		<FormControl>
																			<Input
																				placeholder='Solana address'
																				{...field}
																				className='flex-grow'
																			/>
																		</FormControl>
																	</div>
																	<FormMessage />
																</>
															) : profile?.wallets?.solana ? (
																<div className='flex items-center gap-2'>
																	<code className='px-2 py-1 bg-gray-100 rounded text-sm font-mono'>
																		{formatWalletAddress(
																			profile.wallets.solana
																		)}
																	</code>
																	<Button
																		variant='ghost'
																		size='sm'
																		type='button'
																		onClick={() => {
																			navigator.clipboard.writeText(
																				profile.wallets.solana
																			);
																			toast.success(
																				'Address copied to clipboard'
																			);
																		}}
																	>
																		<Copy className='h-4 w-4' />
																	</Button>
																</div>
															) : (
																<span className='text-gray-400'>
																	No wallet connected
																</span>
															)}
														</FormItem>
													)}
												/>

												{/* Phantom Sui Wallet */}
												<FormField
													control={form.control}
													name='wallets.sui'
													render={({ field }) => (
														<FormItem>
															<FormLabel className='flex items-center gap-2'>
																<div className='w-4 h-4 rounded-full bg-blue-500'></div>
																Sui
															</FormLabel>
															{isEditing ? (
																<>
																	<FormControl>
																		<Input
																			placeholder='Sui address'
																			{...field}
																		/>
																	</FormControl>
																	<FormMessage />
																</>
															) : profile?.wallets?.sui ? (
																<div className='flex items-center gap-2'>
																	<code className='px-2 py-1 bg-gray-100 rounded text-sm font-mono'>
																		{formatWalletAddress(profile.wallets.sui)}
																	</code>
																	<Button
																		variant='ghost'
																		size='sm'
																		type='button'
																		onClick={() => {
																			navigator.clipboard.writeText(
																				profile.wallets.sui
																			);
																			console.log('Sui address copied');
																			toast.success(
																				'Address copied to clipboard'
																			);
																		}}
																	>
																		<Copy className='h-4 w-4' />
																	</Button>
																</div>
															) : (
																<span className='text-gray-400'>
																	No wallet connected
																</span>
															)}
														</FormItem>
													)}
												/>

												{/* Ethereum Wallet */}
												<FormField
													control={form.control}
													name='wallets.ethereum'
													render={({ field }) => (
														<FormItem>
															<FormLabel className='flex items-center gap-2'>
																<div className='w-4 h-4 rounded-full bg-blue-400'></div>
																Ethereum
															</FormLabel>
															{isEditing ? (
																<>
																	<FormControl>
																		<Input
																			placeholder='Ethereum address'
																			{...field}
																		/>
																	</FormControl>
																	<FormMessage />
																</>
															) : profile?.wallets?.ethereum ? (
																<div className='flex items-center gap-2'>
																	<code className='px-2 py-1 bg-gray-100 rounded text-sm font-mono'>
																		{formatWalletAddress(
																			profile.wallets.ethereum
																		)}
																	</code>
																	<Button
																		variant='ghost'
																		size='sm'
																		type='button'
																		onClick={() => {
																			navigator.clipboard.writeText(
																				profile.wallets.ethereum
																			);
																			toast.success(
																				'Address copied to clipboard'
																			);
																		}}
																	>
																		<Copy className='h-4 w-4' />
																	</Button>
																</div>
															) : (
																<span className='text-gray-400'>
																	No wallet connected
																</span>
															)}
														</FormItem>
													)}
												/>
											</div>
										</div>
									</CardContent>

									{isEditing && (
										<CardFooter className='flex justify-items-end mt-4'>
											<Button type='submit' disabled={isSaving}>
												{isSaving ? (
													<>
														<Loader2 className='mr-2 h-4 w-4 animate-spin' />
														Saving...
													</>
												) : (
													<>
														<Save className='mr-2 h-4 w-4' />
														Save Changes
													</>
												)}
											</Button>
										</CardFooter>
									)}
								</form>
							</Form>
						</Card>
					</TabsContent>

					<TabsContent value='activity'>
						<Card>
							<CardHeader>
								<CardTitle>Activity</CardTitle>
								<CardDescription>
									Your recent activity and interactions.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className='text-center py-10'>
									<p className='text-gray-500'>
										No recent activity to display.
									</p>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value='settings'>
						<Card>
							<CardHeader>
								<CardTitle>Settings</CardTitle>
								<CardDescription>
									Manage your account preferences and settings.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className='space-y-6'>
									<div>
										<h3 className='text-lg font-medium'>Email Notifications</h3>
										<p className='text-gray-500 text-sm mt-1'>
											Configure what emails you want to receive.
										</p>
										<div className='mt-4'>
											{/* Settings content would go here */}
											<p className='text-center text-gray-500 py-4'>
												Settings options coming soon.
											</p>
										</div>
									</div>
									<Separator />
									<div>
										<h3 className='text-lg font-medium'>Privacy</h3>
										<p className='text-gray-500 text-sm mt-1'>
											Control your profile visibility and data sharing
											preferences.
										</p>
										<div className='mt-4'>
											{/* Privacy content would go here */}
											<p className='text-center text-gray-500 py-4'>
												Privacy options coming soon.
											</p>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
