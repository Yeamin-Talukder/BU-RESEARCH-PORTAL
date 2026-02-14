document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('abstract-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const viewAbstractBtns = document.querySelectorAll('.view-abstract-btn');
    const modalTitle = document.getElementById('modal-title');
    const modalText = document.getElementById('modal-text');

    // Abstract content map (simulating dynamic data)
    const abstracts = {
        '1': "This study explores the mapping of cocoa land suitability in East Kalimantan using Geographic Information Systems (GIS). By leveraging Leaflet JS for interactive web mapping and GeoJSON for efficient data handling, we visualize spatial data effectively. The results indicate significant potential for cocoa expansion in specific regencies...",
        '2': "This paper investigates the application of various machine learning algorithms, including Random Forest and Support Vector Machines, to predict student academic performance. The study uses a dataset from the University of Barishal and identifies key factors contributing to student success and failure.",
        '3': "Access to reliable energy is a challenge in rural Bangladesh. This case study focuses on the implementation of solar and wind hybrid systems in off-grid villages of the Barishal district. We analyze the economic viability and social impact of these renewable energy solutions.",
        '4': "River erosion is a major natural disaster in Bangladesh, exacerbated by climate change. This research analyzes satellite imagery over the last two decades to track morphological changes in the southern delta rivers. We propose a new model for predicting erosion-prone areas to aid in disaster management.",
        '9': "This study evaluates the performance of Convolutional Neural Networks (CNNs) in detecting early-stage diabetic retinopathy from retinal fundus images. We achieved 98% accuracy using a modified ResNet architecture, outperforming traditional diagnostic methods.",
        '10': "With the launch of the MRT Line-6, Dhaka's traffic patterns are shifting. This paper analyzes pre- and post-launch traffic data to quantify the impact on congestion reduction and commuter travel time savings in the Mirpur-Motijheel corridor.",
        '11': "The Sundarbans mangrove forest faces threats from salinity intrusion and climate change. We conducted a genetic analysis of *Heritiera fomes* (Sundri) populations to identify resilient genotypes. Our findings provide a roadmap for genetic conservation and restoration efforts.",
        '12': "Micro-credit has long been heralded as a tool for poverty alleviation. This longitudinal study tracks 500 households in Rangpur district over 5 years. We find significant positive correlations between micro-credit access and women's decision-making power within the household."
    };

    // Open Modal
    if (viewAbstractBtns) {
        viewAbstractBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const paperId = btn.getAttribute('data-id');
                // Populate modal (optional: get title from card)
                const card = btn.closest('.paper-card');
                const title = card.querySelector('.paper-title').textContent;
                
                modalTitle.textContent = "Abstract: " + (title.length > 50 ? title.substring(0, 50) + "..." : title);
                modalText.textContent = abstracts[paperId] || "Abstract content not available for this item.";
                
                modal.classList.remove('hidden'); // Ensure display block if using that
                // Add a small delay for transition if needed, or just class toggle
                requestAnimationFrame(() => {
                    modal.classList.add('active');
                });
            });
        });
    }

    // Close Modal Function
    const closeModal = () => {
        if (!modal) return;
        modal.classList.remove('active');
        setTimeout(() => {
             // specific logic if using display:none/flex toggles
             // modal.classList.add('hidden'); 
        }, 300); // match css transition
    };

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }

    // Profile Dropdown Toggle
    const profileBtn = document.getElementById('profile-btn');
    const profileDropdown = document.getElementById('profile-dropdown');

    // Listeners are defined below


    // Close Modal and Dropdowns on click outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
        
        // Close profile dropdown if clicking outside
        if (profileDropdown && profileDropdown.classList.contains('active')) {
            if (!profileDropdown.contains(e.target) && !profileBtn.contains(e.target)) {
                profileDropdown.classList.remove('active');
                if (profileBtn) profileBtn.classList.remove('active');
            }
        }

        // Close notification panel if clicking outside
        if (notificationPanel && notificationPanel.classList.contains('active')) {
            if (!notificationPanel.contains(e.target) && !notificationBtn.contains(e.target)) {
                notificationPanel.classList.remove('active');
            }
        }
    });

    // Notification Panel Toggle
    const notificationBtn = document.getElementById('notification-btn');
    const notificationPanel = document.getElementById('notification-panel');

    if (notificationBtn && notificationPanel) {
        notificationBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            notificationPanel.classList.toggle('active');
            
            // Close profile dropdown if open
            if (profileDropdown && profileDropdown.classList.contains('active')) {
                profileDropdown.classList.remove('active');
                if (profileBtn) profileBtn.classList.remove('active');
            }
        });
    }

    // Update profile listener to close notifications
    if (profileBtn && profileDropdown) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation(); 
            profileDropdown.classList.toggle('active');
            profileBtn.classList.toggle('active');

            // Close notification panel if open
            if (notificationPanel && notificationPanel.classList.contains('active')) {
                notificationPanel.classList.remove('active');
            }
        });
    }

    // Scroll Animation Observer
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1 // Trigger when 10% visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    // Observe all paper cards
    const cards = document.querySelectorAll('.paper-card');
    cards.forEach((card, index) => {
        // Optional: Stagger initial load
        // if (index < 4) card.style.animationDelay = `${index * 0.1}s`; 
        observer.observe(card);
        observer.observe(card);
    });

    // View All Notifications Logic
    const viewAllNotifBtn = document.querySelector('.notification-footer a');
    const notifModal = document.getElementById('notification-modal');
    const closeNotifModalBtn = document.querySelector('.close-notif-modal');
    const closeNotifBtnMain = document.querySelector('.close-notif-btn');
    const fullNotifList = document.getElementById('full-notification-list');

    // Demo Extended Notifications
    const allNotifications = [
        { icon: 'ph-file-text', type: '', text: 'New paper published in <strong>Journal of Sciences</strong>', time: '2 mins ago' },
        { icon: 'ph-info', type: 'info', text: 'System maintenance scheduled for tonight.', time: '1 hour ago' },
        { icon: 'ph-check-circle', type: 'success', text: 'Your abstract submission was approved.', time: '5 hours ago' },
        { icon: 'ph-users', type: '', text: 'Prof. Rahman commented on your paper.', time: '1 day ago' },
        { icon: 'ph-star', type: 'info', text: '<strong>Research Week</strong> starts next Monday.', time: '2 days ago' },
        { icon: 'ph-quote', type: '', text: 'Your paper was cited by <em>A. Karim</em>.', time: '3 days ago' },
        { icon: 'ph-warning-circle', type: 'info', text: 'Please update your profile information.', time: '4 days ago' },
        { icon: 'ph-file-pdf', type: '', text: 'New issue of <strong>IEEE Transactions</strong> available.', time: '5 days ago' },
        { icon: 'ph-user-plus', type: 'success', text: 'You have a new follower: <strong>Dr. S. Huda</strong>.', time: '1 week ago' },
        { icon: 'ph-bell', type: '', text: 'Reminder: Submit your progress report.', time: '1 week ago' },
        { icon: 'ph-calendar', type: '', text: 'Meeting with supervisor scheduled for tomorrow.', time: '1 week ago' },
        { icon: 'ph-medal', type: 'success', text: '<strong>Award</strong>: Best Paper Nomination.', time: '2 weeks ago' },
        { icon: 'ph-chat-circle-dots', type: '', text: 'New discussion in "AI Ethics" group.', time: '2 weeks ago' },
        { icon: 'ph-upload-simple', type: '', text: 'Dataset upload completed successfully.', time: '3 weeks ago' },
        { icon: 'ph-envelope', type: '', text: 'Invitation to review a manuscript.', time: '3 weeks ago' },
        { icon: 'ph-gear', type: 'info', text: 'Account security update required.', time: '1 month ago' },
        { icon: 'ph-book', type: '', text: 'New book added to library: "Deep Learning".', time: '1 month ago' }
    ];

    // Duplicate data to ensure scrolling
    const extendedNotifications = [...allNotifications, ...allNotifications, ...allNotifications, ...allNotifications];

    if (viewAllNotifBtn && notifModal) {
        viewAllNotifBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Close the dropdown panel
            if (notificationPanel) notificationPanel.classList.remove('active');

            // Populate Modal
            fullNotifList.innerHTML = extendedNotifications.map(n => `
                <li class="notification-item ${n.type ? '' : 'unread'}">
                    <div class="notif-icon ${n.type}"><i class="ph ${n.icon}"></i></div>
                    <div class="notif-content">
                        <p class="notif-text">${n.text}</p>
                        <span class="notif-time">${n.time}</span>
                    </div>
                </li>
            `).join('');

            // Open Modal
            notifModal.classList.remove('hidden');
            document.body.classList.add('no-scroll');
            requestAnimationFrame(() => notifModal.classList.add('active'));
        });
    }

    // Live Journal Search
    const journalSearchInput = document.querySelector('.search-box input');
    const journalCards = document.querySelectorAll('.journal-list .journal-card');

    if (journalSearchInput) {
        journalSearchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();

            journalCards.forEach(card => {
                const title = card.querySelector('h4').textContent.toLowerCase();
                // Optional: also search description
                const desc = card.querySelector('p')?.textContent.toLowerCase() || '';
                
                if (title.includes(searchTerm) || desc.includes(searchTerm)) {
                    card.classList.remove('filtered-out');
                } else {
                    card.classList.add('filtered-out');
                }
            });
        });
    }

    // Modal Mark Read Logic
    const markReadModalBtn = document.querySelector('.mark-read-modal');
    if (markReadModalBtn) {
        markReadModalBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const unreadItems = fullNotifList.querySelectorAll('.notification-item.unread');
            unreadItems.forEach(item => {
                item.classList.remove('unread');
                item.style.backgroundColor = 'transparent'; // Visual confirm
            });
            // Update the badge too
            const badge = document.querySelector('.notification-badge');
            if (badge) badge.style.display = 'none';
        });
    }

    // --- Right Sidebar Filter & Sort Logic ---
    const mainFeed = document.querySelector('.main-feed'); // Ensure this is selected
    const filterPaperInput = document.getElementById('filter-paper-name');
    const filterAuthorInput = document.getElementById('filter-author-name');
    const filterJournalSelect = document.getElementById('filter-journal-name');
    const applyFilterBtn = document.getElementById('btn-apply-filter');
    
    const sortMinViewBtn = document.getElementById('sort-min-view');
    const sortMaxViewBtn = document.getElementById('sort-max-view');
    const sortMinDownloadBtn = document.getElementById('sort-min-download');
    const sortMaxDownloadBtn = document.getElementById('sort-max-download');
    
    // Group buttons for independent visual toggling if that's what user implies, 
    // but functionally we can only sort by one thing. 
    // However, to "treat them separately" might mean we don't clear the "other" group's active state? 
    // That would be misleading. Let's stick to single active sort but ensure logic is solid.
    // User request "view and downlode min,max treat them separetly" might simply mean they want them to work!
    const sortButtons = document.querySelectorAll('.view-btn');

    // Filtering Logic
    const filterPapers = () => {
        const paperQuery = filterPaperInput ? filterPaperInput.value.toLowerCase().trim() : '';
        const authorQuery = filterAuthorInput ? filterAuthorInput.value.toLowerCase().trim() : '';
        const journalQuery = filterJournalSelect ? filterJournalSelect.value.toLowerCase().trim() : '';

        const paperCards = document.querySelectorAll('.main-feed .paper-card');

        paperCards.forEach(card => {
            const title = card.querySelector('.paper-title').textContent.toLowerCase();
            const authors = card.querySelector('.paper-authors').textContent.toLowerCase();
            const journal = card.getAttribute('data-journal')?.toLowerCase() || "";

            const matchesPaper = !paperQuery || title.includes(paperQuery);
            const matchesAuthor = !authorQuery || authors.includes(authorQuery);
            // Handle empty value for 'All Journals'
            const matchesJournal = !journalQuery || journal === journalQuery; 

            if (matchesPaper && matchesAuthor && matchesJournal) {
                // Show item
                card.classList.remove('filtered-hidden');
                // Ensure generic animation triggers if it was previously hidden? 
                // Or just let it expand naturally.
            } else {
                // Hide item with animation
                card.classList.add('filtered-hidden');
            }
        });
    };

    if (applyFilterBtn) {
        applyFilterBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent form submission behavior if any
            filterPapers();
        });
    }

    // Sorting Logic
    const sortPapers = (type, order, activeBtnId) => {
        // type: 'views' or 'downloads'
        // order: 'asc' or 'desc'
        
        // Select direct children cards to avoid nested issues if any
        const paperCards = Array.from(document.querySelectorAll('.main-feed .paper-card'));
        
        paperCards.sort((a, b) => {
            // Find correct stat element based on icon class
            // Views: .ph-eye, Downloads: .ph-download-simple
            // Note: Since we have multiple icons, we need to be specific.
            // valid structure: .meta-stat > i.ph-eye + text
            
            const getCount = (card, iconClass) => {
                // We specifically look inside .meta-stat to avoid buttons
                const stats = card.querySelectorAll('.meta-stat');
                for (let stat of stats) {
                    if (stat.querySelector(iconClass)) {
                        return parseInt(stat.textContent.replace(/\D/g, '')) || 0;
                    }
                }
                return 0;
            };

            const iconSelector = type === 'views' ? '.ph-eye' : '.ph-download-simple';
            
            const countA = getCount(a, iconSelector);
            const countB = getCount(b, iconSelector);
            
            return order === 'asc' ? countA - countB : countB - countA;
        });

        // Toggle Active State - Treating groups separately? 
        // If we want to allow user to see "Min View" active AND "Max Download" active 
        // it implies multi-sort which is hard. 
        // I will assume "treat them separately" means *implement them* properly.
        // But I will clear ONLY buttons of the same type? No, that's confusing.
        // I'll stick to clearing all for clear single-sort feedback.
        sortButtons.forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.getElementById(activeBtnId);
        if (activeBtn) activeBtn.classList.add('active');

        // Re-append in new order
        paperCards.forEach(card => mainFeed.appendChild(card));
        
        // Re-trigger animation
        paperCards.forEach(card => {
            card.classList.remove('animate-in');
            void card.offsetWidth; 
            // Only animate if NOT hidden
            if (!card.classList.contains('filtered-hidden')) {
                card.classList.add('animate-in');
            }
        });
    };

    if (sortMinViewBtn) sortMinViewBtn.addEventListener('click', () => sortPapers('views', 'asc', 'sort-min-view'));
    if (sortMaxViewBtn) sortMaxViewBtn.addEventListener('click', () => sortPapers('views', 'desc', 'sort-max-view'));
    if (sortMinDownloadBtn) sortMinDownloadBtn.addEventListener('click', () => sortPapers('downloads', 'asc', 'sort-min-download'));
    if (sortMaxDownloadBtn) sortMaxDownloadBtn.addEventListener('click', () => sortPapers('downloads', 'desc', 'sort-max-download'));

    const closeNotifModal = () => {
        if (!notifModal) return;
        notifModal.classList.remove('active');
        document.body.classList.remove('no-scroll');
        // setTimeout(() => notifModal.classList.add('hidden'), 300); // Optional
    };

    if (closeNotifModalBtn) closeNotifModalBtn.addEventListener('click', closeNotifModal);
    if (closeNotifBtnMain) closeNotifBtnMain.addEventListener('click', closeNotifModal);
    
    // Theme Toggle Logic
    const themeToggleBtn = document.getElementById('theme-toggle');
    const body = document.body;
    
    // Check local storage for preference
    if (localStorage.getItem('theme') === 'dark') {
        body.setAttribute('data-theme', 'dark');
        if (themeToggleBtn) {
            themeToggleBtn.querySelector('i').classList.replace('ph-moon', 'ph-sun');
            themeToggleBtn.querySelector('span').textContent = 'Light Mode';
        }
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent closing dropdown immediately if desired, or let it stick open? 
            // Better to let it stay open or close? Standard is nice click feeling.
            // But let's just toggle.
            
            const isDark = body.getAttribute('data-theme') === 'dark';
            
            if (isDark) {
                body.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
                themeToggleBtn.querySelector('i').classList.replace('ph-sun', 'ph-moon');
                themeToggleBtn.querySelector('span').textContent = 'Dark Mode';
            } else {
                body.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                themeToggleBtn.querySelector('i').classList.replace('ph-moon', 'ph-sun');
                themeToggleBtn.querySelector('span').textContent = 'Light Mode';
            }
        });
    }

    // Consolidated Click Listener for "Outside" Caching
    document.addEventListener('click', (e) => {
        // Close Notification Modal
        if (typeof notifModal !== 'undefined' && notifModal.classList.contains('active')) {
             if (e.target === notifModal) closeNotifModal();
        }

        // Close Sidebar
        if (rightSidebar && rightSidebar.classList.contains('active')) {
            if (!rightSidebar.contains(e.target) && !fabFilterBtn.contains(e.target)) {
                rightSidebar.classList.remove('active');
                fabFilterBtn.classList.remove('active');
                 // Reset icon
                const icon = fabFilterBtn.querySelector('i');
                if (icon) icon.classList.replace('ph-x', 'ph-magnifying-glass');
            }
        }
    });

    // FAB Filter Toggle
    const fabFilterBtn = document.getElementById('fab-filter-toggle');
    const rightSidebar = document.querySelector('.sidebar-right');

    if (fabFilterBtn && rightSidebar) {
        fabFilterBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Important!
            rightSidebar.classList.toggle('active');
            fabFilterBtn.classList.toggle('active');
            
            // Toggle icon
            const icon = fabFilterBtn.querySelector('i');
            if (rightSidebar.classList.contains('active')) {
                icon.classList.replace('ph-funnel', 'ph-x');
            } else {
                icon.classList.replace('ph-x', 'ph-funnel');
            }
        });
    }

    // Close sidebar when clicking outside
    document.addEventListener('click', (e) => {
        // Notification Modal Logic
        if (typeof notifModal !== 'undefined' && e.target === notifModal) {
             closeNotifModal();
        }

        // Sidebar Logic
        if (rightSidebar && rightSidebar.classList.contains('active')) {
            if (!rightSidebar.contains(e.target) && !fabFilterBtn.contains(e.target)) {
                rightSidebar.classList.remove('active');
                fabFilterBtn.classList.remove('active');
                // Reset icon
                const icon = fabFilterBtn.querySelector('i');
                if (icon) icon.classList.replace('ph-x', 'ph-funnel');
            }
        }
    });
});
