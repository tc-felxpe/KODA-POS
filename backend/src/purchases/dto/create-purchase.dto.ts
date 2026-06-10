import { IsString, IsOptional, IsNumber, IsArray, IsEnum } from 'class-validator';

export enum PurchaseStatusDto {
  PENDING = 'PENDING',
  RECEIVED = 'RECEIVED',
  CANCELLED = 'CANCELLED',
}

export class PurchaseItemDto {
  @IsString()
  productId: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unitCost: number;
}

export class CreatePurchaseDto {
  @IsString()
  supplierId: string;

  @IsString()
  branchId: string;

  @IsString()
  @IsOptional()
  invoiceNumber?: string;

  @IsNumber()
  tax: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  items: PurchaseItemDto[];

  @IsEnum(PurchaseStatusDto)
  @IsOptional()
  status?: PurchaseStatusDto;
}
