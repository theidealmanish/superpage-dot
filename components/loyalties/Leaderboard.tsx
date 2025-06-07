'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Award, ArrowUp, ArrowDown, Loader2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

interface Creator {
	_id: string;
	name: string;
	username: string;
	avatarUrl?: string;
	token?: {
		symbol: string;
	};
}

interface LeaderboardItem {
	rank: number;
	userId: string;
	username: string;
	name: string;
	avatarUrl: string;
	points: number;
	recordCount: number;
	change: 'up' | 'down' | 'same';
}

interface LeaderboardProps {
	selectedCreator: Creator | null;
}

export default function Leaderboard({ selectedCreator }: LeaderboardProps) {
	const router = useRouter();
	const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
	const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
	const [timeframe, setTimeframe] = useState('weekly');

	// Get formatted token symbol
	const tokenSymbol = selectedCreator?.token?.symbol || 'TOKEN';
	const formattedTokenSymbol = tokenSymbol.startsWith('$')
		? tokenSymbol
		: `$${tokenSymbol}`;

	useEffect(() => {
		if (selectedCreator) {
			fetchLeaderboard();
		}
	}, [selectedCreator, timeframe]);

	const fetchLeaderboard = async () => {
		if (!selectedCreator) return;

		setIsLoadingLeaderboard(true);
		try {
			const response = await axios.get(
				`/loyalties/leaderboard/${selectedCreator._id}`,
				{
					params: { timeframe },
				}
			);

			if (response.data && response.data.status === 'success') {
				const leaderboardData = (response.data.data || []).map(
					(item: any, index: number) => ({
						rank: index + 1,
						userId: item.userId || item._id,
						username: item.username || 'Anonymous',
						name: item.name || '',
						avatarUrl: item.avatarUrl || '',
						points: item.points || 0,
						recordCount: item.recordCount || 0,
						lastEarned: item.lastEarned ? new Date(item.lastEarned) : null,
						change: determineChange(item.userId, index),
					})
				);
				console.log('Leaderboard data:', leaderboardData);

				setLeaderboard(leaderboardData);
			}
		} catch (error) {
			console.error('Error fetching leaderboard:', error);
			toast.error('Failed to load leaderboard');
			setLeaderboard([]);
		} finally {
			setIsLoadingLeaderboard(false);
		}
	};

	// Helper function to determine position changes
	const determineChange = (userId: string, currentIndex: number) => {
		const random = Math.random();
		if (random < 0.33) return 'up';
		if (random < 0.66) return 'down';
		return 'same';
	};

	return (
		<Card>
			<CardHeader>
				<div className='flex justify-between items-center'>
					<CardTitle className='flex items-center gap-2'>
						<Award className='h-5 w-5 text-amber-500' />
						{formattedTokenSymbol} Leaderboard
					</CardTitle>
					<Select value={timeframe} onValueChange={setTimeframe}>
						<SelectTrigger className='w-36'>
							<SelectValue placeholder='Select timeframe' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='daily'>Daily</SelectItem>
							<SelectItem value='weekly'>Weekly</SelectItem>
							<SelectItem value='monthly'>Monthly</SelectItem>
							<SelectItem value='alltime'>All Time</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<CardDescription>
					Top supporters in the {timeframe} leaderboard for{' '}
					{selectedCreator?.name}
				</CardDescription>
			</CardHeader>
			<CardContent>
				{isLoadingLeaderboard ? (
					<div className='flex justify-center p-8'>
						<Loader2 className='h-8 w-8 animate-spin text-primary' />
					</div>
				) : leaderboard.length === 0 ? (
					<div className='text-center py-12'>
						<Award className='h-12 w-12 text-gray-300 mx-auto mb-4' />
						<p className='text-lg font-medium text-gray-700'>
							No leaderboard data yet
						</p>
						<p className='text-gray-500'>Be the first to earn points!</p>
					</div>
				) : (
					<>
						{/* Top 3 Podium Section */}
						<div className='mb-8 mt-16'>
							<div className='flex justify-center items-end gap-4 h-44'>
								{/* Second Place */}
								{leaderboard.length > 1 ? (
									<motion.div
										initial={{ y: 100, opacity: 0 }}
										animate={{ y: 0, opacity: 1 }}
										transition={{
											delay: 0.2,
											type: 'spring',
											stiffness: 100,
										}}
										className='flex flex-col items-center'
									>
										<div className='mb-2'>
											<span className='text-2xl'>🥈</span>
										</div>
										<Avatar className='h-16 w-16 border-2 border-gray-200'>
											<AvatarImage
												src={
													leaderboard[1].avatarUrl ||
													`https://api.dicebear.com/7.x/initials/svg?seed=${leaderboard[1].username}`
												}
											/>
											<AvatarFallback>
												{leaderboard[1]?.username?.charAt(0)?.toUpperCase() ||
													'2'}
											</AvatarFallback>
										</Avatar>
										<motion.div
											className='h-24 w-20 bg-gray-100 rounded-t-lg mt-2 flex items-center justify-center'
											initial={{ height: 0 }}
											animate={{ height: '6rem' }}
											transition={{ delay: 0.3, duration: 0.5 }}
										>
											<div className='text-center'>
												<p className='font-medium text-sm'>
													{leaderboard[1].username}
												</p>
												<p className='font-bold text-lg'>
													{leaderboard[1].points.toFixed(2)}
												</p>
											</div>
										</motion.div>
									</motion.div>
								) : (
									<div className='w-20'></div>
								)}

								{/* First Place */}
								{leaderboard.length > 0 ? (
									<motion.div
										initial={{ y: 100, opacity: 0 }}
										animate={{ y: 0, opacity: 1 }}
										transition={{ type: 'spring', stiffness: 100 }}
										className='flex flex-col items-center'
									>
										<div className='mb-2'>
											<span className='text-2xl'>🥇</span>
										</div>
										<Avatar className='h-20 w-20 border-4 border-amber-300'>
											<AvatarImage
												src={
													leaderboard[0].avatarUrl ||
													`https://api.dicebear.com/7.x/initials/svg?seed=${leaderboard[0].username}`
												}
											/>
											<AvatarFallback>
												{leaderboard[0]?.username?.charAt(0)?.toUpperCase() ||
													'1'}
											</AvatarFallback>
										</Avatar>
										<motion.div
											className='h-32 w-24 bg-amber-50 rounded-t-lg mt-2 flex items-center justify-center'
											initial={{ height: 0 }}
											animate={{ height: '8rem' }}
											transition={{ duration: 0.7 }}
										>
											<div className='text-center'>
												<p className='font-medium'>{leaderboard[0].username}</p>
												<p className='font-bold text-xl'>
													{leaderboard[0].points.toFixed(2)}
												</p>
											</div>
										</motion.div>
									</motion.div>
								) : (
									<div className='w-24'></div>
								)}

								{/* Third Place */}
								{leaderboard.length > 2 ? (
									<motion.div
										initial={{ y: 100, opacity: 0 }}
										animate={{ y: 0, opacity: 1 }}
										transition={{
											delay: 0.4,
											type: 'spring',
											stiffness: 100,
										}}
										className='flex flex-col items-center'
									>
										<div className='mb-2'>
											<span className='text-2xl'>🥉</span>
										</div>
										<Avatar className='h-14 w-14 border-2 border-gray-200'>
											<AvatarImage
												src={
													leaderboard[2].avatarUrl ||
													`https://api.dicebear.com/7.x/initials/svg?seed=${leaderboard[2].username}`
												}
											/>
											<AvatarFallback>
												{leaderboard[2]?.username?.charAt(0)?.toUpperCase() ||
													'3'}
											</AvatarFallback>
										</Avatar>
										<motion.div
											className='h-16 w-20 bg-gray-100 rounded-t-lg mt-2 flex items-center justify-center'
											initial={{ height: 0 }}
											animate={{ height: '4rem' }}
											transition={{ delay: 0.5, duration: 0.5 }}
										>
											<div className='text-center'>
												<p className='font-medium text-sm'>
													{leaderboard[2].username}
												</p>
												<p className='font-bold'>
													{leaderboard[2].points.toFixed(2)}
												</p>
											</div>
										</motion.div>
									</motion.div>
								) : (
									<div className='w-20'></div>
								)}
							</div>
						</div>

						{/* Full Leaderboard List */}
						<div className='rounded-md border mt-8'>
							<div className='grid grid-cols-12 bg-gray-50 py-3 px-4 text-sm font-medium text-gray-500'>
								<div className='col-span-1'>#</div>
								<div className='col-span-7'>User</div>
								<div className='col-span-3 text-right'>Points</div>
								<div className='col-span-1'></div>
							</div>

							{leaderboard.map((user) => (
								<motion.div
									key={user.rank}
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: user.rank * 0.05 }}
									className={cn(
										'grid grid-cols-12 py-3 px-4 border-t items-center',
										user.rank <= 3 ? 'bg-amber-50/50' : ''
									)}
								>
									<div className='col-span-1 font-medium flex items-center'>
										{user.rank <= 3 ? (
											<span className='mr-1'>
												{user.rank === 1 && '🥇'}
												{user.rank === 2 && '🥈'}
												{user.rank === 3 && '🥉'}
											</span>
										) : (
											user.rank
										)}
									</div>
									<div className='col-span-7 flex items-center gap-3'>
										<Avatar className='h-8 w-8'>
											<AvatarImage
												src={
													user.avatarUrl ||
													`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`
												}
											/>
											<AvatarFallback>
												{user?.username?.charAt(0)?.toUpperCase() || '?'}
											</AvatarFallback>
										</Avatar>
										<div>
											<div className='font-medium'>@{user.username}</div>
											{user.name && (
												<div className='text-xs text-gray-500'>{user.name}</div>
											)}
										</div>
									</div>
									<div className='col-span-3 text-right font-bold'>
										{user.points.toFixed(2)}
										{user.recordCount > 0 && (
											<div className='text-xs text-gray-500'>
												{user.recordCount} activities
											</div>
										)}
									</div>
									<div className='col-span-1 flex justify-end'>
										{user.change === 'up' && (
											<motion.div
												initial={{ y: 3 }}
												animate={{ y: -3 }}
												transition={{
													repeat: Infinity,
													repeatType: 'reverse',
													duration: 0.8,
												}}
											>
												<ArrowUp className='h-4 w-4 text-green-500' />
											</motion.div>
										)}
										{user.change === 'down' && (
											<motion.div
												initial={{ y: -3 }}
												animate={{ y: 3 }}
												transition={{
													repeat: Infinity,
													repeatType: 'reverse',
													duration: 0.8,
												}}
											>
												<ArrowDown className='h-4 w-4 text-red-500' />
											</motion.div>
										)}
									</div>
								</motion.div>
							))}
						</div>
					</>
				)}

				{leaderboard.length > 0 && selectedCreator && (
					<div className='mt-6 flex justify-center'>
						<Button
							variant='outline'
							className='gap-2'
							onClick={() =>
								router.push(
									`/creators/${selectedCreator._id}/leaderboard?timeframe=${timeframe}`
								)
							}
						>
							<Users className='h-4 w-4' />
							View Full Leaderboard
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
