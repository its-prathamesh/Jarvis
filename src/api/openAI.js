import axios from 'axios';
import { apiKey } from "../constants/dummy";

const client= axios.create({
    headers:{
        "Authorization":"Bearer "+ apiKey,
        "Content-Type":"application/json"
    }
})

const chatGptEndpoint="https://api.openai.com/v1/chat/completions";
const dalleEndpont="https://api.openai.com/v1/images/generations";

export const apiCall=async(prompt, messages)=>{
    try{
        const res = await client.post(chatGptEndpoint, {
            model: 'gpt-3.5-turbo',
            messages: [{
                role: 'user',
                content: `Does this message want to generate an AI picture, image, art or anything similar?  ${prompt} Simply answer with yes or no.`,
            }]
        })
        console.log('data: ',res.data.choices[0].message);
        let isArt= res.data?.choices[0]?.message?.content;
        if(isArt.toLowerCase().includes('yes')){
            console.log('dalle api call');
            return dalleApiCall(prompt, messages);
        }else{
            console.log("chatgpt api call");
            return chatgptApiCall(prompt, messages);
        }
 
    }catch(err){
        console.log('error: ',err);
        return Promise.resolve({success: false, msg: err.message});

    }
}

const chatgptApiCall = async (prompt, messages) => {
    try {
      console.log('ChatGPT API Call - Start');
      const res = await client.post(chatGptEndpoint, {
        model: 'gpt-3.5-turbo',
        messages,
      });
  
      console.log('ChatGPT API Response:', res.data);
  
      let answer = res.data?.choices[0]?.message?.content;
  
      messages.push({ role: 'assistant', content: answer.trim() });
  
      return Promise.resolve({ success: true, data: messages });
    } catch (err) {
      console.log('Error in ChatGPT API Call:', err);
      return Promise.resolve({ success: false, msg: err.message });
    }
  }
  


const dalleApiCall = async(prompt, messages) =>{
    try{
        const res = await client.post(dalleEndpont, {
            prompt,
            n: 1,
            size: "512x512"

        })
        console.log('DALL·E API Response:', res.data);
        let url = res?.data?.data[0]?.url;
        if (url) {
            console.log('Got URL of the image:', url);
            messages.push({ role: 'assistant', content: url });
            return Promise.resolve({ success: true, data: messages });
          } else {
            console.log('Error: Unable to get image URL from DALL·E API response');
            return Promise.resolve({ success: false, msg: 'Unable to get image URL' });
          }
        } catch (err) {
          console.log('Error:', err);
          return Promise.resolve({ success: false, msg: err.message });
        }
    }
