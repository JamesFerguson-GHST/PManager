
// Simple shift cipher for basic encryption
function encrypt(text, shift = 3) {
    return btoa(text.split('').map(char =>
        String.fromCharCode(char.charCodeAt(0) + shift)
    ).join(''));
}

// Simple shift cipher for decryption
function decrypt(text, shift = 3) {
    return atob(text).split('').map(char =>
        String.fromCharCode(char.charCodeAt(0) - shift)
    ).join('');
}

// Function to load stored passwords from localStorage
function loadPasswords() {
    return JSON.parse(localStorage.getItem('Password_stored')) || {};
}

// Function to save passwords
function savePassword(username, site, password) {
    let storedData = JSON.parse(localStorage.getItem("Password_stored")) || {};

    if (!storedData[username]) {
        storedData[username] = { savedPasswords: {} };
    }

    // Add the new password to the savedPasswords object
    storedData[username].savedPasswords[site] = encrypt(password);

    // Save the updated data back to localStorage
    localStorage.setItem("Password_stored", JSON.stringify(storedData));

    alert(`Password for ${site} saved!`);
}

// Function to register a new user
function registerUser(username, password) {
    let data = loadPasswords();
    if (data[username]) {
        alert('User already exists!');
        return;
    }
    data[username] = { masterPassword: encrypt(password), savedPasswords: {} };
    savePasswords(data);
    alert('User registered successfully!');
}

// Function to login
function loginUser(username, password) {
    let data = loadPasswords();
    if (!data[username] || decrypt(data[username].masterPassword) !== password) {
        alert('Invalid username or password!');
        return null;
    }
    alert('Login successful!');
    return data[username].savedPasswords;
}

// Function to add or update a password entry (encrypting stored passwords)
// Handle file upload and convert to JSON format
function handleFileUpload(event) {
    const file = event.target.files[0]; // Get the uploaded file
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const uploadedJson = JSON.parse(e.target.result); // Parse the JSON file
                jsonData = uploadedJson; // Store parsed JSON data for merging
                document.getElementById("outputBox").innerText = JSON.stringify(jsonData, null, 2);
                console.log("JSON uploaded and parsed successfully");
            } catch (err) {
                alert("Error parsing JSON file: " + err);
            }
        };
        reader.readAsText(file); // Read the file as text
    }
}

// Save password and merge with localStorage data
function addOrUpdatePassword(username, site, sitePassword) {
    let data = loadPasswords(); // Load data from localStorage

    // If there's no uploaded JSON, initialize it
    if (!jsonData.saved || jsonData.saved.length === 0) {
        jsonNewData = { saved: Object.entries(data[username]?.savedPasswords || {}).map(([site, password]) => ({ sitename: site, password: decrypt(password) })) || [] };
    }

    // Check if site exists in jsonData and update or add it
    let existingSiteIndex = jsonNewData.saved.findIndex(entry => entry.sitename === site);
    if (existingSiteIndex === -1) {
        jsonData.saved.push({ sitename: site, password: sitePassword });
    } else {
        jsonData.saved[existingSiteIndex].password = sitePassword;
    }

    // Update the data for saving (localStorage)
    data[username].savedPasswords = jsonnewData.saved.reduce((acc, entry) => {
        acc[entry.sitename] = encrypt(entry.password);
        return acc;
    }, {});

    // Save the merged data back to localStorage
    savePasswords(data);
    saveLocal(data); // Save updated data

    // Update output box with the latest merged data
    document.getElementById("outputBox").innerText = JSON.stringify(jsonData, null, 2);
    alert(`Password for ${site} saved!`);
}


// Function to view all saved passwords (decrypting before displaying)
function viewPasswords(username) {
    let storedData = JSON.parse(localStorage.getItem("Password_stored")) || {};

    if (!storedData[username] || !storedData[username].savedPasswords) {
        document.getElementById("outputBox").innerText = "No passwords found.";
        return;
    }

    // Convert saved passwords into a readable format
    let passwordList = Object.entries(storedData[username].savedPasswords).map(([site, password]) => ({
        sitename: site,
        password: decrypt(password)
    }));

    document.getElementById("outputBox").innerText = JSON.stringify(passwordList, null, 2);
}

// Function to delete saved passwords (requires re-entering password)
function deletePasswords(username) {
    let data = loadPasswords();
    if (!data[username]) {
        alert('User not found!');
        return;
    }

    let enteredPassword = document.getElementById('deleteTrue').value;
    if (decrypt(data[username].masterPassword) !== enteredPassword) {
        alert('Incorrect password! Deletion not allowed.');
        return;
    }

    data[username].savedPasswords = {};
    savePasswords(data);
    alert('All saved passwords have been deleted!');
}

// Function to generate password
function genPassword(length = 12) {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()-_=+[]{}|;:'\",.<>?/`~";

    const allChars = uppercase + lowercase + numbers + symbols;
    let password = "";

    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    for (let i = 4; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    password = password.split('').sort(() => Math.random() - 0.5).join('');

    document.getElementById('generatedPassword').innerHTML = password;
}

// Function to check the strength of the password and update the strength bar
function checkPasswordStrength() {
    const password = document.getElementById('passwordInput').value;
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');

    let strength = 0;
    if (password.length >= 8) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 20;

    strengthBar.value = strength;

    if (strength <= 20) {
        strengthText.textContent = "Weak";
        strengthBar.style.backgroundColor = "red";
    } else if (strength <= 40) {
        strengthText.textContent = "Fair";
        strengthBar.style.backgroundColor = "orange";
    } else if (strength <= 60) {
        strengthText.textContent = "Good";
        strengthBar.style.backgroundColor = "yellowgreen";
    } else if (strength <= 80) {
        strengthText.textContent = "Strong";
        strengthBar.style.backgroundColor = "green";
    } else {
        strengthText.textContent = "Very Strong";
        strengthBar.style.backgroundColor = "darkgreen";
    }
}

// Dark mode
const themeToggle = document.getElementById("themeToggle");

if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
}

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");

    // Save theme preference to localStorage
    if (document.body.classList.contains("dark-mode")) {
        localStorage.setItem("theme", "dark");
    } else {
        localStorage.setItem("theme", "light");
    }
});
