'use client';

import { Diamond } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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

interface TokenInfoCardProps {
  selectedCreator: Creator | null;
}

export default function TokenInfoCard({ selectedCreator }: TokenInfoCardProps) {
  // Get formatted token symbol
  const tokenSymbol = selectedCreator?.token?.symbol || 'TOKEN';
  const formattedTokenSymbol = tokenSymbol.startsWith('$')
    ? tokenSymbol
    : `$${tokenSymbol}`;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Diamond className="h-5 w-5 text-indigo-500" />
          {selectedCreator?.token?.name || 'Token'} Information
        </CardTitle>
        <CardDescription>
          Statistics about {selectedCreator?.name}'s {formattedTokenSymbol} token
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 mb-4">
          <div className="bg-gray-50 p-4 rounded-lg flex items-center space-x-4">
            <span className="text-gray-500 mr-1">CA:</span>
            {selectedCreator?.token?.contractAddress ? (
              <a
                href={`https://solscan.io/token/${selectedCreator.token.contractAddress}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline truncate flex-1 font-mono text-sm"
              >
                {selectedCreator.token.contractAddress}
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
            ) : (
              <span className="text-gray-400 italic">Not available</span>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 mb-4">
          <div className="bg-gray-50 p-4 rounded-lg flex items-center space-x-4">
            {selectedCreator?.token?.imageUrl ? (
              <img
                src={selectedCreator.token.imageUrl}
                alt={selectedCreator.token.name}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary font-bold">
                  {selectedCreator?.token?.symbol?.substring(0, 2) ||
                    tokenSymbol.substring(0, 2)}
                </span>
              </div>
            )}
            <div>
              <div className="text-sm text-gray-500 mb-1">Token</div>
              <div className="font-bold flex items-center">
                {selectedCreator?.token?.name ||
                  `${selectedCreator?.name}'s Token`}
                <span className="ml-2 text-sm bg-gray-200 px-2 py-0.5 rounded-full">
                  {formattedTokenSymbol}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500 mb-1">Points Earned</div>
            <div className="text-xl font-bold">
              {formatTokenAmount(selectedCreator?.earnedPoints || 0)}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500 mb-1">Total Supply</div>
            <div className="text-xl font-bold">
              {formatTokenAmount(selectedCreator?.token?.totalSupply || 1000000)}{' '}
              {formattedTokenSymbol}
            </div>
          </div>
        </div>

        {/* Description if available */}
        {selectedCreator?.token?.description && (
          <div className="bg-gray-50 p-4 rounded-lg mt-2">
            <div className="text-sm text-gray-500 mb-1">Description</div>
            <div className="text-sm">{selectedCreator.token.description}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}