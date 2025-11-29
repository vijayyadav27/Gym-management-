const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-auth-domain",
    projectId: "your-project-id",
    storageBucket: "your-storage-bucket",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

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

loginBtn.addEventListener('click', () => openModal(loginModal));
registerBtn.addEventListener('click', () => openModal(registerModal));
closeButtons.forEach(button => {
    button.addEventListener('click', closeModal);
});
showRegister.addEventListener('click', (e) => {
    e.preventDefault();
    closeModal();
    openModal(registerModal);
});
showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    closeModal();
    openModal(loginModal);
});
loginForm.addEventListener('submit', handleLogin);
registerForm.addEventListener('submit', handleRegister);
logoutBtn.addEventListener('click', handleLogout);
hamburger.addEventListener('click', toggleMobileMenu);

function openModal(modal) {
    modal.style.display = 'block';
}

function closeModal() {
    loginModal.style.display = 'none';
    registerModal.style.display = 'none';
}

function toggleMobileMenu() {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
}

document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const userType = document.getElementById('user-type').value;
    
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            closeModal();
            showDashboard(userType);
        })
        .catch((error) => {
            alert(`Login failed: ${error.message}`);
        });
}

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const userType = document.getElementById('register-type').value;
    
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            
            return db.collection('users').doc(user.uid).set({
                name: name,
                email: email,
                userType: userType,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        })
        .then(() => {
            closeModal();
            showDashboard(userType);
        })
        .catch((error) => {
            alert(`Registration failed: ${error.message}`);
        });
}

function handleLogout() {
    auth.signOut().then(() => {
        hideDashboard();
    }).catch((error) => {
        console.error('Sign out error:', error);
    });
}

function showDashboard(userType) {
    document.querySelector('main').style.display = 'none';
    dashboard.classList.remove('hidden');
    dashboardTitle.textContent = `${userType.charAt(0).toUpperCase() + userType.slice(1)} Dashboard`;
    loadDashboardContent(userType);
}

function hideDashboard() {
    dashboard.classList.add('hidden');
    document.querySelector('main').style.display = 'block';
}

function loadDashboardContent(userType) {
    let content = '';
    
    switch(userType) {
        case 'admin':
            content = `
                <div class="admin-dashboard">
                    <div class="dashboard-cards">
                        <div class="card">
                            <h3>Total Members</h3>
                            <p id="total-members">0</p>
                        </div>
                        <div class="card">
                            <h3>Pending Payments</h3>
                            <p id="pending-payments">0</p>
                        </div>
                        <div class="card">
                            <h3>Monthly Revenue</h3>
                            <p id="monthly-revenue">$0</p>
                        </div>
                    </div>
                    <div class="dashboard-actions">
                        <button class="btn primary" id="add-member-btn">Add Member</button>
                        <button class="btn primary" id="create-bill-btn">Create Bill</button>
                        <button class="btn primary" id="send-notification-btn">Send Notification</button>
                        <button class="btn primary" id="generate-report-btn">Generate Report</button>
                    </div>
                    <div class="dashboard-table">
                        <h3>Recent Members</h3>
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
                            <tbody id="members-table-body"></tbody>
                        </table>
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
                            <p id="next-payment">15th Oct 2023</p>
                        </div>
                        <div class="card">
                            <h3>Remaining Days</h3>
                            <p id="remaining-days">12</p>
                        </div>
                    </div>
                    <div class="dashboard-section">
                        <h3>My Receipts</h3>
                        <div id="receipts-list"></div>
                    </div>
                    <div class="dashboard-section">
                        <h3>Notifications</h3>
                        <div id="notifications-list"></div>
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
                            <p id="membership-status">Active</p>
                        </div>
                        <div class="card">
                            <h3>Last Payment</h3>
                            <p id="last-payment">1st Oct 2023</p>
                        </div>
                    </div>
                    <div class="dashboard-section">
                        <h3>My Details</h3>
                        <div id="user-details"></div>
                    </div>
                    <div class="dashboard-section">
                        <h3>Search Records</h3>
                        <div class="search-box">
                            <input type="text" id="search-input" placeholder="Search payment records...">
                            <button class="btn primary" id="search-btn">Search</button>
                        </div>
                        <div id="search-results"></div>
                    </div>
                </div>
            `;
            break;
    }
    
    dashboardContent.innerHTML = content;

    if (userType === 'admin') {
        document.getElementById('add-member-btn').addEventListener('click', showAddMemberForm);
        document.getElementById('create-bill-btn').addEventListener('click', showCreateBillForm);
        document.getElementById('send-notification-btn').addEventListener('click', showSendNotificationForm);
        document.getElementById('generate-report-btn').addEventListener('click', generateReport);
        loadMembersData();
    }
    
    if (userType === 'user') {
        document.getElementById('search-btn').addEventListener('click', handleSearch);
    }
}

function showAddMemberForm() {
    alert('Add Member functionality would be implemented here');
}

function showCreateBillForm() {
    alert('Create Bill functionality would be implemented here');
}

function showSendNotificationForm() {
    alert('Send Notification functionality would be implemented here');
}

function generateReport() {
    alert('Generate Report functionality would be implemented here');
}

function loadMembersData() {
    const membersTableBody = document.getElementById('members-table-body');
    membersTableBody.innerHTML = `
        <tr>
            <td>John Doe</td>
            <td>2023-09-15</td>
            <td>Premium</td>
            <td>Active</td>
            <td>
                <button class="btn small">Edit</button>
                <button class="btn small danger">Delete</button>
            </td>
        </tr>
        <tr>
            <td>Jane Smith</td>
            <td>2023-09-20</td>
            <td>Basic</td>
            <td>Active</td>
