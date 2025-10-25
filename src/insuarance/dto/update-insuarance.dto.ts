import { PartialType } from '@nestjs/mapped-types';
import { CreateInsuaranceDto } from './create-insuarance.dto';

export class UpdateInsuaranceDto extends PartialType(CreateInsuaranceDto) {}
