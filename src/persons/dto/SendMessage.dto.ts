import { IsBooleanString, IsNotEmpty, IsString } from 'class-validator'

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  phone: string

  @IsBooleanString()
  @IsNotEmpty()
  message: string
}
