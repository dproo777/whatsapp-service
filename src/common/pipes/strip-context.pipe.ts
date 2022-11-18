import { Injectable, PipeTransform } from '@nestjs/common'

@Injectable()
export class StripContextPipe implements PipeTransform {
  transform(value: any) {
    if (value.context) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { context, ...rest } = value

      return rest
    }

    return value
  }
}
