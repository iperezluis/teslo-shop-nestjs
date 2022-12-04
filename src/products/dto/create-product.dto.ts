import {
  IsString,
  MinLength,
  IsOptional,
  IsNumber,
  IsPositive,
  IsInt,
  IsArray,
  IsIn,
} from 'class-validator';
import { Index } from 'typeorm';

export class CreateProductDto {
  @IsString()
  @MinLength(1, { message: 'debe tener al menos 1 caracter' })
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  price?: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  stock?: number;

  @IsString()
  @IsOptional()
  slug?: string;

  // each le dice que cada uno de elements en el arreglo debe cumplir la condicion
  @IsString({ each: true })
  @IsArray()
  sizes: string[];

  @IsString()
  @IsIn(['men', 'women', 'kid', 'unisex']) //?solo permite los valores dentro del arreglo
  gender: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];
}
