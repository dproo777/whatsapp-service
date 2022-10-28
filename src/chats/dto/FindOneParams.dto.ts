import { IsBooleanString, IsNumberString, IsString } from 'class-validator'

export class FindOneParamsDto {
  @IsNumberString()
  limit = 25

  @IsString()
  id: string

  @IsBooleanString()
  fromMe: boolean
}
