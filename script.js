// --- THEME ---
const htmlElement = document.documentElement;

function updateThemeIcons(theme) {
  document.querySelectorAll('#theme-toggle i, #mobile-theme-toggle i').forEach((icon) => {
    if (theme === 'light') { icon.classList.remove('fa-moon'); icon.classList.add('fa-sun'); }
    else { icon.classList.remove('fa-sun'); icon.classList.add('fa-moon'); }
  });
}

if (htmlElement.getAttribute('data-theme') === 'light') updateThemeIcons('light');

function toggleTheme() {
  const isLight = htmlElement.getAttribute('data-theme') === 'light';
  if (isLight) {
    htmlElement.removeAttribute('data-theme');
    localStorage.setItem('theme', 'dark');
    updateThemeIcons('dark');
  } else {
    htmlElement.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
    updateThemeIcons('light');
  }
}

document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
document.getElementById('mobile-theme-toggle')?.addEventListener('click', toggleTheme);

// --- MOBILE MENU ---
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileNav = document.getElementById('mobile-nav');

if (mobileMenuBtn && mobileNav) {
  const mobileIcon = mobileMenuBtn.querySelector('i');
  mobileMenuBtn.addEventListener('click', () => {
    const open = mobileNav.style.display === 'flex';
    mobileNav.style.display = open ? 'none' : 'flex';
    mobileIcon.classList.replace(open ? 'fa-xmark' : 'fa-bars', open ? 'fa-bars' : 'fa-xmark');
  });
  mobileNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mobileNav.style.display = 'none';
      mobileIcon.classList.replace('fa-xmark', 'fa-bars');
    });
  });
}

// --- NAV ACTIVE STATE ---
const currentPath = window.location.pathname;
document.querySelectorAll('.nav-links a, .mobile-nav a').forEach((link) => {
  const href = link.getAttribute('href');
  if (!href || !href.startsWith('/') || href.includes('#')) return;
  if (href === currentPath || (href !== '/' && currentPath.startsWith(href))) {
    link.classList.add('active');
  }
});

// --- BACK TO TOP ---
const backToTopBtn = document.getElementById('back-to-top');
if (backToTopBtn) {
  window.addEventListener('scroll', () => {
    backToTopBtn.classList.toggle('show', window.scrollY > 500);
  });
}

// --- FORMSPREE ---
const form = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');

if (form && formStatus) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    formStatus.textContent = 'Sending...';
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });
      if (response.ok) {
        formStatus.textContent = 'Message sent successfully!';
        form.reset();
      } else {
        formStatus.textContent = 'Oops! There was a problem submitting your form.';
      }
    } catch {
      formStatus.textContent = 'Network error. Please try again later.';
    }
  });
}

// --- BLOG FILTER ---
const filterBar = document.getElementById('filter-bar');
const postList = document.getElementById('post-list');

if (filterBar && postList) {
  const applyFilter = () => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type');
    const project = params.get('project');

    filterBar.querySelectorAll('.filter-btn').forEach((btn) => {
      btn.classList.remove('active');
      const f = btn.dataset.filter;
      if (!type && !project && f === 'all') btn.classList.add('active');
      else if (type === f) btn.classList.add('active');
      else if (project && f === 'project') btn.classList.add('active');
    });

    postList.querySelectorAll('.blog-item[data-type]').forEach((item) => {
      let show = true;
      if (type && item.dataset.type !== type) show = false;
      if (project && item.dataset.project !== project) show = false;
      item.style.display = show ? '' : 'none';
    });
  };

  filterBar.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const url = new URL(window.location);
      const f = btn.dataset.filter;
      url.searchParams.delete('project');
      if (f === 'all') url.searchParams.delete('type');
      else url.searchParams.set('type', f);
      window.history.pushState({}, '', url);
      applyFilter();
    });
  });

  applyFilter();
}
// --- BLOG POST: PROGRESS BAR & TOC ---
const progressBar = document.getElementById('reading-progress');
const postBody = document.querySelector('.post-body');
const tocList = document.getElementById('toc-list');

if (postBody && progressBar) {
    
    // 1. Progress Bar Logic
    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + "%";
    });

    // 2. Build TOC Logic (Only runs if the sidebar exists on the page)
    if (tocList) {
        const headings = postBody.querySelectorAll('h2, h3');
        
        headings.forEach((heading, index) => {
            // Give each heading an ID if it doesn't have one
            if (!heading.id) {
                heading.id = `section-${index}`;
            }

            // Create the list item
            const li = document.createElement('li');
            const a = document.createElement('a');
            
            a.href = `#${heading.id}`;
            a.textContent = heading.textContent;
            
            // Add class for h3s to handle indentation via CSS
            if (heading.tagName.toLowerCase() === 'h3') {
                li.classList.add('toc-h3');
            }

            li.appendChild(a);
            tocList.appendChild(li);
        });

        // 3. Highlight Active TOC Item on Scroll
        const tocLinks = tocList.querySelectorAll('li');
        
        window.addEventListener('scroll', () => {
            let current = '';
            
            headings.forEach(heading => {
                const headingTop = heading.offsetTop;
                // If we've scrolled past the heading (minus 120px for the fixed nav)
                if (window.scrollY >= headingTop - 120) {
                    current = heading.id;
                }
            });

            tocLinks.forEach(li => {
                li.classList.remove('active');
                const link = li.querySelector('a');
                if (link && link.getAttribute('href') === `#${current}`) {
                    li.classList.add('active');
                }
            });
        });
    }
}

// --- BLOG POST: COPY CODE BUTTON ---
const postContent = document.querySelector('.post-body');

if (postContent) {
    // Find all pre blocks (code blocks) inside the post
    const codeBlocks = postContent.querySelectorAll('pre');
    
    codeBlocks.forEach((pre) => {
        // Create the button
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-code-btn';
        copyBtn.innerText = 'Copy';
        
        // Add click event to copy text
        copyBtn.addEventListener('click', async () => {
            // Get the actual code text
            const code = pre.querySelector('code').innerText;
            
            try {
                await navigator.clipboard.writeText(code);
                
                // Visual feedback
                copyBtn.innerText = 'Copied!';
                copyBtn.classList.add('copied');
                
                // Reset after 2 seconds
                setTimeout(() => {
                    copyBtn.innerText = 'Copy';
                    copyBtn.classList.remove('copied');
                }, 2000);
            } catch (err) {
                console.error('Failed to copy text: ', err);
                copyBtn.innerText = 'Failed';
            }
        });
        
        // Inject the button into the pre block
        pre.appendChild(copyBtn);
    });
}