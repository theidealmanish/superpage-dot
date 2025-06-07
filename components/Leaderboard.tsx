'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';

interface LeaderboardEntry {
	rank: number;
	username: string;
	avatarUrl: string;
	points: number;
	change: 'up' | 'down' | 'same';
}

interface LeaderboardTableProps {
	data: LeaderboardEntry[];
	showViewMore?: boolean;
	onViewMoreClick?: () => void;
}

export default function LeaderboardTable({
	data,
	showViewMore = true,
	onViewMoreClick = () => {},
}: LeaderboardTableProps) {
	// Function to render rank with medal for top 3
	const renderRank = (rank: number) => {
		if (rank === 1) {
			return (
				<div className='flex justify-center items-center w-6 h-6 bg-yellow-100 text-yellow-700 rounded-full'>
					<span className='text-sm'>🥇</span>
				</div>
			);
		} else if (rank === 2) {
			return (
				<div className='flex justify-center items-center w-6 h-6 bg-gray-100 text-gray-700 rounded-full'>
					<span className='text-sm'>🥈</span>
				</div>
			);
		} else if (rank === 3) {
			return (
				<div className='flex justify-center items-center w-6 h-6 bg-amber-100 text-amber-700 rounded-full'>
					<span className='text-sm'>🥉</span>
				</div>
			);
		}

		return <div className='font-medium'>{rank}</div>;
	};

	return (
		<div className='space-y-4'>
			<div className='rounded-md border'>
				<div className='grid grid-cols-12 bg-gray-50 py-3 px-4 text-sm font-medium text-gray-500'>
					<div className='col-span-1'>#</div>
					<div className='col-span-7'>User</div>
					<div className='col-span-3 text-right'>Points</div>
					<div className='col-span-1'></div>
				</div>

				{data.map((user) => (
					<div
						key={user.rank}
						className={`grid grid-cols-12 py-3 px-4 border-t items-center ${
							user.rank <= 3
								? 'bg-gradient-to-r from-gray-50 to-transparent'
								: ''
						}`}
					>
						<div className='col-span-1'>{renderRank(user.rank)}</div>
						<div className='col-span-7 flex items-center gap-3'>
							<Avatar className='h-8 w-8'>
								<AvatarImage
									src={
										user.avatarUrl ||
										`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`
									}
								/>
								<AvatarFallback>
									{user.username.charAt(0).toUpperCase()}
								</AvatarFallback>
							</Avatar>
							<div className='font-medium'>@{user.username}</div>
						</div>
						<div className='col-span-3 text-right font-bold'>
							{user.points.toLocaleString()}
						</div>
						<div className='col-span-1 flex justify-end'>
							{user.change === 'up' && (
								<ArrowUp className='h-4 w-4 text-green-500' />
							)}
							{user.change === 'down' && (
								<ArrowDown className='h-4 w-4 text-red-500' />
							)}
						</div>
					</div>
				))}
			</div>

			{showViewMore && (
				<div className='flex justify-center mt-4'>
					<Button variant='outline' className='gap-2' onClick={onViewMoreClick}>
						<Users className='h-4 w-4' />
						View Full Leaderboard
					</Button>
				</div>
			)}
		</div>
	);
}
