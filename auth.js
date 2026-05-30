import { auth, db } from "./firebase-config.js";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// LOGIN
const loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", async () => {

  const roll = document.getElementById("login-roll").value.trim();

  const password = document.getElementById("login-pass").value;

  const errorBox = document.getElementById("login-err");

  errorBox.textContent = "";

  if (!roll || !password) {
    errorBox.textContent = "Please fill all fields.";
    return;
  }

  const fakeEmail = `${roll}@gnitscanteen.com`;

  try {

    await signInWithEmailAndPassword(
      auth,
      fakeEmail,
      password
    );

    window.location.href = "menu.html";

  }

  catch (error) {
    errorBox.textContent = "Invalid ERP ID or password.";
  }

});


// SIGNUP
const signupBtn = document.getElementById("signupBtn");

signupBtn.addEventListener("click", async () => {

  const roll = document.getElementById("signup-roll").value.trim();

  const name = document.getElementById("signup-name").value.trim();

  const password = document.getElementById("signup-pass").value;

  const confirmPassword =
    document.getElementById("signup-pass2").value;

  const errorBox = document.getElementById("signup-err");

  errorBox.textContent = "";

  if (!roll || !name || !password || !confirmPassword) {
    errorBox.textContent = "Please fill all fields.";
    return;
  }

  if (password !== confirmPassword) {
    errorBox.textContent = "Passwords do not match.";
    return;
  }

  const fakeEmail = `${roll}@gnitscanteen.com`;

  try {

    // CREATE FIREBASE ACCOUNT
    const userCredential =
      await createUserWithEmailAndPassword(
        auth,
        fakeEmail,
        password
      );

    // SAVE USER INFO IN FIRESTORE
    await setDoc(doc(db, "erp_users", roll.toUpperCase()), {
      roll: roll.toUpperCase(),
      name: name,
      role: "student",
      orders: []

});
    localStorage.setItem('sc_current_user', roll);
    window.location.href = "menu.html";

  }

  catch (error) {

    if (error.code === "auth/email-already-in-use") {
      errorBox.textContent =
        "Account already exists.";
    }

    else {
      errorBox.textContent = error.message;
    }

  }

});


// AUTO REDIRECT IF LOGGED IN
//onAuthStateChanged(auth, (user) => {

  //if (user) {
    //window.location.href = "menu.html";
  //}

//});