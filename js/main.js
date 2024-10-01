/*----------------------------------------------------*/
/* Start General */
let typingForm = document.querySelector(".typing-form");
let suggestions = document.querySelectorAll(".suggestion-list .suggestion");
let chatList = document.querySelector(".chat-list");
let modeButton = document.querySelector(".typing-area .action-buttons .mode");
let deleteButton = document.querySelector(".typing-area .action-buttons .delete");

let userMessage = null;
let isResponseGenerating = false;

let API_KEY = "AIzaSyANy4XV1fVAesaej8FRGPFKxng57OqzGOs";
let API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
/* End General */
/*----------------------------------------------------*/
// Start Create Div Content
let createMessageElement = (content, ...classes) => {
  let div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  
  return div;
}
// End Create Div Content
/*----------------------------------------------------*/
// Start Make Typing Effect On Response Text
let localChat = localStorage.getItem("chat");

  chatList.innerHTML = localChat || "";
  document.body.classList.toggle("hide-header", localChat);
  chatList.scrollTo(0, chatList.scrollHeight);

let showTypingEffect = function(textResponse, textElememt, incomingMessageDiv){
  let words = textResponse.split(" ");
  let index = 0;

  let addWordsToTextElememt = setInterval(() => {
    textElememt.innerText += (index === 0 ? '' : " ") + words[index++];
    incomingMessageDiv.querySelector(".icon").classList.add("hide");
    
    if(index === words.length){
      clearInterval(addWordsToTextElememt);
      isResponseGenerating = false;
      incomingMessageDiv.querySelector(".icon").classList.remove("hide");
      localStorage.setItem("chat", chatList.innerHTML);
      chatList.scrollTo(0, chatList.scrollHeight);
    }
  }, 75)
}
// End Make Typing Effect On Response Text
/*----------------------------------------------------*/
// Start Generate Api Response
let generateApiResponse = async (incomingMessageDiv) => {
  let textElement = incomingMessageDiv.querySelector(".text");

  try{
    let response = await fetch(API_URL, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [{text: userMessage}]
        }]
      })
    });

    let data = await response.json();
    if(!response.ok) throw new Error(data.error.message);

    let apiResponse = data?.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, `$1`);
    showTypingEffect(apiResponse, textElement, incomingMessageDiv)
  }catch(error){
    isResponseGenerating = false;
    textElement.innerText = error.message;
    textElement.classList.add("error");
  }finally{
    incomingMessageDiv.classList.remove("loading");
  }
}
// End Generate Api Response
/*----------------------------------------------------*/
// Start Show Animation
const showLoadingAnimation = () => {
  let htmlContent = `<div class="message-content">
        <img src="images/gemini.svg" class="avatar" alt="Gemini Image">
        <p class="text"></p>
        <div class="loading-indicator">
          <div class="loading-bar"></div>
          <div class="loading-bar"></div>
          <div class="loading-bar"></div>
        </div>
      </div>
      <i onClick="copyMessage(this)" class="icon fa-regular fa-copy"></i>`;

  let incomingMessageDiv = createMessageElement(htmlContent, "incoming", "loading");
  chatList.appendChild(incomingMessageDiv);

  chatList.scrollTo(0, chatList.scrollHeight);
  generateApiResponse(incomingMessageDiv);
}
// End Show Animation
/*----------------------------------------------------*/
// Start Copy Message
let copyMessage = (copyIcon) => {
  let copyText = copyIcon.parentElement.querySelector(".text").innerText;
  navigator.clipboard.writeText(copyText);

  setTimeout(() => {copyIcon.className = "icon fa-regular fa-circle-check"}, 1000);
}
// End Copy Message
/*----------------------------------------------------*/
// Start Check From (userMessage) And Send Data to (createMessageElement) Then Add Data From (createMessageElement) To (chatList)
let handleOutgoingChat = () => {
  userMessage = typingForm.querySelector(".typing-input").value.trim() || userMessage;

  if(!userMessage || isResponseGenerating) return;

  isResponseGenerating = true;

  let htmlContent = `<div class="message-content">
        <img src="images/user.png" class="avatar" alt="User Image">
        <p class="text"></p>
      </div>`;

  let outgoingMessageDiv = createMessageElement(htmlContent, "outgoing");
  outgoingMessageDiv.querySelector(".text").innerText = userMessage;
  chatList.appendChild(outgoingMessageDiv);

  typingForm.reset();
  chatList.scrollTo(0, chatList.scrollHeight);
  document.body.classList.add("hide-header");
  setTimeout(showLoadingAnimation, 500);
}
// End Check From (userMessage) And Send Data to (createMessageElement) Then Add Data From (createMessageElement) To (chatList)
/*----------------------------------------------------*/
// Start Page Mode
let localTheme = localStorage.getItem("theme");

if(localTheme !== null){
  let lightMode = (localTheme === "light");
  document.body.classList.toggle("light", lightMode);

  modeButton.className = (lightMode) ? "mode icon fa-solid fa-moon" : "mode icon fa-regular fa-sun";
}

modeButton.addEventListener("click", () => {
  let light = document.body.classList.toggle("light");
  if(light){
    modeButton.className = "mode icon fa-solid fa-moon";
    localStorage.setItem("theme", "light");
  }
  else{
    modeButton.className = "mode icon fa-regular fa-sun";
    localStorage.setItem("theme", "dark");
  }
})
// End Page Mode
/*----------------------------------------------------*/
// Start Suggestion Response
suggestions.forEach((suggestion) => {
  suggestion.addEventListener("click", () => {
    userMessage = suggestion.querySelector(".text").innerText;
    handleOutgoingChat();
  })
})
// End Suggestion Response
/*----------------------------------------------------*/
// Start Delete Button
deleteButton.onclick = () => {

  let overlay = document.createElement("div");
  overlay.className = "overlay";

  let poppupElement = document.createElement("div");
  poppupElement.className = "poppup";

  let textElement = document.createElement("h3");
  let poppupText = document.createTextNode("Are you sure you want to delete all messages?");
  textElement.appendChild(poppupText);

  let buttonItems = document.createElement("div");
  let buttonYes = document.createElement("button");
  buttonYes.innerText = "Yes";
  let buttonNo = document.createElement("button");
  buttonNo.innerText = "No";

  buttonItems.appendChild(buttonYes);
  buttonItems.appendChild(buttonNo);

  poppupElement.appendChild(textElement);
  poppupElement.appendChild(buttonItems);

  document.body.appendChild(overlay);
  document.body.appendChild(poppupElement);

  buttonItems.querySelectorAll("button").forEach((butt) => {
    butt.addEventListener("click", (e) => {
      if(e.target.innerText === "Yes"){
        localStorage.removeItem("chat");
        window.location.reload();
      }else{
        overlay.remove();
        poppupElement.remove();
      }
    })
  })

}
// End Delete Button
/*----------------------------------------------------*/
// Start Work (handleOutgoingChat) When Submit
typingForm.addEventListener("submit", (e) => {
  e.preventDefault();
  handleOutgoingChat();
  typingForm.querySelector(".typing-input").focus();
})
// End Work (handleOutgoingChat) When Submit