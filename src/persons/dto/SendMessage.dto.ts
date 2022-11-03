import { IsBooleanString, IsNotEmpty, IsString } from 'class-validator'

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  whatsappId: string

  @IsBooleanString()
  @IsNotEmpty()
  message: string
}
