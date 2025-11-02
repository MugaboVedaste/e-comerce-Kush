# 🔧 Hamburger Menu Troubleshooting Guide

## Issue: Hamburger Menu Not Showing Dropdown

### Updated Files (Version 15)
- ✅ CSS: v11
- ✅ JavaScript: v15
- ✅ Added console.log debugging

---

## 🧪 Step-by-Step Testing

### Step 1: Clear Browser Cache
**IMPORTANT!** You must clear cache for new files to load:

**Method 1 - Hard Refresh:**
- Windows: `Ctrl + Shift + R` or `Ctrl + F5`
- Mac: `Cmd + Shift + R`

**Method 2 - Clear Cache:**
1. Press `F12` to open DevTools
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

**Method 3 - Incognito Mode:**
1. Press `Ctrl + Shift + N` (Windows) or `Cmd + Shift + N` (Mac)
2. Open your site in incognito window
3. Test hamburger menu

---

### Step 2: Check Console Logs
1. Open your site
2. Press `F12` to open Developer Tools
3. Click "Console" tab
4. Look for these messages:

**Expected Console Output:**
```
Script.js loaded - Version 15 - Hamburger Menu Active
Hamburger menu init: Found
Main nav init: Found
Hamburger menu attached!
```

**When you click the hamburger, you should see:**
```
Hamburger clicked!
Menu active: true
```

---

### Step 3: Check Element IDs

1. Press `F12` → Go to "Elements" or "Inspector" tab
2. Press `Ctrl + F` to search
3. Search for: `id="hamburgerMenu"`
4. Verify it exists in the HTML

**Should look like:**
```html
<button class="hamburger-menu" id="hamburgerMenu" aria-label="Toggle menu">
  <span></span>
  <span></span>
  <span></span>
</button>
```

5. Search for: `id="mainNav"`
6. Verify it exists

**Should look like:**
```html
<nav class="main-nav" id="mainNav">
  <ul>
    <li><a href="..." class="nav-link">Home</a></li>
    ...
  </ul>
</nav>
```

---

### Step 4: Test on Mobile Size

1. Press `F12` to open DevTools
2. Press `Ctrl + Shift + M` to toggle device toolbar
3. Select "Responsive" or "iPhone 12 Pro"
4. Set width to **600px** (definitely under 720px)
5. Check if hamburger icon (☰) is visible

**If you don't see the hamburger icon:**
- The viewport might be too wide
- Try manually resizing to be very narrow (320px)

---

### Step 5: Inspect CSS

1. Right-click the hamburger icon
2. Select "Inspect" or "Inspect Element"
3. In the Styles panel, check:

**At desktop size (>720px):**
```css
.hamburger-menu {
  display: none; /* Should be hidden */
}
```

**At mobile size (<720px):**
```css
.hamburger-menu {
  display: flex; /* Should be visible */
}
```

**When clicked (with .active class):**
```css
.main-nav.active {
  max-height: 400px; /* Menu should expand */
  padding: 20px 0;
}
```

---

### Step 6: Check JavaScript Errors

In Console tab, look for any red error messages:

**Common Errors:**

❌ **"Cannot read property 'addEventListener' of null"**
- **Problem:** IDs are missing or wrong
- **Solution:** Check HTML has `id="hamburgerMenu"` and `id="mainNav"`

❌ **"script.js:1 Uncaught SyntaxError"**
- **Problem:** JavaScript file corrupted
- **Solution:** Hard refresh or restart server

❌ **"Failed to load resource: 404"**
- **Problem:** Script file not loading
- **Solution:** Check Django static files are served correctly

---

## 🔍 Manual Test Checklist

Test each item:

- [ ] 1. Hamburger icon (☰) visible on mobile (<720px)
- [ ] 2. Hamburger icon NOT visible on desktop (>720px)
- [ ] 3. Click hamburger → Icon changes to X (✕)
- [ ] 4. Click hamburger → Menu slides down
- [ ] 5. Console shows "Hamburger clicked!"
- [ ] 6. Console shows "Menu active: true"
- [ ] 7. Menu has blue/purple background
- [ ] 8. Menu items visible (Home, About, etc.)
- [ ] 9. Click menu item → Menu closes
- [ ] 10. Click outside menu → Menu closes

---

## 🐛 Common Issues & Solutions

### Issue 1: Hamburger Not Visible on Mobile
**Symptoms:** No three-line icon appears even on small screen

**Solutions:**
```css
/* Check if this CSS exists at bottom of style.css */
@media(max-width:720px){
  .hamburger-menu{display:flex}
}
```

**Try:**
1. Verify viewport meta tag exists in HTML
2. Check browser width is actually < 720px
3. Hard refresh browser cache

---

### Issue 2: Hamburger Visible But Menu Won't Open
**Symptoms:** Can see ☰ icon but clicking does nothing

**Solutions:**
1. Check Console for "Hamburger clicked!" message
2. If no message → JavaScript not attached
3. Verify IDs: `id="hamburgerMenu"` and `id="mainNav"`
4. Check script.js is loading (v15)

**Test in Console:**
```javascript
document.getElementById('hamburgerMenu')
document.getElementById('mainNav')
```
Both should return HTML elements, not `null`

---

### Issue 3: Menu Opens But No Content
**Symptoms:** Menu expands but no navigation items visible

**Solution:**
Check HTML structure:
```html
<nav class="main-nav" id="mainNav">
  <ul>
    <li><a href="..." class="nav-link">Home</a></li>
    <!-- More items -->
  </ul>
</nav>
```

---

### Issue 4: Menu Opens But Doesn't Close
**Symptoms:** Menu stays open after clicking

**Solution:**
Check all nav links have `.nav-link` class:
```html
<a href="..." class="nav-link">Home</a>
```

---

### Issue 5: Hamburger Shows on Desktop
**Symptoms:** ☰ visible even on wide screens

**Solution:**
Verify CSS has:
```css
.hamburger-menu {
  display: none; /* Default hidden */
}

@media(max-width:720px) {
  .hamburger-menu {
    display: flex; /* Show on mobile */
  }
}
```

---

## 🔧 Emergency Fixes

### Quick Fix 1: Force CSS Reload
Add to URL: `?v=999` after style.css
```html
<link rel="stylesheet" href="{% static 'store/style.css' %}?v=999" />
```

### Quick Fix 2: Inline Test
Add this to bottom of page before `</body>`:
```html
<script>
document.addEventListener('DOMContentLoaded', function() {
  console.log('Testing hamburger...');
  const h = document.getElementById('hamburgerMenu');
  const n = document.getElementById('mainNav');
  console.log('Hamburger:', h);
  console.log('Nav:', n);
  
  if (h && n) {
    h.onclick = function() {
      console.log('CLICKED!');
      h.classList.toggle('active');
      n.classList.toggle('active');
    };
  }
});
</script>
```

If this works, the issue is with script.js loading.

---

## 📋 Django-Specific Checks

### Check 1: Static Files Served
Run in terminal:
```bash
python manage.py collectstatic
```

### Check 2: Debug Mode
In `settings.py`, verify:
```python
DEBUG = True
STATICFILES_DIRS = []  # Or your static dirs
STATIC_URL = '/static/'
```

### Check 3: Server Running
Restart Django server:
```bash
python manage.py runserver
```

---

## 🎯 Final Verification Steps

1. **Open in Incognito mode** (fresh browser state)
2. **Press F12** → Check Console tab
3. **Resize to 600px width**
4. **Look for hamburger icon** (☰)
5. **Click it**
6. **Check console** for click messages
7. **Watch for menu** sliding down

**Success Indicators:**
- ✅ Console: "Script.js loaded - Version 15"
- ✅ Console: "Hamburger menu attached!"
- ✅ Console: "Hamburger clicked!" (when you click)
- ✅ Visual: Menu slides down with blue background
- ✅ Visual: Icon changes from ☰ to ✕

---

## 💡 Still Not Working?

If menu still won't open after all checks:

1. **Screenshot the Console tab** - Share any errors
2. **Check Network tab** - Verify script.js loaded
3. **Run this in Console**:
```javascript
document.getElementById('hamburgerMenu').click()
```
4. Watch what happens

If this makes menu open → JavaScript is working, CSS might be the issue.
If nothing happens → JavaScript is not attached correctly.

---

## 🆘 Contact Developer

If you've tried all steps above:

1. Share screenshot of Console output
2. Share screenshot of Elements inspector (showing IDs)
3. Share screenshot of Network tab (showing loaded files)
4. Mention which browser you're using

---

**Last Updated:** November 1, 2025  
**Version:** CSS v11, JS v15  
**Status:** Debugging Mode Active ✅
