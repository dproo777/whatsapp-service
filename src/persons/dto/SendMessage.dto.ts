import { IsNotEmpty, IsString } from 'class-validator'
import { Transform } from 'class-transformer'
import { IsPersonOnWhatsapp } from '../validators'
import { ContextDto } from '../../common/dto'

export class SendMessageDto extends ContextDto {
  @Transform(({ value }) =>
    value.endsWith('@s.whatsapp.net')
      ? value
      : value.replace(/\D/g, '').concat('@s.whatsapp.net'),
  )
  @IsNotEmpty()
  @IsString()
  @IsPersonOnWhatsapp()
  whatsappId: string

  @IsNotEmpty()
  @IsString()
  text: string
}
