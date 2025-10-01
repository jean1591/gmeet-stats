import { IsUUID, IsISO8601 } from 'class-validator';

export class CreateSessionDto {
  @IsUUID(4)
  user_id: string;

  @IsISO8601()
  start_time: string;

  @IsISO8601()
  end_time: string;
}
