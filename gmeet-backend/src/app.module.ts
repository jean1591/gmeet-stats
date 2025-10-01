import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { SessionsModule } from './sessions/sessions.module';

@Module({
  imports: [PrismaModule, SessionsModule],
})
export class AppModule {}
