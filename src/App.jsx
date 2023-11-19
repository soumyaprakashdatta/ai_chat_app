import React from 'react'

import Chat from './Chat'
import ChatContext from './ChatContext'

function App() {
  return (
    <div>
      <ChatContext />
      <Chat />
    </div>
  )
}

export default App
