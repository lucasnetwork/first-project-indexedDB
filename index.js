const loadButton = document.querySelector("#load");
const addButton = document.querySelector("#add");
const clearButton = document.querySelector(".clear");
const input = document.querySelector("#deleteInput");
const inputName = document.querySelector("#name");
const inputPassword = document.querySelector("#password");

function acessDatabase(callback) {
  const request = window.indexedDB.open("users", 1);

  request.onsuccess = callback;

  request.onupgradeneeded = initializingUserDatabase;
}

function getAllUsers(e, usersList) {
  const db = e.target.result;
  const transaction = db.transaction(["users"], "readonly");
  const objectStore = transaction.objectStore("users");
  const request = objectStore.openCursor();

  request.onsuccess = (e) => {
    const cursor = event.target.result;
    if (cursor) {
      usersList.push({ ...cursor.value, id: cursor.key });
      cursor.continue();
    } else {
      mostrarValores(usersList);
    }
  };
}

function addUser(e) {
  const usersList = [];
  const db = e.target.result;
  const transaction = db.transaction(["users"], "readwrite");

  const objectStore = transaction.objectStore("users");

  const request = objectStore.add({
    name: inputName.value,
    password: inputPassword.value,
  });

  request.onsuccess = acessDatabase((e) => getAllUsers(e, usersList));
}

function mostrarValores(users) {
  const listsHtml = users
    .map(
      (user, index) =>
        `<tbody><td>${user.id}</td><td>${user.name}</td><td>${user.password}</td></tbody>`
    )
    .join("");
  const userContainer = document.querySelector("#users");

  userContainer.innerHTML = `<thead>
        <th>id</th>
        <th>nome</th>
        <th>senha</th>
      </thead>
      ${listsHtml}
      `;
}

function initializingUserDatabase(e) {
  const db = e.target.result;

  const objectStore = db.createObjectStore("users", {
    autoIncrement: true,
  });

  objectStore.createIndex("nome", "nome", { unique: false });
  objectStore.createIndex("password", "password", { unique: false });
}

function deleteItem(e) {
  const usersList = [];
  const db = e.target.result;
  const transaction = db.transaction(["users"], "readwrite");
  const objectStore = transaction.objectStore("users");
  const request = objectStore.delete(Number(input.value));

  request.onsuccess = acessDatabase((e) => getAllUsers(e, usersList));
}

loadButton.addEventListener("click", () => {
  const usersList = [];
  acessDatabase((e) => getAllUsers(e, usersList));
});

clearButton.addEventListener("click", () => acessDatabase(deleteItem));
addButton.addEventListener("click", () => acessDatabase(addUser));
