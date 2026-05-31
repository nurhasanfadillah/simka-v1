import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateRoleDto {
  @IsNotEmpty()
  @IsString()
  name!: string;
}

export class UpdateRoleDto {
  @IsNotEmpty()
  @IsString()
  name!: string;
}

export class AssignPermissionsDto {
  @IsArray()
  @IsNumber({}, { each: true })
  permissionIds!: number[];
}
