const form = document.querySelector('form');
const messagesPart = document.querySelector('.message-part');
const input = document.querySelector('.input-message');

const API_KEY = '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';

let messageHolder = [];

class Message{
    constructor(id, sender, timestamp, text){
        this.id = id;
        this.sender = sender;
        this.timestamp = timestamp;
        this.text = text;
        this.render();
    }

    render(){
    }
}

class UserMessage extends Message{
    render(){
        const div = document.createElement('div');
        div.innerHTML = `
        <div class="message recipient">
            <p>${this.text}</p>
            <p class="time-text">${this.timestamp}</p>
        </div>
        `
        messagesPart.appendChild(div);
    }
}

class SystemMessage extends Message{
    render(){
        const div = document.createElement('div');
        div.innerHTML = `
        <div class="message sender">
            <p>${this.text}</p>
            <p class="time-text">${this.timestamp}</p>
        </div>
        `
        messagesPart.appendChild(div);
    }
}

form.addEventListener('submit', (event) => {
    event.preventDefault();
    if(input.value.trim()){
        const currentDate = new Date();
        const userMessage = new UserMessage(messageHolder.length + 1, 'eve', `${currentDate.getHours()}:${currentDate.getMinutes()}`, input.value);
        const aiResonse = getMessageAi(input.value);
        input.value = '';
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
            console.log(responseData)
            return responseData;

        } else {
            throw new Error(`Failed to fetch data from API. Status Code: ${response.status}`);
        }   
    } catch (error) {
        console.error('Error fetching AI response:', error);
    }

}

async function getMessageAi(userMessage){
    const currentDate = new Date();
    try {
        let aiResponse = await getAIResponse(userMessage);
        if(aiResponse === '') aiResponse = "I can't answer right now";
        const sysMessage = new SystemMessage(messageHolder.length + 1, 'system', `${currentDate.getHours()}:${currentDate.getMinutes()}`, aiResponse.choices[0].message.content);
        
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
