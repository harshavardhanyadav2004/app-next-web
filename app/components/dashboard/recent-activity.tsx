"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface Activity {
  user_id: string;
  activity: string;
  created_at: string;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }

  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) {
    return `${years} year${years > 1 ? 's' : ''} ago`;
  } else if (months > 0) {
    return `${months} month${months > 1 ? 's' : ''} ago`;
  } else if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else {
    return 'just now';
  }
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    async function fetchActivities() {
      try {
        const API_URL = "https://appcraft-go-web-production.up.railway.app";
        const response = await fetch(`${API_URL}/users/activity/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Uncomment if authentication is required
            // "Authorization": `Bearer ${yourToken}`
          },
          signal: abortController.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(async () => ({
            message: await response.text()
          }));
          throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }

        const data: Activity[] = await response.json();
        setActivities(data.slice(0, 5));

      } catch (err) {
        if (abortController.signal.aborted) {
          console.log('Request was aborted');
          return;
        }
        
        const message = err instanceof Error ? err.message : "Unknown error occurred";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchActivities();

    return () => abortController.abort();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-500">
        <p>Error: {error}</p>
        <p className="text-xs mt-2">Check browser console for details</p>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No recent activities found
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {activities.map((activity) => (
        <div 
          key={`${activity.user_id}-${activity.created_at}`} 
          className="flex items-center"
        >
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              {activity.activity}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatRelativeTime(activity.created_at)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

