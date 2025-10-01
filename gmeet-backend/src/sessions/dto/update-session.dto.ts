import { IsISO8601 } from 'class-validator';

export class UpdateSessionDto {
  @IsISO8601()
  end_time: string;
}
