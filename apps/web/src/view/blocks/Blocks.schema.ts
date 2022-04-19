import {Schema, schema} from '@alinea/core'
import {list} from '@alinea/input.list'
import {TextBlockSchema} from './TextBlock.schema'
import {TypesBlockSchema} from './TypesBlock.schema'

export const BlocksSchema = list('Body', {
  schema: schema({
    TextBlock: TextBlockSchema,
    TypesBlock: TypesBlockSchema
  })
})

export type BlocksSchema = Schema.TypeOf<typeof BlocksSchema>
