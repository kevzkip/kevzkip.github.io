const form = document.getElementById('post-form');
const tokenInput = document.getElementById('github-token');
const submitBtn = document.getElementById('submit-btn');
const formStatus = document.getElementById('form-status');

// Set date to today by default
document.getElementById('post-date').valueAsDate = new Date();

// Load saved token if it exists
const savedToken = localStorage.getItem('gh_token');
if (savedToken) {
    tokenInput.value = savedToken;
}

// Convert string to Base64 (safe for Unicode/Emojis)
function toBase64(str) {
    return btoa(unescape(encodeURIComponent(str)));
}

// Create URL-friendly slug
function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           
        .replace(/[^\w\-]+/g, '')       
        .replace(/\-\-+/g, '-')         
        .replace(/^-+/, '')             
        .replace(/-+$/, '');            
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const token = tokenInput.value.trim();
    const title = document.getElementById('post-title').value.trim();
    const date = document.getElementById('post-date').value;
    const type = document.getElementById('post-type').value;
    const desc = document.getElementById('post-desc').value.trim();
    const project = document.getElementById('post-project').value.trim();
    const tags = document.getElementById('post-tags').value.split(',').map(t => t.trim()).filter(Boolean);
    const featured = document.getElementById('post-featured').checked;
    const content = document.getElementById('post-content').value;

    // Save token for next time
    localStorage.setItem('gh_token', token);

    // Build the filename and frontmatter
    const slug = slugify(title);
    const filename = `${date}-${slug}.md`;
    const repoPath = `_posts/${filename}`;

    let frontmatter = `---\n`;
    frontmatter += `title: ${title}\n`;
    frontmatter += `date: ${date}\n`;
    frontmatter += `description: ${desc}\n`;
    frontmatter += `type: ${type}\n`;
    if (type === 'project' && project) frontmatter += `project: ${project}\n`;
    if (tags.length > 0) frontmatter += `tags: [${tags.join(', ')}]\n`;
    if (featured) frontmatter += `featured: true\n`;
    frontmatter += `---\n\n`;

    const fullMarkdown = frontmatter + content;
    const base64Content = toBase64(fullMarkdown);

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Publishing...';
    formStatus.textContent = '';
    formStatus.style.color = 'var(--accent)';

    try {
        const response = await fetch(`https://api.github.com/repos/kevzkip/kevzkip.github.io/contents/${repoPath}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `New post: ${title}`,
                content: base64Content
            })
        });

        if (response.ok) {
            formStatus.textContent = "Success! Post pushed to GitHub. The site will rebuild in ~60 seconds.";
            formStatus.style.color = "#22c55e"; // Green
            form.reset();
            document.getElementById('post-date').valueAsDate = new Date();
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to publish');
        }
    } catch (error) {
        console.error(error);
        formStatus.textContent = `Error: ${error.message}. Check your token permissions.`;
        formStatus.style.color = "#ef4444"; // Red
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Publish Post';
    }
});