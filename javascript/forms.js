// Import Firebase SDKs (modular v9+ style)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// Your Firebase config (from your Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyD23mN-ia7SaATIhzHXNMNKx7TrJ0V6NCk",
  authDomain: "membershipdrivesicap.firebaseapp.com",
  projectId: "membershipdrivesicap",
  storageBucket: "membershipdrivesicap.firebasestorage.app",
  messagingSenderId: "1049515842307",
  appId: "1:1049515842307:web:31f34fdafda44e71196736",
  measurementId: "G-J1D1BGHT8M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Handle form submission
document.addEventListener("DOMContentLoaded", () => {
  const submitBtn = document.getElementById("submit");

  submitBtn.addEventListener("click", async () => {
    try {
      // Collect form values
      const formData = {
        consent: document.getElementById("consent").checked,
        fullName: document.getElementById("full-name").value,
        studentId: document.getElementById("student-id").value,
        courseYear: document.getElementById("course-and-year").value,
        committee: document.querySelector("input[name='committee-selection']:checked")?.value || "",
        willingness: document.querySelector("input[name='willingness']:checked")?.value || "",
        facebookName: document.querySelector("input[name='facebook-name']")?.value || "",
        paymentMode: document.querySelector("input[name='payment-mode']:checked")?.value || "",
        amountPaid: document.getElementById("amount-paid").value,
        paymentConfirmed: document.getElementById("payment-confirmation").checked
      };

      // Save to Firestore (collection: "registrations")
      await addDoc(collection(db, "registrations"), formData);

      alert("Form submitted successfully");
    } catch (error) {
      console.error("Error submitting form: ", error);
      alert("Error submitting form. Check console for details.");
    }

    location.reload();
  });
});
