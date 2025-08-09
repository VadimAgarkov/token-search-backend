import { ApiProperty } from '@nestjs/swagger';

export class SearchQueryDto {
  @ApiProperty({
    description: 'Search field: address, part of the name, or pair',
    example: '0xabc... or token/eth or Uniswap',
  })
  q: string;

  @ApiProperty({
    description: "Search type: 'address' | 'pair' | 'name'",
    required: false,
    example: 'address',
  })
  type?: 'address' | 'pair' | 'name';
}
