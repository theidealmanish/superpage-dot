'use client';

import { useLogin } from '@privy-io/react-auth';
import Head from 'next/head';
import { useRouter } from 'next/navigation';

export default function Login() {
	const router = useRouter();
	const { login } = useLogin({
		onComplete: () => router.push('/home'),
	});

	return (
		<>
			<Head>
				<title>Login · Privy</title>
			</Head>

			<main className='flex min-h-screen min-w-full'>
				<div className='flex bg-privy-light-blue flex-1 p-6 justify-center items-center'>
					<div>
						<div className='mt-6 flex justify-center text-center'>
							<button onClick={login}>Login</button>
						</div>
					</div>
				</div>
			</main>
		</>
	);
}
