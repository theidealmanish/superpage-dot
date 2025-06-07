'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

interface CreatorSelectorProps {
  creators: Creator[];
  selectedCreator: Creator | null;
  onSelectCreator: (creator: Creator) => void;
}

export default function CreatorSelector({
  creators,
  selectedCreator,
  onSelectCreator,
}: CreatorSelectorProps) {
  return (
    <div className="my-4 md:mt-0">
      <h3 className="font-semibold mb-2">Select creator</h3>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-[240px] justify-between p-6">
            <div className="flex items-center gap-2 truncate">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={selectedCreator?.avatarUrl || ''}
                  alt={selectedCreator?.name}
                />
                <AvatarFallback>
                  {selectedCreator?.name?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-left">
                <span className="text-sm font-medium truncate">
                  {selectedCreator?.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  @{selectedCreator?.username}
                </span>
              </div>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[240px]" align="end">
          <DropdownMenuLabel>Select Creator</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {creators.map((creator) => (
            <DropdownMenuItem
              key={creator._id}
              className="cursor-pointer"
              onClick={() => onSelectCreator(creator)}
            >
              <div className="flex items-center gap-2 w-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={creator.avatarUrl || ''}
                    alt={creator.name}
                  />
                  <AvatarFallback>
                    {creator?.name?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{creator.name}</div>
                  <div className="text-xs text-muted-foreground">
                    @{creator.username}
                  </div>
                </div>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}