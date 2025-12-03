# Coach Landing Page

## Overview

This landing page matches the design style of Clare and Clark applications from Contempo Studios. It features:

- **Consistent Design**: Uses the same Schibsted Grotesk font and layout structure
- **Brand Colors**: Medical teal/green theme (rgb(16, 185, 129))
- **Horizontal Scrolling Features**: Smooth animated feature cards
- **Responsive Design**: Works on desktop and mobile devices
- **SEO Optimized**: Proper meta tags and schema markup

## Files Created

- `landing.html` - Main landing page (standalone HTML file)
- `coach-logo.svg` - Temporary placeholder logo (replace with your actual logo)

## Customization

### 1. Replace the Logo

The landing page currently uses a temporary SVG logo. To use your actual Coach logo:

1. Save your logo image as `coach-logo.png` or `coach-logo.svg` in the project root
2. If using a different format, update these lines in `landing.html`:
   - Line 41: Favicon link
   - Line 408: Hero logo image

Example:
```html
<img src="/your-logo-file.png" alt="Coach" class="coach-logo">
```

### 2. Update Links

The current page has placeholder links to `http://localhost:3000`. Update these based on your deployment:

- Line 398: Login button
- Lines 416-420: CTA buttons

### 3. Customize Brand Colors

The page uses these CSS variables (defined in the `:root` section):

```css
--coach-primary: rgb(16, 185, 129);        /* Main teal/green */
--coach-primary-light: rgba(16, 185, 129, 0.1);  /* Light variant */
--coach-primary-dark: rgb(5, 150, 105);    /* Dark variant */
```

Change these values to match your brand guidelines.

## Deployment Options

### Option 1: Standalone Page (Recommended for Marketing)

Serve the landing page separately from your React app:

1. Upload `landing.html` and `coach-logo.svg` to your web server root
2. Configure your domain (e.g., coachmedai.app) to serve `landing.html` as the index
3. Point login/CTA buttons to your React app domain

### Option 2: Integrate with React App

Move the landing page into your React app:

1. Copy `landing.html` content to `frontend/public/landing.html`
2. Copy `coach-logo.svg` to `frontend/public/`
3. Update asset paths to use relative URLs
4. Configure your router to serve landing page at root

### Option 3: Azure Static Web Apps

For Azure deployment (matching Clare/Clark):

1. Create a new Azure Static Web App resource
2. Upload `landing.html` as the index page
3. Configure custom domain: `coachmedai.app` or `coachmedai.ai`
4. Link to your main React app subdomain (e.g., `app.coachmedai.app`)

## Design Consistency with Clare & Clark

This landing page maintains consistency with the ecosystem:

| Element | Clare | Clark | Coach |
|---------|-------|-------|-------|
| **Font** | Schibsted Grotesk | Schibsted Grotesk | Schibsted Grotesk |
| **Primary Color** | Maroon (#990033) | Mustard (rgb(255, 204, 0)) | Teal (rgb(16, 185, 129)) |
| **Logo Height** | 87.5px | 87.5px | 120px |
| **Features** | Horizontal scroll | Horizontal scroll | Horizontal scroll |
| **Accent Lines** | Yes (maroon) | Yes (mustard) | Yes (teal) |
| **Footer Links** | Clare, Terms, Privacy | Clark, Terms, Privacy | Clare, Clark, Contempo |

## Testing the Landing Page

To view the landing page locally:

```bash
# Option 1: Direct file access
open landing.html

# Option 2: Local server (recommended for testing links)
python3 -m http.server 8080
# Then visit: http://localhost:8080/landing.html

# Option 3: Using Node.js http-server
npx http-server -p 8080
# Then visit: http://localhost:8080/landing.html
```

## Cross-linking with Ecosystem

The footer includes links to:
- **Clare** (clareai.app) - Clinical Guidelines
- **Clark** (clarkai.app) - Medical Documentation
- **Contempo Studios** (contempostudios.ai) - Parent company

Update these URLs once domains are finalized.

## Future Enhancements

Consider adding:
- [ ] Login modal (like Clare) for direct access
- [ ] Email signup form for beta access
- [ ] Video demo or screenshots
- [ ] Testimonials from medical students
- [ ] Integration with Coach React app authentication
- [ ] Google Analytics or Azure Application Insights
- [ ] Cookie consent banner (GDPR compliance)

## Support

For questions about the design system or integration:
- Check Clare repository: `github.com/Amoukli/Clare`
- Check Clark repository: `/Users/ahmad/Documents/GitHub/Clark`
- Review CLAUDE.md for full project documentation

---

**Created:** January 2025
**Last Updated:** January 2025
**Version:** 1.0.0
