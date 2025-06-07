'use client';

import { Coins } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface Creator {
  _id: string;
  name: string;
  username: string;
  token?: {
    symbol: string;
  };
}

interface RewardsTabProps {
  selectedCreator: Creator | null;
}

export default function RewardsTab({ selectedCreator }: RewardsTabProps) {
  // Get formatted token symbol
  const tokenSymbol = selectedCreator?.token?.symbol || 'TOKEN';
  const formattedTokenSymbol = tokenSymbol.startsWith('$')
    ? tokenSymbol
    : `$${tokenSymbol}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Loyalty Rewards</CardTitle>
        <CardDescription>
          Ways to earn more {formattedTokenSymbol} tokens from{' '}
          {selectedCreator?.name}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center py-12">
        <div className="mb-6">
          <div className="bg-gray-100 p-8 inline-block rounded-full">
            <Coins className="h-12 w-12 text-gray-400" />
          </div>
        </div>
        <h3 className="text-2xl font-semibold mb-2">Rewards Coming Soon</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          We're working on exciting new ways for you to earn rewards from{' '}
          {selectedCreator?.name}. Check back soon for updates!
        </p>
      </CardContent>
    </Card>
  );
}