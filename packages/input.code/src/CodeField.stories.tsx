import {InputField} from '@alinea/editor/view/InputField'
import {VStack} from '@alinea/ui'
import {code} from '@alinea/input.code'
import {dashboardDecorator} from '@alinea/dashboard/DashboardStory'
import {useField} from '@alinea/editor'

export function CodeInput() {
  const codeField = useField(code('Code'))
  const disabledCodeField = useField(
    code('Code (read-only)', {
      readonly: true,
      initialValue: `console.log('Hello world!')`
    })
  )
  return (
    <VStack>
      <InputField {...codeField} />
      <InputField {...disabledCodeField} />
    </VStack>
  )
}

export default {
  title: 'Fields / Code',
  decorators: dashboardDecorator({fullWidth: true})
}
