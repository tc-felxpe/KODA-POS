import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';

export enum MovementTypeFilter {
  ENTRY = 'ENTRY',
  EXIT = 'EXIT',
  ADJUSTMENT = 'ADJUSTMENT',
  SALE = 'SALE',
  PURCHASE = 'PURCHASE',
  RETURN = 'RETURN',
}

export class MovementFilterDto {
  @IsString()
  @IsOptional()
  productId?: string;

  @IsEnum(MovementTypeFilter)
  @IsOptional()
  type?: MovementTypeFilter;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  search?: string;
}
