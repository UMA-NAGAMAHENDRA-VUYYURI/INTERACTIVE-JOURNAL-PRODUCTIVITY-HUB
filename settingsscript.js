// App State
const state = {
    user: {
        name: "koushik immidi",
        email: "koushikimmidi@gmail.com",
        username: "koushiki",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg",
        bio: "Writer, productivity enthusiast, and lifelong learner."
    },
    settings: {
        notifications: {
            enabled: true,
            journalReminders: true,
            taskReminders: true,
            blogComments: true,
            productivityReports: false,
            communityUpdates: false,
            method: "in-app",
            dailyTime: "09:00"
        },
        privacy: {
            publicProfile: false,
            defaultJournalPrivacy: "private",
            journalDiscovery: true,
            twoFactorAuth: false,
            loginNotifications: true,
            dataCollection: true,
            personalizedContent: true,
            activityLogs: true,
            dataRetention: "30days",
            encryption: true
        },
        integrations: {
            googleCalendar: true,
            dropbox: false,
            slack: false
        }
    },
    faqs: [
        {
            question: "How do I recover deleted journal entries?",
            answer: "Deleted journal entries are kept in the trash for 30 days. You can restore them from the Trash section in your journal. After 30 days, they are permanently deleted."
        },
        {
            question: "Can I use the app offline?",
            answer: "Yes, you can create and edit journal entries and tasks offline. Your changes will sync automatically when you reconnect to the internet."
        },
        {
            question: "How do I share my journal with someone?",
            answer: "Go to the journal entry you want to share, click the Share button, and choose whether to share via link, email, or with specific users in our community."
        },
        {
            question: "What's the difference between journals and blogs?",
            answer: "Journals are private by default and meant for personal reflection. Blogs are public and meant to be shared with others. You can convert a journal entry to a blog post anytime."
        }
    ],
    team: [
        {
            name: "David Chen",
            role: "Founder & CEO",
            avatar: "https://randomuser.me/api/portraits/men/32.jpg"
        },
        {
            name: "Sarah Johnson",
            role: "Lead Designer",
            avatar: "https://randomuser.me/api/portraits/women/44.jpg"
        },
        {
            name: "Michael Rodriguez",
            role: "Lead Developer",
            avatar: "https://randomuser.me/api/portraits/men/67.jpg"
        },
        {
            name: "Emily Wilson",
            role: "Community Manager",
            avatar: "https://randomuser.me/api/portraits/women/28.jpg"
        }
    ],
    availableIntegrations: [
        {
            name: "Google Calendar",
            description: "Sync your tasks and reminders",
            icon: "fab fa-google",
            connected: true
        },
        {
            name: "Dropbox",
            description: "Backup your journal entries",
            icon: "fab fa-dropbox",
            connected: false
        },
        {
            name: "Slack",
            description: "Get reminders in Slack",
            icon: "fab fa-slack",
            connected: false
        },
        {
            name: "Trello",
            description: "Connect your Trello boards",
            icon: "fab fa-trello",
            connected: false
        },
        {
            name: "Microsoft To-Do",
            description: "Sync with Microsoft To-Do",
            icon: "fab fa-microsoft",
            connected: false
        },
        {
            name: "Spotify",
            description: "Background music for writing",
            icon: "fab fa-spotify",
            connected: false
        }
    ]
};

// DOM Elements
const settingsMenu = document.getElementById('settings-menu');
const settingsContent = document.getElementById('settings-content');
const settingsTitle = document.getElementById('settings-title');
const userAvatar = document.getElementById('user-avatar');
const profileUpload = document.getElementById('profile-upload');
const toast = document.getElementById('toast');

// API Endpoints - Using JSONPlaceholder for demonstration
const API_ENDPOINTS = {
    getUser: 'https://jsonplaceholder.typicode.com/users/1',
    updateUser: 'https://jsonplaceholder.typicode.com/users/1',
    uploadImage: 'https://api.imgbb.com/1/upload?key=YOUR_IMGBB_API_KEY' // Replace with your imgBB API key
};

// Show toast notification
function showToast(message, duration = 3000) {
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// Initialize the app
async function init() {
    // Set user info
    userAvatar.src = state.user.avatar;

    try {
        // Load user data from API
        const response = await fetch(API_ENDPOINTS.getUser);
        if (!response.ok) throw new Error('Failed to fetch user data');
        
        const userData = await response.json();
        state.user = { 
            ...state.user, 
            name: userData.name || state.user.name,
            email: userData.email || state.user.email,
            username: userData.username || state.user.username
        };
        
        // Update UI
        renderAccountSettings();
    } catch (error) {
        console.error("Error fetching user data:", error);
        showToast("Error loading user data. Using local data.");
    }

    // Load saved settings from localStorage
    loadSettings();

    // Render the settings menu
    renderMenu();

    // Render the initial content (Account settings)
    renderContent('account');

    // Set up event listeners
    setupEventListeners();
}

// Upload profile picture to imgBB
async function uploadProfilePicture(file) {
    const formData = new FormData();
    formData.append('image', file);
    
    try {
        const response = await fetch(API_ENDPOINTS.uploadImage, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) throw new Error('Failed to upload image');
        
        const data = await response.json();
        return data.data.url; // Return the URL of the uploaded image
    } catch (error) {
        console.error("Error uploading image:", error);
        throw error;
    }
}

// Update user profile in the API
async function updateUserProfile(profileData) {
    try {
        const response = await fetch(API_ENDPOINTS.updateUser, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(profileData)
        });
        
        if (!response.ok) throw new Error('Failed to update profile');
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error updating profile:", error);
        throw error;
    }
}

// Load settings from localStorage
function loadSettings() {
    const savedSettings = localStorage.getItem('journalAppSettings');
    if (savedSettings) {
        Object.assign(state.settings, JSON.parse(savedSettings));
    }
}

// Save settings to localStorage and API
async function saveSettings() {
    localStorage.setItem('journalAppSettings', JSON.stringify(state.settings));
    
    // In a real app, you would also save to your backend API
    console.log("Settings saved to localStorage");
}

// Render the settings menu
function renderMenu() {
    const menuItems = [
        { id: 'account', icon: 'fa-user', text: 'Account' },
        { id: 'notifications', icon: 'fa-bell', text: 'Notifications' },
        { id: 'privacy', icon: 'fa-lock', text: 'Privacy & Security' },
        { id: 'integrations', icon: 'fa-plug', text: 'Integrations' },
        { id: 'help', icon: 'fa-question-circle', text: 'Help & Support' },
        { id: 'about', icon: 'fa-info-circle', text: 'About' }
    ];

    settingsMenu.innerHTML = menuItems.map(item => `
        <li><a href="#${item.id}" data-section="${item.id}"><i class="fas ${item.icon}"></i> ${item.text}</a></li>
    `).join('');

    // Set first item as active
    settingsMenu.querySelector('a').classList.add('active');
}

// Render content based on section
function renderContent(sectionId) {
    settingsTitle.textContent = `${capitalizeFirstLetter(sectionId)} Settings`;
    
    switch (sectionId) {
        case 'account':
            renderAccountSettings();
            break;
        case 'notifications':
            renderNotificationSettings();
            break;
        case 'privacy':
            renderPrivacySettings();
            break;
        case 'integrations':
            renderIntegrationSettings();
            break;
        case 'help':
            renderHelpSettings();
            break;
        case 'about':
            renderAboutSettings();
            break;
        default:
            renderAccountSettings();
    }
}

// Render Account Settings
function renderAccountSettings() {
    settingsContent.innerHTML = `
        <div class="settings-card active" id="account">
            <h2>Profile Information</h2>
            <div class="form-row">
                <div class="form-group">
                    <label for="firstName">First Name</label>
                    <input type="text" id="firstName" class="form-control" value="${state.user.name.split(' ')[0]}">
                </div>
                <div class="form-group">
                    <label for="lastName">Last Name</label>
                    <input type="text" id="lastName" class="form-control" value="${state.user.name.split(' ')[1] || ''}">
                </div>
            </div>
            <div class="form-group">
                <label for="username">Username</label>
                <input type="text" id="username" class="form-control" value="${state.user.username}">
            </div>
            <div class="form-group">
                <label for="email">Email Address</label>
                <input type="email" id="email" class="form-control" value="${state.user.email}">
            </div>
            <div class="form-group">
                <label for="bio">Bio</label>
                <textarea id="bio" class="form-control" rows="3">${state.user.bio}</textarea>
            </div>
            <div class="btn-group">
                <button class="btn" id="save-profile">Save Changes</button>
                <button class="btn btn-danger" id="cancel-profile">Cancel</button>
            </div>
        </div>

        <div class="settings-card" id="account-password">
            <h2>Password</h2>
            <div class="form-group">
                <label for="currentPassword">Current Password</label>
                <input type="password" id="currentPassword" class="form-control">
            </div>
            <div class="form-group">
                <label for="newPassword">New Password</label>
                <input type="password" id="newPassword" class="form-control">
            </div>
            <div class="form-group">
                <label for="confirmPassword">Confirm New Password</label>
                <input type="password" id="confirmPassword" class="form-control">
            </div>
            <div class="btn-group">
                <button class="btn" id="update-password">Update Password</button>
            </div>
        </div>
    `;
}

// Render Notification Settings
function renderNotificationSettings() {
    settingsContent.innerHTML = `
        <div class="settings-card active" id="notifications">
            <h2>Notification Preferences</h2>
            <div class="settings-section">
                <h3>General Notifications</h3>
                <label class="toggle-label">
                    <span>Enable All Notifications</span>
                    <div class="toggle-switch">
                        <input type="checkbox" id="enableNotifications" ${state.settings.notifications.enabled ? 'checked' : ''}>
                        <span class="slider"></span>
                    </div>
                </label>
            </div>
            <div class="settings-section">
                <h3>Notification Types</h3>
                <div class="notification-options">
                    <div class="notification-option">
                        <div class="notification-option-info">
                            <h4>Journal Reminders</h4>
                            <p>Receive reminders to write in your journal</p>
                        </div>
                        <div class="toggle-switch">
                            <input type="checkbox" id="journalReminders" ${state.settings.notifications.journalReminders ? 'checked' : ''}>
                            <span class="slider"></span>
                        </div>
                    </div>
                    <div class="notification-option">
                        <div class="notification-option-info">
                            <h4>Task Due Dates</h4>
                            <p>Get alerts when tasks are due or overdue</p>
                        </div>
                        <div class="toggle-switch">
                            <input type="checkbox" id="taskReminders" ${state.settings.notifications.taskReminders ? 'checked' : ''}>
                            <span class="slider"></span>
                        </div>
                    </div>
                    <div class="notification-option">
                        <div class="notification-option-info">
                            <h4>Blog Comments</h4>
                            <p>Notify me when someone comments on my blog</p>
                        </div>
                        <div class="toggle-switch">
                            <input type="checkbox" id="blogComments" ${state.settings.notifications.blogComments ? 'checked' : ''}>
                            <span class="slider"></span>
                        </div>
                    </div>
                    <div class="notification-option">
                        <div class="notification-option-info">
                            <h4>Productivity Insights</h4>
                            <p>Weekly reports on your productivity and journaling habits</p>
                        </div>
                        <div class="toggle-switch">
                            <input type="checkbox" id="productivityReports" ${state.settings.notifications.productivityReports ? 'checked' : ''}>
                            <span class="slider"></span>
                        </div>
                    </div>
                    <div class="notification-option">
                        <div class="notification-option-info">
                            <h4>Community Updates</h4>
                            <p>News and updates from the community</p>
                        </div>
                        <div class="toggle-switch">
                            <input type="checkbox" id="communityUpdates" ${state.settings.notifications.communityUpdates ? 'checked' : ''}>
                            <span class="slider"></span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="settings-section">
                <h3>Notification Delivery</h3>
                <div class="form-group">
                    <label>Preferred Notification Method</label>
                    <div class="select-wrapper">
                        <select id="notificationMethod" class="form-control">
                            <option value="in-app" ${state.settings.notifications.method === 'in-app' ? 'selected' : ''}>In-App Notifications</option>
                            <option value="email" ${state.settings.notifications.method === 'email' ? 'selected' : ''}>Email Notifications</option>
                            <option value="both" ${state.settings.notifications.method === 'both' ? 'selected' : ''}>Both In-App and Email</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label for="notificationTime">Daily Digest Time</label>
                    <input type="time" id="notificationTime" class="form-control" value="${state.settings.notifications.dailyTime}">
                </div>
            </div>
            <div class="btn-group">
                <button class="btn" id="save-notifications">Save Preferences</button>
            </div>
        </div>
    `;
}

// Render Privacy Settings
function renderPrivacySettings() {
    settingsContent.innerHTML = `
        <div class="settings-card active" id="privacy">
            <h2>Privacy & Security</h2>
            
            <div class="privacy-grid">
                <!-- Account Privacy -->
                <div class="privacy-card">
                    <h4><i class="fas fa-user-shield"></i> Account Privacy</h4>
                    <p>Control who can see your profile and activity</p>
                    <label class="toggle-label">
                        <span>Public Profile</span>
                        <div class="toggle-switch">
                            <input type="checkbox" id="publicProfile" ${state.settings.privacy.publicProfile ? 'checked' : ''}>
                            <span class="slider"></span>
                        </div>
                    </label>
                    <p class="form-text">When enabled, others can see your profile</p>
                </div>
                
                <!-- Journal Privacy -->
                <div class="privacy-card">
                    <h4><i class="fas fa-book"></i> Journal Privacy</h4>
                    <p>Manage default privacy for new journal entries</p>
                    <div class="form-group">
                        <label>Default Privacy</label>
                        <div class="select-wrapper">
                            <select id="defaultJournalPrivacy" class="form-control">
                                <option value="private" ${state.settings.privacy.defaultJournalPrivacy === 'private' ? 'selected' : ''}>Private</option>
                                <option value="friends" ${state.settings.privacy.defaultJournalPrivacy === 'friends' ? 'selected' : ''}>Friends Only</option>
                                <option value="public" ${state.settings.privacy.defaultJournalPrivacy === 'public' ? 'selected' : ''}>Public</option>
                            </select>
                        </div>
                    </div>
                    <label class="toggle-label">
                        <span>Allow Discovery</span>
                        <div class="toggle-switch">
                            <input type="checkbox" id="journalDiscovery" ${state.settings.privacy.journalDiscovery ? 'checked' : ''}>
                            <span class="slider"></span>
                        </div>
                    </label>
                </div>
                
                <!-- Security -->
                <div class="privacy-card">
                    <h4><i class="fas fa-shield-alt"></i> Security</h4>
                    <p>Enhance your account security</p>
                    <label class="toggle-label">
                        <span>Two-Factor Auth <span class="tooltip">?<span class="tooltiptext">Adds an extra layer of security to your account</span></span></span>
                        <div class="toggle-switch">
                            <input type="checkbox" id="twoFactorAuth" ${state.settings.privacy.twoFactorAuth ? 'checked' : ''}>
                            <span class="slider"></span>
                        </div>
                    </label>
                    <label class="toggle-label">
                        <span>Login Notifications</span>
                        <div class="toggle-switch">
                            <input type="checkbox" id="loginNotifications" ${state.settings.privacy.loginNotifications ? 'checked' : ''}>
                            <span class="slider"></span>
                        </div>
                    </label>
                    <label class="toggle-label">
                        <span>Data Encryption <span class="tooltip">?<span class="tooltiptext">Encrypts your data for additional protection</span></span></span>
                        <div class="toggle-switch">
                            <input type="checkbox" id="encryption" ${state.settings.privacy.encryption ? 'checked' : ''}>
                            <span class="slider"></span>
                        </div>
                    </label>
                    
                    ${state.settings.privacy.twoFactorAuth || state.settings.privacy.encryption ? `
                        <div class="security-badge">
                            <i class="fas fa-lock"></i>
                            <span>Enhanced Security Active</span>
                        </div>
                    ` : ''}
                </div>
                
                <!-- Data Privacy -->
                <div class="privacy-card">
                    <h4><i class="fas fa-database"></i> Data Privacy</h4>
                    <p>Control how your data is used</p>
                    <label class="toggle-label">
                        <span>Activity Logs</span>
                        <div class="toggle-switch">
                            <input type="checkbox" id="activityLogs" ${state.settings.privacy.activityLogs ? 'checked' : ''}>
                            <span class="slider"></span>
                        </div>
                    </label>
                    <div class="form-group">
                        <label>Data Retention</label>
                        <div class="select-wrapper">
                            <select id="dataRetention" class="form-control">
                                <option value="30days" ${state.settings.privacy.dataRetention === '30days' ? 'selected' : ''}>30 Days</option>
                                <option value="6months" ${state.settings.privacy.dataRetention === '6months' ? 'selected' : ''}>6 Months</option>
                                <option value="1year" ${state.settings.privacy.dataRetention === '1year' ? 'selected' : ''}>1 Year</option>
                                <option value="forever" ${state.settings.privacy.dataRetention === 'forever' ? 'selected' : ''}>Keep Forever</option>
                            </select>
                        </div>
                    </div>
                    <label class="toggle-label">
                        <span>Personalized Content</span>
                        <div class="toggle-switch">
                            <input type="checkbox" id="personalizedContent" ${state.settings.privacy.personalizedContent ? 'checked' : ''}>
                            <span class="slider"></span>
                        </div>
                    </label>
                </div>
            </div>
            
            <div class="btn-group">
                <button class="btn" id="save-privacy">Save Privacy Settings</button>
                <button class="btn btn-danger" id="download-data">Download My Data</button>
            </div>
        </div>
    `;
}

// Render Integration Settings
function renderIntegrationSettings() {
    const connectedIntegrations = state.availableIntegrations.filter(i => i.connected);
    const availableIntegrations = state.availableIntegrations.filter(i => !i.connected);

    settingsContent.innerHTML = `
        <div class="settings-card active" id="integrations">
            <h2>Connected Apps</h2>
            <div class="settings-section">
                <h3>Your Integrations</h3>
                <div class="integration-cards">
                    ${connectedIntegrations.map(integration => `
                        <div class="integration-card">
                            <div class="integration-icon">
                                <i class="${integration.icon}"></i>
                            </div>
                            <div class="integration-info">
                                <h4>${integration.name}</h4>
                                <p>${integration.description}</p>
                            </div>
                            <div class="toggle-switch">
                                <input type="checkbox" id="${integration.name.toLowerCase().replace(' ', '-')}" ${integration.connected ? 'checked' : ''}>
                                <span class="slider"></span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="settings-section">
                <h3>Available Integrations</h3>
                <div class="integration-cards">
                    ${availableIntegrations.map(integration => `
                        <div class="integration-card">
                            <div class="integration-icon">
                                <i class="${integration.icon}"></i>
                            </div>
                            <div class="integration-info">
                                <h4>${integration.name}</h4>
                                <p>${integration.description}</p>
                            </div>
                            <button class="btn" data-integration="${integration.name.toLowerCase().replace(' ', '-')}">Connect</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

// Render Help Settings
function renderHelpSettings() {
    settingsContent.innerHTML = `
        <div class="settings-card active" id="help">
            <h2>Help & Support</h2>
            <div class="settings-section">
                <h3>Frequently Asked Questions</h3>
                <div class="faq-list">
                    ${state.faqs.map((faq, index) => `
                        <div class="faq-item">
                            <div class="faq-question">
                                <span>${faq.question}</span>
                                <i class="fas fa-chevron-down"></i>
                            </div>
                            <div class="faq-answer">
                                <p>${faq.answer}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="settings-section">
                <h3>Contact Support</h3>
                <div class="contact-form">
                    <div class="form-group">
                        <label for="supportSubject">Subject</label>
                        <input type="text" id="supportSubject" class="form-control" placeholder="What do you need help with?">
                    </div>
                    <div class="form-group">
                        <label for="supportMessage">Message</label>
                        <textarea id="supportMessage" class="form-control" rows="5" placeholder="Describe your issue in detail..."></textarea>
                    </div>
                    <div class="form-group">
                        <label for="supportAttachments">Attachments (optional)</label>
                        <input type="file" id="supportAttachments" class="form-control">
                    </div>
                    <button class="btn" id="send-support">Send Message</button>
                </div>
            </div>
            <div class="settings-section">
                <h3>Community Resources</h3>
                <div class="btn-group">
                    <button class="btn"><i class="fas fa-book"></i> Documentation</button>
                    <button class="btn"><i class="fas fa-video"></i> Tutorial Videos</button>
                    <button class="btn"><i class="fas fa-users"></i> Community Forum</button>
                </div>
            </div>
        </div>
    `;
}

// Render About Settings
function renderAboutSettings() {
    settingsContent.innerHTML = `
        <div class="settings-card active" id="about">
            <h2>About Interactive Journal & Productivity Hub</h2>
            <div class="about-content">
                <p>Welcome to your all-in-one journaling and productivity platform. Our mission is to help you organize your thoughts, boost your productivity, and achieve your personal and professional goals.</p>
                
                <h3>Version Information</h3>
                <p><strong>Current Version:</strong> 2.4.1</p>
                <p><strong>Last Updated:</strong> June 15, 2023</p>
                <p><strong>What's New:</strong> Dark mode, improved task management, and faster syncing across devices.</p>
                
                <h3>Our Team</h3>
                <div class="team-members">
                    ${state.team.map(member => `
                        <div class="team-member">
                            <img src="${member.avatar}" alt="${member.name}">
                            <h4>${member.name}</h4>
                            <p>${member.role}</p>
                        </div>
                    `).join('')}
                </div>
                
                <h3>Legal Information</h3>
                <p><a href="https://www.termsfeed.com/live/2c365e41-bc2d-4b6f-8fbe-01d7e448e265">Terms of Service</a> | <a href="https://www.termsfeed.com/live/d2e4c907-a903-42ce-942d-77e3d6bbc5ee">Privacy Policy</a> | <a href="https://www.termsfeed.com/live/9342b0c9-e0d6-44b1-94b6-cb4ff729d848">Cookie Policy</a></p>
                
                <div class="btn-group">
                    <button class="btn"><i class="fas fa-heart"></i> Rate Us</button>
                    <button class="btn"><i class="fas fa-share-alt"></i> Share With Friends</button>
                </div>
            </div>
        </div>
    `;
}

// Set up event listeners
function setupEventListeners() {
    // Menu navigation
    settingsMenu.addEventListener('click', (e) => {
        if (e.target.tagName === 'A' || e.target.parentElement.tagName === 'A') {
            e.preventDefault();
            const link = e.target.tagName === 'A' ? e.target : e.target.parentElement;
            const sectionId = link.getAttribute('data-section') || link.getAttribute('href').substring(1);
            
            // Update active menu item
            document.querySelectorAll('.sidebar-menu a').forEach(a => a.classList.remove('active'));
            link.classList.add('active');
            
            // Render the content
            renderContent(sectionId);
        }
    });

    // Profile picture upload
    profileUpload.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (!file.type.match('image.*')) {
            showToast('Please select an image file');
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            showToast('Image size should be less than 5MB');
            return;
        }
        
        try {
            // Show loading state
            userAvatar.style.opacity = '0.5';
            
            // In a real app, you would upload to your server or a service like imgBB
            // For demo purposes, we'll just use a local URL
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageUrl = e.target.result;
                userAvatar.src = imageUrl;
                state.user.avatar = imageUrl;
                userAvatar.style.opacity = '1';
                showToast('Profile picture updated!');
                
                // In a real app, you would save this to your backend
                console.log('Profile picture updated locally');
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            showToast('Failed to update profile picture');
            userAvatar.style.opacity = '1';
        }
    });

    // Delegate events for dynamic content
    settingsContent.addEventListener('click', (e) => {
        // FAQ accordion
        if (e.target.classList.contains('faq-question') || e.target.parentElement.classList.contains('faq-question')) {
            const faqItem = e.target.classList.contains('faq-question') ? 
                e.target.parentElement : 
                e.target.parentElement.parentElement;
            
            // Toggle this item
            faqItem.classList.toggle('active');
            
            // Close other open FAQs
            document.querySelectorAll('.faq-item').forEach(item => {
                if (item !== faqItem && item.classList.contains('active')) {
                    item.classList.remove('active');
                }
            });
        }

        // Save profile button
        if (e.target.id === 'save-profile') {
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const bio = document.getElementById('bio').value;
            
            state.user.name = `${firstName} ${lastName}`.trim();
            state.user.username = username;
            state.user.email = email;
            state.user.bio = bio;
            
            // Update the user profile in the API
            updateUserProfile(state.user)
                .then(() => {
                    showToast('Profile updated successfully!');
                })
                .catch(error => {
                    console.error('Error updating profile:', error);
                    showToast('Error updating profile');
                });
        }

        // Update password button
        if (e.target.id === 'update-password') {
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (newPassword !== confirmPassword) {
                showToast('New passwords do not match!');
                return;
            }
            
            // In a real app, you would validate current password and update it
            showToast('Password updated successfully!');
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
        }

        // Save notification preferences
        if (e.target.id === 'save-notifications') {
            state.settings.notifications.enabled = document.getElementById('enableNotifications').checked;
            state.settings.notifications.journalReminders = document.getElementById('journalReminders').checked;
            state.settings.notifications.taskReminders = document.getElementById('taskReminders').checked;
            state.settings.notifications.blogComments = document.getElementById('blogComments').checked;
            state.settings.notifications.productivityReports = document.getElementById('productivityReports').checked;
            state.settings.notifications.communityUpdates = document.getElementById('communityUpdates').checked;
            state.settings.notifications.method = document.getElementById('notificationMethod').value;
            state.settings.notifications.dailyTime = document.getElementById('notificationTime').value;
            
            saveSettings();
            showToast('Notification preferences saved!');
        }

        // Save privacy settings
        if (e.target.id === 'save-privacy') {
            state.settings.privacy.publicProfile = document.getElementById('publicProfile').checked;
            state.settings.privacy.defaultJournalPrivacy = document.getElementById('defaultJournalPrivacy').value;
            state.settings.privacy.journalDiscovery = document.getElementById('journalDiscovery').checked;
            state.settings.privacy.twoFactorAuth = document.getElementById('twoFactorAuth').checked;
            state.settings.privacy.loginNotifications = document.getElementById('loginNotifications').checked;
            state.settings.privacy.encryption = document.getElementById('encryption').checked;
            state.settings.privacy.activityLogs = document.getElementById('activityLogs').checked;
            state.settings.privacy.dataRetention = document.getElementById('dataRetention').value;
            state.settings.privacy.personalizedContent = document.getElementById('personalizedContent').checked;
            
            saveSettings();
            showToast('Privacy settings saved!');
            
            // Re-render privacy settings to update the security badge
            renderPrivacySettings();
        }

        // Download data button
        if (e.target.id === 'download-data') {
            showToast('Preparing your data for download...');
            // In a real app, this would generate and download a file
        }

        // Connect integration button
        if (e.target.classList.contains('btn') && e.target.hasAttribute('data-integration')) {
            const integrationName = e.target.getAttribute('data-integration');
            showToast(`Connecting to ${integrationName.replace('-', ' ')}...`);
            // In a real app, this would initiate OAuth flow
        }

        // Toggle integration
        if (e.target.type === 'checkbox' && e.target.closest('.integration-card')) {
            const integrationCard = e.target.closest('.integration-card');
            const integrationName = integrationCard.querySelector('h4').textContent;
            const integrationId = integrationName.toLowerCase().replace(' ', '-');
            
            // Update state
            const integration = state.availableIntegrations.find(i => 
                i.name.toLowerCase().replace(' ', '-') === integrationId
            );
            
            if (integration) {
                integration.connected = e.target.checked;
                saveSettings();
                console.log(`${integrationName} integration is now ${e.target.checked ? 'enabled' : 'disabled'}`);
                showToast(`${integrationName} integration ${e.target.checked ? 'enabled' : 'disabled'}`);
            }
        }

        // Send support message
        if (e.target.id === 'send-support') {
            const subject = document.getElementById('supportSubject').value;
            const message = document.getElementById('supportMessage').value;
            
            if (!subject || !message) {
                showToast('Please fill in both subject and message fields');
                return;
            }
            
            showToast('Support request submitted. We\'ll get back to you soon!');
            document.getElementById('supportSubject').value = '';
            document.getElementById('supportMessage').value = '';
        }
    });

    // Input events for dynamic content
    settingsContent.addEventListener('input', (e) => {
        // Handle all toggle switches
        if (e.target.type === 'checkbox' && e.target.classList.contains('toggle-switch')) {
            const settingPath = e.target.id;
            updateToggleState(settingPath, e.target.checked);
        }
    });

    // Change events for dynamic content
    settingsContent.addEventListener('change', (e) => {
        // Handle all select dropdowns
        if (e.target.tagName === 'SELECT') {
            const settingPath = e.target.id;
            updateSelectState(settingPath, e.target.value);
        }
    });
}

// Update toggle switch state in the settings object
function updateToggleState(path, value) {
    const pathParts = path.split('.');
    let current = state.settings;
    
    for (let i = 0; i < pathParts.length - 1; i++) {
        if (!current[pathParts[i]]) {
            current[pathParts[i]] = {};
        }
        current = current[pathParts[i]];
    }
    
    current[pathParts[pathParts.length - 1]] = value;
    saveSettings();
}

// Update select dropdown state in the settings object
function updateSelectState(path, value) {
    const pathParts = path.split('.');
    let current = state.settings;
    
    for (let i = 0; i < pathParts.length - 1; i++) {
        if (!current[pathParts[i]]) {
            current[pathParts[i]] = {};
        }
        current = current[pathParts[i]];
    }
    
    current[pathParts[pathParts.length - 1]] = value;
    saveSettings();
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Initialize the app
init();