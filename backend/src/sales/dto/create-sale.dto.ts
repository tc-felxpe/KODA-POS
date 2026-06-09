import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class SaleItemDto {
  @IsString()
  productId: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unitPrice: number;

  @IsNumber()
  @IsOptional()
  discount?: number;

  @IsNumber()
  @IsOptional()
  tax?: number;
}

class SalePaymentDto {
  @IsString()
  paymentMethodId: string;

  @IsNumber()
  amount: number;

  @IsString()
  @IsOptional()
  reference?: string;
}

export class CreateSaleDto {
  @IsString()
  @IsOptional()
  customerId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  items: SaleItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SalePaymentDto)
  payments: SalePaymentDto[];

  @IsNumber()
  subtotal: number;

  @IsNumber()
  discount: number;

  @IsNumber()
  tax: number;

  @IsNumber()
  total: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
