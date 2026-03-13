# Urbanek Scholarship API - Complete Backend

## 📦 Package Contents

This package contains all Azure Functions for the Urbanek Scholarship Application system.

### Functions Included (12 total):

#### Authentication (2):
- `authLogin` - User login with JWT
- `authMe` - Get current user info

#### Applications (5):
- `submitApplication` - Student submits application
- `getMyApplications` - Student views their applications  
- `getAllApplications` - Reviewers/admins view all applications
- `updateApplicationStatus` - Approve/reject applications
- `withdrawApplication` - Student withdraws application
- `downloadApplication` - Download application as HTML

#### Admin (4):
- `adminGetStats` - Get application statistics
- `adminGetUsers` - List all users
- `adminCreateUser` - Create new user
- `adminDeleteUser` - Delete user

### Support Files:
- `middleware/auth.js` - JWT authentication
- `utils/database.js` - SQL database connection
- `utils/storage.js` - Azure Blob Storage
- `package.json` - Dependencies
- `host.json` - Azure Functions configuration

---

## 🚀 Deployment Instructions

### Method 1: VS Code (Recommended)

1. **Extract this ZIP file**
2. **Open folder in VS Code**
3. **Install Azure Functions extension**
4. **Right-click on folder** → "Deploy to Function App"
5. **Select:** urbanek-api-av
6. **Wait 2-3 minutes**
7. **Verify:** Azure Portal → Functions → Should see 12 functions

### Method 2: Azure Portal

1. **Go to:** Azure Portal → Function Apps → urbanek-api-av
2. **Deployment Center** → External Git or ZIP Deploy
3. **Upload this ZIP**
4. **Wait for deployment**

---

## ⚙️ Environment Variables Required

Set these in Azure Portal → Configuration → Application Settings:

```
SQL_SERVER=urbanek-server-av-2025.database.windows.net
SQL_DATABASE=urbanek-db
SQL_USER=urbanekadmin
SQL_PASSWORD=<your-password>
JWT_SECRET=<your-secret-key>
AZURE_STORAGE_CONNECTION_STRING=<your-connection-string>
AZURE_STORAGE_CONTAINER_NAME=urbanek-uploads
```

---

## 🧪 Testing After Deployment

### 1. Check Functions List
```
Azure Portal → urbanek-api-av → Functions
Should see 12 functions listed
```

### 2. Test Login
```bash
POST https://urbanek-api-av-eghuaph6e2fxgvdw.westus-01.azurewebsites.net/api/auth/login
Content-Type: application/json

{
  "email": "admin@test.com",
  "password": "password123"
}
```

Expected: 200 OK with JWT token

### 3. Test Download (with token from login)
```
https://urbanek-api-av-eghuaph6e2fxgvdw.westus-01.azurewebsites.net/api/applications/1/download?token=YOUR_TOKEN
```

Expected: HTML file downloads

---

## 🔧 Key Features

### Role-Based Access:
- **Student:** Submit, view own, withdraw
- **Reviewer:** View all, approve/reject
- **Admin:** Everything + user management

### Security:
- JWT authentication
- Token expiry: 24 hours
- Role validation on every endpoint
- SQL injection protection

### File Handling:
- Upload to Azure Blob Storage
- Supports: JPG, PNG, PDF, DOCX
- Max size: 10MB per file

---

## 📋 API Endpoints Summary

| Endpoint | Method | Auth | Role | Description |
|----------|--------|------|------|-------------|
| `/api/auth/login` | POST | No | Any | Login |
| `/api/auth/me` | GET | Yes | Any | Current user |
| `/api/applications/submit` | POST | Yes | Student | Submit app |
| `/api/applications/my-applications` | GET | Yes | Student | View own |
| `/api/applications/all` | GET | Yes | Reviewer/Admin | View all |
| `/api/applications/{id}/status` | PUT | Yes | Reviewer/Admin | Update status |
| `/api/applications/{id}/withdraw` | DELETE | Yes | Student | Withdraw |
| `/api/applications/{id}/download` | GET | Yes | Reviewer/Admin | Download HTML |
| `/api/admin/stats` | GET | Yes | Reviewer/Admin | Statistics |
| `/api/admin/users` | GET | Yes | Admin | List users |
| `/api/admin/users` | POST | Yes | Admin | Create user |
| `/api/admin/users/{id}` | DELETE | Yes | Admin | Delete user |

---

## 🐛 Troubleshooting

### Functions Not Showing Up?
- Wait 2-3 minutes after deployment
- Refresh Azure Portal
- Check Deployment Center → Logs

### 401 Unauthorized?
- Token expired (login again)
- Token not in request
- Check `Authorization: Bearer <token>` header

### 403 Forbidden?
- Correct token but wrong role
- Check user role in database
- Reviewers can't access admin endpoints

### 500 Internal Server Error?
- Check Application Insights logs
- Verify environment variables set
- Check database connection

### Download Not Working?
- Ensure `downloadApplication` function deployed
- Check token in URL: `?token=XXX`
- Token must be from reviewer/admin
- Use `fetch()` not `window.open()` in frontend

---

## 📊 Database Schema Required

Ensure these tables exist:

### Users Table:
```sql
user_id, email, password_hash, role, full_name, created_at
```

### Applications Table:
```sql
application_id, student_id, first_name, last_name, birthday, gender,
email, phone, home_address, city, state_province, country, zip_postal_code,
kla_parent_name, position, department, second_parent_name, second_parent_occupation,
gpa_weighted, gpa_non_weighted, class_rank, sat_act_score,
university_preference_1, university_preference_2, university_preference_3, possible_major,
activity_summary, family_income_2023, family_income_2024, number_of_siblings,
siblings_in_college, personal_statement, photo_url, transcript_url, personal_statement_attachment,
parent_guardian_name, parent_guardian_signature, student_name_confirmation,
signature_date, terms_accepted, status, submitted_at, reviewed_at, reviewer_notes
```

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] 12 functions visible in Azure Portal
- [ ] Login endpoint works (returns token)
- [ ] Can fetch applications with token
- [ ] Download endpoint returns HTML
- [ ] Students can submit applications
- [ ] Reviewers can approve/reject
- [ ] Admin panel works

---

## 📞 Support

If issues persist:
1. Check Application Insights logs
2. Verify all environment variables
3. Test each endpoint with Postman
4. Check database connectivity

---

**Last Updated:** February 7, 2026
**Version:** 2.0.0 (Complete with Download Feature)
