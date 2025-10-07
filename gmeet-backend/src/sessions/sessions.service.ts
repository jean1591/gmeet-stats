import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  async create(createSessionDto: CreateSessionDto) {
    const { user_id, start_time, end_time } = createSessionDto;

    // Validate that end_time >= start_time
    const startDate = new Date(start_time);
    const endDate = new Date(end_time);

    if (endDate < startDate) {
      throw new BadRequestException('end_time must be greater than or equal to start_time');
    }

    // Create new session (backend generates ID)
    return this.prisma.session.create({
      data: {
        user_id,
        start_time: startDate,
        end_time: endDate,
      },
    });
  }

  async update(sessionId: string, updateSessionDto: UpdateSessionDto) {
    const { end_time } = updateSessionDto;

    // Find existing session
    const existingSession = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!existingSession) {
      throw new NotFoundException('Session not found');
    }

    // Validate that end_time >= start_time
    const endDate = new Date(end_time);
    if (endDate < existingSession.start_time) {
      throw new BadRequestException('end_time must be greater than or equal to start_time');
    }

    // Update session
    return this.prisma.session.update({
      where: { id: sessionId },
      data: {
        end_time: endDate,
      },
    });
  }

  async findByUserId(userId: string) {
    // Get all sessions for aggregation
    const allSessions = await this.prisma.session.findMany({
      where: { user_id: userId },
      orderBy: { start_time: 'asc' },
    });

    // If no sessions, return empty stats
    if (allSessions.length === 0) {
      return {
        summary: {
          totalSessions: 0,
          totalDuration: 0,
          avgDuration: 0,
          thisMonth: { count: 0, duration: 0 },
          thisYear: { count: 0, duration: 0 },
        },
        dailyStats: [],
        recentSessions: [],
      };
    }

    // Calculate summary stats
    const now = new Date();
    const currentMonth = now.getUTCMonth();
    const currentYear = now.getUTCFullYear();

    let totalDuration = 0;
    let thisMonthCount = 0;
    let thisMonthDuration = 0;
    let thisYearCount = 0;
    let thisYearDuration = 0;

    // Group by date for daily stats
    const dailyMap = new Map<
      string,
      { sessionCount: number; duration: number }
    >();

    allSessions.forEach((session) => {
      const duration =
        session.end_time.getTime() - session.start_time.getTime();
      const sessionMonth = session.start_time.getUTCMonth();
      const sessionYear = session.start_time.getUTCFullYear();

      // Total stats
      totalDuration += duration;

      // This month stats
      if (sessionMonth === currentMonth && sessionYear === currentYear) {
        thisMonthCount++;
        thisMonthDuration += duration;
      }

      // This year stats
      if (sessionYear === currentYear) {
        thisYearCount++;
        thisYearDuration += duration;
      }

      // Daily aggregation (UTC date)
      const dateKey = session.start_time.toISOString().split('T')[0]; // YYYY-MM-DD
      const existing = dailyMap.get(dateKey) || {
        sessionCount: 0,
        duration: 0,
      };
      dailyMap.set(dateKey, {
        sessionCount: existing.sessionCount + 1,
        duration: existing.duration + duration,
      });
    });

    // Convert daily map to array
    const dailyStats = Array.from(dailyMap.entries())
      .map(([date, stats]) => ({
        date,
        sessionCount: stats.sessionCount,
        duration: stats.duration,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Get last 10 sessions
    const recentSessions = await this.prisma.session.findMany({
      where: { user_id: userId },
      orderBy: { start_time: 'desc' },
      take: 10,
    });

    const recentSessionsWithDuration = recentSessions.map((session) => ({
      id: session.id,
      user_id: session.user_id,
      start_time: session.start_time,
      end_time: session.end_time,
      duration: session.end_time.getTime() - session.start_time.getTime(),
    }));

    return {
      summary: {
        totalSessions: allSessions.length,
        totalDuration,
        avgDuration: Math.round(totalDuration / allSessions.length),
        thisMonth: {
          count: thisMonthCount,
          duration: thisMonthDuration,
        },
        thisYear: {
          count: thisYearCount,
          duration: thisYearDuration,
        },
      },
      dailyStats,
      recentSessions: recentSessionsWithDuration,
    };
  }
}
