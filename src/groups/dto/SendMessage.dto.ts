import { IsNotEmpty, IsString } from 'class-validator'
import { Transform } from 'class-transformer'
import { ContextDto } from '../../common/dto'
import { IsGroupOnWhatsapp } from '../validators'

export class SendMessageDto extends ContextDto {
  @Transform(({ value }) =>
    value.endsWith('@g.us')
      ? value
      : value.replace(/[^\d-]/g, '').concat('@g.us'),
  )
  @IsNotEmpty()
  @IsString()
  @IsGroupOnWhatsapp()
  whatsappId: string

  @IsNotEmpty()
  @IsString()
  text: string
}
