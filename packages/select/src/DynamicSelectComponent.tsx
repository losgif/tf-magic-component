import { Select } from 'antd';
import { SelectProps, SelectValue } from 'antd/lib/select'
import { debounce } from 'lodash'
import * as React from 'react'
import { useEffect, useRef, useState } from 'react'
import { SelectComponentOption } from './constants'
import styles from './index.less'

/**
 * 选项组件Props类型声明
 */
type DynamicSelectComponentProps = {
  /**
   * 初始化可选项数组
   */
  options?: SelectComponentOption[]

  /**
   * 选项动态查询功能回调函数，`showSearch`参数 同时传入情况下有效
   */
  loadData?: ((text: SelectValue) => Promise<SelectComponentOption[]>)

  /**
   * 防抖时长
   */
  wait?: number

  /**
   * 选项值
   */
  value?: SelectValue
} & Omit<SelectProps, 'options'>

const DynamicSelectComponent: React.FC<DynamicSelectComponentProps> = (props) => {
  /**
   * 默认配置
   */
  const defaultConfig: SelectProps = {
    allowClear: true,
    style: {
      height: '32px',
      width: '100%'
    }
  }

  let {
    loadData: propsLoadData,
    options: propsOptions,
    wait: propsWait,
    showSearch,
    ...restProps
  } = props;

  const [config, setConfig] = useState<SelectProps>()
  const [options, setOptions] = useState<SelectComponentOption[]>()
  const loadingRef = useRef<boolean>(false)

  /**
   * 外部更新配置
   */
  useEffect(() => {
    setOptions(propsOptions)
  }, [propsOptions])

  useEffect(() => {
    /**
     * 动态搜索组件特殊配置
     */
    if (propsLoadData) {
      let dynamicConfig: any = {
        ...defaultConfig,
        ...restProps,
        loading: loadingRef.current
      }

      if (showSearch) {
        // 搜索组件对应配置
        dynamicConfig = {
          ...dynamicConfig,
          defaultActiveFirstOption: false,
          filterOption: false,
          showArrow: false,
          showSearch,
          onSearch
        }
      } else {
        // 非搜索组件直接加载数据
        loadData()
      }
      setConfig(dynamicConfig)
    }
  }, [
    props.value,
    propsLoadData,
    showSearch
  ])

  /**
   * 动态搜索组件获取可选项方法
   *
   * @param text
   */
  const loadData = (text = undefined) => {
    if (!props.loadData) {
      return
    }

    setOptions([])
    loadingRef.current = true

    props.loadData(text).then((options) => {
      loadingRef.current = false

      if (options !== undefined) {
        options = [...options]
        setOptions(options)
      }
    }).catch(() => {
      loadingRef.current = false
    })
  }

  /**
   * 搜索选择组件onSearch处理方法
   *
   * @param text
   */
  const onSearch = debounce(loadData, propsWait)

  return (
    <Select { ...config } >
      {
        options && options.map(({ name, value,...option }) => (
          <Select.Option
            value={ value }
            { ...option }
          >
            { name }
          </Select.Option>)
        )
      }
    </Select>
  )
}

/**
 * 默认Props值
 */
DynamicSelectComponent.defaultProps = {
  wait: 500
}

export default DynamicSelectComponent;
