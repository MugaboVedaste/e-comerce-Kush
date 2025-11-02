# Site-Wide Rating & Review System Documentation

## Overview
This document describes the comprehensive website-wide feedback system that allows users to rate the entire site experience (1-5 stars) and leave written reviews.

---

## Features Implemented

### ✅ **1. Star Rating System (1-5 Stars)**
- Users can rate the website experience from 1 to 5 stars
- Interactive star hovering with visual feedback
- Instant submission via AJAX (no page reload)
- Thank you message displayed after submission
- Average rating calculation and display (e.g., ⭐4.6/5)
- Total rating count shown

### ✅ **2. Written Review System**
- "Leave a Review" button opens a popup modal
- Form fields:
  - **Name** (required)
  - **Email or Phone** (optional)
  - **Review Text** (required)
- Data saved to database with timestamp
- Reviews displayed below rating section
- Auto-approval system (can be moderated via admin panel)

### ✅ **3. Display Features**
- Average rating prominently displayed with stars
- Recent reviews shown (last 5 approved reviews)
- Review cards with reviewer name, date, and text
- Responsive design for mobile and desktop
- Dark theme support

---

## Database Models

### **SiteRating Model**
```python
class SiteRating(models.Model):
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

**Fields:**
- `rating`: Integer from 1-5
- `ip_address`: User's IP for tracking (optional)
- `created_at`: Timestamp of submission

### **SiteReview Model**
```python
class SiteReview(models.Model):
    name = models.CharField(max_length=100)
    contact = models.CharField(max_length=100, blank=True)
    review_text = models.TextField()
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    is_approved = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

**Fields:**
- `name`: Customer's name (required)
- `contact`: Email or phone number (optional)
- `review_text`: Written review content (required)
- `ip_address`: User's IP for tracking
- `is_approved`: Moderation flag (default: True)
- `created_at`: Timestamp of submission

---

## API Endpoints

### **POST /submit-rating/**
Submits a star rating (1-5)

**Request:**
```
POST /submit-rating/
Content-Type: application/x-www-form-urlencoded

rating=5
```

**Response:**
```json
{
  "success": true,
  "message": "Thank you for rating our website!",
  "average_rating": 4.6,
  "total_ratings": 123
}
```

### **POST /submit-review/**
Submits a written review

**Request:**
```
POST /submit-review/
Content-Type: multipart/form-data

name=John Doe
contact=john@example.com (optional)
review_text=Great website! Love the selection.
```

**Response:**
```json
{
  "success": true,
  "message": "Thank you for your review! We appreciate your feedback.",
  "review": {
    "name": "John Doe",
    "review_text": "Great website! Love the selection.",
    "created_at": "November 01, 2025"
  }
}
```

---

## Frontend Implementation

### **HTML Structure (base.html & Sample Kush.html)**

```html
<!-- Rating Section -->
<section class="container my-5">
  <div class="rating-section">
    <!-- Average Rating Display -->
    <div class="average-rating">
      <div class="rating-number">4.6</div>
      <div class="rating-stars">⭐⭐⭐⭐⭐</div>
      <div class="rating-count">Based on 123 ratings</div>
    </div>

    <!-- Star Rating Input -->
    <div class="star-rating-input" id="starRating">
      <span class="star" data-rating="1">⭐</span>
      <span class="star" data-rating="2">⭐</span>
      <span class="star" data-rating="3">⭐</span>
      <span class="star" data-rating="4">⭐</span>
      <span class="star" data-rating="5">⭐</span>
    </div>

    <!-- Leave Review Button -->
    <button class="leave-review-btn" id="leaveReviewBtn">
      Leave a Review
    </button>

    <!-- Recent Reviews -->
    <div class="recent-reviews">
      <!-- Review cards displayed here -->
    </div>
  </div>
</section>

<!-- Review Modal -->
<div class="review-modal" id="reviewModal">
  <div class="review-modal-content">
    <!-- Review form here -->
  </div>
</div>
```

### **JavaScript Functionality**

**Star Rating:**
- Hover effect highlights stars
- Click submits rating via AJAX
- Thank you message appears for 3 seconds
- Average rating updates dynamically

**Review Modal:**
- Opens on "Leave a Review" button click
- Closes on X button, outside click, or after submission
- Form validation before submission
- Success message displayed
- Page reloads after 2 seconds to show new review

---

## CSS Styling

### **Key CSS Classes**

**Rating Section:**
- `.rating-section` - Main container with card styling
- `.average-rating` - Displays average rating with stars
- `.star-rating-input` - Interactive star rating input
- `.star` - Individual star (hover and active states)

**Modal:**
- `.review-modal` - Full-screen overlay
- `.review-modal-content` - White card with form
- `.review-form` - Form styling with inputs

**Reviews:**
- `.recent-reviews` - Recent reviews container
- `.review-card` - Individual review card
- `.reviewer-name` - Highlighted reviewer name

**Animations:**
- Star scale on hover (1.2x)
- Modal slide-in animation
- Thank you message slide down

---

## Admin Panel Management

### **Accessing Admin Panel**

1. Navigate to: `http://127.0.0.1:8000/admin/`
2. Login with staff credentials
3. View sections:
   - **Site Ratings** - View all ratings with timestamps
   - **Site Reviews** - Manage reviews, approve/disapprove

### **Admin Features**

**Site Ratings:**
- List view: Rating value, IP address, date
- Filter by rating (1-5) and date
- Search by IP address
- Read-only timestamps

**Site Reviews:**
- List view: Name, contact, approval status, date
- Bulk approve/disapprove reviews
- Search by name, contact, review text
- Edit individual reviews
- Delete spam/inappropriate reviews

---

## Usage Guide

### **For Customers:**

1. **Rate the Website:**
   - Scroll to "Rate Our Website" section
   - Hover over stars to preview rating
   - Click desired star (1-5)
   - Thank you message appears
   - Average rating updates instantly

2. **Leave a Review:**
   - Click "Leave a Review" button
   - Fill in your name (required)
   - Optionally add email/phone
   - Write your review
   - Click "Submit Review"
   - Success message appears
   - Page refreshes to show your review

### **For Administrators:**

1. **Monitor Ratings:**
   - Login to admin panel
   - Navigate to "Site Ratings"
   - View all ratings with timestamps
   - Filter by date range or rating value
   - Export data if needed

2. **Moderate Reviews:**
   - Navigate to "Site Reviews"
   - Review submitted feedback
   - Approve appropriate reviews
   - Disapprove spam/inappropriate content
   - Edit reviews if needed
   - Delete offensive content

---

## Configuration

### **Number of Reviews Displayed**
Edit in `views.py`:
```python
recent_reviews = SiteReview.objects.filter(is_approved=True)[:5]  # Change 5 to desired number
```

### **Auto-Approval Setting**
In `models.py` SiteReview:
```python
is_approved = models.BooleanField(default=True)  # Change to False for manual approval
```

### **Star Rating Range**
Currently 1-5. To change, update:
- Model: `choices=[(i, i) for i in range(1, 6)]`
- HTML: Add/remove star elements
- JavaScript: Update star count

---

## Troubleshooting

### **Ratings Not Saving**
1. Check browser console for errors
2. Verify CSRF token in form
3. Ensure `/submit-rating/` URL is accessible
4. Check database migrations applied

### **Reviews Not Appearing**
1. Check `is_approved` field in database
2. Verify template context includes `recent_reviews`
3. Check view passes reviews to template
4. Ensure at least one review exists

### **Modal Not Opening**
1. Check JavaScript loaded correctly
2. Verify element IDs match (`leaveReviewBtn`, `reviewModal`)
3. Check browser console for errors
4. Ensure CSS v17 loaded

### **Average Rating Not Updating**
1. Check database has ratings
2. Verify `Avg` function imported in views
3. Check template receives `average_rating` context
4. Reload page to see changes

---

## Browser Compatibility

✅ **Supported Browsers:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

**Features:**
- CSS Grid & Flexbox
- Fetch API
- ES6 JavaScript
- CSS Animations
- Dark theme via CSS variables

---

## Security Considerations

1. **IP Tracking:** User IP addresses stored for abuse prevention
2. **CSRF Protection:** `@csrf_exempt` used (consider adding CSRF for production)
3. **Input Validation:** Form validation on both client and server
4. **XSS Protection:** Django auto-escapes template variables
5. **Spam Prevention:** IP tracking + manual approval option
6. **SQL Injection:** Django ORM prevents SQL injection

**Production Recommendations:**
- Add rate limiting (max ratings per IP per day)
- Implement CAPTCHA for review form
- Add profanity filter for reviews
- Enable CSRF protection
- Add honeypot field for spam bots

---

## Future Enhancements

**Planned Features:**
- [ ] Reply to reviews (admin feature)
- [ ] User can edit/delete their review
- [ ] Star rating breakdown (% of 1★, 2★, 3★, etc.)
- [ ] Helpful/Not Helpful buttons on reviews
- [ ] Sort reviews (Most Recent, Highest Rated, Most Helpful)
- [ ] Photo upload with reviews
- [ ] Email notification on new review
- [ ] Sentiment analysis of reviews
- [ ] Integration with Google Reviews
- [ ] Export reviews to PDF/CSV

---

## Files Modified

**Backend:**
- `models.py` - Added SiteRating and SiteReview models
- `admin.py` - Registered models with custom admin
- `forms.py` - Created SiteRatingForm and SiteReviewForm
- `views.py` - Added submit_rating and submit_review views
- `urls.py` - Added URL patterns for new endpoints

**Frontend:**
- `style.css` - Added 300+ lines of CSS (v17)
- `base.html` - Added rating section + JavaScript
- `Sample Kush.html` - Added rating section + JavaScript

**Database:**
- `0004_siterating_sitereview.py` - Migration file

---

## Testing Checklist

- [x] Database models created successfully
- [x] Migrations applied without errors
- [x] Admin panel displays ratings and reviews
- [x] Star rating submits and updates average
- [x] Review form validates required fields
- [x] Review modal opens and closes correctly
- [x] Thank you messages display properly
- [x] Recent reviews appear on page
- [x] Page reloads after review submission
- [x] Responsive design works on mobile
- [x] Dark theme styling applied correctly
- [x] AJAX requests work without page reload

---

## Support

For questions or issues:
1. Check this documentation
2. Review Django logs for errors
3. Inspect browser console for JS errors
4. Check database records in admin panel
5. Verify all migrations applied: `python manage.py migrate`

---

## Version History

**v1.0.0 (November 1, 2025)**
- Initial release
- Star rating system (1-5)
- Written review submission
- Admin moderation panel
- Average rating display
- Recent reviews section
- Responsive design
- Dark theme support

---

**Last Updated:** November 1, 2025
**Author:** Kush Development Team
**Django Version:** 5.2.4
**Python Version:** 3.11+
