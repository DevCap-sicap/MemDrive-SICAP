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
        id: Date.now().toString(), // Simple ID generation
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
        // Remove the local metadata before sending to Firebase
        const { id, localTimestamp, ...firebaseData } = registration;
        
        await addDoc(collection(db, "registrations"), firebaseData);
        this.removePendingRegistration(id);
        console.log(`Successfully synced registration: ${firebaseData.fullName}`);
      } catch (error) {
        console.error('Error syncing registration:', error);
        // Keep the registration in local storage for retry later
      }
    }

    const remainingPending = this.getPendingRegistrations();
    if (remainingPending.length === 0) {
      console.log('All pending registrations synced successfully!');
    } else {
      console.log(`${remainingPending.length} registrations still pending sync`);
    }
  }

  // Main submission handler
  async submitRegistration(formData) {
    try {
      if (this.isOnline) {
        // Try to submit directly to Firebase first
        await addDoc(collection(db, "registrations"), formData);
        console.log("Registration saved directly to Firebase");
        return { success: true, method: 'online' };
      } else {
        throw new Error('Offline - using local storage');
      }
    } catch (error) {
      // If online submission fails or we're offline, save locally
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

// Add status indicator to show offline/online status and pending count
function updateStatusIndicator() {
  let statusDiv = document.getElementById('connection-status');
  if (!statusDiv) {
    statusDiv = document.createElement('div');
    statusDiv.id = 'connection-status';
    statusDiv.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
      z-index: 1000;
      min-width: 120px;
      text-align: center;
    `;
    document.body.appendChild(statusDiv);
  }

  const isOnline = navigator.onLine;
  const pendingCount = offlineManager.getPendingCount();
  
  if (isOnline) {
    statusDiv.style.backgroundColor = '#4CAF50';
    statusDiv.style.color = 'white';
    statusDiv.textContent = pendingCount > 0 ? 
      `Online - Syncing ${pendingCount}` : 'Online';
  } else {
    statusDiv.style.backgroundColor = '#FF9800';
    statusDiv.style.color = 'white';
    statusDiv.textContent = pendingCount > 0 ? 
      `Offline - ${pendingCount} pending` : 'Offline';
  }
}

// Update status on page load and connection changes
window.addEventListener('online', updateStatusIndicator);
window.addEventListener('offline', updateStatusIndicator);
document.addEventListener('DOMContentLoaded', updateStatusIndicator);

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const submitBtn = document.getElementById("submit");

  // Remove any existing event listeners
  submitBtn.replaceWith(submitBtn.cloneNode(true));
  const newSubmitBtn = document.getElementById("submit");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Disable submit button to prevent double submission
    newSubmitBtn.disabled = true;
    newSubmitBtn.value = "Submitting...";

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
      paymentConfirmed: document.getElementById("payment-confirmation").checked,
      timestamp: new Date()
    };

    try {
      const result = await offlineManager.submitRegistration(formData);
      
      if (result.success) {
        const message = result.method === 'online' ? 
          'Registration submitted successfully!' : 
          'Registration saved offline. It will be synced when you\'re back online.';
        
        alert(message);
        form.reset();
        updateStatusIndicator(); // Update pending count
        window.location.href = "../index.html";
      } else {
        throw new Error(result.error || 'Submission failed');
      }
    } catch (error) {
      console.error("Error during submission:", error);
      alert("Unable to save registration. Please try again.");
    } finally {
      // Re-enable submit button
      newSubmitBtn.disabled = false;
      newSubmitBtn.value = "Submit";
    }
  });

  // Show pending registrations count on load
  const pendingCount = offlineManager.getPendingCount();
  if (pendingCount > 0) {
    console.log(`You have ${pendingCount} registrations waiting to be synced.`);
  }
});