import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import {
  ApiTags,
  ApiQuery,
  ApiOkResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchApiResultDto } from './dto/search-api-result.dto';
import { SearchQueryDto } from './dto/search-query.dto';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiQuery({
    name: 'queryText',
    description: 'Search query text',
    required: true,
    type: String,
  })
  @ApiQuery({
    name: 'type',
    description: 'Search type',
    required: false,
    enum: ['address', 'pair', 'name'],
  })
  @ApiOkResponse({
    description: 'Search results',
    type: [SearchApiResultDto],
  })
  @ApiBadRequestResponse({ description: 'Missing required parameter q' })
  async search(@Query() query: SearchQueryDto) {
    if (!query.queryText) throw new BadRequestException('queryText required');
    return this.searchService.search(query.queryText, query.type as any);
  }
}
