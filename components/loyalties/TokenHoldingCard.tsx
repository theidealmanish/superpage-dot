'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Coins, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';
import axios from '@/lib/axios';
import formatTokenAmount from '@/lib/formatNumberToString';

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

interface TokenHoldingCardProps {
  selectedCreator: Creator | null;
  userWalletAddress?: string;
  tokenClaimed: string;
}

export default function TokenHoldingCard({
  selectedCreator,
  userWalletAddress,
  tokenClaimed,
}: TokenHoldingCardProps) {
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimTxId, setClaimTxId] = useState<string | null>(null);

  // Get formatted token symbol
  const tokenSymbol = selectedCreator?.token?.symbol || 'TOKEN';
  const formattedTokenSymbol = tokenSymbol.startsWith('$')
    ? tokenSymbol
    : `$${tokenSymbol}`;

  // handle the token claim
  const claimToken = async () => {
    setIsClaiming(true);
    console.log('Claiming token for user:', userWalletAddress);
    console.log('Selected creator:', selectedCreator?.token?._id);
    try {
      const response = await axios.post('/tokens/claim', {
        tokenId: selectedCreator?.token?._id,
        recipientAddress: userWalletAddress,
      });
      if (response.data && response.data.status === 'success') {
        setClaimTxId(response.data.data.transactionId);
        toast.success('Token claimed successfully!');
      } else {
        toast.error('Failed to claim token');
      }
    } catch (error) {
      console.error('Error claiming token:', error);
      toast.error('Failed to claim token');
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Coins className="h-5 w-5 text-amber-500" />
          {formattedTokenSymbol} Holding
        </CardTitle>
        <CardDescription>
          Summary of your token holdings from @{selectedCreator?.username}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-baseline mb-6">
          <div className="text-4xl font-bold">
            {formatTokenAmount(selectedCreator?.earnedPoints || 0)}
          </div>
          <div className="text-sm text-gray-500">
            From {selectedCreator?.engagements || 0} engagements
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Loyalty Points</span>
              <span className="font-medium">
                {selectedCreator?.earnedPoints || 0} points
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Token Claimed</span>
              <span className="font-medium ">{tokenClaimed || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Token Value (Not listed yet)</span>
              <span className="font-medium text-amber-600">
                ≈{' '}
                {Math.round((selectedCreator?.earnedPoints || 0) * 0.01 * 100) /
                  100}{' '}
                {formattedTokenSymbol}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {claimTxId && (
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-500" />
            <a
              href={`https://solscan.io/tx/${claimTxId}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-500 hover:underline truncate flex-1 font-mono text-sm"
            >
              Token claimed successfully!
              <span className="inline-block ml-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </span>
            </a>
          </div>
        )}

        <div className="flex flex-col">
          {selectedCreator?.token?._id ? (
            <Button disabled={isClaiming} onClick={claimToken}>
              {isClaiming ? 'Claiming' : 'Claim Tokens'}
            </Button>
          ) : (
            <Button
              variant="outline"
              className="w-full"
              disabled
              onClick={() => {
                toast.error('Token not available for this creator');
              }}
            >
              Token Not Available
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}