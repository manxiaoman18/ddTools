import type { CSSProperties } from 'vue'
import type { JsonListItem } from '../entitys/JsonListItem'

export enum ExecuteType {
  DbReq = 1,
  DbRes = 2,
  DgReq = 3,
}

export const executeTypeOptions = [
  { label: 'dbutil请求结构体', value: ExecuteType.DbReq },
  { label: 'dbutil响应结构体', value: ExecuteType.DbRes },
  { label: 'dg请求入参', value: ExecuteType.DgReq },
]

export const jsonReplacer = (_key: any, value: any) => {
  if (_key === 'optionList' || _key === 'optionValueType') {
    return undefined
  }
  if (value === null || value === '') {
    return undefined
  }
  return value
}

export const railStyle = ({ focused, checked }: { focused: boolean; checked: boolean }) => {
  const style: CSSProperties = {}
  if (checked) {
    style.background = '#d03050'
    if (focused) {
      style.boxShadow = '0 0 0 2px #d0305040'
    }
  } else {
    style.background = '#2080f0'
    if (focused) {
      style.boxShadow = '0 0 0 2px #2080f040'
    }
  }
  return style
}

export const createDbReqItem = (key: string): JsonListItem => ({
  key,
  alias: key,
  width: '300px',
  default: '',
})

export const createDbResItem = (key: string): JsonListItem => ({
  key,
  alias: key,
  desc: key,
  primary: key === 'id',
})

export const createDgItem = (key: string): JsonListItem => ({
  key,
  label: key,
  placeholder: `请输入${key}`,
  type: 'input',
  options: null,
  expand: false,
  required: true,
  description: '',
  requiredMessage: '',
  default: null,
})

export const createItems = (type: ExecuteType, keys: string[]): JsonListItem[] => {
  const factory =
    type === ExecuteType.DbReq ? createDbReqItem
      : type === ExecuteType.DbRes ? createDbResItem
        : createDgItem
  return keys.map(factory)
}

export const parseOptionsToList = (item: JsonListItem) => {
  if (!item.options) return
  item.optionList = []
  Object.entries(item.options).forEach(([key, value]) => {
    if (item.optionValueType === undefined) {
      item.optionValueType = typeof value === 'number'
    }
    item.optionList!.push({ key, value: String(value) })
  })
}
