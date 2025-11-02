import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({ 
    status: 200, 
    description: 'Сервис работает корректно',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
        service: { type: 'string', example: 'api' },
        ts: { type: 'number', example: 1698765432100 },
      },
    },
  })
  ping() {
    return { ok: true, service: 'api', ts: Date.now() };
  }
}
