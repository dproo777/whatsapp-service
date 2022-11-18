import { Injectable } from '@nestjs/common'
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import { Context } from '../../common/interfaces'
import { SessionsService } from '../../sessions/sessions.service'

interface IsPersonOnWhatsappValidatorArguments extends ValidationArguments {
  object: {
    context: Context
  }
}

@ValidatorConstraint({ async: true })
@Injectable()
export class IsPersonOnWhatsappValidator
  implements ValidatorConstraintInterface
{
  constructor(private readonly sessionsService: SessionsService) {}

  async validate(value: any, args: IsPersonOnWhatsappValidatorArguments) {
    const session = this.sessionsService.findSession(
      args.object.context.headers.session,
    )

    try {
      const [result] = await session.onWhatsApp(value)

      return result.exists
    } catch (e) {
      return false
    }
  }

  defaultMessage() {
    return 'person is not on whatsapp'
  }
}

export function IsPersonOnWhatsapp(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsPersonOnWhatsapp',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsPersonOnWhatsappValidator,
    })
  }
}
