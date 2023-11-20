import React from 'react'

import { Row, Col } from 'antd'

import Chat from './Chat'
import ChatContext from './ChatContext'

function App() {
  return (
    <Row style={{ backgroundColor: 'yellow' }}>
      <Col
        span={16}
        style={{
          backgroundColor: '#262626',
          height: '100vh',
        }}
      >
        <Chat />
      </Col>
      <Col span={8} style={{ backgroundColor: 'green', height: '100vh' }}>
        <ChatContext />
      </Col>
    </Row>
  )
}

export default App
