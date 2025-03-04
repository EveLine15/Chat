const messageForm = document.querySelector('.message-input');
const messagesPart = document.querySelector('.message-part');
const input = document.querySelector('.input-message');

const API_KEY = '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';

let messageHolder = [];

class Message{
    constructor(id, sender, timestamp, text, status){
        this.id = id;
        this.sender = sender;
        this.timestamp = timestamp;
        this.text = text;
        this.status = status;
        this.render();
    }

    render(){
        const div = document.createElement('div');
        div.innerHTML = `
        <div class="message ${this.status}" id="${this.id}">
            <p>${this.text}</p>
            <p class="time-text">${this.timestamp}</p>
        </div>
        `
        messagesPart.appendChild(div);
    }
}

class UserMessage extends Message{
    deliteMessage(){

    }
}

class SystemMessage extends Message{
    
}

messageForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if(input.value.trim()){
        const currentDate = new Date();
        const userMessage = new UserMessage(messageHolder.length + 1, 'eve', `${currentDate.getHours()}:${currentDate.getMinutes()}`, input.value, 'recipient');
        messageHolder.push(userMessage);
        const aiResonse = getMessageAi(input.value);
        input.value = '';
    }
});

messagesPart.addEventListener('click', (event) => {
        event.preventDefault();
        if(event.target.closest('.recipient')){
            const delButton = document.createElement('button');
            delButton.innerText = 'Delete';
            delButton.classList.add('del-button');
    
            const windowWidth = window.innerWidth;
    
            let posX = event.clientX;
    
            console.log(windowWidth);
            console.log(posX+55)
            if (posX + 55 > windowWidth) {
                posX = windowWidth - 150;
            }
    
            delButton.style.left = `${posX}px`;
            delButton.style.top = `${event.clientY}px`;
    
            document.body.appendChild(delButton);

            delButton.addEventListener('click', () => {
                //const {id} = event.target.parentElement;
                console.log(event.target.parentElement);
                messagesPart.removeChild(event.target.parentElement.parentElement);
                console.log(delButton)
                document.body.removeChild(delButton);
                document.body.removeEventListener();
            })
        }
});

async function getAIResponse(userMessage) {
    headers = {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
    }

    const data = {
        model: "deepseek/deepseek-chat:free",
        messages: [{ role: "user", content: `${userMessage} (Please respond in no more than 3 sentences, without lists)` }]
    };

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data)
        })

        if (response.ok) {
            const responseData = await response.json();
            return responseData;

        } else {
            throw new Error(`Failed to fetch data from API. Status Code: ${response.status}`);
        }   
    } catch (error) {
        console.log('Error fetching AI response:', error);
    }

}

async function getMessageAi(userMessage){
    const currentDate = new Date();
    try {
        let aiResponse = await getAIResponse(userMessage);
        if(aiResponse === '') aiResponse = "I can't answer right now";
        const sysMessage = new SystemMessage(messageHolder.length + 1, 'system', `${currentDate.getHours()}:${currentDate.getMinutes()}`, aiResponse.choices[0].message.content, 'sender');
        messageHolder.push(sysMessage);

    } catch (error) {
        aiResponse = "I didn't get the response, try again";
    }
}

input.addEventListener("keydown", (event) => {
    if (event.key === " " && input.value.length === 0) {
        event.preventDefault();
    }
});

input.addEventListener("input", () => {
    if (input.value.startsWith(" ")) {
        input.value = input.value.trimStart();
    }
});

function scrollToBottom(container) {
    container.scrollTop = container.scrollHeight;
  }
  
  window.onload = function() {
    const chatContainer = document.querySelector('.message-part');
    scrollToBottom(chatContainer);
  };
  
  const chatContainer = document.querySelector('.message-part');
  const observer = new MutationObserver(() => {
    scrollToBottom(chatContainer);
  });
  
  observer.observe(chatContainer, {
    childList: true, // наблюдаем за добавлением новых элементов
    subtree: true,   // наблюдаем за элементами внутри контейнера
  });