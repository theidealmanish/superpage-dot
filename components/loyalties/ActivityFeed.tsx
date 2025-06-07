'use client';

import { Calendar, Coins } from 'lucide-react';
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
  avatarUrl: string;
  earnedPoints: number;
  engagements: number;
}

interface Activity {
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
}

interface ActivityFeedProps {
  selectedCreator: Creator | null;
  recentActivity: Activity[];
}

export default function ActivityFeed({
  selectedCreator,
  recentActivity,
}: ActivityFeedProps) {
  if (!selectedCreator || recentActivity.length === 0) {
    return null;
  }

  const filteredActivities = recentActivity.filter(
    (activity) => activity.creator._id === selectedCreator._id
  );

  if (filteredActivities.length === 0) {
    return null;
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Calendar className="h-5 w-5 text-blue-500" />
          Recent Activity
        </CardTitle>
        <CardDescription>
          Your most recent engagement with {selectedCreator.name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredActivities.slice(0, 3).map((activity) => (
            <div
              key={activity._id}
              className="flex items-center justify-between p-3 rounded-md border"
            >
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 p-2 rounded-full">
                  <Coins className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <div className="font-medium">
                    Earned {activity.loyaltyPoints} points
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(activity.createdAt).toLocaleDateString()} •
                    {activity.engagement?.sourceUrl && (
                      <a
                        href={activity.engagement.sourceUrl}
                        className="ml-1 text-blue-500 hover:underline"
                      >
                        View Content
                      </a>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">+{activity.loyaltyPoints}</div>
                <div className="text-xs text-gray-500">
                  {activity.engagement?.engagedTime}s watched
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}