'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { login } from '@/api/auth';
import { Button } from '@/components/ui/button';
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
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useEffect } from 'react';

// Form validation schema that accepts either username or email
const signInSchema = z.object({
	identifier: z.string().min(1, { message: 'Username or email is required' }),
	password: z.string().min(1, { message: 'Password is required' }),
	rememberMe: z.boolean().default(false),
});

export default function SignInPage() {
	const router = useRouter();
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const form = useForm<z.infer<typeof signInSchema>>({
		resolver: zodResolver(signInSchema),
		defaultValues: {
			identifier: '',
			password: '',
			rememberMe: false,
		},
	});

	async function onSubmit(values: z.infer<typeof signInSchema>) {
		setIsLoading(true);
		setError(null);

		login({
			identifier: values.identifier,
			password: values.password,
		})
			.then((response) => {
				toast.success('Login successful!');
				// Store the token in local storage or context
				localStorage.setItem('token', response.token);
				router.push(`/home`);
			})
			.catch((error) => {
				// Handle login error
				console.log(error);
				toast.error(
					error.response.data.message || 'Login failed. Please try again.'
				);
				console.error('Login error:', error.response.data.message);
				setError(error.response.data.message);
			})
			.finally(() => {
				setIsLoading(false);
			});
	}

	// if the user is already logged in, redirect them to their profile page
	useEffect(() => {
		const token = localStorage.getItem('token');
		if (token) {
			router.push(`/home`);
		}
	}, [router]);

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
			<Card className='w-full max-w-md'>
				<CardHeader className='space-y-1'>
					<CardTitle className='text-2xl font-bold text-center'>
						Welcome back
					</CardTitle>
					<CardDescription className='text-center'>
						Sign in to your SuperPage account
					</CardDescription>
				</CardHeader>

				<CardContent>
					{error && (
						<Alert variant='destructive' className='mb-6'>
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
							<FormField
								control={form.control}
								name='identifier'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Username or Email</FormLabel>
										<FormControl>
											<Input
												placeholder='Enter your username or email'
												{...field}
												disabled={isLoading}
												autoComplete='username'
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
										<div className='flex items-center justify-between'>
											<FormLabel>Password</FormLabel>
											<Link
												href='/forgot-password'
												className='text-xs text-primary hover:underline'
											>
												Forgot password?
											</Link>
										</div>
										<div className='relative'>
											<FormControl>
												<Input
													type={showPassword ? 'text' : 'password'}
													placeholder='••••••••'
													{...field}
													disabled={isLoading}
													autoComplete='current-password'
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
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name='rememberMe'
								render={({ field }) => (
									<FormItem className='flex flex-row items-center space-x-2 space-y-0'>
										<FormControl>
											<Checkbox
												checked={field.value}
												onCheckedChange={field.onChange}
												disabled={isLoading}
											/>
										</FormControl>
										<div className='space-y-1 leading-none'>
											<FormLabel className='text-sm font-normal'>
												Remember me for 30 days
											</FormLabel>
										</div>
									</FormItem>
								)}
							/>

							<Button
								type='submit'
								className='w-full flex items-center justify-center gap-2'
								disabled={isLoading}
							>
								{isLoading ? (
									'Signing in...'
								) : (
									<>
										<LogIn className='h-4 w-4' />
										Sign In
									</>
								)}
							</Button>
						</form>
					</Form>
				</CardContent>

				<CardFooter className='flex justify-center p-6 border-t'>
					<p className='text-sm text-gray-600'>
						Don't have an account?{' '}
						<Link
							href='/register'
							className='text-primary font-medium hover:underline'
						>
							Sign up
						</Link>
					</p>
				</CardFooter>
			</Card>
		</div>
	);
}
