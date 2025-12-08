# Design Guide & Style System

UI/UX design specifications, component guidelines, and visual standards.

## 🎨 Design System Overview

### Color Palette

#### Primary Colors
- **Primary Blue**: `#2563eb` - Main actions, links
- **Primary Light**: `#dbeafe` - Hover states, backgrounds
- **Primary Dark**: `#1e40af` - Active states, hover darken

#### Status Colors
- **Success Green**: `#10b981` - Present, approved
- **Warning Orange**: `#f59e0b` - Late, pending
- **Danger Red**: `#ef4444` - Absent, rejected
- **Info Blue**: `#3b82f6` - Notifications, info

#### Neutral Colors
```
White:        #ffffff
Light Gray:   #f9fafb
Medium Gray:  #f3f4f6
Dark Gray:    #e5e7eb
Text Gray:    #6b7280
Dark Text:    #1f2937
```

### Typography

#### Font Family
- **Primary**: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif
- **Mono**: 'Menlo', 'Monaco', monospace

#### Font Sizes & Weights
```
Display:    32px / 600 weight (Page titles)
Heading 1:  28px / 600 weight (Section titles)
Heading 2:  24px / 600 weight (Subsection)
Heading 3:  20px / 600 weight (Cards, dialogs)
Body:       16px / 400 weight (Regular text)
Body Small: 14px / 400 weight (Secondary text)
Caption:    12px / 400 weight (Meta, labels)
```

### Spacing System

Consistent 4px baseline:
```
xs:  4px
sm:  8px
md:  16px
lg:  24px
xl:  32px
2xl: 48px
3xl: 64px
```

Usage:
```css
padding: 16px;      /* md */
margin: 24px 0;     /* lg vertical */
gap: 8px;           /* sm */
```

### Border Radius
```
sm:  4px   (buttons, small elements)
md:  8px   (cards, modals)
lg:  12px  (large sections)
full: 50%  (avatars, circular)
```

### Shadows
```
sm:  0 1px 2px rgba(0, 0, 0, 0.05)
md:  0 4px 6px rgba(0, 0, 0, 0.1)
lg:  0 10px 15px rgba(0, 0, 0, 0.1)
xl:  0 20px 25px rgba(0, 0, 0, 0.1)
```

---

## 🧩 Component Library

### Button Styles

#### Primary Button
```jsx
<button className="btn btn-primary">
  Action
</button>
```
- Background: Primary Blue
- Text: White
- Hover: Darken 10%
- Active: Darken 20%
- Disabled: Opacity 50%

#### Secondary Button
- Background: Light Gray
- Text: Dark Text
- Hover: Medium Gray background
- Border: 1px light gray border

#### Danger Button
- Background: Danger Red
- Text: White
- Used for destructive actions

#### Link Button
- No background
- Text: Primary Blue
- Underline on hover
- No padding, minimal height

### Input Fields

#### Text Input
```jsx
<input 
  type="text"
  className="input-field"
  placeholder="Enter text..."
/>
```

Styling:
- Border: 1px solid dark gray
- Padding: 12px 16px
- Border radius: 8px
- Focus: Blue border + shadow
- Invalid: Red border + error message

#### Textarea
- Same as input
- Min height: 120px
- Resize: vertical only

#### Select Dropdown
- Similar to input styling
- Arrow icon on right
- Dark text for options
- Blue background for selected item

### Cards

```jsx
<div className="card">
  <div className="card-header">Title</div>
  <div className="card-body">Content</div>
  <div className="card-footer">Actions</div>
</div>
```

Styling:
- Background: White
- Border: 1px light gray
- Border radius: 12px
- Box shadow: md
- Padding: 24px

### Tables

```jsx
<table className="table">
  <thead>
    <tr className="table-header">
      <th>Header</th>
    </tr>
  </thead>
  <tbody>
    <tr className="table-row">
      <td>Data</td>
    </tr>
  </tbody>
</table>
```

Styling:
- Header background: Light gray
- Rows: Alternate white/light gray
- Borders: 1px light gray
- Hover row: Very light blue background
- Padding: 12px
- Text align: Left for text, right for numbers

### Badges & Labels

#### Status Badge
```jsx
<span className="badge badge-success">Present</span>
<span className="badge badge-danger">Absent</span>
<span className="badge badge-warning">Late</span>
```

Styling:
- Padding: 4px 8px
- Border radius: 4px
- Font size: 12px
- Bold text
- Color: Status color
- Background: Light status color

### Alerts & Notifications

#### Alert Box
```jsx
<div className="alert alert-info">
  <i className="icon"></i>
  <div>
    <h4>Title</h4>
    <p>Message</p>
  </div>
</div>
```

Variants:
- `alert-info` (blue)
- `alert-success` (green)
- `alert-warning` (orange)
- `alert-danger` (red)

### Modals & Dialogs

```jsx
<div className="modal-overlay">
  <div className="modal">
    <div className="modal-header">
      <h2>Title</h2>
      <button className="close-btn">×</button>
    </div>
    <div className="modal-body">Content</div>
    <div className="modal-footer">
      <button className="btn btn-secondary">Cancel</button>
      <button className="btn btn-primary">Save</button>
    </div>
  </div>
</div>
```

Styling:
- Overlay: Black 50% opacity, blur backdrop
- Modal: White card, centered, max-width 500px
- Box shadow: xl
- Animation: Fade in + slide up

### Navigation Bar

```jsx
<nav className="navbar">
  <div className="navbar-left">
    <img src="logo.svg" className="logo" />
    <span className="app-name">Khwopa Attendance</span>
  </div>
  
  <div className="navbar-right">
    <button className="icon-btn">
      <i className="bell-icon"></i>
      <span className="badge">3</span>
    </button>
    <button className="theme-toggle">🌙</button>
    <div className="user-menu">
      <img src={avatar} className="avatar" />
      <span>John Doe</span>
    </div>
  </div>
</nav>
```

Height: 64px
Sticky top, z-index: 100
Shadow: md

### Sidebar

```jsx
<aside className="sidebar">
  <div className="sidebar-header">
    <h3>Menu</h3>
  </div>
  
  <nav className="sidebar-nav">
    <a href="#" className="nav-item active">
      <i className="icon"></i>
      <span>Dashboard</span>
    </a>
    <a href="#" className="nav-item">
      <i className="icon"></i>
      <span>Attendance</span>
    </a>
  </nav>
</aside>
```

Width: 280px (expanded), 80px (collapsed)
Animation: Smooth width transition
Active item: Blue background, bold text

---

## 🌓 Dark Theme Implementation

### Dark Mode CSS Variables
```css
[data-theme="dark"] {
  --bg-primary: #111827;
  --bg-secondary: #1f2937;
  --text-primary: #f3f4f6;
  --text-secondary: #d1d5db;
  --border-color: #374151;
  --shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  --card-bg: #1f2937;
}
```

### Theme Toggle
```jsx
const [theme, setTheme] = useState('light');

const toggleTheme = () => {
  const newTheme = theme === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
};
```

### Persistence
```jsx
useEffect(() => {
  const savedTheme = localStorage.getItem('theme') || 'light';
  setTheme(savedTheme);
  document.documentElement.setAttribute('data-theme', savedTheme);
}, []);
```

---

## 📐 Responsive Design

### Breakpoints
```
Mobile:     < 640px
Tablet:     640px - 1024px
Desktop:    > 1024px
```

### Mobile First Approach
```css
/* Mobile styles (default) */
.card {
  width: 100%;
  padding: 16px;
}

/* Tablet */
@media (min-width: 640px) {
  .card {
    padding: 24px;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .card {
    width: calc(50% - 8px);
  }
}
```

### Grid System
```
Mobile:     1 column
Tablet:     2 columns
Desktop:    3-4 columns (depends on component)
```

---

## ✨ Animation Guidelines

### Transitions
```css
/* Default transitions */
.element {
  transition: all 200ms ease-in-out;
}

/* Hover states */
.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  transition: all 150ms ease-in-out;
}
```

### Loading States
```css
@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner {
  animation: spin 1s linear infinite;
}
```

### Page Transitions
- Fade in: 300ms
- Slide up: 300ms
- Fade out: 200ms on leave

---

## 🎯 Best Practices

### Color Usage
- ✅ Use semantic colors (green for success, red for error)
- ✅ Maintain contrast ratio ≥ 4.5:1 for text
- ✅ Don't rely on color alone - use icons/labels
- ❌ Don't use more than 3 primary colors per page

### Spacing
- ✅ Use consistent spacing scale (4px increments)
- ✅ More space around headings (lg, xl)
- ✅ Tighter spacing within components (sm, md)
- ❌ Don't use arbitrary spacing values

### Typography
- ✅ Use 16px minimum for body text
- ✅ Line height 1.5 for readability
- ✅ Max 70-80 characters per line
- ❌ Don't mix too many font sizes on one page

### Accessibility
- ✅ Color + text contrast ≥ 4.5:1
- ✅ Keyboard navigation support
- ✅ ARIA labels for screen readers
- ✅ Focus indicators visible
- ❌ Don't use color alone for status

---

## 📊 Component Usage Examples

### Dashboard Card
```jsx
<div className="card">
  <div className="card-header">
    <h3>Attendance Overview</h3>
    <span className="badge badge-info">Last 30 days</span>
  </div>
  <div className="card-body">
    <div className="stat-row">
      <div className="stat">
        <span className="stat-label">Present</span>
        <span className="stat-value success">85%</span>
      </div>
      <div className="stat">
        <span className="stat-label">Absent</span>
        <span className="stat-value danger">10%</span>
      </div>
      <div className="stat">
        <span className="stat-label">Late</span>
        <span className="stat-value warning">5%</span>
      </div>
    </div>
  </div>
</div>
```

### Form Example
```jsx
<form className="form">
  <div className="form-group">
    <label>Student Name</label>
    <input type="text" className="input-field" required />
  </div>
  
  <div className="form-group">
    <label>Class</label>
    <select className="input-field" required>
      <option>Select class</option>
      <option>BIT-1A</option>
    </select>
  </div>
  
  <div className="form-actions">
    <button type="button" className="btn btn-secondary">Cancel</button>
    <button type="submit" className="btn btn-primary">Save</button>
  </div>
</form>
```

---

## 📝 CSS Naming Convention

### BEM Methodology
```css
.card {}                    /* Block */
.card__header {}           /* Element */
.card__header--dark {}     /* Modifier */

.button {}
.button--primary {}
.button--primary:hover {}
.button--large {}
```

### Utility Classes
```
.mt-{size}     - Margin top
.mb-{size}     - Margin bottom
.p-{size}      - Padding
.flex          - Flexbox container
.grid          - Grid container
.text-center   - Text alignment
.text-{color}  - Text color
.bg-{color}    - Background color
.hidden        - Display none
.opacity-50    - Opacity
```

---

For frontend component implementation details, see `FRONTEND_STRUCTURE.md`
