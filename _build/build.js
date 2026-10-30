import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

const ROOT = path.resolve(process.cwd());
const POSTS_DIR = path.join(ROOT, '_posts');
const TEMPLATES_DIR = path.join(ROOT, '_templates');
const DIST_DIR = path.join(ROOT, 'dist');
const MAX_FEATURED = 3;

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[c]));

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

const renderTags = (tags = []) => tags.map((t) => `<a href="/blog/?tag=${esc(t)}" class="post-tag">${esc(t)}</a>`).join('');
function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyRecursive(s, d);
    else fs.copyFileSync(s, d);
  }
}

const postTemplate = fs.readFileSync(path.join(TEMPLATES_DIR, 'post.html'), 'utf8');
const listingTemplate = fs.readFileSync(path.join(TEMPLATES_DIR, 'listing.html'), 'utf8');

if (!fs.existsSync(POSTS_DIR)) {
  console.error('No _posts/ directory found.');
  process.exit(1);
}

const posts = fs.readdirSync(POSTS_DIR)
  .filter((f) => f.endsWith('.md'))
  .map((file) => {
    const match = file.match(/^(\d{4}-\d{2}-\d{2})-(.+)\.md$/);
    if (!match) {
      console.warn(`Skipping ${file} (expected YYYY-MM-DD-slug.md)`);
      return null;
    }
    const [, dateFromFile, slug] = match;
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8');
    const { data, content } = matter(raw);
    if (!data.title) {
      console.warn(`Skipping ${file} (missing title)`);
      return null;
    }
    return {
      slug,
      date: data.date || dateFromFile,
      title: data.title,
      description: data.description || '',
      type: (data.type || 'notes').toLowerCase(), 
      project: data.project || '',
      tags: data.tags || [],
      featured: data.featured === true,
      html: marked.parse(content),
    };
  })
  .filter(Boolean);

posts.sort((a, b) => new Date(b.date) - new Date(a.date));

const card = (post) => {
  const badge = post.type === 'project'
    ? `<a href="/blog/?type=project" class="post-badge badge-project">Project${post.project ? ' · ' + esc(post.project) : ''}</a>`
    : `<a href="/blog/?type=notes" class="post-badge badge-notes">Notes</a>`;
  
  return `<div class="blog-item" data-type="${post.type}" data-tags="${post.tags.join(',')}"${post.project ? ` data-project="${esc(post.project)}"` : ''}>
      <div class="blog-meta">
        ${badge}
        <span class="blog-date">${formatDate(post.date)}</span>
      </div>
      <h3 class="blog-title"><a href="/blog/${post.slug}/">${esc(post.title)}</a></h3>
      <p class="blog-excerpt">${esc(post.description)}</p>
      <div class="card-tags">${renderTags(post.tags)}</div>
    </div>`;
};

fs.rmSync(DIST_DIR, { recursive: true, force: true });
fs.mkdirSync(DIST_DIR, { recursive: true });

copyRecursive(path.join(ROOT, 'about'), path.join(DIST_DIR, 'about'));
copyRecursive(path.join(ROOT, 'resume'), path.join(DIST_DIR, 'resume'));
copyRecursive(path.join(ROOT, 'projects'), path.join(DIST_DIR, 'projects'));
copyRecursive(path.join(ROOT, 'blog-admin'), path.join(DIST_DIR, 'blog-admin'));
fs.copyFileSync(path.join(ROOT, 'styles.css'), path.join(DIST_DIR, 'styles.css'));
fs.copyFileSync(path.join(ROOT, 'script.js'), path.join(DIST_DIR, 'script.js'));
for (const extra of ['.nojekyll','robots.txt', 'feed.xml', 'CNAME']) {
  const p = path.join(ROOT, extra);
  if (fs.existsSync(p)) fs.copyFileSync(p, path.join(DIST_DIR, extra));
}

const featured = posts.filter((p) => p.featured).slice(0, MAX_FEATURED);
const featuredHtml = featured.length
  ? featured.map(card).join('\n')
  : '<p class="empty-Notes">No featured posts yet. Add <code>featured: true</code> to a post frontmatter.</p>';

let indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
if (!indexHtml.includes('<!-- FEATURED:START -->')) {
  console.warn('index.html is missing FEATURED markers; skipping featured injection.');
} else {
  indexHtml = indexHtml.replace(
    /<!-- FEATURED:START -->[\s\S]*?<!-- FEATURED:END -->/,
    `<!-- FEATURED:START -->\n${featuredHtml}\n    <!-- FEATURED:END -->`
  );
}
fs.writeFileSync(path.join(DIST_DIR, 'index.html'), indexHtml);

for (const post of posts) {
    const projectMeta = post.type === 'project'
    ? `<div class="project-meta">
         <a href="/blog/?type=project" class="project-badge">Project log</a>
         ${post.project ? `<span class="project-name">${esc(post.project)}</span>` : ''}
       </div>`
    : `<div class="project-meta">
         <a href="/blog/?type=notes" class="project-badge" style="color: #a78bfa; border-color: #a78bfa;">Notes</a>
       </div>`;

  const page = postTemplate
    .replaceAll('{{TITLE}}', esc(post.title))
    .replaceAll('{{SLUG}}', post.slug)
    .replaceAll('{{DATE}}', formatDate(post.date))
    .replaceAll('{{DATE_ISO}}', post.date)
    .replaceAll('{{DESCRIPTION}}', esc(post.description))
    .replaceAll('{{TAGS}}', renderTags(post.tags))
    .replaceAll('{{PROJECT_META}}', projectMeta)
    .replaceAll('{{CONTENT}}', post.html);

  const dir = path.join(DIST_DIR, 'blog', post.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), page);
  console.log(`  ✓ blog/${post.slug}/`);
}

fs.mkdirSync(path.join(DIST_DIR, 'blog'), { recursive: true });
const listingPage = listingTemplate.replaceAll('{{POST_CARDS}}', posts.map(card).join('\n'));
fs.writeFileSync(path.join(DIST_DIR, 'blog', 'index.html'), listingPage);
console.log('  ✓ blog/');

console.log(`\nDone. ${posts.length} posts, ${featured.length} featured → dist/`);
