'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
	Heart,
	MessageCircle,
	Repeat2,
	Share,
	MoreHorizontal,
	Verified,
	TrendingUp,
	Users,
	Bell,
	Search,
	Home,
	User,
	Bookmark,
	Settings,
	Plus,
	Image as ImageIcon,
	Smile,
	Calendar,
	MapPin,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { InstagramEmbed } from 'react-social-media-embed';

interface User {
	_id: string;
	name: string;
	photo?: string;
	username: string;
	role: string;
	verified?: boolean;
	followers: number;
	following: number;
}

interface Post {
	_id: string;
	user: User;
	content: any;
	createdAt: string;
	likes: number;
	comments: number;
	reposts: number;
	isLiked: boolean;
	isReposted: boolean;
	images?: string[];
	type?: 'token_update' | 'marketplace' | 'regular';
	metadata?: {
		tokenPrice?: number;
		priceChange?: number;
		itemName?: string;
		itemPrice?: number;
	};
}

interface TrendingTopic {
	tag: string;
	posts: number;
	category: string;
}

export default function HomePage() {
	const router = useRouter();

	// State
	const [isLoading, setIsLoading] = useState(true);
	const [user, setUser] = useState<User | null>(null);
	const [posts, setPosts] = useState<Post[]>([]);
	const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
	const [newPostContent, setNewPostContent] = useState('');
	const [isPosting, setIsPosting] = useState(false);

	// Mock data
	const mockUser = {
		_id: '1',
		name: 'Jane Smith',
		photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
		username: 'janesmith',
		role: 'creator',
		verified: true,
		followers: 2547,
		following: 168,
	};

	const mockPosts: Post[] = [
		{
			_id: 'p1',
			user: {
				_id: 'u1',
				name: 'Jane Smith',
				photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
				username: 'janesmith',
				role: 'creator',
				verified: true,
				followers: 2547,
				following: 168,
			},
			content:
				'Just launched my new token! 🚀 Excited to see where this journey takes us. The community has been absolutely amazing so far. #TokenLaunch #Crypto',
			createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
			likes: 124,
			comments: 23,
			reposts: 45,
			isLiked: false,
			isReposted: false,
			type: 'token_update',
			metadata: {
				tokenPrice: 2.45,
				priceChange: 12.5,
			},
		},
		{
			_id: 'p2',
			user: {
				_id: 'u2',
				name: 'Alex Johnson',
				photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
				username: 'alexj',
				role: 'creator',
				verified: false,
				followers: 892,
				following: 234,
			},
			content: 'Hello',
			createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
			likes: 67,
			comments: 12,
			reposts: 8,
			isLiked: true,
			isReposted: false,
			images: ['https://picsum.photos/400/300?random=1'],
		},
		{
			_id: 'p3',
			user: {
				_id: 'u3',
				name: 'Sarah Williams',
				photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
				username: 'sarahw',
				role: 'creator',
				verified: true,
				followers: 1234,
				following: 456,
			},
			content:
				"New premium templates just dropped in the marketplace! Check them out if you're looking to upgrade your page design 🎨",
			createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
			likes: 89,
			comments: 15,
			reposts: 22,
			isLiked: false,
			isReposted: true,
			type: 'marketplace',
			metadata: {
				itemName: 'Premium Design Templates',
				itemPrice: 49.99,
			},
		},
		{
			_id: 'p4',
			user: {
				_id: 'u4',
				name: 'Michael Chen',
				photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
				username: 'michaelc',
				role: 'creator',
				verified: false,
				followers: 567,
				following: 123,
			},
			content:
				"Thanks to everyone who supported my latest project! The response has been incredible. Here's a behind-the-scenes look at the process 📸",
			createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
			likes: 234,
			comments: 45,
			reposts: 67,
			isLiked: true,
			isReposted: false,
			images: [
				'https://picsum.photos/400/300?random=2',
				'https://picsum.photos/400/300?random=3',
			],
		},
	];

	const mockTrending: TrendingTopic[] = [
		{ tag: '#TokenLaunch', posts: 1234, category: 'Crypto' },
		{ tag: '#SuperpageCreators', posts: 856, category: 'Community' },
		{ tag: '#MarketplaceDeals', posts: 432, category: 'Shopping' },
		{ tag: '#DesignTips', posts: 298, category: 'Design' },
		{ tag: '#CryptoNews', posts: 1876, category: 'News' },
	];

	// Load data
	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true);
			try {
				// Simulate API calls
				setUser(mockUser);
				setPosts(mockPosts);
				setTrendingTopics(mockTrending);

				setTimeout(() => {
					setIsLoading(false);
				}, 1000);
			} catch (error) {
				console.error('Error fetching data:', error);
				toast.error('Failed to load feed');
				setIsLoading(false);
			}
		};

		fetchData();
	}, []);

	// Format relative time
	const formatRelativeTime = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
		const diffInMinutes = Math.floor(diffInSeconds / 60);
		const diffInHours = Math.floor(diffInMinutes / 60);
		const diffInDays = Math.floor(diffInHours / 24);

		if (diffInSeconds < 60) return 'now';
		if (diffInMinutes < 60) return `${diffInMinutes}m`;
		if (diffInHours < 24) return `${diffInHours}h`;
		if (diffInDays < 7) return `${diffInDays}d`;
		return date.toLocaleDateString();
	};

	// Format numbers
	const formatNumber = (num: number) => {
		if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
		if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
		return num.toString();
	};

	// Handle post actions
	const handleLike = (postId: string) => {
		setPosts((prev) =>
			prev.map((post) =>
				post._id === postId
					? {
							...post,
							isLiked: !post.isLiked,
							likes: post.isLiked ? post.likes - 1 : post.likes + 1,
					  }
					: post
			)
		);
	};

	const handleRepost = (postId: string) => {
		setPosts((prev) =>
			prev.map((post) =>
				post._id === postId
					? {
							...post,
							isReposted: !post.isReposted,
							reposts: post.isReposted ? post.reposts - 1 : post.reposts + 1,
					  }
					: post
			)
		);
	};

	const handlePost = async () => {
		if (!newPostContent.trim()) return;

		setIsPosting(true);
		try {
			// Simulate API call
			const newPost: Post = {
				_id: `p${Date.now()}`,
				user: mockUser,
				content: newPostContent,
				createdAt: new Date().toISOString(),
				likes: 0,
				comments: 0,
				reposts: 0,
				isLiked: false,
				isReposted: false,
			};

			setPosts((prev) => [newPost, ...prev]);
			setNewPostContent('');
			toast.success('Post shared!');
		} catch (error) {
			toast.error('Failed to post');
		} finally {
			setIsPosting(false);
		}
	};

	if (isLoading) {
		return (
			<div className='max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6 p-6'>
				{/* Main feed skeleton */}
				<div className='lg:col-span-2 space-y-4'>
					<Skeleton className='h-[120px] w-full rounded-lg' />
					{[1, 2, 3].map((i) => (
						<Skeleton key={i} className='h-[200px] w-full rounded-lg' />
					))}
				</div>

				{/* Right sidebar skeleton */}
				<div className='hidden lg:block space-y-4'>
					<Skeleton className='h-[300px] w-full rounded-lg' />
				</div>
			</div>
		);
	}

	return (
		<div className='max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 p-6'>
			{/* Main Feed */}
			<div className='lg:col-span-2 space-y-6'>
				{/* Compose Tweet */}
				<Card>
					<CardContent className='p-4'>
						<div className='flex space-x-3'>
							<Avatar className='h-10 w-10'>
								<AvatarImage src={user?.photo} />
								<AvatarFallback>{user?.name[0]}</AvatarFallback>
							</Avatar>
							<div className='flex-1'>
								<Textarea
									placeholder="What's happening?"
									value={newPostContent}
									onChange={(e) => setNewPostContent(e.target.value)}
									className='border-none resize-none text-lg placeholder:text-xl focus-visible:ring-0'
									rows={3}
								/>
								<div className='flex items-center justify-between mt-3'>
									<div className='flex space-x-4'>
										<Button variant='ghost' size='sm'>
											<ImageIcon className='h-5 w-5 text-blue-500' />
										</Button>
										<Button variant='ghost' size='sm'>
											<Smile className='h-5 w-5 text-blue-500' />
										</Button>
										<Button variant='ghost' size='sm'>
											<Calendar className='h-5 w-5 text-blue-500' />
										</Button>
										<Button variant='ghost' size='sm'>
											<MapPin className='h-5 w-5 text-blue-500' />
										</Button>
									</div>
									<Button
										onClick={handlePost}
										disabled={!newPostContent.trim() || isPosting}
										className='rounded-full px-6'
									>
										{isPosting ? 'Posting...' : 'Post'}
									</Button>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Posts Feed */}
				{posts.map((post) => (
					<Card
						key={post._id}
						className='cursor-pointer hover:bg-muted/5 transition-colors'
					>
						<CardContent className='p-4'>
							<div className='flex space-x-3'>
								<Avatar className='h-10 w-10'>
									<AvatarImage src={post.user.photo} />
									<AvatarFallback>{post.user.name[0]}</AvatarFallback>
								</Avatar>
								<div className='flex-1 min-w-0'>
									<div className='flex items-center space-x-2'>
										<span className='font-medium'>{post.user.name}</span>
										{post.user.verified && (
											<Verified className='h-4 w-4 text-blue-500 fill-current' />
										)}
										<span className='text-muted-foreground'>
											@{post.user.username}
										</span>
										<span className='text-muted-foreground'>·</span>
										<span className='text-muted-foreground'>
											{formatRelativeTime(post.createdAt)}
										</span>
										<div className='ml-auto'>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant='ghost' size='sm'>
														<MoreHorizontal className='h-4 w-4' />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align='end'>
													<DropdownMenuItem>
														Follow @{post.user.username}
													</DropdownMenuItem>
													<DropdownMenuSeparator />
													<DropdownMenuItem>Copy link to post</DropdownMenuItem>
													<DropdownMenuItem>Bookmark</DropdownMenuItem>
													<DropdownMenuSeparator />
													<DropdownMenuItem className='text-red-600'>
														Report post
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</div>
									</div>

									<div className='mt-2'>
										<p className='text-sm leading-relaxed whitespace-pre-wrap'>
											{post.content}
										</p>

										{/* Token/Marketplace metadata */}
										{post.type === 'token_update' && post.metadata && (
											<div className='mt-3 p-3 border rounded-lg bg-muted/30'>
												<div className='flex items-center justify-between'>
													<span className='text-sm font-medium'>
														Token Price
													</span>
													<div className='flex items-center space-x-2'>
														<span className='font-bold'>
															${post.metadata.tokenPrice}
														</span>
														<Badge
															variant={
																post.metadata.priceChange! > 0
																	? 'default'
																	: 'destructive'
															}
														>
															{post.metadata.priceChange! > 0 ? '+' : ''}
															{post.metadata.priceChange}%
														</Badge>
													</div>
												</div>
											</div>
										)}

										{post.type === 'marketplace' && post.metadata && (
											<div className='mt-3 p-3 border rounded-lg bg-muted/30'>
												<div className='flex items-center justify-between'>
													<span className='text-sm font-medium'>
														{post.metadata.itemName}
													</span>
													<span className='font-bold'>
														${post.metadata.itemPrice}
													</span>
												</div>
											</div>
										)}

										{/* Images */}
										{post.images && post.images.length > 0 && (
											<div
												className={cn(
													'mt-3 gap-2',
													post.images.length === 1
														? 'grid grid-cols-1'
														: 'grid grid-cols-2'
												)}
											>
												{post.images.map((image, index) => (
													<img
														key={index}
														src={image}
														alt={`Post image ${index + 1}`}
														className='rounded-lg w-full h-48 object-cover'
													/>
												))}
											</div>
										)}
									</div>

									{/* Actions */}
									<div className='flex items-center justify-between mt-4 max-w-md'>
										<Button
											variant='ghost'
											size='sm'
											className='text-muted-foreground hover:text-blue-500 hover:bg-blue-50'
										>
											<MessageCircle className='h-4 w-4 mr-2' />
											{formatNumber(post.comments)}
										</Button>

										<Button
											variant='ghost'
											size='sm'
											className={cn(
												'text-muted-foreground hover:text-green-500 hover:bg-green-50',
												post.isReposted && 'text-green-500'
											)}
											onClick={() => handleRepost(post._id)}
										>
											<Repeat2 className='h-4 w-4 mr-2' />
											{formatNumber(post.reposts)}
										</Button>

										<Button
											variant='ghost'
											size='sm'
											className={cn(
												'text-muted-foreground hover:text-red-500 hover:bg-red-50',
												post.isLiked && 'text-red-500'
											)}
											onClick={() => handleLike(post._id)}
										>
											<Heart
												className={cn(
													'h-4 w-4 mr-2',
													post.isLiked && 'fill-current'
												)}
											/>
											{formatNumber(post.likes)}
										</Button>

										<Button
											variant='ghost'
											size='sm'
											className='text-muted-foreground hover:text-blue-500 hover:bg-blue-50'
										>
											<Share className='h-4 w-4' />
										</Button>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				))}

				{/* Pagination */}
				<div className='flex justify-center py-4'>
					<Button variant='outline' className='px-4 py-2 text-sm'>
						Load more
					</Button>
				</div>
			</div>

			{/* Right Sidebar - Trending */}
			<div className='hidden lg:block space-y-4'>
				<Card>
					<CardHeader>
						<CardTitle className='flex items-center'>
							<TrendingUp className='mr-2 h-5 w-5' />
							Trending
						</CardTitle>
					</CardHeader>
					<CardContent className='p-0'>
						{trendingTopics.map((topic, index) => (
							<div
								key={topic.tag}
								className='p-4 hover:bg-muted/50 cursor-pointer'
							>
								<div className='flex justify-between items-start'>
									<div>
										<p className='text-sm text-muted-foreground'>
											{index + 1} · {topic.category}
										</p>
										<p className='font-medium'>{topic.tag}</p>
										<p className='text-sm text-muted-foreground'>
											{formatNumber(topic.posts)} posts
										</p>
									</div>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant='ghost' size='sm'>
												<MoreHorizontal className='h-4 w-4' />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align='end'>
											<DropdownMenuItem>
												Not interested in this
											</DropdownMenuItem>
											<DropdownMenuItem>This trend is harmful</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							</div>
						))}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className='flex items-center'>
							<Users className='mr-2 h-5 w-5' />
							Who to follow
						</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						{[
							{
								name: 'David Kim',
								username: 'davidk',
								photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
								verified: false,
							},
							{
								name: 'Emma Watson',
								username: 'emmaw',
								photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
								verified: true,
							},
						].map((suggestion) => (
							<div
								key={suggestion.username}
								className='flex items-center justify-between'
							>
								<div className='flex items-center space-x-3'>
									<Avatar className='h-10 w-10'>
										<AvatarImage src={suggestion.photo} />
										<AvatarFallback>{suggestion.name[0]}</AvatarFallback>
									</Avatar>
									<div>
										<div className='flex items-center space-x-1'>
											<span className='font-medium text-sm'>
												{suggestion.name}
											</span>
											{suggestion.verified && (
												<Verified className='h-3 w-3 text-blue-500 fill-current' />
											)}
										</div>
										<span className='text-xs text-muted-foreground'>
											@{suggestion.username}
										</span>
									</div>
								</div>
								<Button size='sm' variant='outline'>
									Follow
								</Button>
							</div>
						))}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
