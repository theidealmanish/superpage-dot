'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';
import {
	Bell,
	User,
	Coins,
	ArrowUpRight,
	ArrowDownLeft,
	ChevronRight,
	Settings,
	Loader2,
	CheckCheck,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

// Define notification types based on the MongoDB schemas
interface Notification {
	_id: string;
	user: string;
	type: 'Transaction' | 'Engagement' | 'System';
	isSeen: boolean;
	isNotified: boolean;
	message: string;
	detail: any; // Can be Transaction or Engagement
	createdAt: string;
}

interface Transaction {
	_id: string;
	from: any;
	to: any;
	transactionHash: string;
	amount: number;
	status: string;
	sourceUrl?: string;
	message?: string;
	earnedPoints?: number;
	network?: string;
}

interface Engagement {
	_id: string;
	user: any;
	creator: any;
	sourceUrl: string;
	token: any;
	earnedPoints: number;
}

export default function NotificationsPage() {
	const router = useRouter();
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [activeTab, setActiveTab] = useState('all');
	const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);

	// Fetch notifications when the component mounts
	useEffect(() => {
		fetchNotifications();
	}, []);

	// Fetch notifications from the API
	const fetchNotifications = async () => {
		try {
			setIsLoading(true);
			// TODO: Replace with tanstack query
			const response = await axios.get('/notifications');
			setNotifications(response.data.data || []);
			setIsLoading(false);
		} catch (error) {
			console.error('Error fetching notifications:', error);
			toast.error('Failed to load notifications');
			setIsLoading(false);
		}
	};

	// Mark a notification as read
	const markAsRead = async (notificationId: string) => {
		try {
			await axios.patch(`/notifications/mark-all-as-seen`);
			setNotifications(
				notifications.map((notification) =>
					notification._id === notificationId
						? { ...notification, isSeen: true }
						: notification
				)
			);
		} catch (error) {
			console.error('Error marking notification as read:', error);
		}
	};

	// Mark all notifications as read
	const markAllAsRead = async () => {
		try {
			setIsMarkingAllRead(true);
			await axios.patch('/notifications/mark-all-as-seen');
			setNotifications(
				notifications.map((notification) => ({ ...notification, isSeen: true }))
			);
			toast.success('All notifications marked as read');
			setIsMarkingAllRead(false);
		} catch (error) {
			console.error('Error marking all notifications as read:', error);
			toast.error('Failed to mark all as read');
			setIsMarkingAllRead(false);
		}
	};

	// Filter notifications based on the active tab
	const filteredNotifications = notifications.filter((notification) => {
		if (activeTab === 'all') return true;
		return notification.type.toLowerCase() === activeTab;
	});

	// Count unread notifications
	const unreadCount = notifications.filter(
		(notification) => !notification.isSeen
	).length;

	// Function to render the appropriate icon for each notification type
	const getNotificationIcon = (notification: Notification) => {
		switch (notification.type) {
			case 'Transaction':
				return <Coins className='h-5 w-5 text-indigo-500' />;
			case 'Engagement':
				return <User className='h-5 w-5 text-emerald-500' />;
			case 'System':
				return <Bell className='h-5 w-5 text-amber-500' />;
			default:
				return <Bell className='h-5 w-5 text-gray-500' />;
		}
	};

	// Function to handle notification click
	const handleNotificationClick = async (notification: Notification) => {
		// Mark as read first
		if (!notification.isSeen) {
			await markAsRead(notification._id);
		}

		// Navigate based on notification type
		switch (notification.type) {
			case 'Transaction':
				router.push(`/transactions/${notification.detail?._id}`);
				break;
			case 'Engagement':
				router.push(`/creators/${notification.detail?.creator?._id}`);
				break;
			case 'System':
				// System notifications might not need navigation
				break;
		}
	};

	// Render time since notification was created
	const renderTimeAgo = (dateString: string) => {
		try {
			return formatDistanceToNow(new Date(dateString), { addSuffix: true });
		} catch (e) {
			return 'recently';
		}
	};

	// Render notification details based on type
	const renderNotificationDetail = (notification: Notification) => {
		switch (notification.type) {
			case 'Transaction':
				const transaction = notification.detail as Transaction;
				const isReceived = transaction?.to?._id === notification.user;

				return (
					<div className='flex items-center gap-2 text-sm text-gray-500'>
						{isReceived ? (
							<ArrowDownLeft className='h-4 w-4 text-emerald-500' />
						) : (
							<ArrowUpRight className='h-4 w-4 text-amber-500' />
						)}
						<span>
							{transaction?.amount?.toLocaleString()} tokens{' '}
							{isReceived ? 'received' : 'sent'}
						</span>
					</div>
				);

			case 'Engagement':
				const engagement = notification.detail as Engagement;
				return (
					<div className='text-sm text-gray-500'>
						Earned {engagement?.earnedPoints} points
					</div>
				);

			default:
				return null;
		}
	};

	return (
		<div className='container mx-auto py-6 px-4 md:px-6'>
			<div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-6'>
				<div>
					<h1 className='text-3xl font-bold mb-1'>Notifications</h1>
					<p className='text-gray-500'>Stay updated with all your activities</p>
				</div>

				<div className='flex items-center gap-2 mt-4 md:mt-0'>
					<Button
						variant='outline'
						size='sm'
						onClick={markAllAsRead}
						disabled={isMarkingAllRead || unreadCount === 0}
					>
						{isMarkingAllRead ? (
							<Loader2 className='h-4 w-4 mr-2 animate-spin' />
						) : (
							<CheckCheck className='h-4 w-4 mr-2' />
						)}
						Mark all as read
					</Button>

					<Button
						variant='ghost'
						size='icon'
						onClick={() => router.push('/settings/notifications')}
					>
						<Settings className='h-5 w-5' />
					</Button>
				</div>
			</div>

			<Tabs
				defaultValue='all'
				value={activeTab}
				onValueChange={setActiveTab}
				className='space-y-4'
			>
				<div className='flex justify-between items-center'>
					<TabsList>
						<TabsTrigger value='all' className='relative'>
							All
							{unreadCount > 0 && (
								<Badge className='ml-1 h-5 w-5 p-0 flex items-center justify-center bg-primary text-primary-foreground rounded-full absolute -top-1 -right-1 text-xs'>
									{unreadCount}
								</Badge>
							)}
						</TabsTrigger>
						<TabsTrigger value='transaction'>Transactions</TabsTrigger>
						<TabsTrigger value='engagement'>Engagements</TabsTrigger>
						<TabsTrigger value='system'>System</TabsTrigger>
					</TabsList>
				</div>

				<TabsContent value='all' className='space-y-4'>
					<Card>
						<CardHeader className='pb-2'>
							<CardTitle>Recent Notifications</CardTitle>
							<CardDescription>
								You have {unreadCount} unread notifications
							</CardDescription>
						</CardHeader>
						<CardContent>
							{isLoading ? (
								// Loading skeleton
								<div className='space-y-4'>
									{[1, 2, 3].map((i) => (
										<div key={i} className='flex gap-4'>
											<Skeleton className='h-12 w-12 rounded-full' />
											<div className='space-y-2 flex-1'>
												<Skeleton className='h-4 w-full' />
												<Skeleton className='h-4 w-3/4' />
											</div>
										</div>
									))}
								</div>
							) : filteredNotifications.length === 0 ? (
								<div className='flex flex-col items-center justify-center py-12 text-center'>
									<Bell className='h-12 w-12 text-gray-300 mb-4' />
									<h3 className='font-medium text-lg'>No notifications yet</h3>
									<p className='text-gray-500 mt-1'>
										When you get notifications, they'll show up here
									</p>
								</div>
							) : (
								<div className='space-y-2'>
									{filteredNotifications.map((notification, index) => (
										<div key={notification._id}>
											<div
												className={`flex items-start gap-4 p-3 rounded-lg transition-colors ${
													!notification.isSeen
														? 'bg-primary-foreground'
														: 'hover:bg-gray-50 dark:hover:bg-gray-900'
												} cursor-pointer`}
												onClick={() => handleNotificationClick(notification)}
											>
												<div
													className={`rounded-full p-2 ${
														notification.type === 'Transaction'
															? 'bg-indigo-50 dark:bg-indigo-950'
															: notification.type === 'Engagement'
															? 'bg-emerald-50 dark:bg-emerald-950'
															: 'bg-amber-50 dark:bg-amber-950'
													}`}
												>
													{getNotificationIcon(notification)}
												</div>

												<div className='flex-1 min-w-0'>
													<div className='flex justify-between items-start'>
														<div className='font-medium pr-2 line-clamp-2'>
															{notification.message}

															{!notification.isSeen && (
																<span className='inline-block h-2 w-2 rounded-full bg-primary ml-2'></span>
															)}
														</div>
														<span className='text-xs text-gray-500 whitespace-nowrap'>
															{renderTimeAgo(notification.createdAt)}
														</span>
													</div>

													{renderNotificationDetail(notification)}
												</div>

												<ChevronRight className='h-5 w-5 text-gray-400 shrink-0' />
											</div>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* Transaction Tab */}
				<TabsContent value='transaction' className='space-y-4'>
					<Card>
						<CardHeader>
							<CardTitle>Transaction Notifications</CardTitle>
							<CardDescription>
								Your recent transaction activity
							</CardDescription>
						</CardHeader>
						<CardContent>
							{/* Similar content as "all" tab but filtered for transactions */}
							{isLoading ? (
								<div className='space-y-4'>
									{[1, 2].map((i) => (
										<div key={i} className='flex gap-4'>
											<Skeleton className='h-12 w-12 rounded-full' />
											<div className='space-y-2 flex-1'>
												<Skeleton className='h-4 w-full' />
												<Skeleton className='h-4 w-3/4' />
											</div>
										</div>
									))}
								</div>
							) : filteredNotifications.length === 0 ? (
								<div className='py-8 text-center'>
									<Coins className='h-12 w-12 text-gray-300 mx-auto mb-4' />
									<h3 className='font-medium'>No transaction notifications</h3>
									<p className='text-gray-500 mt-1'>
										When you send or receive tokens, notifications will appear
										here
									</p>
								</div>
							) : (
								<div className='space-y-2'>
									{/* Same rendering logic as the "all" tab */}
									{filteredNotifications.map((notification, index) => (
										<div key={notification._id}>
											{/* Same notification item structure */}
											<div
												className={`flex items-start gap-4 p-3 rounded-lg transition-colors ${
													!notification.isSeen
														? 'bg-primary-foreground'
														: 'hover:bg-gray-50 dark:hover:bg-gray-900'
												} cursor-pointer`}
												onClick={() => handleNotificationClick(notification)}
											>
												<div className='bg-indigo-50 dark:bg-indigo-950 rounded-full p-2'>
													<Coins className='h-5 w-5 text-indigo-500' />
												</div>

												<div className='flex-1 min-w-0'>
													<div className='flex justify-between items-start'>
														<div className='font-medium pr-2 line-clamp-2'>
															{notification.message}

															{!notification.isSeen && (
																<span className='inline-block h-2 w-2 rounded-full bg-primary ml-2'></span>
															)}
														</div>
														<span className='text-xs text-gray-500 whitespace-nowrap'>
															{renderTimeAgo(notification.createdAt)}
														</span>
													</div>

													{renderNotificationDetail(notification)}
												</div>

												<ChevronRight className='h-5 w-5 text-gray-400 shrink-0' />
											</div>{' '}
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* Engagement Tab */}
				<TabsContent value='engagement' className='space-y-4'>
					<Card>
						<CardHeader>
							<CardTitle>Engagement Notifications</CardTitle>
							<CardDescription>
								Activity with creators you support
							</CardDescription>
						</CardHeader>
						<CardContent>
							{/* Similar structure as other tabs */}
							{isLoading ? (
								<div className='space-y-4'>
									{[1, 2].map((i) => (
										<div key={i} className='flex gap-4'>
											<Skeleton className='h-12 w-12 rounded-full' />
											<div className='space-y-2 flex-1'>
												<Skeleton className='h-4 w-full' />
												<Skeleton className='h-4 w-3/4' />
											</div>
										</div>
									))}
								</div>
							) : filteredNotifications.length === 0 ? (
								<div className='py-8 text-center'>
									<User className='h-12 w-12 text-gray-300 mx-auto mb-4' />
									<h3 className='font-medium'>No engagement notifications</h3>
									<p className='text-gray-500 mt-1'>
										When you engage with creators, notifications will appear
										here
									</p>
								</div>
							) : (
								<div className='space-y-2'>
									{filteredNotifications.map((notification, index) => (
										<div key={notification._id}>
											{/* Same notification item structure */}
											<div
												className={`flex items-start gap-4 p-3 rounded-lg transition-colors ${
													!notification.isSeen
														? 'bg-primary-foreground'
														: 'hover:bg-gray-50 dark:hover:bg-gray-900'
												} cursor-pointer`}
												onClick={() => handleNotificationClick(notification)}
											>
												<div className='bg-emerald-50 dark:bg-emerald-950 rounded-full p-2'>
													<User className='h-5 w-5 text-emerald-500' />
												</div>

												<div className='flex-1 min-w-0'>
													<div className='flex justify-between items-start'>
														<div className='font-medium pr-2 line-clamp-2'>
															{notification.message}

															{!notification.isSeen && (
																<span className='inline-block h-2 w-2 rounded-full bg-primary ml-2'></span>
															)}
														</div>
														<span className='text-xs text-gray-500 whitespace-nowrap'>
															{renderTimeAgo(notification.createdAt)}
														</span>
													</div>

													{renderNotificationDetail(notification)}
												</div>

												<ChevronRight className='h-5 w-5 text-gray-400 shrink-0' />
											</div>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* System Tab */}
				<TabsContent value='system' className='space-y-4'>
					<Card>
						<CardHeader>
							<CardTitle>System Notifications</CardTitle>
							<CardDescription>
								Important updates from SuperPage
							</CardDescription>
						</CardHeader>
						<CardContent>
							{/* Similar structure as other tabs */}
							{isLoading ? (
								<div className='space-y-4'>
									{[1, 2].map((i) => (
										<div key={i} className='flex gap-4'>
											<Skeleton className='h-12 w-12 rounded-full' />
											<div className='space-y-2 flex-1'>
												<Skeleton className='h-4 w-full' />
												<Skeleton className='h-4 w-3/4' />
											</div>
										</div>
									))}
								</div>
							) : filteredNotifications.length === 0 ? (
								<div className='py-8 text-center'>
									<Bell className='h-12 w-12 text-gray-300 mx-auto mb-4' />
									<h3 className='font-medium'>No system notifications</h3>
									<p className='text-gray-500 mt-1'>
										System notifications about platform updates will appear here
									</p>
								</div>
							) : (
								<div className='space-y-2'>
									{filteredNotifications.map((notification, index) => (
										<div key={notification._id}>
											{/* Same notification item structure */}
											<div
												className={`flex items-start gap-4 p-3 rounded-lg transition-colors ${
													!notification.isSeen
														? 'bg-primary-foreground'
														: 'hover:bg-gray-50 dark:hover:bg-gray-900'
												} cursor-pointer`}
												onClick={() => handleNotificationClick(notification)}
											>
												<div className='bg-amber-50 dark:bg-amber-950 rounded-full p-2'>
													<Bell className='h-5 w-5 text-amber-500' />
												</div>

												<div className='flex-1 min-w-0'>
													<div className='flex justify-between items-start'>
														<div className='font-medium pr-2 line-clamp-2'>
															{notification.message}

															{!notification.isSeen && (
																<span className='inline-block h-2 w-2 rounded-full bg-primary ml-2'></span>
															)}
														</div>
														<span className='text-xs text-gray-500 whitespace-nowrap'>
															{renderTimeAgo(notification.createdAt)}
														</span>
													</div>
												</div>

												<ChevronRight className='h-5 w-5 text-gray-400 shrink-0' />
											</div>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
