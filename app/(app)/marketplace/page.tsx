'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
	Plus,
	Search,
	Filter,
	Grid3x3,
	List as ListIcon,
	Tag,
	Bookmark,
	Download,
	Link2,
	Clock,
	Trash2,
	Edit,
	ChevronDown,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import Loading from '@/components/Loading';
import uploadImage from '@/lib/uploadImage';

// Types for the listings based on your interface
interface User {
	_id: string;
	name: string;
	photo?: string;
}

interface Listing {
	_id: string;
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
	owner: User;
}

// Form schema for listings
const listingFormSchema = z.object({
	title: z.string().min(5, { message: 'Title must be at least 5 characters' }),
	description: z
		.string()
		.min(10, { message: 'Description must be at least 10 characters' }),
	image: z
		.string()
		.url({ message: 'Please enter a valid image URL' })
		.optional(),
	price: z.coerce
		.number()
		.min(0.01, { message: 'Price must be greater than 0' }),
	priceWithToken: z.coerce
		.number()
		.min(0, { message: 'Token price must be greater than or equal to 0' }),
	discount: z.coerce
		.number()
		.min(0)
		.max(100, { message: 'Discount must be between 0 and 100' })
		.default(0),
	isLimited: z.boolean().default(false),
	quantity: z.coerce.number().min(1).optional(),
});

// Current user mock - in a real app this would come from your auth context
const currentUser = {
	_id: 'current-user-id',
	name: 'Current User',
	avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CurrentUser',
};

export default function MarketplacePage() {
	const router = useRouter();

	// State
	const [activeTab, setActiveTab] = useState('explore');
	const [isLoading, setIsLoading] = useState(true);
	const [allListings, setAllListings] = useState<Listing[]>([]);
	const [myListings, setMyListings] = useState<Listing[]>([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
	const [sortOption, setSortOption] = useState<string>('newest');
	const [priceRangeFilter, setPriceRangeFilter] = useState<[number, number]>([
		0, 1000,
	]);
	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [editingListing, setEditingListing] = useState<Listing | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Form
	const form = useForm<z.infer<typeof listingFormSchema>>({
		resolver: zodResolver(listingFormSchema),
		defaultValues: {
			title: '',
			description: '',
			image: '',
			price: 0,
			priceWithToken: 0,
			discount: 0,
			isLimited: false,
			quantity: undefined,
		},
	});

	// Load listings
	useEffect(() => {
		async function fetchData() {
			setIsLoading(true);
			try {
				// Fetch all listings
				const allResponse = await axios.get('/listings');
				const allData = allResponse.data.data || allResponse.data || [];
				setAllListings(Array.isArray(allData) ? allData : []);

				// Fetch my listings
				const myResponse = await axios.get('/listings/me');
				const myData = myResponse.data.data || myResponse.data || [];
				setMyListings(Array.isArray(myData) ? myData : []);
			} catch (error) {
				console.error('Error fetching listings:', error);
				toast.error('Failed to load listings');
				setAllListings([]);
				setMyListings([]);
			} finally {
				setIsLoading(false);
			}
		}

		fetchData();
	}, []);

	// Set form values when editing
	useEffect(() => {
		if (editingListing) {
			form.reset({
				title: editingListing.title,
				description: editingListing.description,
				image: editingListing.image || '',
				price: editingListing.price,
				priceWithToken: editingListing.priceWithToken,
				discount: editingListing.discount,
				isLimited: editingListing.isLimited,
				quantity: editingListing.quantity,
			});
		}
	}, [editingListing, form]);

	// Filter listings based on search query
	const filteredAllListings = Array.isArray(allListings)
		? allListings.filter((listing) => {
				const matchesSearch =
					listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
					listing.description.toLowerCase().includes(searchQuery.toLowerCase());

				const matchesPriceRange =
					listing.price >= priceRangeFilter[0] &&
					listing.price <= priceRangeFilter[1];

				return matchesSearch && matchesPriceRange;
		  })
		: [];

	const filteredMyListings = Array.isArray(myListings)
		? myListings.filter((listing) => {
				const matchesSearch =
					listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
					listing.description.toLowerCase().includes(searchQuery.toLowerCase());

				const matchesPriceRange =
					listing.price >= priceRangeFilter[0] &&
					listing.price <= priceRangeFilter[1];

				return matchesSearch && matchesPriceRange;
		  })
		: [];

	// Sort listings
	const sortListings = (listings: Listing[]): Listing[] => {
		return [...listings].sort((a, b) => {
			switch (sortOption) {
				case 'price-low':
					return a.price - b.price;
				case 'price-high':
					return b.price - a.price;
				case 'discount':
					return b.discount - a.discount;
				case 'oldest':
					return (
						new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
					);
				case 'newest':
				default:
					return (
						new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
					);
			}
		});
	};

	const sortedFilteredAllListings = sortListings(filteredAllListings);
	const sortedFilteredMyListings = sortListings(filteredMyListings);

	// Toggle saved state
	const toggleSaved = (listingId: string) => {
		setAllListings((prev) =>
			prev.map((listing) =>
				listing._id === listingId
					? { ...listing, isSaved: !listing.isSaved }
					: listing
			)
		);

		const listing = allListings.find((l) => l._id === listingId);
		toast.success(
			`${listing?.isSaved ? 'Removed from' : 'Added to'} saved items`
		);
	};

	// Handle form submission
	const onSubmit = async (values: z.infer<typeof listingFormSchema>) => {
		setIsSubmitting(true);

		try {
			if (editingListing) {
				// Update existing listing
				const response = await axios.put(
					`/listings/${editingListing._id}`,
					values
				);

				setMyListings((prev) =>
					prev.map((listing) =>
						listing._id === editingListing._id
							? { ...(response.data.data || response.data) }
							: listing
					)
				);

				toast.success('Listing updated successfully');
			} else {
				// Create new listing
				const response = await axios.post('/listings', values);
				const newListing = response.data.data || response.data;

				setMyListings((prev) => [newListing, ...prev]);
				toast.success('Listing created successfully');
			}

			setShowCreateDialog(false);
			setEditingListing(null);
			form.reset();
		} catch (error) {
			console.error('Error submitting form:', error);
			toast.error('Failed to save listing. Please try again.');
		} finally {
			setIsSubmitting(false);
		}
	};

	// Delete listing
	const deleteListing = async (listingId: string) => {
		try {
			await axios.delete(`/listings/${listingId}`);

			setMyListings((prev) =>
				prev.filter((listing) => listing._id !== listingId)
			);
			toast.success('Listing deleted successfully');
		} catch (error) {
			console.error('Error deleting listing:', error);
			toast.error('Failed to delete listing');
		}
	};

	// Reset form when dialog closes
	const handleDialogOpenChange = (open: boolean) => {
		setShowCreateDialog(open);
		if (!open) {
			setEditingListing(null);
			form.reset();
		}
	};

	// Corrected handleUploadImage function
	const handleUploadImage = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		if (event.target.files && event.target.files[0]) {
			const file = event.target.files[0];

			// First show preview immediately
			const reader = new FileReader();
			reader.onload = (e) => {
				if (e.target?.result) {
					// Directly set the preview in the form
					form.setValue('image', e.target.result as string);
				}
			};
			reader.readAsDataURL(file);

			// Then upload to cloudinary
			setIsSubmitting(true); // Use existing isSubmitting state
			try {
				const data = await uploadImage(file);
				// Set the secure URL from cloudinary to the form
				form.setValue('image', data.secure_url);
				toast.success('Image uploaded successfully');
			} catch (error) {
				console.error('Error uploading image:', error);
				toast.error('Failed to upload image');
			} finally {
				setIsSubmitting(false);
			}
		}
	};

	if (isLoading) {
		return <Loading />;
	}

	return (
		<div className='container mx-auto px-4 py-8'>
			<div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8'>
				<div>
					<h1 className='text-3xl font-bold'>Marketplace</h1>
					<p className='text-muted-foreground'>
						Discover and purchase digital products and services
					</p>
				</div>

				<Button
					onClick={() => setShowCreateDialog(true)}
					className='flex items-center gap-2'
				>
					<Plus size={16} />
					<span>Create Listing</span>
				</Button>
			</div>

			<Tabs
				defaultValue='explore'
				value={activeTab}
				onValueChange={setActiveTab}
				className='w-full'
			>
				<div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4'>
					<TabsList>
						<TabsTrigger value='explore'>Explore</TabsTrigger>
						<TabsTrigger value='my-listings'>My Listings</TabsTrigger>
					</TabsList>

					<div className='flex gap-2'>
						<Button
							variant='outline'
							size='icon'
							onClick={() => setViewMode('grid')}
							className={cn(viewMode === 'grid' && 'bg-secondary')}
						>
							<Grid3x3 size={16} />
						</Button>
						<Button
							variant='outline'
							size='icon'
							onClick={() => setViewMode('list')}
							className={cn(viewMode === 'list' && 'bg-secondary')}
						>
							<ListIcon size={16} />
						</Button>
					</div>
				</div>

				{/* Search and filters */}
				<div className='flex flex-col sm:flex-row gap-3 mb-6'>
					<div className='relative flex-grow'>
						<Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
						<Input
							placeholder='Search listings...'
							className='pl-9'
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>

					<div className='flex gap-2'>
						<Select value={sortOption} onValueChange={setSortOption}>
							<SelectTrigger className='w-[160px]'>
								<SelectValue placeholder='Sort by' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='newest'>Newest</SelectItem>
								<SelectItem value='oldest'>Oldest</SelectItem>
								<SelectItem value='price-low'>Price: Low to High</SelectItem>
								<SelectItem value='price-high'>Price: High to Low</SelectItem>
								<SelectItem value='discount'>Biggest Discount</SelectItem>
							</SelectContent>
						</Select>

						<Popover>
							<PopoverTrigger asChild>
								<Button variant='outline' size='icon'>
									<Filter size={16} />
								</Button>
							</PopoverTrigger>
							<PopoverContent className='w-80'>
								<div className='space-y-4'>
									<h4 className='font-medium'>Price Range</h4>
									<div className='flex items-center space-x-2'>
										<Input
											type='number'
											placeholder='Min'
											value={priceRangeFilter[0]}
											onChange={(e) =>
												setPriceRangeFilter([
													parseFloat(e.target.value) || 0,
													priceRangeFilter[1],
												])
											}
											className='w-24'
										/>
										<span>to</span>
										<Input
											type='number'
											placeholder='Max'
											value={priceRangeFilter[1]}
											onChange={(e) =>
												setPriceRangeFilter([
													priceRangeFilter[0],
													parseFloat(e.target.value) || 1000,
												])
											}
											className='w-24'
										/>
									</div>

									<div className='pt-2'>
										<Button
											variant='secondary'
											size='sm'
											onClick={() => setPriceRangeFilter([0, 1000])}
										>
											Reset
										</Button>
									</div>
								</div>
							</PopoverContent>
						</Popover>
					</div>
				</div>

				<TabsContent value='explore' className='mt-0'>
					{isLoading ? (
						<div
							className={`grid ${
								viewMode === 'grid'
									? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
									: ''
							} gap-6`}
						>
							{Array(6)
								.fill(0)
								.map((_, i) => (
									<ListingSkeleton key={i} viewMode={viewMode} />
								))}
						</div>
					) : sortedFilteredAllListings.length === 0 ? (
						<EmptyState
							title='No listings found'
							description='Try adjusting your search or filters'
						/>
					) : (
						<div
							className={`grid ${
								viewMode === 'grid'
									? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
									: ''
							} gap-6`}
						>
							{sortedFilteredAllListings.map((listing) => (
								<ListingCard
									key={listing._id}
									listing={listing}
									viewMode={viewMode}
									onSaveToggle={() => toggleSaved(listing._id)}
									onView={() => router.push(`/marketplace/${listing._id}`)}
								/>
							))}
						</div>
					)}
				</TabsContent>

				<TabsContent value='my-listings' className='mt-0'>
					<div className='flex justify-between items-center mb-6'>
						<h2 className='text-xl font-semibold'>Your Listings</h2>
						<Button
							onClick={() => setShowCreateDialog(true)}
							className='flex items-center gap-2'
						>
							<Plus size={16} />
							<span>Create Listing</span>
						</Button>
					</div>

					{isLoading ? (
						<div
							className={`grid ${
								viewMode === 'grid'
									? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
									: ''
							} gap-6`}
						>
							{Array(3)
								.fill(0)
								.map((_, i) => (
									<ListingSkeleton key={i} viewMode={viewMode} />
								))}
						</div>
					) : sortedFilteredMyListings.length === 0 ? (
						<EmptyState
							title="You don't have any listings yet"
							description='Create your first listing to start selling'
							action={
								<Button
									onClick={() => setShowCreateDialog(true)}
									className='mt-4'
								>
									Create Your First Listing
								</Button>
							}
						/>
					) : (
						<div
							className={`grid ${
								viewMode === 'grid'
									? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
									: ''
							} gap-6`}
						>
							{sortedFilteredMyListings.map((listing) => (
								<MyListingCard
									key={listing._id}
									listing={listing}
									viewMode={viewMode}
									onEdit={() => {
										setEditingListing(listing);
										setShowCreateDialog(true);
									}}
									onDelete={() => deleteListing(listing._id)}
									onView={() => router.push(`/marketplace/${listing._id}`)}
								/>
							))}
						</div>
					)}
				</TabsContent>
			</Tabs>

			{/* Create/Edit Listing Dialog */}
			<Dialog open={showCreateDialog} onOpenChange={handleDialogOpenChange}>
				<DialogContent className='sm:max-w-[650px]'>
					<DialogHeader>
						<DialogTitle>
							{editingListing ? 'Edit Listing' : 'Create New Listing'}
						</DialogTitle>
						<DialogDescription>
							{editingListing
								? 'Make changes to your listing here.'
								: 'Add details about your new product or service.'}
						</DialogDescription>
					</DialogHeader>

					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
							<FormField
								control={form.control}
								name='title'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Title</FormLabel>
										<FormControl>
											<Input
												placeholder='E.g. Premium Design Templates'
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name='description'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Description</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Describe what you're offering..."
												className='min-h-[100px]'
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Replace the image form field with this upload version */}
							<FormField
								control={form.control}
								name='image'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Image</FormLabel>
										<FormControl>
											<div className='flex flex-col space-y-2'>
												{field.value ? (
													<div className='relative w-full h-40 rounded-md overflow-hidden mb-2'>
														<img
															src={field.value}
															alt='Listing preview'
															className='object-cover w-full h-full'
														/>
														<Button
															type='button'
															variant='destructive'
															size='sm'
															className='absolute top-2 right-2'
															onClick={() => field.onChange('')}
														>
															Remove
														</Button>
													</div>
												) : null}

												<div className='flex items-center gap-2'>
													<Input
														type='file'
														accept='image/*'
														onChange={handleUploadImage}
														className='flex-1'
													/>

													<Button
														type='button'
														variant='outline'
														onClick={() => {
															const url = prompt('Or enter an image URL:');
															if (url) field.onChange(url);
														}}
													>
														Use URL
													</Button>
												</div>
											</div>
										</FormControl>
										<FormDescription>
											Upload an image to showcase your listing
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className='grid grid-cols-2 sm:grid-cols-3 gap-4'>
								<FormField
									control={form.control}
									name='price'
									render={({ field }) => (
										<FormItem>
											<FormLabel>Regular Price ($)</FormLabel>
											<FormControl>
												<Input type='number' step='0.01' min='0' {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name='discount'
									render={({ field }) => (
										<FormItem>
											<FormLabel>Discount (%)</FormLabel>
											<FormControl>
												<Input
													type='number'
													min='0'
													max='100'
													step='1'
													{...field}
													onChange={(e) => {
														const value = Math.min(
															100,
															Math.max(0, parseInt(e.target.value) || 0)
														);
														field.onChange(value);

														// Calculate token price based on discount
														const price = parseFloat(
															form.getValues('price').toString()
														);
														const newTokenPrice = price * (1 - value / 100);
														form.setValue(
															'priceWithToken',
															parseFloat(newTokenPrice.toFixed(2))
														);
													}}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name='priceWithToken'
									render={({ field }) => (
										<FormItem>
											<FormLabel>Token Price ($)</FormLabel>
											<FormControl>
												<Input type='number' step='0.01' min='0' {...field} />
											</FormControl>
											<FormDescription>Price for token holders</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
								<FormField
									control={form.control}
									name='isLimited'
									render={({ field }) => (
										<FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
											<FormControl>
												<Switch
													checked={field.value}
													onCheckedChange={field.onChange}
												/>
											</FormControl>
											<div className='space-y-1 leading-none'>
												<FormLabel>Limited Quantity</FormLabel>
												<FormDescription>
													Enable if you have limited stock
												</FormDescription>
											</div>
										</FormItem>
									)}
								/>

								{form.watch('isLimited') && (
									<FormField
										control={form.control}
										name='quantity'
										render={({ field }) => (
											<FormItem>
												<FormLabel>Available Quantity</FormLabel>
												<FormControl>
													<Input
														type='number'
														min='1'
														step='1'
														{...field}
														value={field.value || ''}
														onChange={(e) =>
															field.onChange(
																parseInt(e.target.value) || undefined
															)
														}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								)}
							</div>

							<DialogFooter>
								<Button
									type='button'
									variant='outline'
									onClick={() => handleDialogOpenChange(false)}
									disabled={isSubmitting}
								>
									Cancel
								</Button>
								<Button type='submit' disabled={isSubmitting}>
									{isSubmitting ? (
										<>Saving...</>
									) : editingListing ? (
										<>Update Listing</>
									) : (
										<>Create Listing</>
									)}
								</Button>
							</DialogFooter>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</div>
	);
}

// Listing Card Component
function ListingCard({
	listing,
	viewMode,
	onSaveToggle,
	onView,
}: {
	listing: Listing;
	viewMode: 'grid' | 'list';
	onSaveToggle: () => void;
	onView: () => void;
}) {
	if (viewMode === 'list') {
		return (
			<Card className='overflow-hidden'>
				<div className='flex flex-col sm:flex-row'>
					<div className='relative sm:w-48 h-40 shrink-0'>
						<div className='h-full w-full'>
							{listing.image ? (
								<img
									src={listing.image}
									alt={listing.title}
									className='h-full w-full object-cover'
								/>
							) : (
								<div className='h-full w-full bg-secondary flex items-center justify-center'>
									<Tag size={32} className='text-muted-foreground' />
								</div>
							)}
						</div>

						{listing.isLimited && listing.quantity && (
							<Badge
								variant='secondary'
								className='absolute bottom-2 left-2 bg-orange-500 text-white hover:bg-orange-500'
							>
								{listing.quantity} left
							</Badge>
						)}
					</div>

					<div className='flex-1 p-4 flex flex-col'>
						<div className='flex justify-between'>
							<div>
								<h3
									className='font-medium text-lg cursor-pointer hover:text-primary'
									onClick={onView}
								>
									{listing.title}
								</h3>

								<div className='flex items-center gap-2 mt-1'>
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

							<div className='text-right'>
								<div className='font-bold text-lg'>
									${listing.price.toFixed(2)} or $
									{listing.priceWithToken.toFixed(2)}
								</div>
								{listing.priceWithToken < listing.price && (
									<div className='text-sm text-green-600 flex items-center justify-end gap-1'>
										${listing.priceWithToken.toFixed(2)} with token
										{listing.discount > 0 && (
											<Badge
												variant='outline'
												className='bg-green-50 text-green-700 ml-1'
											>
												{listing.discount}% off
											</Badge>
										)}
									</div>
								)}
							</div>
						</div>

						<p className='text-muted-foreground text-sm mt-2 line-clamp-2 flex-grow'>
							{listing.description}
						</p>

						<div className='flex justify-between items-center mt-3'>
							<div className='flex items-center text-muted-foreground text-sm'>
								<Clock size={14} className='mr-1' />
								{formatDate(listing.createdAt)}
							</div>
						</div>
					</div>
				</div>
			</Card>
		);
	}

	return (
		<Card className='overflow-hidden'>
			<div className='relative aspect-video cursor-pointer' onClick={onView}>
				{listing.image ? (
					<img
						src={listing.image}
						alt={listing.title}
						className='h-full w-full object-cover'
					/>
				) : (
					<div className='h-full w-full bg-secondary flex items-center justify-center'>
						<Tag size={32} className='text-muted-foreground' />
					</div>
				)}

				{listing.isLimited && listing.quantity && (
					<Badge
						variant='secondary'
						className='absolute bottom-2 left-2 bg-orange-500 text-white hover:bg-orange-500'
					>
						{listing.quantity} left
					</Badge>
				)}
			</div>

			<CardHeader className='p-4 pb-2'>
				<div className='flex justify-between items-start gap-2'>
					<CardTitle
						className='text-lg font-medium cursor-pointer hover:text-primary'
						onClick={onView}
					>
						{listing.title}
					</CardTitle>
				</div>

				<div className='flex items-center gap-2 mt-1'>
					<Avatar className='h-6 w-6'>
						<AvatarImage src={listing.owner?.photo} />
						<AvatarFallback>{listing.owner?.name?.charAt(0)}</AvatarFallback>
					</Avatar>
					<span className='text-sm text-muted-foreground'>
						{listing.owner?.name || 'Unknown'}
					</span>
				</div>
			</CardHeader>

			<CardFooter className='p-4 pt-0 flex-col items-stretch gap-3'>
				<div className='flex justify-between items-center w-full'>
					<div className='flex items-center text-muted-foreground text-sm'>
						<Clock size={14} className='mr-1' />
						{formatDate(listing.createdAt)}
					</div>

					<div>
						<div className='font-bold text-right'>
							${listing.price.toFixed(2)} or {listing.priceWithToken.toFixed(2)}
							T
						</div>
						{listing.priceWithToken < listing.price && (
							<div className='text-sm text-green-600 flex items-center justify-end gap-1'>
								${listing.priceWithToken.toFixed(2)}
								{listing.discount > 0 && (
									<Badge
										variant='outline'
										className='bg-green-50 text-green-700 ml-1'
									>
										{listing.discount}% off
									</Badge>
								)}
							</div>
						)}
					</div>
				</div>

				<Button
					className='w-full flex items-center justify-center gap-1'
					onClick={onView}
				>
					View Details
				</Button>
			</CardFooter>
		</Card>
	);
}

// My Listing Card Component
function MyListingCard({
	listing,
	viewMode,
	onEdit,
	onDelete,
	onView,
}: {
	listing: Listing;
	viewMode: 'grid' | 'list';
	onEdit: () => void;
	onDelete: () => void;
	onView: () => void;
}) {
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);

	if (viewMode === 'list') {
		return (
			<Card className='overflow-hidden'>
				<div className='flex flex-col sm:flex-row'>
					<div className='relative sm:w-48 h-40 shrink-0'>
						<div className='h-full w-full'>
							{listing.image ? (
								<img
									src={listing.image}
									alt={listing.title}
									className='h-full w-full object-cover'
								/>
							) : (
								<div className='h-full w-full bg-secondary flex items-center justify-center'>
									<Tag size={32} className='text-muted-foreground' />
								</div>
							)}
						</div>

						{listing.isLimited && listing.quantity && (
							<Badge
								variant='secondary'
								className='absolute bottom-2 left-2 bg-orange-500 text-white hover:bg-orange-500'
							>
								{listing.quantity} left
							</Badge>
						)}
					</div>

					<div className='flex-1 p-4 flex flex-col'>
						<div className='flex justify-between'>
							<div>
								<h3
									className='font-medium text-lg cursor-pointer hover:text-primary'
									onClick={onView}
								>
									{listing.title}
								</h3>
							</div>

							<div className='text-right'>
								<div className='font-bold text-lg'>
									${listing.price.toFixed(2)}
								</div>
								{listing.priceWithToken < listing.price && (
									<div className='text-sm text-green-600 flex items-center justify-end gap-1'>
										${listing.priceWithToken.toFixed(2)} with token
										{listing.discount > 0 && (
											<Badge
												variant='outline'
												className='bg-green-50 text-green-700 ml-1'
											>
												{listing.discount}% off
											</Badge>
										)}
									</div>
								)}
							</div>
						</div>

						<p className='text-muted-foreground text-sm mt-2 line-clamp-2 flex-grow'>
							{listing.description}
						</p>

						<div className='flex justify-between items-center mt-3'>
							<div className='flex items-center text-muted-foreground text-sm'>
								<Clock size={14} className='mr-1' />
								{formatDate(listing.createdAt)}
							</div>

							<div className='flex gap-2'>
								<Button
									variant='outline'
									size='sm'
									onClick={onEdit}
									className='flex items-center gap-1'
								>
									<Edit size={14} />
									Edit
								</Button>

								<Dialog
									open={showDeleteDialog}
									onOpenChange={setShowDeleteDialog}
								>
									<DialogTrigger asChild>
										<Button
											variant='outline'
											size='sm'
											className='flex items-center gap-1 text-red-500 border-red-200'
										>
											<Trash2 size={14} />
											Delete
										</Button>
									</DialogTrigger>
									<DialogContent>
										<DialogHeader>
											<DialogTitle>Confirm Deletion</DialogTitle>
											<DialogDescription>
												Are you sure you want to delete this listing? This
												action cannot be undone.
											</DialogDescription>
										</DialogHeader>
										<div className='flex justify-end gap-2 mt-4'>
											<Button
												variant='outline'
												onClick={() => setShowDeleteDialog(false)}
											>
												Cancel
											</Button>
											<Button
												variant='destructive'
												onClick={() => {
													onDelete();
													setShowDeleteDialog(false);
												}}
											>
												Delete
											</Button>
										</div>
									</DialogContent>
								</Dialog>

								<Button
									variant='outline'
									size='sm'
									onClick={onView}
									className='flex items-center gap-1'
								>
									View
								</Button>
							</div>
						</div>
					</div>
				</div>
			</Card>
		);
	}

	return (
		<Card className='overflow-hidden'>
			<div className='relative aspect-video cursor-pointer' onClick={onView}>
				{listing.image ? (
					<img
						src={listing.image}
						alt={listing.title}
						className='h-full w-full object-cover'
					/>
				) : (
					<div className='h-full w-full bg-secondary flex items-center justify-center'>
						<Tag size={32} className='text-muted-foreground' />
					</div>
				)}

				{listing.isLimited && listing.quantity && (
					<Badge
						variant='secondary'
						className='absolute bottom-2 left-2 bg-orange-500 text-white hover:bg-orange-500'
					>
						{listing.quantity} left
					</Badge>
				)}
			</div>

			<CardHeader className='p-4 pb-2'>
				<div className='flex justify-between items-start gap-2'>
					<CardTitle
						className='text-lg font-medium cursor-pointer hover:text-primary'
						onClick={onView}
					>
						{listing.title}
					</CardTitle>
				</div>
			</CardHeader>

			<CardContent className='p-4 pt-0'>
				<p className='text-muted-foreground text-sm line-clamp-2 min-h-[40px]'>
					{listing.description}
				</p>

				<div className='flex justify-between items-center mt-3'>
					<div className='flex items-center text-muted-foreground text-sm'>
						<Clock size={14} className='mr-1' />
						{formatDate(listing.createdAt)}
					</div>

					<div>
						<div className='font-bold text-right'>
							${listing.price.toFixed(2)}
						</div>
						{listing.priceWithToken < listing.price && (
							<div className='text-sm text-green-600 flex items-center justify-end gap-1'>
								${listing.priceWithToken.toFixed(2)}
								{listing.discount > 0 && (
									<Badge
										variant='outline'
										className='bg-green-50 text-green-700 ml-1'
									>
										{listing.discount}% off
									</Badge>
								)}
							</div>
						)}
					</div>
				</div>
			</CardContent>

			<CardFooter className='p-4 pt-0 flex-col items-stretch gap-3'>
				<div className='flex gap-2'>
					<Button
						variant='outline'
						className='flex-1 flex items-center justify-center gap-1'
						onClick={onEdit}
					>
						<Edit size={14} />
						Edit
					</Button>

					<Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
						<DialogTrigger asChild>
							<Button
								variant='outline'
								className='flex-1 flex items-center justify-center gap-1 text-red-500 border-red-200'
							>
								<Trash2 size={14} />
								Delete
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Confirm Deletion</DialogTitle>
								<DialogDescription>
									Are you sure you want to delete this listing? This action
									cannot be undone.
								</DialogDescription>
							</DialogHeader>
							<div className='flex justify-end gap-2 mt-4'>
								<Button
									variant='outline'
									onClick={() => setShowDeleteDialog(false)}
								>
									Cancel
								</Button>
								<Button
									variant='destructive'
									onClick={() => {
										onDelete();
										setShowDeleteDialog(false);
									}}
								>
									Delete
								</Button>
							</div>
						</DialogContent>
					</Dialog>

					<Button
						className='flex-1 flex items-center justify-center gap-1'
						onClick={onView}
					>
						View
					</Button>
				</div>
			</CardFooter>
		</Card>
	);
}

// Empty State Component
function EmptyState({
	title,
	description,
	action,
}: {
	title: string;
	description: string;
	action?: React.ReactNode;
}) {
	return (
		<div className='flex flex-col items-center justify-center p-10 bg-muted/20 rounded-lg border border-dashed'>
			<div className='flex h-20 w-20 items-center justify-center rounded-full bg-muted'>
				<Tag className='h-10 w-10 text-muted-foreground' />
			</div>
			<h3 className='mt-4 text-lg font-semibold'>{title}</h3>
			<p className='mt-2 text-sm text-muted-foreground text-center max-w-xs'>
				{description}
			</p>
			{action}
		</div>
	);
}

// Listing Skeleton for loading state
function ListingSkeleton({ viewMode }: { viewMode: 'grid' | 'list' }) {
	if (viewMode === 'list') {
		return (
			<Card className='overflow-hidden'>
				<div className='flex flex-col sm:flex-row'>
					<Skeleton className='relative sm:w-48 h-40 shrink-0' />

					<div className='flex-1 p-4 flex flex-col'>
						<div className='flex justify-between'>
							<div>
								<Skeleton className='h-5 w-40 mb-2' />
								<Skeleton className='h-4 w-32' />
							</div>

							<div className='text-right'>
								<Skeleton className='h-5 w-16 mb-1' />
								<Skeleton className='h-4 w-24' />
							</div>
						</div>

						<div className='mt-2 space-y-1'>
							<Skeleton className='h-4 w-full' />
							<Skeleton className='h-4 w-full' />
							<Skeleton className='h-4 w-3/4' />
						</div>

						<div className='flex justify-between items-center mt-3'>
							<Skeleton className='h-4 w-32' />

							<div className='flex gap-2'>
								<Skeleton className='h-9 w-16' />
								<Skeleton className='h-9 w-16' />
							</div>
						</div>
					</div>
				</div>
			</Card>
		);
	}

	return (
		<Card className='overflow-hidden'>
			<Skeleton className='aspect-video w-full' />

			<CardHeader className='p-4 pb-2'>
				<div className='flex justify-between items-start gap-2'>
					<Skeleton className='h-5 w-40' />
					<Skeleton className='h-8 w-8 rounded-full' />
				</div>

				<div className='flex items-center gap-2 mt-1'>
					<Skeleton className='h-6 w-6 rounded-full' />
					<Skeleton className='h-4 w-24' />
				</div>
			</CardHeader>

			<CardContent className='p-4 pt-0'>
				<div className='space-y-1'>
					<Skeleton className='h-4 w-full' />
					<Skeleton className='h-4 w-full' />
				</div>
			</CardContent>

			<CardFooter className='p-4 pt-0 flex-col items-stretch gap-3'>
				<div className='flex justify-between items-center w-full'>
					<Skeleton className='h-4 w-24' />

					<div>
						<Skeleton className='h-5 w-16 mb-1' />
						<Skeleton className='h-4 w-24' />
					</div>
				</div>

				<Skeleton className='h-9 w-full' />
			</CardFooter>
		</Card>
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
		}).format(date);
	}
}
