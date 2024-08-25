import { Code } from '../../types'

export interface DefaultServiceResponse<T= any> {
  status: boolean
  code: Code
  message?: string
  data?: T
}
