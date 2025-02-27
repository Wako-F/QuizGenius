import { useState, useEffect } from "react";
import { QuizActivity } from "@/lib/firebase/userUtils";
import ActivityCard from "./ActivityCard";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/hooks/useAuth";

interface RecentActivityProps {
  activities?: QuizActivity[];
  maxHeight?: string;
}

export default function RecentActivity({ activities, maxHeight = "400px" }: RecentActivityProps) {
  const { refreshUserProfile } = useAuth();
  const [recentActivities, setRecentActivities] = useState<QuizActivity[]>([]);

  useEffect(() => {
    if (activities && activities.length > 0) {
      setRecentActivities(activities);
    }
  }, [activities]);

  const refreshActivity = async () => {
    await refreshUserProfile();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
    >
      {/* Activity Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Recent Activity</h2>
        <button
          onClick={refreshActivity}
          className="text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      
      {/* Activities with scrollable container */}
      <div className={`overflow-y-auto pr-2`} style={{ maxHeight }}>
        {recentActivities && recentActivities.length > 0 ? (
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <ActivityCard key={index} activity={activity} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 text-center">
            <p className="text-gray-400">No recent activity yet. Create or take a quiz to get started!</p>
          </div>
        )}
      </div>
    </motion.div>
  );
} 