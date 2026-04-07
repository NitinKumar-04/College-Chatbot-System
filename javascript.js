// DOM Elements
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const quickReplyBtns = document.querySelectorAll('.quick-reply-btn');

// State
let isTyping = false;

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    scrollToBottom();
});

// Setup all event listeners
function setupEventListeners() {
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', handleKeyPress);
    quickReplyBtns.forEach(btn => {
        btn.addEventListener('click', () => sendQuickReply(btn.dataset.message));
    });
}

// Send message function
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message || isTyping) return;
    
    // Clear input and add user message
    userInput.value = '';
    addMessage(message, true);
    
    // Show typing indicator
    await showTyping();
    
    // Send to server
    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message })
        });
        
        const data = await response.json();
        
        // Remove typing indicator
        removeTyping();
        
        // Add bot response
        if (data.status === 'success') {
            addMessage(data.response, false);
        } else {
            addMessage(data.response, false, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        removeTyping();
        addMessage('Sorry, there was an error connecting to the server. Please try again.', false, 'error');
    }
}

// Add message to chat
function addMessage(content, isUser, type = '') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'} ${type}`;
    
    // Format content (handle line breaks)
    const formattedContent = content.replace(/\n/g, '<br>');
    
    messageDiv.innerHTML = `
        <div class="message-content">
            ${formattedContent}
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
    
    // Play sound for bot messages (optional)
    if (!isUser) {
        playNotificationSound();
    }
}

// Show typing indicator
async function showTyping() {
    isTyping = true;
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = `
        <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    chatMessages.appendChild(typingDiv);
    scrollToBottom();
    
    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 500));
}

// Remove typing indicator
function removeTyping() {
    isTyping = false;
    const typing = document.getElementById('typingIndicator');
    if (typing) typing.remove();
}

// Send quick reply
function sendQuickReply(message) {
    userInput.value = message;
    sendMessage();
}

// Handle enter key press
function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

// Scroll to bottom of chat
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Play notification sound (optional)
function playNotificationSound() {
    // Uncomment to add sound
    // const audio = new Audio('/static/sounds/notification.mp3');
    // audio.play().catch(e => console.log('Sound play failed:', e));
}

// Clear chat history (optional feature)
function clearChat() {
    const messages = chatMessages.querySelectorAll('.message');
    messages.forEach(message => {
        if (!message.classList.contains('bot-message') || 
            message.querySelector('.message-content')?.innerText !== 'Hello! 👋 Welcome to College Enquiry Bot. How can I help you today?') {
            message.remove();
        }
    });
}

// Export functions for debugging (optional)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { sendMessage, clearChat };
}
