import { IsNotEmpty, IsString } from 'class-validator'

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  group: string

  @IsString()
  @IsNotEmpty()
  message: string
}
