import { ColumnsType } from 'antd/es/table/interface'
import { TableProps } from 'antd/lib/table'
import { cloneDeep } from 'lodash'
import * as React from 'react';
import { useEffect, useState } from 'react';
// @ts-ignore
import ReactDragListView from 'react-drag-listview';
import Table from './Table'

let defaultGetColumnKeys = <T extends React.Key> (storageKey): Promise<T[]> => {
  return JSON.parse(localStorage.getItem(storageKey))
}

let defaultSetColumnKeys = <T extends React.Key> (storageKey, columnKeys: T[]) => {
  localStorage.setItem(storageKey, JSON.stringify(columnKeys))
}

const setGlobalConfig =
  ({
     getColumnsKeys = defaultGetColumnKeys,
     setColumnsKeys = defaultSetColumnKeys
   }) => {
    defaultGetColumnKeys = getColumnsKeys
    defaultSetColumnKeys = setColumnsKeys
  }

/**
 * 可拖拽表格组件Props
 * 注意，Columns参数中，key 必须唯一且必传
 */
type DraggableTableProps<T> = TableProps<T> & {
  /**
   * 存储键名
   */
  storageKey: string,
}

/**
 * 可拖拽表格组件
 *
 * @param storageKey 持久化标识Key
 * @param props
 * @constructor
 */
const DraggableTable: React.FC & { config: typeof setGlobalConfig } = <T extends object>
({
   storageKey,
   ...props
 }: DraggableTableProps<T>) => {
  const [columns, setColumns] = useState<ColumnsType<T>>()

  /**
   * 获取持久化保存表格排序数据
   */
  const getColumnKeys = defaultGetColumnKeys

  /**
   * 持久化保存表头排序数据
   *
   * @param storageKey
   * @param columnKeys
   */
  const setColumnKeys = defaultSetColumnKeys

  /**
   * 响应拖拽事件
   *
   * @param fromIndex
   * @param toIndex
   */
  const handleDragColumnsEnd = (fromIndex: number, toIndex: number) => {
    const cloneColumns = cloneDeep(columns)
    const item = cloneColumns.splice(fromIndex - +!!props.rowSelection, 1)[0];

    cloneColumns.splice(toIndex - +!!props.rowSelection, 0, item);

    const columnKeys: React.Key[] = []
    cloneColumns.forEach((column) => {
      if (!column.key) {
        throw new Error('属性 key 必须指定值')
      }

      if (columnKeys.includes(column.key)) {
        throw new Error('属性 key 必须唯一')
      }

      columnKeys.push(column.key)
    })

    setColumnKeys(storageKey, columnKeys)
    setColumns(cloneColumns);
  }

  /**
   * 初始化表头
   */
  useEffect(() => {
    // 获取表头排序数据
    const columnKeys = getColumnKeys(storageKey)

    if (Array.isArray(columnKeys) && columnKeys.length === props.columns.length) {
      const cloneColumns = columnKeys.map(columnKey => {
        for (let i = 0; i < props.columns.length; i++) {
          if (props.columns[i].key === columnKey) {
            return props.columns[i]
          }
        }
      })

      /**
       * 重新排序后非空子项长度不变时作为新列传递给Table
       */
      if (cloneColumns.filter(value => value).length === props.columns.length) {
        setColumns(cloneColumns)
      } else {
        setColumnKeys(storageKey, [])
        setColumns(props.columns)
      }
    } else {
      setColumnKeys(storageKey, [])
      setColumns(props.columns)
    }
  }, [])

  return (
    <ReactDragListView.DragColumn
      onDragEnd={ handleDragColumnsEnd }
      nodeSelector="th"
    >
      <Table { ...props } columns={ columns }/>
    </ReactDragListView.DragColumn>
  );
};

DraggableTable.config = setGlobalConfig

export default DraggableTable;
