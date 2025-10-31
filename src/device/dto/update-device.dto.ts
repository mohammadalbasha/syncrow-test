import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { Device, DeviceType } from '../repository/device.model';
import { IsUnique } from 'src/shared/decorators/unique.input.decorator';

export class UpdateDeviceDto {
  @IsString()
  @MaxLength(255)
  @IsUnique(Device, 'name') 
  name: string;

  @IsEnum(DeviceType)
  type: DeviceType;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  location?: string;
}


