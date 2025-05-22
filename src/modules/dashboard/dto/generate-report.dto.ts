import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class GenerateReportDto {
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: 2025,
  })
  @Min(2025)
  year: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsNotEmpty()
  @ApiPropertyOptional({
    example: 1,
  })
  @Min(1)
  @Max(12)
  @IsOptional()
  month: number;
}
