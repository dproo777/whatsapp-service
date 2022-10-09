import { IsNotEmpty, IsString } from 'class-validator'

export class ConnectDto {
  @IsString()
  @IsNotEmpty()
  sessionId: string
}
