import { IsNotEmpty, IsString } from 'class-validator'

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  whatsappId: string

  @IsString()
  @IsNotEmpty()
  message: string
}
