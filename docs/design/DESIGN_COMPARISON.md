# Coach Landing Page - Design Comparison

## Design System Overview

All three applications (Clare, Clark, and Coach) follow a consistent design system from Contempo Studios.

## Visual Comparison

### Typography
- **Font Family**: Schibsted Grotesk (all three apps)
- **Heading Style**: Bold, large headlines with lighter subheadings
- **Body Text**: Clean, readable with generous line spacing

### Layout Structure
```
┌─────────────────────────────────────────┐
│  Header                        [Login]  │
├─────────────────────────────────────────┤
│                                         │
│              [Logo - 87.5-120px]        │
│                                         │
│          Application Name               │
│                                         │
│         Descriptive subtitle            │
│                                         │
│      [Primary CTA]  [Secondary CTA]     │
│                                         │
├─────────────────────────────────────────┤
│ ════════════════════════════════════    │  ← Accent line (top)
│                                         │
│  [Feature 1] [Feature 2] [Feature 3] →  │  ← Scrolling features
│                                         │
│ ════════════════════════════════════    │  ← Accent line (bottom)
├─────────────────────────────────────────┤
│  Footer © 2025 | Links                  │
└─────────────────────────────────────────┘
```

### Color Palettes

#### Clare (Clinical Guidelines)
- **Primary**: Maroon `#990033`
- **Use Case**: Medical/clinical reference
- **Accent Lines**: Maroon gradient
- **CTA Buttons**: Maroon background

#### Clark (Medical Documentation)
- **Primary**: Mustard `rgb(255, 204, 0)`
- **Use Case**: Transcription/documentation
- **Accent Lines**: Mustard gradient
- **CTA Buttons**: Mustard background

#### Coach (Clinical Training) ✨ NEW
- **Primary**: Teal/Green `rgb(16, 185, 129)`
- **Use Case**: Education/training
- **Accent Lines**: Teal gradient
- **CTA Buttons**: Teal background
- **Rationale**:
  - Green evokes growth, learning, and health
  - Teal is calming yet energetic
  - Distinct from Clare (maroon) and Clark (mustard)
  - Associated with medical/healthcare (surgical scrubs)

### Feature Cards

All three apps use horizontally scrolling feature cards:

```css
/* Shared Properties */
- Min/Max Width: 280-320px
- Border Radius: 12px
- Box Shadow: Subtle elevation
- Hover Effect: translateY(-3px)
- Animation: Infinite horizontal scroll (25-45s duration)
- Gradient Fade: Left and right edges masked
```

**Clare Features**:
- 🔍 Evidence-Based
- ⚡ Instant Responses
- 💻 Desktop Optimised
- 🔒 Secure & Private
- 📋 NICE Guidelines
- 🧠 Real-time AI

**Clark Features**:
- 🎙️ Real-time Audio Transcription
- 📋 Clinical Note Structuring
- 📄 Professional Referral Letters
- 🔬 Clare Guidelines Integration
- 🔒 Secure Cloud Storage

**Coach Features**: ✨
- 🎭 Realistic Simulations
- 📊 Instant Assessment
- 🎯 Targeted Learning
- 🔊 Voice Integration
- 📈 Progress Tracking
- 🔗 Clare Integration

### Accent Lines

Horizontal lines above and below the scrolling features section:

```css
/* Top and bottom accent lines */
height: 3px;
background: linear-gradient(
    90deg,
    transparent 0%,
    [PRIMARY-COLOR] 15%,
    [PRIMARY-COLOR] 85%,
    transparent 100%
);
```

- **Clare**: Maroon lines
- **Clark**: Mustard lines
- **Coach**: Teal lines

## Component Breakdown

### 1. Hero Section

**Shared Structure**:
```html
<section class="hero">
    <img src="[logo]" alt="[App Name]" height="87.5px" />
    <h1>[Application Name]</h1>
    <p class="hero-description">[Description]</p>
    <div class="cta-buttons">
        <button class="btn-primary">[Primary Action]</button>
        <button class="btn-secondary">[Secondary Action]</button>
    </div>
</section>
```

**Clare**:
- Title: "Clinical AI Reference Tool"
- Description: Real-time access to NICE guidelines
- CTAs: "Free Trial" / "Demo"

**Clark**:
- Title: "AI Medical Documentation System"
- Description: Transform audio consultations
- CTA: "Login" (single button)

**Coach**:
- Title: "Clinical Training Platform"
- Description: Transform clinical education with AI
- CTAs: "Start Training" / "Browse Scenarios"

### 2. Footer

**Shared Elements**:
```
© [App] 2025. All rights reserved.
Links: Privacy | Terms | Medical Disclaimer | Contact
```

**Coach Addition**:
- Cross-links to Clare and Clark
- Link to Contempo Studios parent site

## Technical Implementation

### File Structure

```
Clare/Clark (Flask):
├── templates/
│   └── landing.html
├── static/
│   ├── css/
│   │   ├── theme.css
│   │   └── components.css
│   └── images/
│       └── [App]Logo.svg

Coach (Standalone):
├── landing.html          ← Self-contained
└── coach-logo.svg        ← Temporary placeholder
```

### CSS Variables

All three apps use CSS custom properties for theming:

```css
:root {
    /* Brand Colors */
    --[app]-primary: [color];
    --[app]-primary-light: [color-light];
    --[app]-primary-dark: [color-dark];

    /* Neutral Colors */
    --text-primary: #1f2937;
    --text-secondary: #6b7280;
    --bg: #ffffff;
    --border-color: #e5e7eb;

    /* Typography */
    --font-primary: "Schibsted Grotesk", sans-serif;
    --type-scale-[size]: [rem];
    --font-weight-[weight]: [value];
    --line-height-[variant]: [value];
}
```

## Brand Personality

### Clare
- **Tone**: Professional, authoritative, clinical
- **Audience**: Healthcare professionals needing quick reference
- **Visual**: Serious maroon, medical red cross association

### Clark
- **Tone**: Efficient, practical, time-saving
- **Audience**: Busy clinicians doing documentation
- **Visual**: Warm mustard, attention-grabbing, optimistic

### Coach
- **Tone**: Educational, encouraging, growth-oriented
- **Audience**: Medical students and trainees
- **Visual**: Fresh teal, energetic, approachable

## Responsive Design

All three applications share responsive breakpoints:

```css
@media (max-width: 768px) {
    /* Mobile adjustments */
    - Stack CTA buttons vertically
    - Reduce hero text size
    - Center footer content
    - Adjust feature card sizing
}
```

## Accessibility

Shared accessibility features:
- ✅ Semantic HTML
- ✅ ARIA labels where needed
- ✅ Keyboard navigation
- ✅ Focus indicators
- ✅ Color contrast (WCAG AA compliant)
- ✅ Responsive text sizing

## Performance

Optimization techniques used:
- Font preloading (Google Fonts)
- CSS animations with `will-change`
- Minimal JavaScript (optional modals)
- SVG logos (scalable, small file size)
- CSS Grid and Flexbox (no heavy frameworks)

## Future Considerations

Potential unified design system improvements:
1. **Shared Component Library**: Extract common components
2. **Design Tokens**: Centralize colors, spacing, typography
3. **Dark Mode**: Add theme switcher across all apps
4. **Animation Library**: Standardize transitions and effects
5. **Icon System**: Move from emoji to icon library
6. **Accessibility Audit**: WCAG 2.1 AAA compliance

---

**Ecosystem**: Contempo Studios
**Applications**: Clare (Guidelines) | Clark (Documentation) | Coach (Training)
**Design Version**: 1.0.0
**Last Updated**: January 2025
