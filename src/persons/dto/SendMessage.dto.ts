import { IsNotEmpty, IsString } from 'class-validator'

export class SendMessageDto {
  @IsNotEmpty()
  @IsString()
  whatsappId: string

  @IsNotEmpty()
  @IsString()
  message: string
}
