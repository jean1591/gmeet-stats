export interface UserStatsResponse {
  summary: {
    totalSessions: number;
    totalDuration: number; // milliseconds
    avgDuration: number; // milliseconds
    thisMonth: {
      count: number;
      duration: number; // milliseconds
    };
    thisYear: {
      count: number;
      duration: number; // milliseconds
    };
  };
  dailyStats: Array<{
    date: string; // YYYY-MM-DD format
    sessionCount: number;
    duration: number; // milliseconds
  }>;
  recentSessions: Array<{
    id: string;
    user_id: string;
    start_time: Date;
    end_time: Date;
    duration: number; // milliseconds
  }>;
}
