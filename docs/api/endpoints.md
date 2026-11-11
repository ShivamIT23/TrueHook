# TrueHook API Endpoints

## Authentication (`/api/v1/auth`)

### Register
- **Path**: `POST /api/v1/auth/register` (or `/auth/register`)
- **Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "securepassword123"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "status": 201,
    "message": "User registered successfully",
    "data": {
      "user": {
        "id": "uuid",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "logo_url": "",
        "created_at": "2026-11-09T22:00:00Z"
      },
      "token": "jwt-token"
    }
  }
  ```

### Login
- **Path**: `POST /api/v1/auth/login` (or `/auth/login`)
- **Body**:
  ```json
  {
    "email": "jane@example.com",
    "password": "securepassword123"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "status": 200,
    "message": "Authentication successful",
    "data": {
      "user": {
        "id": "uuid",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "logo_url": "",
        "created_at": "2026-11-09T22:00:00Z"
      },
      "token": "jwt-token"
    }
  }
  ```

---

## Applications (`/api/v1/application`)

### Create Application
- **Path**: `POST /api/v1/application/create` (or `/application/create`)
- **Headers**: `Authorization: Bearer <jwt-token>`
- **Body**:
  ```json
  {
    "name": "Billing Service",
    "description": "Production billing webhook emitter",
    "logo_url": "https://example.com/icons/billing.png"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "status": 201,
    "message": "Application created successfully",
    "data": {
      "id": "uuid",
      "name": "Billing Service",
      "description": "Production billing webhook emitter",
      "logo_url": "https://example.com/icons/billing.png",
      "created_at": "2026-11-09T22:00:00Z"
    }
  }
  ```

### Update Application
- **Path**: `PUT /api/v1/application/{id}` (or `/application/{id}`)
- **Headers**: `Authorization: Bearer <jwt-token>`
- **Body**:
  ```json
  {
    "name": "Billing Service Updated",
    "description": "Updated billing webhook emitter",
    "logo_url": "https://example.com/icons/billing-v2.png"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "status": 200,
    "message": "Application updated successfully",
    "data": {
      "id": "uuid",
      "name": "Billing Service Updated",
      "description": "Updated billing webhook emitter",
      "logo_url": "https://example.com/icons/billing-v2.png",
      "created_at": "2026-11-09T22:00:00Z"
    }
  }
  ```

### Get Application
- **Path**: `GET /api/v1/application/{id}` (or `/application/{id}`)
- **Headers**: `Authorization: Bearer <jwt-token>`
- **Response**: `200 OK`

### List Applications
- **Path**: `GET /api/v1/application` (or `/application`)
- **Headers**: `Authorization: Bearer <jwt-token>`
- **Response**: `200 OK`
  ```json
  {
    "status": 200,
    "message": "Retrieving successful",
    "data": {
      "applications": [
        {
          "id": "uuid",
          "name": "Billing Service",
          "description": "Production billing webhook emitter",
          "logo_url": "https://example.com/icons/billing.png",
          "created_at": "2026-11-09T22:00:00Z"
        }
      ]
    }
  }
  ```

### Delete Application
- **Path**: `DELETE /api/v1/application/{id}` (or `/application/{id}`)
- **Headers**: `Authorization: Bearer <jwt-token>`
- **Response**: `200 OK`


---

## Endpoints (`/api/v1/application/{application_id}/endpoint`)

### Create Endpoint
- **Path**: `POST /api/v1/application/{application_id}/endpoint/create` (or `/application/{application_id}/endpoint/create`)
- **Headers**: `Authorization: Bearer <jwt-token>`
- **Body**:
  ```json
  {
    "url": "https://example.com/webhook",
    "secret_encrypted": "whsec_..."
  }
  ```
- **Response**: `201 Created`

### Update Endpoint
- **Path**: `PUT /api/v1/application/{application_id}/endpoint/{endpoint_id}` (or `/application/{application_id}/endpoint/{endpoint_id}`)
- **Headers**: `Authorization: Bearer <jwt-token>`
- **Body**:
  ```json
  {
    "url": "https://example.com/webhook-v2",
    "secret_encrypted": "whsec_...",
    "enabled": true
  }
  ```
- **Response**: `200 OK`

### List Application Endpoints
- **Path**: `GET /api/v1/application/{application_id}/endpoint` (or `/application/{application_id}/endpoint`)
- **Headers**: `Authorization: Bearer <jwt-token>`
- **Response**: `200 OK`

### Delete Endpoint
- **Path**: `DELETE /api/v1/application/{application_id}/endpoint/{endpoint_id}` (or `/application/{application_id}/endpoint/{endpoint_id}`)
- **Headers**: `Authorization: Bearer <jwt-token>`
- **Response**: `200 OK`


---

## Users (`/api/v1/user`)

### Update User Profile
- **Path**: `PUT /api/v1/user` (or `/user`)
- **Headers**: `Authorization: Bearer <jwt-token>`
- **Body**:
  ```json
  {
    "name": "Jane Updated",
    "email": "jane_updated@example.com",
    "logo_url": "https://example.com/avatars/jane.png",
    "password": "newSecurePassword123"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "status": 200,
    "message": "User updated successfully",
    "data": {
      "id": "uuid",
      "name": "Jane Updated",
      "email": "jane_updated@example.com",
      "logo_url": "https://example.com/avatars/jane.png",
      "created_at": "2026-11-09T22:00:00Z"
    }
  }
  ```

### Get User Profile
- **Path**: `GET /api/v1/user` (or `/user`)
- **Headers**: `Authorization: Bearer <jwt-token>`
- **Response**: `200 OK`
  ```json
  {
    "status": 200,
    "message": "User retrieved successfully",
    "data": {
      "id": "uuid",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "logo_url": "https://example.com/avatars/jane.png",
      "created_at": "2026-11-09T22:00:00Z"
    }
  }
  ```


---

## Admin (`/api/v1/admin`)

### Admin Login
- **Path**: `POST /api/v1/admin/login` (or `/admin/login`)
- **Body**:
  ```json
  {
    "email": "admin@truehook.internal",
    "password": "adminPassword123"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "status": 200,
    "message": "Admin authentication successful",
    "data": {
      "admin": {
        "id": "uuid",
        "name": "Super Admin",
        "email": "admin@truehook.internal",
        "created_at": "2026-11-09T22:00:00Z"
      },
      "token": "jwt-token-with-admin-role"
    }
  }
  ```

### Admin Get All Users
- **Path**: `GET /api/v1/admin/users` (or `/admin/users`)
- **Headers**: `Authorization: Bearer <admin-jwt-token>`
- **Response**: `200 OK`
  ```json
  {
    "status": 200,
    "message": "Users retrieved successfully",
    "data": {
      "users": [
        {
          "id": "uuid",
          "name": "Jane Doe",
          "email": "jane@example.com",
          "logo_url": "https://example.com/avatars/jane.png",
          "created_at": "2026-11-09T22:00:00Z"
        }
      ]
    }
  }
  ```

### Admin Get User By ID
- **Path**: `GET /api/v1/admin/users/{id}` (or `/admin/users/{id}`)
- **Headers**: `Authorization: Bearer <admin-jwt-token>`
- **Response**: `200 OK`
  ```json
  {
    "status": 200,
    "message": "User retrieved successfully",
    "data": {
      "id": "uuid",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "logo_url": "https://example.com/avatars/jane.png",
      "created_at": "2026-11-09T22:00:00Z"
    }
  }
  ```
