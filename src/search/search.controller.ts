import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly svc: SearchService) {}

  @Get()
  @ApiQuery({ name: 'q', required: true })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['address', 'pair', 'name'],
  })
  async search(@Query('q') q: string, @Query('type') type?: string) {
    if (!q) throw new BadRequestException('q required');
    return this.svc.search(q, type as any);
  }
}
