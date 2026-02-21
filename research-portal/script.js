document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('abstract-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const viewAbstractBtns = document.querySelectorAll('.view-abstract-btn');
    const modalTitle = document.getElementById('modal-title');
    const modalText = document.getElementById('modal-text');

    // Abstract content map (simulating dynamic data)
    const abstracts = {
        '1': "This study explores the mapping of cocoa land suitability...",
        '2': "This paper investigates the application of various machine learning...",
        '3': "Access to reliable energy is a challenge in rural Bangladesh...",
        '4': "River erosion is a major natural disaster in Bangladesh...",
        '9': "This study evaluates the performance of CNNs...",
        '10': "With the launch of the MRT Line-6...",
        '11': "The Sundarbans mangrove forest faces threats...",
        '12': "Micro-credit has long been heralded as a tool..."
    };

    // ✅ Open Modal
    viewAbstractBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const paperId = btn.getAttribute('data-id');
            const card = btn.closest('.paper-card');

            if (!card || !modal) return; // ✅ safety guard

            const title = card.querySelector('.paper-title')?.textContent || "Untitled";

            modalTitle.textContent =
                "Abstract: " +
                (title.length > 50 ? title.substring(0, 50) + "..." : title);

            modalText.textContent =
                abstracts[paperId] || "Abstract content not available.";

            modal.classList.remove('hidden');
            requestAnimationFrame(() => modal.classList.add('active'));
        });
    });

    // ✅ Close Modal
    const closeModal = () => {
        if (!modal) return;
        modal.classList.remove('active');
    };

    closeModalBtn?.addEventListener('click', closeModal);

    // Notification & Profile Elements
    const profileBtn = document.getElementById('profile-btn');
    const profileDropdown = document.getElementById('profile-dropdown');
    const notificationBtn = document.getElementById('notification-btn');
    const notificationPanel = document.getElementById('notification-panel');

    // ✅ Click Outside Logic
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();

        if (profileDropdown?.classList.contains('active')) {
            if (!profileDropdown.contains(e.target) && !profileBtn?.contains(e.target)) {
                profileDropdown.classList.remove('active');
                profileBtn?.classList.remove('active');
            }
        }

        if (notificationPanel?.classList.contains('active')) {
            if (!notificationPanel.contains(e.target) && !notificationBtn?.contains(e.target)) {
                notificationPanel.classList.remove('active');
            }
        }
    });

    // ✅ Notification Toggle
    notificationBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        notificationPanel?.classList.toggle('active');

        profileDropdown?.classList.remove('active');
        profileBtn?.classList.remove('active');
    });

    // ✅ Profile Toggle
    profileBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        profileDropdown?.classList.toggle('active');
        profileBtn.classList.toggle('active');

        notificationPanel?.classList.remove('active');
    });

    // ✅ Scroll Animation Observer
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    const cards = document.querySelectorAll('.paper-card');

    cards.forEach(card => {
        observer.observe(card); // ✅ FIXED duplicate call
    });

});