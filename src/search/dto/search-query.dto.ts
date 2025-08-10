import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SearchQueryDto {
  @ApiProperty({
    description: 'Search query text: address, part of the name, or pair',
    example: '0xabc... or token/eth or Uniswap',
  })
  queryText: string;

  @ApiPropertyOptional({
    description: "Search type: 'address' | 'pair' | 'name'",
    example: 'address',
    enum: ['address', 'pair', 'name'],
  })
  type?: 'address' | 'pair' | 'name';
}
