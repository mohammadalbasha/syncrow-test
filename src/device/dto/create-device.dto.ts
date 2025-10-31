import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, Validate } from 'class-validator';
import { Device, DeviceType } from '../repository/device.model';
import { IsUnique, UniqueValidator } from 'src/shared/decorators/unique.input.decorator';

export class CreateDeviceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @IsUnique(Device, 'name') 
//@Validate(UniqueValidator, [Device, 'name'])
  name: string;

  @IsEnum(DeviceType)
  type: DeviceType;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  location?: string;
}





