import { IsBooleanString, IsNotEmpty, IsString } from 'class-validator'

export class SendChatDto {
  @IsString()
  @IsNotEmpty()
  receiver: string

  @IsBooleanString()
  @IsNotEmpty()
  message: string
}
