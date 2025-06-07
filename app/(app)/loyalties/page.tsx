'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';
import { Coins } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useUserProfile } from '@/hooks/useUserProfile';
import Loading from '@/components/Loading';

// Import our components
import CreatorSelector from '@/components/loyalties/CreatorSelector';
import TokenHoldingCard from '@/components/loyalties/TokenHoldingCard';
import TokenInfoCard from '@/components/loyalties/TokenInfoCard';
import ActivityFeed from '@/components/loyalties/ActivityFeed';
import Leaderboard from '@/components/loyalties/Leaderboard';
import RewardsTab from '@/components/loyalties/RewardsTab';

// Types
interface Creator {
  _id: string;
  name: string;
  username: string;
  avatarUrl: string;
  earnedPoints: number;
  engagements: number;
  token?: {
    _id: string;
    name: string;
    symbol: string;
    imageUrl?: string;
    totalSupply?: number;
    circulatingSupply?: number;
    decimals?: number;
    description?: string;
    contractAddress: string;
  };
}

interface LoyaltyStatsResponse {
  creators: Array<{
    creatorId: string;
    creatorName: string;
    creatorUsername: string;
    creatorPhoto?: string;
    totalPoints: number;
    count: number;
    lastEarned: string;
    tokenId?: string;
    tokenName?: string;
    tokenSymbol?: string;
    tokenImage?: string;
    tokenSupply?: number;
    tokenDescription?: string;
    tokenAddress?: string;
  }>;
  overall: {
    totalPoints: number;
    uniqueCreators: number;
    uniqueTokens: number;
    recordCount: number;
    firstEarned?: string;
    lastEarned?: string;
  };
  recentActivity: Array<{
    _id: string;
    user: string;
    creator: {
      _id: string;
      name: string;
      username: string;
      photo?: string;
    };
    token?: {
      _id: string;
      name: string;
      symbol: string;
      imageUrl?: string;
    };
    engagement: {
      _id: string;
      sourceUrl: string;
      engagedTime: number;
    };
    loyaltyPoints: number;
    createdAt: string;
  }>;
}

export default function LoyaltiesPage() {
  // Hooks
  const { data: userProfile, isLoading: isLoadingProfile } = useUserProfile();
  const router = useRouter();

  // State
  const [creators, setCreators] = useState<Creator[]>([]);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [tokenClaimed, setTokenClaimed] = useState('0');
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [recentActivity, setRecentActivity] = useState<
    LoyaltyStatsResponse['recentActivity']
  >([]);

  // Fetch user loyalty stats on first load
  useEffect(() => {
    fetchUserLoyaltyStats();
  }, []);

  // Fetch user's loyalty stats
  const fetchUserLoyaltyStats = async () => {
    setIsLoadingStats(true);
    try {
      const response = await axios.get('/loyalties/stats/user');
      console.log('User loyalty stats:', response.data);

      if (response.data && response.data.status === 'success') {
        const stats: LoyaltyStatsResponse = response.data.data;
        console.log('LoyaltyStatsResponse:', stats);
        // Map the creators from the stats to our Creator interface
        const mappedCreators: any = stats.creators.map((creator) => ({
          _id: creator.creatorId,
          name: creator.creatorName,
          username: creator.creatorUsername,
          avatarUrl: creator.creatorPhoto || '',
          earnedPoints: creator.totalPoints,
          engagements: creator.count,
          token: creator.tokenId
            ? {
                _id: creator.tokenId,
                name: creator.tokenName || 'Token',
                symbol: creator.tokenSymbol || 'TKN',
                imageUrl: creator.tokenImage,
                totalSupply: creator.tokenSupply,
                description: creator.tokenDescription,
                contractAddress: creator.tokenAddress,
              }
            : undefined,
        }));

        setCreators(mappedCreators);
        setRecentActivity(stats.recentActivity);

        // Select the first creator by default
        if (mappedCreators.length > 0) {
          setSelectedCreator(mappedCreators[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching user loyalty stats:', error);
      toast.error('Failed to load loyalty statistics');
    } finally {
      setIsLoadingStats(false);
      setIsInitialLoad(false);
    }
  };

  // Handle selecting a different creator
  const handleSelectCreator = (creator: Creator) => {
    setSelectedCreator(creator);
  };

  // Determine if we're in a main loading state
  const isLoading = isLoadingProfile || (isLoadingStats && isInitialLoad);

  // Empty state
  if (!isLoading && creators.length === 0) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-[70vh]">
        <Coins className="h-16 w-16 text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold mb-2">No Creators Found</h1>
        <p className="text-gray-500 mb-6 text-center max-w-md">
          There are no creators with loyalty tokens available yet. Check back
          later for updates.
        </p>
        <Button onClick={() => router.push('/explore')}>
          Explore Creators
        </Button>
      </div>
    );
  }

  // Main loading state - shows only once during initial load
  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="container mx-auto p-6 flex flex-col h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <h1 className="text-3xl font-bold">Loyalties</h1>
      </div>

      {/* Creator Selection Dropdown */}
      <CreatorSelector
        creators={creators}
        selectedCreator={selectedCreator}
        onSelectCreator={handleSelectCreator}
      />

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Your Token Card */}
            <TokenHoldingCard
              selectedCreator={selectedCreator}
              userWalletAddress={userProfile?.wallets?.solana}
              tokenClaimed={tokenClaimed}
            />

            {/* Token Stats Card */}
            <TokenInfoCard selectedCreator={selectedCreator} />
          </div>

          {/* Recent Activity */}
          <ActivityFeed
            selectedCreator={selectedCreator}
            recentActivity={recentActivity}
          />
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard">
          <Leaderboard selectedCreator={selectedCreator} />
        </TabsContent>

        {/* Rewards Tab */}
        <TabsContent value="rewards">
          <RewardsTab selectedCreator={selectedCreator} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
