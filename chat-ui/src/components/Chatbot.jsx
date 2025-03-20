import React from 'react'

// react icons
import { FaRobot} from "react-icons/fa";

function Chatbot({ toggleChat, onClick}) {
  return (
    toggleChat? (
    <div id='chatbot-container' onClick={onClick}>
      <div id='chatbot-icon'><FaRobot size={50} color="#444444" /></div>
    </div> ) : (
        <div id='chatbot-container' onClick={onClick}>
        <div id='chatbot-icon'><FaRobot size={50} color="red" /></div>
      </div>
    )
  )
}

export default Chatbot
