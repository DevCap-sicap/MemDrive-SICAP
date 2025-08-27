// Function to check if all required fields in a section are filled
function checkSectionCompletion() {
    // Section 1: Intro - Check if consent checkbox is checked
    const consentCheckbox = document.getElementById('consent');
    const introNext = document.querySelector('#Intro .nav-button');
    if (consentCheckbox && introNext) {
        introNext.disabled = !consentCheckbox.checked;
    }

    // Section 2: Personal Info - Check if all name fields are filled
    const lastname = document.getElementById('lastname');
    const firstname = document.getElementById('firstname');
    const middleinitial = document.getElementById('middleinitial');
    const personalInfoNext = document.querySelector('#personal-info .nav-button[value="Next"]');
    
    if (lastname && firstname && middleinitial && personalInfoNext) {
        const allNameFieldsFilled = lastname.value.trim() !== '' && 
                                   firstname.value.trim() !== '' && 
                                   middleinitial.value.trim() !== '';
        personalInfoNext.disabled = !allNameFieldsFilled;
    }

    // Section 3: Student Email - Check if email field is filled
    const studentId = document.getElementById('student-id');
    const studentIdNext = document.querySelector('#student-id-sec .nav-button[value="Next"]');
    
    if (studentId && studentIdNext) {
        studentIdNext.disabled = studentId.value.trim() === '';
    }

    // Section 4: Course and Year Level - Check if course field is filled
    const courseAndYear = document.getElementById('course-and-year');
    const courseNext = document.querySelector('#course-year-level .nav-button[value="Next"]');
    
    if (courseAndYear && courseNext) {
        courseNext.disabled = courseAndYear.value.trim() === '';
    }

    // Section 5: Committee Selection - Check if a committee option is selected
    const committeeRadios = document.querySelectorAll('input[name="committee-selection"]');
    const committeeNext = document.querySelector('#committee-selection .nav-button[value="Next"]');
    
    if (committeeRadios.length > 0 && committeeNext) {
        const isCommitteeSelected = Array.from(committeeRadios).some(radio => radio.checked);
        committeeNext.disabled = !isCommitteeSelected;
    }

    // Section 6: Willingness - Check if willingness option is selected
    const willingnessRadios = document.querySelectorAll('input[name="willingness"]');
    const willingnessNext = document.querySelector('#willingness .nav-button[value="Next"]');
    
    if (willingnessRadios.length > 0 && willingnessNext) {
        const isWillingnessSelected = Array.from(willingnessRadios).some(radio => radio.checked);
        willingnessNext.disabled = !isWillingnessSelected;
    }

    // Section 7: Facebook Name - Check if facebook name field is filled
    const facebookName = document.getElementById('facebook-name');
    const facebookNext = document.querySelector('#facebook-namesec .nav-button[value="Next"]');
    
    if (facebookName && facebookNext) {
        facebookNext.disabled = facebookName.value.trim() === '';
    }

    // Section 8: Payment Mode - Check if payment mode is selected
    const paymentModeRadios = document.querySelectorAll('input[name="payment-mode"]');
    const paymentModeNext = document.querySelector('#payment-mode .nav-button[value="Next"]');
    
    if (paymentModeRadios.length > 0 && paymentModeNext) {
        const isPaymentModeSelected = Array.from(paymentModeRadios).some(radio => radio.checked);
        paymentModeNext.disabled = !isPaymentModeSelected;
    }

    // Section 9: Amount Paid - Check if amount field is filled
    const amountPaid = document.getElementById('amount-paid');
    const amountNext = document.querySelector('#amount-paidsec .nav-button[value="Next"]');
    
    if (amountPaid && amountNext) {
        amountNext.disabled = amountPaid.value.trim() === '';
    }
}

// Add event listeners when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initially disable all next buttons
    const nextButtons = document.querySelectorAll('.nav-button[value="Next"]');
    const okButton = document.querySelector('.nav-button[value="Ok"]');
    
    nextButtons.forEach(button => {
        button.disabled = true;
    });
    
    if (okButton) {
        okButton.disabled = true;
    }

    // Add event listeners for text inputs
    const textInputs = document.querySelectorAll('input[type="text"]');
    textInputs.forEach(input => {
        input.addEventListener('input', checkSectionCompletion);
        input.addEventListener('blur', checkSectionCompletion);
    });

    // Add event listeners for radio buttons
    const radioButtons = document.querySelectorAll('input[type="radio"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', checkSectionCompletion);
    });

    // Add event listeners for checkboxes
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', checkSectionCompletion);
    });

    // Initial check
    checkSectionCompletion();
});

// Optional: Add visual feedback for disabled buttons
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        .nav-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            background-color: #ccc;
        }
        
        .nav-button:not(:disabled) {
            cursor: pointer;
        }
    `;
    document.head.appendChild(style);
});

const returntohome = document.getElementById("return-to-home");
returntohome.addEventListener("click", function(){
      const form = document.querySelector("form");
      form.reset();
      window.close();
});