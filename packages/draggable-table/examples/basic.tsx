import { useState } from 'react'
import * as React from 'react';
import DraggableTable from '@tf-magic/draggable-table';
import 'antd/dist/antd.css';

const Basic = () => {
  const [loading] = useState(false)
  const [data] = useState([
    {
      id: 1,
      name: '张三',
      phone: '13333333333',
      amount: 500
    },
    {
      id: 2,
      name: '李四',
      phone: '14444444444',
      amount: 1000
    }
  ])

  return (
    <DraggableTable
      loading={ loading }
      rowKey={ (record) => record.phone }
      dataSource={ data }
      columns={ [
        {
          title: '操作',
          fixed: 'left',
          render: () => (<a>添加</a>)
        },
        {
          key: 'id',
          dataIndex: 'id',
          title: 'ID'
        },
        {
          key: 'name',
          dataIndex: 'name',
          title: '姓名'
        },
        {
          key: 'phone',
          dataIndex: 'phone',
          title: '手机号'
        },
        {
          key: 'amount',
          dataIndex: 'amount',
          title: '身价'
        }
      ] }
      pagination={ false }
      storageKey={ 'OTHER_RESOURCE_COLUMN_KEYS' }
    />
  )
}

export default Basic
