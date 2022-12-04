import { IsArray, IsOptional, IsString } from 'class-validator';

export class TagsDto {
  @IsArray()
  @IsOptional()
  tags?: string[];
}
