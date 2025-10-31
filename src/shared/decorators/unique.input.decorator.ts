import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { DataSource, EntityTarget, ObjectLiteral } from 'typeorm';
import { ClsService } from 'nestjs-cls';
import { ClsStore } from '../cls/cls.interface';

interface UniqueValidationArguments extends ValidationArguments {
  constraints: [EntityTarget<ObjectLiteral>, string, string?];
}

@ValidatorConstraint({ name: 'isUnique', async: true })
@Injectable()
export class UniqueValidator implements ValidatorConstraintInterface {
  private static dataSourceInstance: DataSource | null = null;

  constructor(
    private readonly cls: ClsService<ClsStore>,
  ) {}

  static setDataSource(dataSource: DataSource) {
    UniqueValidator.dataSourceInstance = dataSource;
  }

  private getDataSource(): DataSource {
    if (UniqueValidator.dataSourceInstance) {
      return UniqueValidator.dataSourceInstance;
    }

   

    throw new Error('DataSource is not available for unique validation');
  }

  async validate(value: any, args: UniqueValidationArguments) {
    if (value === null || value === undefined) {
      return true;
    }

    let dataSource: DataSource;
    try {
      dataSource = this.getDataSource();
    } catch (error) {
      console.error('DataSource is not available for unique validation:', error);
      return false;
    }

    const [entityClass, column, exceptColumn] = args.constraints;
    const repository = dataSource.getRepository(entityClass);


    try {
      const queryBuilder = repository.createQueryBuilder('entity');
      queryBuilder.where(`entity.${column} = :value`, { value });

      // Try to get ID from request params using CLS to exclude current record during update
      const req = this.cls.get('req');
      let requestId: number | null = null;
      
      if (req?.params?.id) {
        const id = req.params.id;
        const parsedId = typeof id === 'number' ? id : parseInt(String(id), 10);
        if (!isNaN(parsedId)) {
          requestId = parsedId;
        }
      }
      if (requestId) {
        queryBuilder.andWhere('entity.id != :id', { id: requestId });
      }

      // Also check if ID is in the DTO object itself
      if (!requestId && args.object && (args.object as any).id !== undefined) {
        const dtoId = (args.object as any).id;
        if (dtoId !== null && dtoId !== undefined) {
          const parsedId = typeof dtoId === 'number' ? dtoId : parseInt(String(dtoId), 10);
          if (!isNaN(parsedId)) {
            queryBuilder.andWhere('entity.id != :id', { id: parsedId });
          }
        }
      }

      if (exceptColumn && args.object) {
        const exceptValue = (args.object as any)[exceptColumn];
        if (exceptValue !== null && exceptValue !== undefined) {
          queryBuilder.andWhere(`entity.${exceptColumn} != :exceptValue`, {
            exceptValue,
          });
        }
      }

      const result = await queryBuilder.getOne();
      return !result; 
    } catch (error) {

      console.error('Unique validation error:', error);
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    const [entityClass] = args.constraints;
    const entityName =
      typeof entityClass === 'function'
        ? entityClass.name
        : 'Entity';
    return `${args.property} must be unique (${entityName})`;
  }
}

export function IsUnique(
  entityClass: EntityTarget<ObjectLiteral>,
  column: string,
  exceptColumn?: string,
  validationOptions?: ValidationOptions,
) {
  return function (target: object, propertyName: string) {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [entityClass, column, exceptColumn],
      validator: UniqueValidator,
    });
  };
}

