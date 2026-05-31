import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import { PromotionService } from './promotion.service';
import { PreviewPromotionDto } from './dto/preview-promotion.dto';
import { PromoteDto } from './dto/promote.dto';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';

@Controller('academic/promotion')
export class PromotionController {
  constructor(private readonly service: PromotionService) {}

  @Get('preview')
  @RequirePermissions('student.view')
  preview(@Query() dto: PreviewPromotionDto) {
    return this.service.previewPromotion(dto);
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('student.manage')
  promote(@Body() dto: PromoteDto) {
    return this.service.promote(dto);
  }
}
