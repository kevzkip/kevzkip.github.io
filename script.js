document.addEventListener('DOMContentLoaded', () => {
    // Initialize Syntax Highlighting
    if (typeof hljs !== 'undefined') {
        hljs.highlightAll();
    }

    const html = document.documentElement;

    // Theme Toggle
    const themeBtn = document.getElementById('theme-toggle');
    const sunSvg = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
    const moonSvg = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;

    if (themeBtn) {
        if (html.getAttribute('data-theme') === 'light') themeBtn.innerHTML = sunSvg;
        
        themeBtn.addEventListener('click', () => {
            const isLight = html.getAttribute('data-theme') === 'light';
            if (isLight) {
                html.removeAttribute('data-theme');
                localStorage.setItem('theme', 'dark');
                themeBtn.innerHTML = moonSvg;
                startMatrix();
            } else {
                html.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
                themeBtn.innerHTML = sunSvg;
                stopMatrix();
            }
        });
    }

    // Matrix Rain
    const canvas = document.getElementById('matrix-canvas');
    let matrixInterval;
    if (canvas) {
        const ctx = canvas.getContext('2d');
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+'.split('');
        const fontSize = 16;
        const columnSpacing = fontSize * 3;
        let columns, drops;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            columns = canvas.width / columnSpacing;
            drops = [];
            for (let x = 0; x < columns; x++) drops[x] = 1;
        };

        const drawMatrix = () => {
            ctx.fillStyle = 'rgba(9, 9, 11, 0.08)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#46b66f';
            ctx.font = fontSize + 'px monospace';
            
            for (let i = 0; i < drops.length; i++) {
                if (Math.random() > 0.3) {
                    const text = chars[Math.floor(Math.random() * chars.length)];
                    ctx.fillText(text, i * columnSpacing, drops[i] * fontSize);
                }
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
                drops[i]++;
            }
        };

        const startMatrix = () => {
            stopMatrix();
            resizeCanvas();
            matrixInterval = setInterval(drawMatrix, 130);
        };

        const stopMatrix = () => {
            clearInterval(matrixInterval);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        };

        window.addEventListener('resize', () => {
            if (html.getAttribute('data-theme') !== 'light') resizeCanvas();
        });

        if (html.getAttribute('data-theme') !== 'light') startMatrix();
    }

        // Mobile Menu
    const mobileBtn = document.getElementById('mobile-menu-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    if (mobileBtn && mobileNav) {
        // Toggle menu on button click
        mobileBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Stop the click from bubbling to the document
            mobileNav.style.display = mobileNav.style.display === 'flex' ? 'none' : 'flex';
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (mobileNav.style.display === 'flex' && !mobileNav.contains(e.target) && !mobileBtn.contains(e.target)) {
                mobileNav.style.display = 'none';
            }
        });
        
        // Close menu when a link is clicked
        mobileNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileNav.style.display = 'none';
            });
        });
    }

    // Active Nav State
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-menu a, .mobile-nav a').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || (href !== '/' && currentPath.startsWith(href))) {
            link.classList.add('active');
        }
    });

    // Command Palette
    const cmdModal = document.getElementById('cmd-modal');
    const cmdInput = document.getElementById('cmd-input');
    const cmdItems = document.querySelectorAll('.cmd-item');

    const toggleCmd = () => {
        if (!cmdModal) return;
        const isActive = cmdModal.classList.contains('active');
        if (isActive) {
            cmdModal.classList.remove('active');
            cmdInput.value = '';
            cmdItems.forEach(item => item.style.display = 'flex');
        } else {
            cmdModal.classList.add('active');
            setTimeout(() => cmdInput.focus(), 100);
        }
    };
    if (cmdModal) {
        cmdModal.addEventListener('click', (e) => {
            if (e.target === cmdModal) toggleCmd();
        });
    }
    document.getElementById('cmd-trigger')?.addEventListener('click', toggleCmd);
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); toggleCmd(); }
        if (e.key === 'Escape' && cmdModal?.classList.contains('active')) toggleCmd();
    });

    if (cmdInput) {
        cmdInput.addEventListener('input', (e) => {
            const val = e.target.value.toLowerCase();
            cmdItems.forEach(item => {
                item.style.display = item.textContent.toLowerCase().includes(val) ? 'flex' : 'none';
            });
        });
        cmdInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const first = Array.from(cmdItems).find(i => i.style.display !== 'none');
                if (first) first.click();
            }
        });
        cmdItems.forEach(item => item.addEventListener('click', toggleCmd));
    }

    // Terminal
    const termModal = document.getElementById('terminal-modal');
    const termInput = document.getElementById('terminal-input');
    const termOutput = document.getElementById('terminal-output');

    const toggleTerm = () => {
        if (!termModal) return;
        if (termModal.classList.contains('active')) {
            termModal.classList.remove('active');
        } else {
            termModal.classList.add('active');
            setTimeout(() => termInput.focus(), 100);
        }
    };
    if (termModal) {
        termModal.addEventListener('click', (e) => {
            if (e.target === termModal) toggleTerm();
        });
    }

    document.getElementById('terminal-trigger')?.addEventListener('click', toggleTerm);
    document.getElementById('term-close-btn')?.addEventListener('click', toggleTerm);

    if (termInput) {
        termInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = e.target.value.trim().toLowerCase();
                e.target.value = '';
                termOutput.innerHTML += `<div><span class="terminal-prompt">guest@kk:~$</span> ${cmd}</div>`;
                switch (cmd) {
                    case 'help': termOutput.innerHTML += `<div>Commands: help, whoami, neofetch, clear, exit</div>`; break;
                    case 'whoami': termOutput.innerHTML += `<div>Kevin Kipkorir. Network Operations & Cloud Infrastructure.</div>`; break;
                    case 'neofetch': termOutput.innerHTML += `<div style="color:var(--accent)">OS: Arch Linux<br>Shell: zsh<br>Role: NOC / Cloud Engineer<br>Skills: Linux, Docker, AWS, Python</div>`; break;
                    case 'clear': termOutput.innerHTML = ''; break;
                    case 'exit': toggleTerm(); break;
                    default: if (cmd) termOutput.innerHTML += `<div>Command not found: ${cmd}</div>`;
                }
                termOutput.scrollTop = termOutput.scrollHeight;
            }
        });
    }

    // Blog Filter
    const filterBar = document.getElementById('filter-bar');
    const postList = document.getElementById('post-list');
    if (filterBar && postList) {
        const applyFilter = () => {
            const params = new URLSearchParams(window.location.search);
            const type = params.get('type');
            const project = params.get('project');
            const tag = params.get('tag');

            filterBar.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
                const f = btn.dataset.filter;
                if (!type && !project && !tag && f === 'all') btn.classList.add('active');
                else if (type === f) btn.classList.add('active');
                else if (project && f === 'project') btn.classList.add('active');
            });

            postList.querySelectorAll('.blog-item[data-type]').forEach(item => {
                let show = true;
                if (type && item.dataset.type.toLowerCase() !== type.toLowerCase()) show = false;
                if (project && item.dataset.project !== project) show = false;
                if (tag) {
                    const tags = item.dataset.tags ? item.dataset.tags.split(',') : [];
                    if (!tags.includes(tag)) show = false;
                }
                item.style.display = show ? '' : 'none';
            });
        };

        filterBar.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const url = new URL(window.location);
                const f = btn.dataset.filter;
                url.searchParams.delete('project');
                url.searchParams.delete('tag');
                if (f === 'all') url.searchParams.delete('type');
                else url.searchParams.set('type', f);
                window.history.pushState({}, '', url);
                applyFilter();
            });
        });

        window.addEventListener('popstate', applyFilter);
        applyFilter();
    }

    // Reading Progress & TOC
    const progressBar = document.getElementById('reading-progress');
    const postBody = document.querySelector('.post-body');
    const tocList = document.getElementById('toc-list');

    if (postBody && progressBar) {
        window.addEventListener('scroll', () => {
            const scroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            progressBar.style.width = (scroll / height) * 100 + "%";
        });

        if (tocList) {
            const headings = postBody.querySelectorAll('h2, h3');
            headings.forEach((h, i) => {
                if (!h.id) h.id = `section-${i}`;
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = `#${h.id}`;
                a.textContent = h.textContent;
                if (h.tagName.toLowerCase() === 'h3') li.classList.add('toc-h3');
                li.appendChild(a);
                tocList.appendChild(li);
            });

            const tocLinks = tocList.querySelectorAll('li');
            window.addEventListener('scroll', () => {
                let current = '';
                headings.forEach(h => {
                    if (window.scrollY >= h.offsetTop - 120) current = h.id;
                });
                tocLinks.forEach(li => {
                    li.classList.remove('active');
                    if (li.querySelector('a').getAttribute('href') === `#${current}`) li.classList.add('active');
                });
            });
        }
    }

    // Copy Code
    if (postBody) {
        postBody.querySelectorAll('pre').forEach(pre => {
            const btn = document.createElement('button');
            btn.className = 'copy-code-btn';
            btn.innerText = 'Copy';
            btn.addEventListener('click', async () => {
                await navigator.clipboard.writeText(pre.querySelector('code').innerText);
                btn.innerText = 'Copied!';
                btn.classList.add('copied');
                setTimeout(() => { btn.innerText = 'Copy'; btn.classList.remove('copied'); }, 2000);
            });
            pre.appendChild(btn);
        });
    }

    // Back to Top
    const backTop = document.getElementById('back-to-top');
    if (backTop) {
        window.addEventListener('scroll', () => {
            backTop.style.opacity = window.scrollY > 500 ? '1' : '0';
            backTop.style.visibility = window.scrollY > 500 ? 'visible' : 'hidden';
        });
    }

    // Formspree
    const form = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    if (form && formStatus) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            formStatus.textContent = 'Sending...';
            try {
                const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } });
                if (res.ok) { formStatus.textContent = 'Message sent successfully!'; form.reset(); }
                else formStatus.textContent = 'Oops! There was a problem.';
            } catch { formStatus.textContent = 'Network error.'; }
        });
    }
});