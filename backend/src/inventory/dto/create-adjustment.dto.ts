import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';

export enum AdjustmentType {
  ENTRY = 'ENTRY',
  EXIT = 'EXIT',
  ADJUSTMENT = 'ADJUSTMENT',
}

export class CreateAdjustmentDto {
  @IsString()
  productId: string;

  @IsString()
  @IsOptional()
  variantId?: string;

  @IsString()
  @IsOptional()
  branchId?: string;

  @IsEnum(AdjustmentType)
  type: AdjustmentType;

  @IsNumber()
  quantity: number;

  @IsString()
  reason: string;

  @IsString()
  @IsOptional()
  referenceId?: string;
}
