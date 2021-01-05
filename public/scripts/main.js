const socket = io();

const inboxPeople = document.querySelector(".onlineUsers");
const unameForm = document.querySelector(".unameForm");
const unameWindow = document.querySelector(".unamePrompt");
const mainWindow = document.querySelector(".mainWindowContainer");
const unameBox = document.querySelector(".unameBox");
const warning = document.querySelector(".warningMessage");
const inputField = document.querySelector(".message_form__input");
let userName = "";

const newUserConnected = (user) => {
  userName = user;

  //emitting this so that it gets picked by server
  socket.emit("new user", userName);
};

const addToUsersBox = (userName) => {
  if (!!document.querySelector(`.${userName}-userlist`)) {
    return;
  }

  const userBox = `
    <div class="chat_ib ${userName}-userlist">
      <h5 class = "font-weight-bold">${userName}</h5>
    </div>
  `;
  inboxPeople.innerHTML += userBox;
  unameWindow.style.display = "none";
  mainWindow.style.display = "block";
  inputField.focus();
};

// new user is created so we generate nickname and emit event
unameForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!unameBox.value) {
    return;
  }

  let user = unameBox.value;
  newUserConnected(user);

  unameBox.value = "";
});

//this gets triggered when server emits the event
socket.on("new user", function (data) {

  if (data == true) {
    warning.style.display = "block";
  }
  else {
    //getting the userlist from server and addint them to the page one by one
    data.map((user) => addToUsersBox(user));
  }
});

socket.on("user disconnected", function (userName) {
  document.querySelector(`.${userName}-userlist`).remove();
});

const messageForm = document.querySelector(".message_form");
const messageBox = document.querySelector(".messages__history");
const mainInbox = document.querySelector(".inbox__messages");

const addNewMessage = ({ user, message }) => {
  const time = new Date();
  const formattedTime = time.toLocaleString("en-US", { hour: "numeric", minute: "numeric" });

  const receivedMsg = `
  <div class="incoming__message clearfix">
    <div class="received__message px-3 pt-3 float-left my-1">
      <p class="message__author font-weight-bold">${user}</p>
      <p class = "text-break">${message}</p>
    </div>
  </div>`;

  const myMsg = `
  <div class="outgoing__message clearfix">
    <div class="sent__message px-3 pt-3 float-right my-1">
      <p class = "text-break">${message}</p>
    </div>
  </div>`;

  messageBox.innerHTML += user === userName ? myMsg : receivedMsg;
  mainInbox.scrollTop = mainInbox.scrollHeight;
};

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!inputField.value) {
    return;
  }

  socket.emit("chat message", {
    message: inputField.value,
    nick: userName,
  });

  inputField.focus();
  inputField.value = "";
});

socket.on("chat message", function (data) {
  addNewMessage({ user: data.nick, message: data.message });
});
