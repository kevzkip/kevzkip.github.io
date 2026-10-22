// --- THEME TOGGLE LOGIC ---
const themeToggleBtn = document.getElementById('theme-toggle');
const mobileThemeToggleBtn = document.getElementById('mobile-theme-toggle');
const themeIcon = themeToggleBtn.querySelector('i');
const mobileThemeIcon = mobileThemeToggleBtn.querySelector('i');
const htmlElement = document.documentElement;

function updateThemeIcons(theme) {
    if (theme === 'light') {
        themeIcon.classList.replace('fa-moon', 'fa-sun');
        mobileThemeIcon.classList.replace('fa-moon', 'fa-sun');
    } else {
        themeIcon.classList.replace('fa-sun', 'fa-moon');
        mobileThemeIcon.classList.replace('fa-sun', 'fa-moon');
    }
}

if (htmlElement.getAttribute('data-theme') === 'light') {
    updateThemeIcons('light');
}

function toggleTheme() {
    const currentTheme = htmlElement.getAttribute('data-theme');
    if (currentTheme === 'light') {
        htmlElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'dark');
        updateThemeIcons('dark');
    } else {
        htmlElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        updateThemeIcons('light');
    }
}

themeToggleBtn.addEventListener('click', toggleTheme);
mobileThemeToggleBtn.addEventListener('click', toggleTheme);

// --- MOBILE MENU LOGIC ---
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileNav = document.getElementById('mobile-nav');
const mobileIcon = mobileMenuBtn.querySelector('i');

mobileMenuBtn.addEventListener('click', () => {
    if (mobileNav.style.display === 'flex') {
        mobileNav.style.display = 'none';
        mobileIcon.classList.replace('fa-xmark', 'fa-bars');
    } else {
        mobileNav.style.display = 'flex';
        mobileIcon.classList.replace('fa-bars', 'fa-xmark');
    }
});

// Close mobile menu when a link is clicked
mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        mobileNav.style.display = 'none';
        mobileIcon.classList.replace('fa-xmark', 'fa-bars');
    });
});

// --- NAVIGATION & SCROLL LOGIC ---
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-links a');
const backToTopBtn = document.getElementById('back-to-top');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= (sectionTop - sectionHeight / 3)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });

    if (window.scrollY > 500) {
        backToTopBtn.classList.add('show');
    } else {
        backToTopBtn.classList.remove('show');
    }
});

// --- FORMSPREE AJAX HANDLING ---
const form = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = new FormData(form);
        formStatus.textContent = "Sending...";
        
        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: data,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                formStatus.textContent = "Message sent successfully!";
                form.reset();
            } else {
                formStatus.textContent = "Oops! There was a problem submitting your form.";
            }
        } catch (error) {
            formStatus.textContent = "Network error. Please try again later.";
        }
    });
}