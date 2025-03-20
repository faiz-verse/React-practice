// necessary imports
import { useState, useEffect, useRef } from 'react'

// importing uuid for unique u ids
import { v4 as uuidv4 } from 'uuid';

// importing css files
import './App.css'
import './components/Chatbot.css'
import './components/ChatbotChat.css';

// importing components
import Chatbot from './components/Chatbot.jsx'
import ChatbotChat from './components/ChatbotChat.jsx';

function App() {

    const [toggleChat, setToggleChat] = useState(false)

    const [chat, setChat] = useState("")
    const [chats, setChats] = useState([])

    const handleSend = () => {
        if (chat.trim() === "" || chat.length <= 1) {
            return
        }
        else {
            setChats([...chats, { chatID: uuidv4(), chat, isUserChat: false }]) //adding the chat after chats
            setChat("")
        }
    }

    useEffect(() => {
        console.log(`Chats are:\n${JSON.stringify(chats, null, 2)}`);
    }, [chats])


    return (
        <>
            <h1>My Personal Chat Bot</h1>
            <h3>(Only UI) Soon after learning I will implement Chatbot</h3>
            <Chatbot onClick={()=> setToggleChat(!toggleChat)} toggleChat={toggleChat} />

            {/* CHAT BOT CHAT */}
            <ChatbotChat chat={chat} chats={chats} setChat={setChat} handleSend={handleSend} toggleChat={toggleChat}/>
        </>
    )
}

export default App
