import React from 'react'

function ChatbotChat({chat, chats, setChat, handleSend, toggleChat, toggleUser, setToggleUser}) {
    return (
        <div id='chatbot-chat' style={toggleChat? {right: '2%'}: {right: '-50%'}}>
            {/* SHOW CHAT AREA */}
            <div id='show-chat-area'>
                {chats.length > 0 ?
                    (
                        chats.map((currentChat, index) => {
                            return (
                                (currentChat.isUserChat) ? (
                                    <div className='user-chat-message'>{currentChat.chat}</div>
                                ) :
                                    (
                                        <div className='bot-chat-message'>{currentChat.chat}</div>
                                    )
                            ) // end of return
                        }) // end of chats.map
                    )
                    : (
                        <p>No chats yet!</p>
                    )
                }
            </div>

            {/* ADD CHAT AREA */}
            <div id='add-chat-area'>
                <input type="text" placeholder='type your queries here'
                    value={chat}
                    onChange={(e) => setChat(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <button onClick={handleSend} disabled={chat.length <= 1}>Send</button>
            </div>

            {/* TOGGLE USER AREA */}
            <div className="button" onClick={() => setToggleUser(!toggleUser)}>
                <span className="buttonText"
                    style={{
                        left: toggleUser ? "5%" : "40%",
                    }}
                >{toggleUser ? "User" : "Bot"}</span>
                <div className="buttonBall"
                    style={{
                        left: toggleUser ? "62%" : "3%",
                    }}
                ></div>
            </div>

        </div>
    )
}

export default ChatbotChat
