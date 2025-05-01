import React, { useState } from 'react';
import './chatbot.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { text: "Hi! I'm SkillBot. How can I help you learn or share a skill today?", sender: 'bot' },
  ]);
  const [userInput, setUserInput] = useState('');
  const [chatVisible, setChatVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => setUserInput(e.target.value);

  const toggleChatVisibility = () => setChatVisible(!chatVisible);

  const closeChat = () => {
    setChatVisible(false);
    setMessages([
      { text: "Hi! I'm SkillBot. How can I help you learn or share a skill today?", sender: 'bot' },
    ]);
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const newUserMessage = { text: userInput.trim(), sender: 'user' };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setUserInput('');
    setLoading(true);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are SkillBot, a friendly assistant in a skill-sharing app. Help users find skills to learn or share, suggest tips, or match them with mentors.' },
            ...updatedMessages.map((msg) => ({
              role: msg.sender === 'user' ? 'user' : 'assistant',
              content: msg.text,
            })),
          ],
        }),
      });

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't understand that.";
      setMessages([...updatedMessages, { text: reply, sender: 'bot' }]);
    } catch (error) {
      console.error('Error talking to ChatGPT:', error);
      setMessages([...updatedMessages, { text: 'Error connecting to ChatGPT.', sender: 'bot' }]);
    }

    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div>
      {chatVisible ? (
        <div className="chatbot-container">
          <div className="chat-header">
            <span className="chatbot-name">SkillBot</span>
            <button className="close-button" onClick={closeChat}>✖</button>
          </div>
          <div className="chatbox">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.sender}`}>
                <p>{msg.text}</p>
              </div>
            ))}
            {loading && <div className="message bot"><p>Typing...</p></div>}
          </div>
          <div className="input-container">
            <input
              type="text"
              placeholder="Ask about a skill..."
              value={userInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      ) : (
        <div className="chatbot-icon" onClick={toggleChatVisibility}>💬</div>
      )}
    </div>
  );
};

export default Chatbot;
