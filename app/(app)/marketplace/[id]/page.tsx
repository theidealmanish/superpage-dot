'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from '@/lib/axios';
import {
	ArrowLeft,
	Clock,
	Tag,
	ShoppingCart,
	Link2,
	Share2,
	AlertTriangle,
	Wallet,
	Flame,
} from 'lucide-react';

import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import Loading from '@/components/Loading';
import { useSuperPageToken } from '@/hooks/useSuperPageToken';

// Types for the listing based on your interface
interface User {
	_id: string;
	name: string;
	photo?: string;
}

interface Listing {
	_id: string;
	owner: User;
	title: string;
	description: string;
	image: string;
	discount: number;
	price: number;
	priceWithToken: number;
	isLimited: boolean;
	quantity?: number;
	createdAt: string;
	updatedAt: string;
	// Additional UI properties
	isSaved?: boolean;
	// Add token contract info
	tokenContractAddress?: string;
	chainId?: number;
}

export default function ListingDetailPage() {
	const router = useRouter();
	const params = useParams();
	const id = params?.id as string;

	// State
	const [listing, setListing] = useState<Listing | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isOwner, setIsOwner] = useState(false);
	const [isSaved, setIsSaved] = useState(false);
	const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
	const [isPurchasing, setIsPurchasing] = useState(false);
	const [txId, setTxID] = useState<string | null>(null);
	const [burnTxHash, setBurnTxHash] = useState<string | null>(null);

	// Token contract integration
	const contractAddress =
		listing?.tokenContractAddress ||
		'0xB67c0ee9f2D84B53A245d20Cd820ad79a6B97bC3';
	const chainId = listing?.chainId || 1;

	const {
		tokenInfo,
		userInfo,
		loading: tokenLoading,
		error: tokenError,
		account,
		isConnected,
		burnTokens,
		connectWallet,
	} = useSuperPageToken(contractAddress);

	// Fetch listing data
	useEffect(() => {
		async function fetchListing() {
			if (!id) return;

			setIsLoading(true);
			try {
				const response = await axios.get(`/listings/${id}`);
				const data = response.data.data || response.data;
				setListing(data);

				// Check saved status (in a real app, you'd have an API endpoint for this)
				setIsSaved(false);
			} catch (error) {
				console.error('Error fetching listing:', error);
				toast.error('Failed to load listing details');
			} finally {
				setIsLoading(false);
			}
		}

		fetchListing();
	}, [id]);

	// Get Subscan explorer URL
	const getExplorerUrl = (txHash: string): string => {
		return `https://assethub-westend.subscan.io/extrinsic/${txHash}`;
	};

	// Check if user has enough tokens for purchase
	const hasEnoughTokens = (): boolean => {
		if (!userInfo || !listing) return false;
		const userBalance = parseFloat(userInfo.balance);
		return userBalance >= listing.priceWithToken;
	};

	// Handle purchase with token burning
	const handlePurchase = async () => {
		if (!listing) return;

		// Check wallet connection first
		if (!isConnected) {
			toast.error('Please connect your wallet first');
			return;
		}

		// Check if user has enough tokens
		if (!hasEnoughTokens()) {
			toast.error(
				`Insufficient token balance. You need ${
					listing.priceWithToken
				} tokens but only have ${userInfo?.balance || 0}.`
			);
			return;
		}

		setIsPurchasing(true);

		try {
			// First, burn the tokens from the user's wallet
			if (contractAddress) {
				toast.loading('Burning tokens for purchase...');

				const burnTx = await burnTokens(
					listing.priceWithToken.toString(),
					`Purchase: ${listing.title}`
				);

				// Wait for burn transaction to complete
				const burnReceipt = await burnTx.wait();

				if (burnReceipt?.status !== 1) {
					throw new Error('Token burn transaction failed');
				}

				setBurnTxHash(burnTx.hash);
				toast.success('Tokens burned successfully!');
			}

			toast.success('Purchase successful!');

			// If this is a limited item, update the quantity
			if (listing.isLimited && listing.quantity) {
				setListing({
					...listing,
					quantity: listing.quantity - 1,
				});
			}
		} catch (error: any) {
			console.error('Error processing purchase:', error);

			// Handle specific error cases
			if (error.message?.includes('Insufficient token balance')) {
				toast.error('Insufficient token balance for this purchase');
			} else if (error.message?.includes('burn')) {
				toast.error('Failed to burn tokens. Purchase cancelled.');
			} else {
				toast.error('Failed to process purchase. Please try again.');
			}
		} finally {
			// Only set isPurchasing to false if there was an error
			// If transaction was successful, keep button disabled
			setIsPurchasing(false);
		}
	};

	// Share listing
	const shareListing = () => {
		if (navigator.share && window) {
			navigator
				.share({
					title: listing?.title || 'Check out this listing',
					text:
						listing?.description ||
						'I found this great listing on the marketplace',
					url: window.location.href,
				})
				.catch((error) => {
					console.error('Error sharing:', error);
				});
		} else {
			// Fallback for browsers that don't support the Web Share API
			navigator.clipboard.writeText(window.location.href);
			toast.success('Link copied to clipboard');
		}
	};

	// Handle edit navigation
	const handleEdit = () => {
		router.push(`/marketplace/edit/${id}`);
	};

	if (isLoading) {
		return <ListingDetailSkeleton />;
	}

	if (!listing) {
		return (
			<div className='container mx-auto px-4 py-12'>
				<Button
					variant='ghost'
					className='mb-6 flex items-center gap-2'
					onClick={() => router.push('/marketplace')}
				>
					<ArrowLeft size={16} />
					<span>Back to Marketplace</span>
				</Button>

				<div className='flex flex-col items-center justify-center p-12 rounded-lg border border-dashed text-center'>
					<AlertTriangle className='h-12 w-12 text-muted-foreground mb-4' />
					<h1 className='text-2xl font-bold mb-2'>Listing Not Found</h1>
					<p className='text-muted-foreground mb-6'>
						The listing you're looking for does not exist or has been removed.
					</p>
					<Button onClick={() => router.push('/marketplace')}>
						Return to Marketplace
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className='container mx-auto px-4 py-8'>
			{/* Breadcrumbs */}
			<Breadcrumb className='mb-6'>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink href='/marketplace'>Marketplace</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbLink>{listing.title}</BreadcrumbLink>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>

			<div className='grid grid-cols-1 lg:grid-cols-5 gap-8'>
				{/* Left Section - Image */}
				<div className='lg:col-span-3'>
					<div className='relative aspect-[4/3] rounded-lg overflow-hidden border bg-muted'>
						{listing.image ? (
							<img
								src={listing.image}
								alt={listing.title}
								className='h-full w-full object-fit'
							/>
						) : (
							<div className='h-full w-full flex items-center justify-center bg-muted'>
								<Tag size={64} className='text-muted-foreground' />
							</div>
						)}

						{listing.isLimited && listing.quantity !== undefined && (
							<Badge
								variant='secondary'
								className='absolute top-3 left-3 bg-orange-500 text-white hover:bg-orange-500'
							>
								{listing.quantity > 0 ? `${listing.quantity} left` : 'Sold Out'}
							</Badge>
						)}
					</div>
				</div>

				{/* Right Section - Details */}
				<div className='lg:col-span-2'>
					<Card>
						<CardHeader>
							<div className='flex justify-between items-start'>
								<div>
									<CardTitle className='text-2xl mb-2'>
										{listing.title}
									</CardTitle>

									<div className='flex items-center gap-2'>
										<Avatar className='h-6 w-6'>
											<AvatarImage src={listing.owner?.photo} />
											<AvatarFallback>
												{listing.owner?.name?.charAt(0) || 'U'}
											</AvatarFallback>
										</Avatar>
										<span className='text-sm text-muted-foreground'>
											{listing.owner?.name || 'Unknown'}
										</span>
									</div>
								</div>
							</div>
						</CardHeader>

						<CardContent className='space-y-4'>
							<div className='space-y-2'>
								<p className='text-muted-foreground'>{listing.description}</p>

								<div className='flex items-center text-muted-foreground text-sm'>
									<Clock size={14} className='mr-1' />
									{formatDate(listing.createdAt)}
								</div>
							</div>

							{/* Token Balance Display */}
							{contractAddress && isConnected && userInfo && (
								<div className='pt-4 border-t'>
									<div className='bg-blue-50 p-3 rounded-lg'>
										<div className='flex justify-between items-center mb-1'>
											<span className='text-sm font-medium text-blue-700'>
												Your Token Balance
											</span>
											<span className='font-bold text-blue-900'>
												{parseFloat(userInfo.balance).toLocaleString()}{' '}
												{tokenInfo?.symbol}
											</span>
										</div>
										{!hasEnoughTokens() && (
											<p className='text-xs text-red-600 mt-1'>
												Insufficient balance for this purchase
											</p>
										)}
									</div>
								</div>
							)}

							<div className='pt-4 border-t'>
								<div className='flex justify-between items-center mb-2'>
									<span className='text-muted-foreground'>Price</span>
									<div className='text-right'>
										<div className='text-sm text-muted-foreground'>
											${listing.price.toFixed(2)} or {listing.priceWithToken} LP
										</div>
									</div>
								</div>

								{listing.isLimited && (
									<div className='flex justify-between mb-2'>
										<span className='text-muted-foreground'>Availability</span>
										<span className='font-medium'>
											{listing.quantity && listing.quantity > 0
												? `${listing.quantity} remaining`
												: 'Sold out'}
										</span>
									</div>
								)}
							</div>

							{/* Wallet Connection Alert */}
							{contractAddress && !isConnected && (
								<Alert>
									<Wallet className='h-4 w-4' />
									<AlertDescription>
										Connect your wallet to check token balance and make
										purchases
									</AlertDescription>
								</Alert>
							)}

							{/* Token Error Alert */}
							{tokenError && (
								<Alert variant='destructive'>
									<AlertTriangle className='h-4 w-4' />
									<AlertDescription>{tokenError}</AlertDescription>
								</Alert>
							)}
						</CardContent>

						<CardFooter className='flex-col space-y-3'>
							{/* Connect Wallet Button */}
							{contractAddress && !isConnected ? (
								<Button
									className='w-full'
									variant='outline'
									onClick={connectWallet}
									disabled={tokenLoading}
								>
									<Wallet size={16} className='mr-2' />
									{tokenLoading ? 'Connecting...' : 'Connect Wallet'}
								</Button>
							) : (
								/* Purchase Button */
								<Button
									className='w-full'
									size='lg'
									disabled={
										isOwner ||
										(listing.isLimited && listing.quantity === 0) ||
										isPurchasing ||
										(contractAddress && (!isConnected || !hasEnoughTokens()))
									}
									onClick={() => setShowPurchaseDialog(true)}
								>
									<ShoppingCart size={16} className='mr-2' />
									{isPurchasing
										? 'Processing...'
										: isOwner
										? 'You own this item'
										: listing.isLimited && listing.quantity === 0
										? 'Sold out'
										: contractAddress && !isConnected
										? 'Connect Wallet'
										: contractAddress && !hasEnoughTokens()
										? 'Insufficient Token Balance'
										: `Buy for ${listing.priceWithToken.toFixed(2)} LP`}
								</Button>
							)}

							<div className='flex gap-3 w-full'>
								<Button
									variant='outline'
									className='flex-1'
									onClick={shareListing}
								>
									<Share2 size={16} className='mr-2' />
									Share
								</Button>

								{isOwner && (
									<Button
										variant='outline'
										className='flex-1'
										onClick={handleEdit}
									>
										<Link2 size={16} className='mr-2' />
										Edit
									</Button>
								)}
							</div>
						</CardFooter>
					</Card>
				</div>
			</div>

			{/* Purchase Dialog */}
			<Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Complete Your Purchase</DialogTitle>
						<DialogDescription className='text-wrap'>
							You're about to purchase "{listing.title}"
						</DialogDescription>
					</DialogHeader>

					<div className='py-4'>
						{/* Token Balance Check */}
						{contractAddress && isConnected && userInfo && (
							<div className='mb-4 p-3 bg-blue-50 rounded-lg'>
								<div className='flex justify-between items-center'>
									<span className='text-sm font-medium'>
										Your Token Balance
									</span>
									<span className='font-bold'>
										{parseFloat(userInfo.balance).toLocaleString()}{' '}
										{tokenInfo?.symbol}
									</span>
								</div>
								{!hasEnoughTokens() && (
									<Alert variant='destructive' className='mt-2'>
										<AlertTriangle className='h-4 w-4' />
										<AlertDescription>
											Insufficient token balance. You need{' '}
											{listing.priceWithToken} tokens but only have{' '}
											{userInfo.balance}.
										</AlertDescription>
									</Alert>
								)}
							</div>
						)}

						<div className='flex justify-between py-2 border-b'>
							<span>Item Price</span>
							<span className='font-medium'>
								{listing.priceWithToken.toFixed(2)} LP
							</span>
						</div>

						<div className='flex justify-between py-2 border-b'>
							<span>Processing Fee</span>
							<span className='font-medium'>0.00 LP</span>
						</div>

						<div className='flex justify-between py-2 mt-2'>
							<span className='font-bold'>Total</span>
							<span className='font-bold'>
								{listing.priceWithToken.toFixed(2)} LP
							</span>
						</div>

						{contractAddress && (
							<div className='mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200'>
								<div className='flex items-center gap-2 text-amber-700'>
									<Flame className='h-4 w-4' />
									<span className='text-sm font-medium'>
										Tokens will be burned from your wallet
									</span>
								</div>
								<p className='text-xs text-amber-600 mt-1'>
									This transaction will permanently remove tokens from your
									balance
								</p>
							</div>
						)}
					</div>

					<div>
						{txId && (
							<div className='mt-4'>
								<a
									href={`https://assethub-westend.subscan.io/extrinsic//${txId}`}
									target='_blank'
									rel='noopener noreferrer'
									className='text-blue-500 hover:underline'
								>
									View Transaction in Subscan
								</a>
							</div>
						)}

						{burnTxHash && (
							<div className='mt-2'>
								<a
									href={getExplorerUrl(burnTxHash)}
									target='_blank'
									rel='noopener noreferrer'
									className='text-green-500 hover:underline'
								>
									View Burn Transaction on Subscan
								</a>
							</div>
						)}
					</div>

					<DialogFooter>
						<Button
							variant='outline'
							onClick={() => setShowPurchaseDialog(false)}
							disabled={isPurchasing}
						>
							Cancel
						</Button>

						<Button
							onClick={handlePurchase}
							disabled={
								isPurchasing ||
								txId !== null ||
								(contractAddress && (!isConnected || !hasEnoughTokens()))
							}
						>
							{isPurchasing
								? 'Processing...'
								: txId
								? 'Purchase Complete'
								: contractAddress && !hasEnoughTokens()
								? 'Insufficient Balance'
								: 'Complete Purchase'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

// Skeleton for loading state
function ListingDetailSkeleton() {
	return (
		<div className='container mx-auto px-4 py-8'>
			<div className='mb-6'>
				<Skeleton className='h-5 w-40' />
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-5 gap-8'>
				<div className='lg:col-span-3'>
					<Skeleton className='w-full aspect-[4/3] rounded-lg' />
				</div>

				<div className='lg:col-span-2'>
					<Card>
						<CardHeader>
							<div className='flex justify-between items-start'>
								<div className='space-y-2'>
									<Skeleton className='h-8 w-56' />
									<div className='flex items-center gap-2'>
										<Skeleton className='h-6 w-6 rounded-full' />
										<Skeleton className='h-4 w-24' />
									</div>
								</div>
								<Skeleton className='h-9 w-9 rounded-full' />
							</div>
						</CardHeader>

						<CardContent className='space-y-4'>
							<div className='space-y-2'>
								<Skeleton className='h-4 w-full' />
								<Skeleton className='h-4 w-full' />
								<Skeleton className='h-4 w-3/4' />

								<div className='flex items-center mt-3'>
									<Skeleton className='h-4 w-32' />
								</div>
							</div>

							<div className='pt-4 border-t'>
								<div className='flex justify-between items-center mb-2'>
									<Skeleton className='h-4 w-10' />
									<div>
										<Skeleton className='h-8 w-20' />
										<Skeleton className='h-5 w-14 mt-1' />
									</div>
								</div>

								<div className='flex justify-between mb-2'>
									<Skeleton className='h-4 w-24' />
									<Skeleton className='h-4 w-20' />
								</div>
							</div>
						</CardContent>

						<CardFooter className='flex-col space-y-3'>
							<Skeleton className='h-11 w-full' />
							<div className='flex gap-3 w-full'>
								<Skeleton className='h-10 flex-1' />
								<Skeleton className='h-10 flex-1' />
							</div>
						</CardFooter>
					</Card>
				</div>
			</div>
		</div>
	);
}

// Helper function to format dates
function formatDate(dateString: string): string {
	const date = new Date(dateString);
	const now = new Date();

	const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
	const diffInMinutes = Math.floor(diffInSeconds / 60);
	const diffInHours = Math.floor(diffInMinutes / 60);
	const diffInDays = Math.floor(diffInHours / 24);

	if (diffInSeconds < 60) {
		return 'Just now';
	} else if (diffInMinutes < 60) {
		return `${diffInMinutes}m ago`;
	} else if (diffInHours < 24) {
		return `${diffInHours}h ago`;
	} else if (diffInDays < 7) {
		return `${diffInDays}d ago`;
	} else {
		return new Intl.DateTimeFormat('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		}).format(date);
	}
}
