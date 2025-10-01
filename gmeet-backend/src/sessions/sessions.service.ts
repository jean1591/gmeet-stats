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
    return this.prisma.session.findMany({
      where: { user_id: userId },
      orderBy: { start_time: 'desc' },
    });
  }
}
