# food-delivery-backend
Backend  for food delivery app
===========================
# Food Delivery API Documentation

Base URL: `http://localhost:5000/api`

## Response Format

Every endpoint returns the same shape:

```json
// Success
{ "success": true, "data": { ... }, "message": "..." }

// Error
{ "success": false, "message": "Description of error" }
```

## Authentication

Protected routes require:
```
Authorization: Bearer <token>
```

Token is returned from `/auth/login` and `/auth/verify-otp` inside `data`:
```json
{ "success": true, "data": { "token": "<jwt>" } }
```

---

## Auth

### POST `/auth/register`
Register a new user. Sends a 6-digit OTP to email.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "Pass@1234",
  "phone_number": "01012345678",
  "role": "Customer"
}
```
- `role` options: `Customer`, `Vendor`, `Admin`
- `phone_number` optional
- Password: 8+ chars, must include uppercase, lowercase, number, special character

**Response `201`:**
```json
{ "success": true, "message": "Registered successfully. Check your email for OTP." }
```

---

### POST `/auth/login`

**Body:**
```json
{ "email": "user@example.com", "password": "Pass@1234" }
```

**Response `200`:**
```json
{ "success": true, "message": "Login successful", "data": { "token": "<jwt>" } }
```

---

### POST `/auth/verify-otp`
Verify email after registration. Returns token on success.

**Body:**
```json
{ "email": "user@example.com", "otp": "123456" }
```

**Response `200`:**
```json
{ "success": true, "message": "Email verified successfully", "data": { "token": "<jwt>" } }
```

---

### POST `/auth/forgot-password`

**Body:**
```json
{ "email": "user@example.com" }
```

**Response `200`:**
```json
{ "success": true, "message": "OTP sent to your email" }
```

---

### POST `/auth/reset-password`

**Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "new_password": "NewPass@1234"
}
```

**Response `200`:**
```json
{ "success": true, "message": "Password reset successfully" }
```

---

## Customer Profile
> All routes protected.

### POST `/customer`
Create profile once after registration.

**Body:**
```json
{
  "first_name": "Ahmed",
  "last_name": "Ali",
  "default_address": "123 Nile St, Cairo",
  "default_latitude": 30.0444,
  "default_longitude": 31.2357
}
```

**Response `201`:**
```json
{ "success": true, "message": "Profile created successfully", "data": { ... } }
```

---

### GET `/customer`
Get logged-in customer's profile.

**Response `200`:**
```json
{ "success": true, "data": { ... } }
```

---

### PUT `/customer`
Update profile. All fields optional.

**Response `200`:**
```json
{ "success": true, "message": "Profile updated successfully", "data": { ... } }
```

---

## Vendors

### GET `/vendors`
Get all approved vendors. Public.

**Query params (optional):**
| Param | Description |
|---|---|
| `filter` | Filter by `category_id` |
| `search` | Search by store name |

**Example:** `GET /vendors?search=mama`

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "vendor_id": 1,
      "store_name": "Mama's Kitchen",
      "logo_url": "...",
      "description": "...",
      "is_open": true,
      "average_rating": 4.80,
      "delivery_fee": 20.00,
      "category_id": 2
    }
  ]
}
```

---

## Menu

### GET `/menu/vendors/:id/menu`
Get available menu items for a vendor. Public. Only returns items where `is_available = true`.

**Params:** `id` — vendor ID

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "item_id": 1,
      "vendor_id": 1,
      "name": "Pepperoni Pizza",
      "description": "...",
      "price": 80.00,
      "image_url": "...",
      "is_available": true
    }
  ]
}
```

---

## Cart
> No auth required — identified by `order_id`.

### POST `/cart/add`
Price is fetched automatically from the menu item — do not send price from frontend.

**Body:**
```json
{ "order_id": 1, "item_id": 5, "quantity": 2 }
```

**Response `201`:**
```json
{ "success": true, "message": "Item added to cart", "data": { ... } }
```

---

### PUT `/cart/update`

**Body:**
```json
{ "order_id": 1, "item_id": 5, "quantity": 3 }
```

**Response `200`:**
```json
{ "success": true, "message": "Quantity updated", "data": { ... } }
```

---

### DELETE `/cart/:order_id/:item_id`

**Response `200`:**
```json
{ "success": true, "message": "Item removed from cart" }
```

---

### GET `/cart/:order_id`
Returns cart items with menu item details joined.

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "order_item_id": 1,
      "order_id": 1,
      "item_id": 5,
      "quantity": 2,
      "unit_price": 80.00,
      "MenuItem": {
        "name": "Pepperoni Pizza",
        "description": "...",
        "image_url": "..."
      }
    }
  ]
}
```

---

### GET `/cart/:order_id/summary`

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "subtotal": 160.00,
    "deliveryFee": 20,
    "tax": 16.00,
    "total": 196.00
  }
}
```

---

## Orders
> All routes protected.

### POST `/orders`
Place an order directly with the total amount.

**Body:**
```json
{
  "total_amount": 196.00,
  "payment_method": "COD",
  "delivery_address": "123 Nile St, Cairo",
  "delivery_lat": 30.0444,
  "delivery_long": 31.2357,
  "vendor_id": 1
}
```
- `payment_method` defaults to `COD` if not provided
- Requires customer profile to exist first

**Response `201`:**
```json
{ "success": true, "message": "Order placed successfully", "data": { ... } }
```

---

### GET `/orders/my-orders`
Get all orders for logged-in customer, newest first.

**Response `200`:**
```json
{ "success": true, "data": [ { ... } ] }
```

---

### GET `/orders/:order_id`

**Response `200`:**
```json
{ "success": true, "data": { ... } }
```

---

### PUT `/orders/:order_id/status`
Update order status.

**Body:**
```json
{ "status": "Preparing" }
```

**Response `200`:**
```json
{ "success": true, "message": "Order status updated", "data": { ... } }
```

---

### PUT `/orders/:order_id/cancel`
Cancel a pending order only.

**Response `200`:**
```json
{ "success": true, "message": "Order cancelled successfully" }
```

---

## Reviews
> Add review and get my reviews are protected. Get vendor reviews is public.

### POST `/reviews`
Order must be `Delivered` and not already reviewed.

**Body:**
```json
{
  "rating": 5,
  "comment": "Great food!",
  "order_id": 1,
  "vendor_id": 1
}
```

**Response `201`:**
```json
{ "success": true, "message": "Review added successfully", "data": { ... } }
```

---

### GET `/reviews/vendor/:vendor_id`
Public.

**Response `200`:**
```json
{ "success": true, "data": [ { ... } ] }
```

---

### GET `/reviews/my-reviews`

**Response `200`:**
```json
{ "success": true, "data": [ { ... } ] }
```

---

## Dashboard (Vendor)
> All routes protected.

### GET `/dashboard/:vendor_id/orders`
Get all orders for a vendor, newest first.

**Response `200`:**
```json
{ "success": true, "data": [ { ... } ] }
```

---

### PUT `/dashboard/orders/:order_id/status`

**Body:**
```json
{ "status": "Preparing" }
```

**Response `200`:**
```json
{ "success": true, "message": "Status updated", "data": { ... } }
```

---

### POST `/dashboard/menu`
Add a new menu item.

**Body:**
```json
{
  "name": "Margherita Pizza",
  "description": "Classic tomato and mozzarella",
  "price": 80.00,
  "image_url": "https://...",
  "vendor_id": 1
}
```

**Response `201`:**
```json
{ "success": true, "message": "Menu item added", "data": { ... } }
```

---

### PUT `/dashboard/menu/:item_id`
All fields optional.

**Body:**
```json
{
  "name": "...",
  "description": "...",
  "price": 90.00,
  "image_url": "...",
  "is_available": true
}
```

**Response `200`:**
```json
{ "success": true, "message": "Menu item updated", "data": { ... } }
```

---

### DELETE `/dashboard/menu/:item_id`

**Response `200`:**
```json
{ "success": true, "message": "Menu item deleted" }
```

---

### GET `/dashboard/:vendor_id/stats`

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "totalOrders": 42,
    "revenue": "3400.00",
    "avgRating": "4.75"
  }
}
```

---

## Error Responses

All errors follow this shape:
```json
{ "success": false, "message": "Description of what went wrong" }
```

| Status | Meaning |
|---|---|
| `400` | Validation error / bad request |
| `401` | Not authenticated |
| `403` | Token invalid or expired |
| `404` | Resource not found |
| `500` | Server error |