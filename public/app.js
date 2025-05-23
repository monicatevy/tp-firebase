// CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyAwu2g1OBmHAHUwGRS_3DYufo6LGnZ6x3I",
  authDomain: "tp-firebase-51f2f.firebaseapp.com",
  projectId: "tp-firebase-51f2f",
  storageBucket: "tp-firebase-51f2f.appspot.com",
  messagingSenderId: "180306458137",
  appId: "1:180306458137:web:495a1349265479b2ad5c88",
  measurementId: "G-ZF966R22ZR"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// SIGN UP
document.getElementById("signup-form").addEventListener("submit", function(e) {
  e.preventDefault();
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  auth.createUserWithEmailAndPassword(email, password)
    .then(() => { document.getElementById("signup-form").reset(); })
    .catch((error) => { alert("Erreur inscription : " + error.message); });
});

// LOGIN
document.getElementById("login-form").addEventListener("submit", function(e) {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  auth.signInWithEmailAndPassword(email, password)
    .then(() => { document.getElementById("login-form").reset(); })
    .catch((error) => { alert("Erreur connexion : " + error.message); });
});

// LOGOUT
document.getElementById("logout-btn").addEventListener("click", function() {
  auth.signOut();
});

// GOOGLE SIGN-IN
document.getElementById("google-signin-btn").addEventListener("click", function(e) {
  e.preventDefault();
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider).catch((error) => {
    alert("Erreur Google Sign-In : " + error.message);
  });
});

// AUTH STATE CHANGE
auth.onAuthStateChanged(function(user) {
  const messageArea = document.getElementById("message-area");
  const logoutBtn = document.getElementById("logout-btn");
  const userInfo = document.getElementById("user-info");

  if (user) {
    document.getElementById("signup-form").style.display = "none";
    document.getElementById("login-form").style.display = "none";
    document.getElementById("google-signin-btn").style.display = "none";
    messageArea.style.display = "block";
    logoutBtn.style.display = "block";
    userInfo.textContent = `Connecté(e) : ${user.email}`;
  } else {
    document.getElementById("signup-form").style.display = "block";
    document.getElementById("login-form").style.display = "block";
    document.getElementById("google-signin-btn").style.display = "block";
    messageArea.style.display = "none";
    logoutBtn.style.display = "none";
    userInfo.textContent = "";
  }
});

// PUBLISH MESSAGE
document.getElementById("message-form").addEventListener("submit", function(e) {
  e.preventDefault();
  const message = document.getElementById("message-input").value.trim();
  const user = auth.currentUser;
  if (!user || !message) return;

  db.collection("messages").add({
    text: message,
    uid: user.uid,
    email: user.email,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    document.getElementById("message-form").reset();
  }).catch((error) => {
    alert("Erreur lors de l'envoi du message : " + error.message);
  });
});

// DISPLAY MSG
db.collection("messages")
  .orderBy("timestamp", "desc")
  .onSnapshot((querySnapshot) => {
    const messagesList = document.getElementById("messages-list");
    messagesList.innerHTML = "";
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      let dateStr = data.timestamp && data.timestamp.toDate
        ? data.timestamp.toDate().toLocaleString()
        : "date inconnue";
      const msg = document.createElement("div");
      msg.className = "msg-card";
      msg.innerHTML = `
        <div>${data.text}</div>
        <div class="msg-meta">${data.email || "Anonyme"} &bull; ${dateStr}</div>
      `;
      messagesList.appendChild(msg);
    });
  });