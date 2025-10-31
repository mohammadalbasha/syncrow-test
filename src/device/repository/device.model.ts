import { Entity, Column, Index } from 'typeorm';
import { BaseModel } from 'src/shared/models/model.base';

export enum DeviceType {
  lamp = 'lamp',
  fan = 'fan',
 
}

@Entity({ name: 'devices' })
export class Device extends BaseModel {
  @Index('idx_device_name', { unique: true })
  @Column({ type: 'varchar', unique: true })
  name: string;

  @Column({ type: 'enum', enum: DeviceType })
  type: DeviceType;

  @Column({ type: 'varchar', nullable: true })
  location: string | null;
}





