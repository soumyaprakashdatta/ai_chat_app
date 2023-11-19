import React from 'react'

import {Row, Col} from 'antd'

import Chat from './Chat'
import ChatContext from './ChatContext'

function App() {
  return (
    <Row style={{backgroundColor: "yellow"}}>
      <Col span={18} style={{backgroundColor: "blue", height: "100vh"}}>
        <Chat />
      </Col>
      <Col span={6} style={{backgroundColor: "green", height: "100vh"}}>
        <ChatContext />
      </Col>
    </Row>
  )
}

export default App
