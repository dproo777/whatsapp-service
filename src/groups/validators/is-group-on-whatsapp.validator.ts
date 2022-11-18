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

interface IsGroupOnWhatsappValidatorArguments extends ValidationArguments {
  object: {
    context: Context
  }
}

@ValidatorConstraint({ async: true })
@Injectable()
export class IsGroupOnWhatsappValidator
  implements ValidatorConstraintInterface
{
  constructor(private readonly sessionsService: SessionsService) {}

  async validate(value: any, args: IsGroupOnWhatsappValidatorArguments) {
    const session = this.sessionsService.findSession(
      args.object.context.headers.session,
    )

    try {
      const result = await session.groupMetadata(value)

      return !!result.id
    } catch (e) {
      return false
    }
  }

  defaultMessage() {
    return 'group is not on whatsapp'
  }
}

export function IsGroupOnWhatsapp(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsGroupOnWhatsapp',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsGroupOnWhatsappValidator,
    })
  }
}
