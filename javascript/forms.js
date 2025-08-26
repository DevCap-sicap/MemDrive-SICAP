import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyD23mN-ia7SaATIhzHXNMNKx7TrJ0V6NCk",
  authDomain: "membershipdrivesicap.firebaseapp.com",
  projectId: "membershipdrivesicap",
  storageBucket: "membershipdrivesicap.firebasestorage.app",
  messagingSenderId: "1049515842307",
  appId: "1:1049515842307:web:31f34fdafda44e71196736",
  measurementId: "G-J1D1BGHT8M"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

import { enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

enableIndexedDbPersistence(db).catch((err) => {
  if (err.code == 'failed-precondition') {
    console.warn("Multiple tabs open, persistence only works in one tab.");
  } else if (err.code == 'unimplemented') {
    console.warn("Browser doesn't support persistence");
  }
});


document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const submitBtn = document.getElementById("submit");

  // remove any duplicate listeners
  submitBtn.replaceWith(submitBtn.cloneNode(true));

  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // stop page refresh
    e.stopPropagation(); // stop bubbling

    try {
      const formData = {
        consent: document.getElementById("consent").checked,
        fullName: document.getElementById("full-name").value,
        studentId: document.getElementById("student-id").value,
        courseYear: document.getElementById("course-and-year").value,
        committee: document.querySelector("input[name='committee-selection']:checked")?.value || "",
        willingness: document.querySelector("input[name='willingness']:checked")?.value || "",
        facebookName: document.getElementById("facebook-name")?.value || "",
        paymentMode: document.querySelector("input[name='payment-mode']:checked")?.value || "",
        amountPaid: document.getElementById("amount-paid").value,
        paymentConfirmed: document.getElementById("payment-confirmation").checked
      };

      await addDoc(collection(db, "registrations"), formData);

      alert("Form submitted successfully!");
      form.reset();
    } catch (error) {
      console.error("Error submitting form: ", error);
      alert("Error submitting form. Check console.");
    }
  });
});


