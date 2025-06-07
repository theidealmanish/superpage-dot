'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, ArrowRight, Loader2, Upload, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import uploadImage from '@/lib/uploadImage';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { register } from '@/api/auth';
import { toast } from 'sonner';

// Form validation schema matching the User interface
const signUpSchema = z.object({
	name: z
		.string()
		.min(2, { message: 'Name must be at least 2 characters' })
		.max(100, { message: 'Name must be less than 100 characters' }),
	username: z
		.string()
		.min(3, { message: 'Username must be at least 3 characters' })
		.max(30, { message: 'Username must be less than 30 characters' })
		.regex(/^[a-zA-Z0-9_]+$/, {
			message: 'Username can only contain letters, numbers and underscores',
		}),
	email: z.string().email({ message: 'Please enter a valid email address' }),
	password: z
		.string()
		.min(8, { message: 'Password must be at least 8 characters' })
		.max(100, { message: 'Password must be less than 100 characters' }),
	photo: z.string().optional().default(''),
});

export default function SignUpPage() {
	const router = useRouter();
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isUploading, setIsUploading] = useState(false);

	const form = useForm<z.infer<typeof signUpSchema>>({
		resolver: zodResolver(signUpSchema),
		defaultValues: {
			name: '',
			username: '',
			email: '',
			password: '',
			photo: '',
		},
	});

	// Handle avatar upload using the cloudinary service
	const handleAvatarChange = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		if (event.target.files && event.target.files[0]) {
			const file = event.target.files[0];

			// First show preview immediately
			const reader = new FileReader();
			reader.onload = (e) => {
				if (e.target?.result) {
					setAvatarPreview(e.target.result as string);
				}
			};
			reader.readAsDataURL(file);

			// Then upload to cloudinary
			setIsUploading(true);
			try {
				const data = await uploadImage(file);
				// Set the secure URL from cloudinary to the form
				form.setValue('photo', data.secure_url);
				toast.success('Profile picture uploaded successfully');
			} catch (error) {
				console.error('Error uploading image:', error);
				toast.error('Failed to upload profile picture');
			} finally {
				setIsUploading(false);
			}
		}
	};

	const triggerFileInput = () => {
		fileInputRef.current?.click();
	};

	async function onSubmit(values: z.infer<typeof signUpSchema>) {
		setIsLoading(true);
		setError(null);

		register({
			name: values.name,
			username: values.username,
			email: values.email,
			password: values.password,
			photo: values.photo,
		})
			.then((res) => {
				console.log(res.data);
				// save the token
				localStorage.setItem('token', res.token);
				router.push(`/${res.data.username}/profile`);
			})
			.catch((err) => {
				setError(err.response?.data?.message || 'Failed to register');
				console.log(err.response.data.message);
				// show the error in sonner
				toast.error(`${err.response?.data?.message}`, {
					duration: 5000,
				});
			})
			.finally(() => {
				setIsLoading(false);
			});
	}

	// Get a shortened address for display
	const shortenAddress = (address: string) => {
		if (!address) return '';
		return `${address.substring(0, 6)}...${address.substring(
			address.length - 4
		)}`;
	};

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
			<Card className='w-full max-w-xl'>
				<CardHeader className='space-y-1'>
					<CardTitle className='text-2xl font-bold text-center'>
						Create your account
					</CardTitle>
					<CardDescription className='text-center'>
						Enter your information to get started with SuperPage
					</CardDescription>
				</CardHeader>

				<CardContent>
					{error && (
						<Alert variant='destructive' className='mb-6'>
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
							{/* Avatar Upload */}
							<FormItem className='flex flex-col items-center justify-center'>
								<FormLabel>Profile Picture</FormLabel>
								<div
									className='w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer overflow-hidden relative'
									onClick={triggerFileInput}
								>
									{avatarPreview ? (
										<>
											<Image
												src={avatarPreview}
												alt='Avatar preview'
												width={96}
												height={96}
												className='w-full h-full object-cover'
											/>
											{isUploading && (
												<div className='absolute inset-0 bg-black/30 flex items-center justify-center'>
													<Loader2 className='h-8 w-8 text-white animate-spin' />
												</div>
											)}
										</>
									) : (
										<Upload className='w-8 h-8 text-gray-400' />
									)}
								</div>
								<input
									type='file'
									ref={fileInputRef}
									onChange={handleAvatarChange}
									accept='image/*'
									className='hidden'
									disabled={isLoading || isUploading}
								/>
								<FormDescription className='text-xs text-center'>
									{isUploading
										? 'Uploading...'
										: 'Click to upload a profile picture (optional)'}
								</FormDescription>
							</FormItem>

							<FormField
								control={form.control}
								name='name'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Full Name</FormLabel>
										<FormControl>
											<Input
												placeholder='John Doe'
												{...field}
												disabled={isLoading}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name='username'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Username</FormLabel>
										<FormControl>
											<Input
												placeholder='johndoe'
												{...field}
												disabled={isLoading}
											/>
										</FormControl>
										<FormDescription className='text-xs'>
											Your unique username for SuperPage
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name='email'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input
												type='email'
												placeholder='name@example.com'
												{...field}
												disabled={isLoading}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name='password'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Password</FormLabel>
										<div className='relative'>
											<FormControl>
												<Input
													type={showPassword ? 'text' : 'password'}
													placeholder='••••••••'
													{...field}
													disabled={isLoading}
												/>
											</FormControl>
											<Button
												type='button'
												variant='ghost'
												size='sm'
												className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
												onClick={() => setShowPassword(!showPassword)}
												disabled={isLoading}
											>
												{showPassword ? (
													<EyeOff className='h-4 w-4 text-gray-400' />
												) : (
													<Eye className='h-4 w-4 text-gray-400' />
												)}
											</Button>
										</div>
										<FormDescription className='text-xs'>
											Must be at least 8 characters
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Button
								type='submit'
								disabled={isLoading && !isUploading}
								className='w-full'
							>
								{isLoading ? (
									<span className='flex items-center'>
										<Loader2 className='mr-2 h-4 w-4 animate-spin' />
										Creating account...
									</span>
								) : (
									<>
										Create Account
										<ArrowRight className='ml-2 h-4 w-4' />
									</>
								)}
							</Button>
						</form>
					</Form>
				</CardContent>

				<CardFooter className='flex flex-col items-center space-y-4 border-t pt-6'>
					<div className='text-sm text-gray-600 text-center'>
						By creating an account, you agree to our{' '}
						<Link
							href='/terms'
							className='underline text-primary hover:text-primary/80'
						>
							Terms of Service
						</Link>{' '}
						and{' '}
						<Link
							href='/privacy'
							className='underline text-primary hover:text-primary/80'
						>
							Privacy Policy
						</Link>
						.
					</div>

					<div className='text-sm'>
						Already have an account?{' '}
						<Link
							href='/signin'
							className='text-primary font-medium hover:underline'
						>
							Sign in
						</Link>
					</div>
				</CardFooter>
			</Card>
		</div>
	);
}
