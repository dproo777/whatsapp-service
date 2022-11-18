import { Allow } from 'class-validator'
import { Context } from '../interfaces'

export class ContextDto {
  @Allow()
  context?: Context
}
