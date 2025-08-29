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

// Enhanced offline storage management
class OfflineManager {
  constructor() {
    this.storageKey = 'sicap_pending_registrations';
    this.isOnline = navigator.onLine;
    this.setupEventListeners();
    this.processPendingRegistrations();
  }

  setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('Back online - processing pending registrations');
      this.processPendingRegistrations();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('Gone offline - will store locally');
    });
  }

  // Save registration locally
  saveLocally(formData) {
    try {
      const pending = this.getPendingRegistrations();
      const registration = {
        ...formData,
        id: Date.now().toString(),
        localTimestamp: new Date().toISOString()
      };
      pending.push(registration);
      localStorage.setItem(this.storageKey, JSON.stringify(pending));
      return true;
    } catch (error) {
      console.error('Error saving to local storage:', error);
      return false;
    }
  }

  // Get pending registrations from local storage
  getPendingRegistrations() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading from local storage:', error);
      return [];
    }
  }

  // Remove processed registration from local storage
  removePendingRegistration(id) {
    try {
      const pending = this.getPendingRegistrations();
      const filtered = pending.filter(reg => reg.id !== id);
      localStorage.setItem(this.storageKey, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing from local storage:', error);
    }
  }

  // Process all pending registrations when online
  async processPendingRegistrations() {
    if (!this.isOnline) return;

    const pending = this.getPendingRegistrations();
    if (pending.length === 0) return;

    console.log(`Processing ${pending.length} pending registrations...`);

    for (const registration of pending) {
      try {
        const { id, localTimestamp, ...firebaseData } = registration;
        await addDoc(collection(db, "registrations"), firebaseData);
        this.removePendingRegistration(id);
        console.log(`Successfully synced registration: ${firebaseData.fullName}`);
      } catch (error) {
        console.error('Error syncing registration:', error);
      }
    }
  }

  // Main submission handler
  async submitRegistration(formData) {
    try {
      if (this.isOnline) {
        await addDoc(collection(db, "registrations"), formData);
        console.log("Registration saved directly to Firebase");
        return { success: true, method: 'online' };
      } else {
        throw new Error('Offline - using local storage');
      }
    } catch (error) {
      console.log('Saving registration locally:', error.message);
      const saved = this.saveLocally(formData);
      if (saved) {
        return { success: true, method: 'offline' };
      } else {
        return { success: false, error: 'Failed to save locally' };
      }
    }
  }

  // Get count of pending registrations for UI display
  getPendingCount() {
    return this.getPendingRegistrations().length;
  }
}

// Initialize offline manager
const offlineManager = new OfflineManager();

// Check if all form fields are filled
function areAllFieldsFilled() {
  // Required fields
  const consent = document.getElementById("consent").checked;
  const lname = document.getElementById("lastname").value.trim();
  const fname = document.getElementById("firstname").value.trim();
  const minit = document.getElementById("middleinitial").value.trim();
  const studentId = document.getElementById("student-id").value.trim();
  const courseYear = document.getElementById("course-and-year").value.trim();
  const committee = document.querySelector("input[name='committee-selection']:checked");
  const willingness = document.querySelector("input[name='willingness']:checked");
  const facebookName = document.getElementById("facebook-name").value.trim();
  const paymentMode = document.querySelector("input[name='payment-mode']:checked");
  const amountPaid = document.querySelector("input[name='payment-amount']:checked");
  const paymentConfirmed = document.getElementById("payment-confirmation").checked;

  return consent &&
         lname &&
         fname &&
         minit &&
         studentId &&
         courseYear &&
         committee &&
         willingness &&
         facebookName &&
         paymentMode &&
         amountPaid &&
         paymentConfirmed;
}

// Update submit button state based on form completion
function updateSubmitButton() {
  const submitBtn = document.getElementById("submit");
  if (submitBtn) {
    submitBtn.disabled = !areAllFieldsFilled();
  }
}

// Add event listeners to all form fields
function setupFormValidation() {
  // Get all input elements
  const allInputs = document.querySelectorAll('input');
  
  // Add event listeners to each input
  allInputs.forEach(input => {
    input.addEventListener('input', updateSubmitButton);
    input.addEventListener('change', updateSubmitButton);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // Setup form validation
  setupFormValidation();
  
  // Initial check to disable submit button
  updateSubmitButton();

  const form = document.querySelector("form");
  const submitBtn = document.getElementById("submit");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Double-check all fields are filled (just in case)
    if (!areAllFieldsFilled()) {
      alert('Please complete all fields before submitting.');
      return;
    }

    // Disable submit button to prevent double submission
    submitBtn.disabled = true;
    submitBtn.value = "Submitting...";

    const formData = {
      consent: document.getElementById("consent").checked,
      lName: document.getElementById("lastname").value,
      fName: document.getElementById("firstname").value,
      minit: document.getElementById("middleinitial").value,
      studentId: document.getElementById("student-id").value,
      courseYear: document.getElementById("course-and-year").value,
      committee: document.querySelector("input[name='committee-selection']:checked").value,
      willingness: document.querySelector("input[name='willingness']:checked").value,
      facebookName: document.getElementById("facebook-name").value,
      paymentMode: document.querySelector("input[name='payment-mode']:checked").value,
      amountPaid: document.querySelector("input[name='payment-amount']:checked").value,
      paymentConfirmed: document.getElementById("payment-confirmation").checked,
      timestamp: new Date()
    };

    try {
      const result = await offlineManager.submitRegistration(formData);
      
      if (result.success) {
        const message = result.method === 'online' ? 
          'Registration submitted successfully!' : 
          'Registration submitted successfully!';
        
        alert(message);
        form.reset();
        window.close();
      } else {
        throw new Error(result.error || 'Submission failed');
      }
    } catch (error) {
      console.error("Error during submission:", error);
      alert("Unable to save registration. Please try again.");
    } finally {
      // Re-enable submit button (in case of error)
      submitBtn.disabled = false;
      submitBtn.value = "Submit";
    }
  });
});