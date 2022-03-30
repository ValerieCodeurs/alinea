import {Schema, type} from '@alinea/core'
import {link} from '@alinea/input.link'
import {path} from '@alinea/input.path'
import {tab, tabs} from '@alinea/input.tabs'
import {text} from '@alinea/input.text'

export const HomePageSchema = type(
  'Home',
  tabs(
    tab('Homepage', {
      title: text('Title', {
        width: 0.5,
        multiline: true
      }),
      path: path('Path', {width: 0.5}),
      headline: text('Headline', {multiline: true}),
      byline: text('Byline', {multiline: true}),
      action: link('Action', {
        max: 1,
        fields: type('Fields', {
          label: text('Button label')
        })
      })
    }),
    tab('Top navigation', {
      links: link('Links', {
        type: 'entry',
        fields: type('Fields', {
          title: text('Title')
        })
      })
    })
  )
).configure({isContainer: true})

export type HomePageSchema = Schema.TypeOf<typeof HomePageSchema>