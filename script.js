// script.js - Complete Firebase Implementation
const firebaseConfig = {
    apiKey: "AIzaSyBg3cj0VrXBNgJkJPp-NeL2n2Ogsv5gP_4",
    authDomain: "gym-management-58b8d.firebaseapp.com",
    projectId: "gym-management-58b8d",
    storageBucket: "gym-management-58b8d.firebasestorage.app",
    messagingSenderId: "7404188760",
    appId: "1:7404188760:web:23c619eef48f488668862d"
};

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully");
} catch (error) {
    console.error("Firebase initialization error:", error);
}

const auth = firebase.auth();
const db = firebase.firestore();

// DOM Elements
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');
const closeButtons = document.querySelectorAll('.close');
const showRegister = document.getElementById('show-register');
const showLogin = document.getElementById('show-login');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const logoutBtn = document.getElementById('logout-btn');
const dashboard = document.getElementById('dashboard');
const dashboardTitle = document.getElementById('dashboard-title');
const dashboardContent = document.querySelector('.dashboard-content');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const getStartedBtn = document.getElementById('get-started');

// Debug: Check if elements exist
console.log('Login button:', loginBtn);
console.log('Register button:', registerBtn);

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, setting up event listeners');
    
    if (loginBtn) loginBtn.addEventListener('click', () => openModal(loginModal));
    if (registerBtn) registerBtn.addEventListener('click', () => openModal(registerModal));
    if (getStartedBtn) getStartedBtn.addEventListener('click', () => openModal(registerModal));
    
    closeButtons.forEach(button => {
        button.addEventListener('click', closeModal);
    });
    
    if (showRegister) showRegister.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal();
        openModal(registerModal);
    });
    
    if (showLogin) showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal();
        openModal(loginModal);
    });
    
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (registerForm) registerForm.addEventListener('submit', handleRegister);
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    if (hamburger) hamburger.addEventListener('click', toggleMobileMenu);

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }));

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) closeModal();
        if (e.target === registerModal) closeModal();
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Modal Functions
function openModal(modal) {
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
}

function closeModal() {
    if (loginModal) loginModal.style.display = 'none';
    if (registerModal) registerModal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Re-enable scrolling
}

// Toggle Mobile Menu
function toggleMobileMenu() {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
}

// Authentication Functions
function handleLogin(e) {
    e.preventDefault();
    console.log('Login attempt');
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const userType = document.getElementById('user-type').value;
    
    if (!email || !password) {
        alert('Please fill in all fields');
        return;
    }

    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Logging in...';
    submitBtn.disabled = true;

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log('User logged in:', user);
            
            // Get user data from Firestore
            return db.collection('users').doc(user.uid).get();
        })
        .then((doc) => {
            if (doc.exists) {
                const userData = doc.data();
                closeModal();
                showDashboard(userData.userType || 'member');
            } else {
                console.log('No user document found');
                closeModal();
                showDashboard('member'); // Default to member
            }
        })
        .catch((error) => {
            console.error('Login error:', error);
            alert(`Login failed: ${error.message}`);
        })
        .finally(() => {
            // Reset button state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
}

function handleRegister(e) {
    e.preventDefault();
    console.log('Registration attempt');
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const userType = document.getElementById('register-type').value;
    
    if (!name || !email || !password) {
        alert('Please fill in all fields');
        return;
    }

    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Creating Account...';
    submitBtn.disabled = true;

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log('User created:', user);
            
            // Save user data to Firestore
            return db.collection('users').doc(user.uid).set({
                name: name,
                email: email,
                userType: userType,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'active'
            });
        })
        .then(() => {
            console.log('User data saved successfully');
            closeModal();
            showDashboard(userType);
        })
        .catch((error) => {
            console.error('Registration error:', error);
            alert(`Registration failed: ${error.message}`);
        })
        .finally(() => {
            // Reset button state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
}

function handleLogout() {
    auth.signOut().then(() => {
        console.log('User signed out successfully');
        hideDashboard();
    }).catch((error) => {
        console.error('Sign out error:', error);
        alert('Logout failed: ' + error.message);
    });
}

// Dashboard Functions
function showDashboard(userType) {
    console.log('Showing dashboard for:', userType);
    
    // Hide main content
    const mainContent = document.querySelector('main');
    if (mainContent) mainContent.style.display = 'none';
    
    // Show dashboard
    dashboard.classList.remove('hidden');
    
    // Set dashboard title
    dashboardTitle.textContent = `${userType.charAt(0).toUpperCase() + userType.slice(1)} Dashboard`;
    
    // Load appropriate dashboard content
    loadDashboardContent(userType);
}

function hideDashboard() {
    console.log('Hiding dashboard');
    
    // Show main content
    const mainContent = document.querySelector('main');
    if (mainContent) mainContent.style.display = 'block';
    
    // Hide dashboard
    dashboard.classList.add('hidden');
}

function loadDashboardContent(userType) {
    console.log('Loading content for:', userType);
    
    let content = '';
    
    switch(userType) {
        case 'admin':
            content = `
                <div class="admin-dashboard">
                    <div class="dashboard-cards">
                        <div class="card">
                            <h3>Total Members</h3>
                            <p id="total-members">24</p>
                        </div>
                        <div class="card">
                            <h3>Pending Payments</hh3>
                            <p id="pending-payments">5</p>
                        </div>
                        <div class="card">
                            <h3>Monthly Revenue</h3>
                            <p id="monthly-revenue">$1,250</p>
                        </div>
                        <div class="card">
                            <h3>Active Packages</h3>
                            <p id="active-packages">3</p>
                        </div>
                    </div>
                    
                    <div class="dashboard-actions">
                        <button class="btn primary" id="add-member-btn">Add Member</button>
                        <button class="btn primary" id="create-bill-btn">Create Bill</button>
                        <button class="btn primary" id="send-notification-btn">Send Notification</button>
                        <button class="btn primary" id="generate-report-btn">Generate Report</button>
                    </div>
                    
                    <div class="dashboard-section">
                        <h3>Recent Members</h3>
                        <div class="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Join Date</th>
                                        <th>Package</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="members-table-body">
                                    <tr>
                                        <td>John Doe</td>
                                        <td>2024-01-15</td>
                                        <td>Premium</td>
                                        <td><span class="status active">Active</span></td>
                                        <td>
                                            <button class="btn small">Edit</button>
                                            <button class="btn small danger">Delete</button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Jane Smith</td>
                                        <td>2024-01-10</td>
                                        <td>Basic</td>
                                        <td><span class="status active">Active</span></td>
                                        <td>
                                            <button class="btn small">Edit</button>
                                            <button class="btn small danger">Delete</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
            break;
            
        case 'member':
            content = `
                <div class="member-dashboard">
                    <div class="dashboard-cards">
                        <div class="card">
                            <h3>Current Package</h3>
                            <p id="current-package">Premium</p>
                        </div>
                        <div class="card">
                            <h3>Next Payment</h3>
                            <p id="next-payment">15th Feb 2024</p>
                        </div>
                        <div class="card">
                            <h3>Remaining Days</h3>
                            <p id="remaining-days">12</p>
                        </div>
                        <div class="card">
                            <h3>Total Paid</h3>
                            <p id="total-paid">$300</p>
                        </div>
                    </div>
                    
                    <div class="dashboard-section">
                        <h3>My Receipts</h3>
                        <div id="receipts-list" class="receipts-grid">
                            <div class="receipt-card">
                                <h4>January 2024 Payment</h4>
                                <p>Amount: $50.00</p>
                                <p>Date: 2024-01-15</p>
                                <button class="btn small">View Receipt</button>
                            </div>
                            <div class="receipt-card">
                                <h4>December 2023 Payment</h4>
                                <p>Amount: $50.00</p>
                                <p>Date: 2023-12-15</p>
                                <button class="btn small">View Receipt</button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="dashboard-section">
                        <h3>Notifications</h3>
                        <div id="notifications-list" class="notifications">
                            <div class="notification-item">
                                <h4>Gym Holiday</h4>
                                <p>The gym will be closed on February 14th for maintenance.</p>
                                <span class="notification-date">2024-02-10</span>
                            </div>
                            <div class="notification-item">
                                <h4>Payment Reminder</h4>
                                <p>Your next payment is due on February 15th.</p>
                                <span class="notification-date">2024-02-01</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            break;
            
        case 'user':
            content = `
                <div class="user-dashboard">
                    <div class="dashboard-cards">
                        <div class="card">
                            <h3>Membership Status</h3>
                            <p id="membership-status" class="status active">Active</p>
                        </div>
                        <div class="card">
                            <h3>Last Payment</h3>
                            <p id="last-payment">15th Jan 2024</p>
                        </div>
                        <div class="card">
                            <h3>Next Payment</h3>
                            <p id="user-next-payment">15th Feb 2024</p>
                        </div>
                    </div>
                    
                    <div class="dashboard-section">
                        <h3>My Details</h3>
                        <div id="user-details" class="user-details">
                            <div class="detail-item">
                                <label>Name:</label>
                                <span>John Doe</span>
                            </div>
                            <div class="detail-item">
                                <label>Email:</label>
                                <span>john.doe@example.com</span>
                            </div>
                            <div class="detail-item">
                                <label>Membership Type:</label>
                                <span>Premium</span>
                            </div>
                            <div class="detail-item">
                                <label>Join Date:</label>
                                <span>2024-01-01</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="dashboard-section">
                        <h3>Search Records</h3>
                        <div class="search-box">
                            <input type="text" id="search-input" placeholder="Search payment records...">
                            <button class="btn primary" id="search-btn">Search</button>
                        </div>
                        <div id="search-results" class="search-results">
                            <p class="search-placeholder">Enter a search term to find your records</p>
                        </div>
                    </div>
                </div>
            `;
            break;
    }
    
    dashboardContent.innerHTML = content;
    
    // Add event listeners for dashboard buttons
    setTimeout(() => {
        if (userType === 'admin') {
            const addMemberBtn = document.getElementById('add-member-btn');
            const createBillBtn = document.getElementById('create-bill-btn');
            const sendNotificationBtn = document.getElementById('send-notification-btn');
            const generateReportBtn = document.getElementById('generate-report-btn');
            
            if (addMemberBtn) addMemberBtn.addEventListener('click', showAddMemberForm);
            if (createBillBtn) createBillBtn.addEventListener('click', showCreateBillForm);
            if (sendNotificationBtn) sendNotificationBtn.addEventListener('click', showSendNotificationForm);
            if (generateReportBtn) generateReportBtn.addEventListener('click', generateReport);
        }
        
        if (userType === 'user') {
            const searchBtn = document.getElementById('search-btn');
            if (searchBtn) searchBtn.addEventListener('click', handleSearch);
        }
    }, 100);
}

// Admin Functions
function showAddMemberForm() {
    alert('Add Member functionality would open a form here');
    // In a real implementation, this would show a modal form
}

function showCreateBillForm() {
    alert('Create Bill functionality would open a form here');
}

function showSendNotificationForm() {
    alert('Send Notification functionality would open a form here');
}

function generateReport() {
    alert('Report generation would start here');
    // This would typically download a PDF or CSV file
}

// User Functions
function handleSearch() {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    const searchTerm = searchInput.value.trim();
    
    if (!searchTerm) {
        searchResults.innerHTML = '<p class="search-placeholder">Please enter a search term</p>';
        return;
    }
    
    // Simulate search results
    searchResults.innerHTML = `
        <div class="search-result-item">
            <h4>Payment Receipt - January 2024</h4>
            <p>Amount: $50.00 | Date: 2024-01-15 | Status: Paid</p>
            <button class="btn small">View Details</button>
        </div>
        <div class="search-result-item">
            <h4>Membership Registration</h4>
            <p>Package: Premium | Date: 2024-01-01 | Status: Active</p>
            <button class="btn small">View Details</button>
        </div>
    `;
}

// Auth State Observer
auth.onAuthStateChanged((user) => {
    console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
    
    if (user) {
        // User is signed in
        console.log('User ID:', user.uid);
        
        // Get user data from Firestore
        db.collection('users').doc(user.uid).get()
            .then((doc) => {
                if (doc.exists) {
                    const userData = doc.data();
                    console.log('User data:', userData);
                    showDashboard(userData.userType || 'member');
                } else {
                    console.log('No user document found, creating one...');
                    // Create a default user document
                    return db.collection('users').doc(user.uid).set({
                        name: user.displayName || 'User',
                        email: user.email,
                        userType: 'member',
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        status: 'active'
                    }).then(() => {
                        showDashboard('member');
                    });
                }
            })
            .catch((error) => {
                console.error('Error getting user document:', error);
                showDashboard('member'); // Default fallback
            });
    } else {
        // User is signed out
        hideDashboard();
    }
});

// Add some additional CSS for new elements
const additionalStyles = `
    .status {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 600;
    }
    
    .status.active {
        background: #10b981;
        color: white;
    }
    
    .table-container {
        overflow-x: auto;
    }
    
    .receipts-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1rem;
    }
    
    .receipt-card, .notification-item, .search-result-item {
        background: #f8fafc;
        padding: 1rem;
        border-radius: 8px;
        border-left: 4px solid var(--primary);
    }
    
    .user-details {
        display: grid;
        gap: 1rem;
    }
    
    .detail-item {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem 0;
        border-bottom: 1px solid #e2e8f0;
    }
    
    .search-placeholder {
        text-align: center;
        color: #64748b;
        font-style: italic;
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);
