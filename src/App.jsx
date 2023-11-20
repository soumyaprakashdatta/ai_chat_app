import React, { useState } from 'react'

import { Row, Col } from 'antd'

import Chat from './Chat'
import ChatContext from './ChatContext'
import { DEFAULT_CONTEXT } from './const'

function App() {
  let [context, setContext] = useState(DEFAULT_CONTEXT)

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
        <ChatContext currentContext={context} setContext={setContext} />
      </Col>
    </Row>
  )
}

export default App
