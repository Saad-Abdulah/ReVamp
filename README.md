# PDF Template Designer & Generator

A comprehensive PDF template designer and generator built with Laravel + Vue 3, featuring drag-and-drop field placement powered by @pdfme/ui and secure PDF generation via @pdfme/generator.

## 🚀 Features

### Core Features
- **PDF Template Upload**: Upload custom PDF templates (max 10MB) with secure S3 storage
- **Visual Template Editor**: Drag-and-drop interface powered by @pdfme/ui for field placement
- **Field Types Support**: Text, multi-line text, checkboxes, radio groups, select dropdowns, signatures, images, and date/time
- **User-Specific Templates**: Each user can save and manage their own labeled templates
- **PDF Generation API**: Generate flattened, customized PDFs on demand via API endpoints
- **AWS S3 Integration**: Secure storage for templates and generated documents
- **Authentication & Authorization**: Laravel Sanctum for secure API access
- **Modern UI**: Beautiful, responsive interface built with Vue 3 and Tailwind CSS

### Security Features
- **User Isolation**: Complete separation of user data and templates
- **Token-based Authentication**: Secure API access with Laravel Sanctum
- **File Upload Validation**: PDF type and size validation (max 10MB)
- **S3 Encryption**: Server-side encryption for stored files

### Self-Service Automation
- Complete workflow from upload → design → save → generate
- No third-party dependencies for PDF operations
- Full control over document automation pipeline

## 🛠 Tech Stack

### Backend
- **Laravel 10**: PHP web application framework
- **Laravel Sanctum**: API authentication
- **MySQL**: Database for user and template management
- **AWS S3**: File storage with encryption
- **Node.js**: PDF generation worker

### Frontend
- **Vue 3**: Progressive JavaScript framework
- **Vite**: Build tool and dev server
- **Pinia**: State management
- **Vue Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **@pdfme/ui**: PDF template visual editor
- **@pdfme/generator**: PDF generation engine
- **Axios**: HTTP client

## 📋 Prerequisites

- PHP 8.1+
- Node.js 16+
- Composer
- MySQL 8.0+
- AWS S3 bucket (for file storage)

## 🔧 Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd mergepdf
```

### 2. Install PHP Dependencies
```bash
composer install
```

### 3. Install Node.js Dependencies
```bash
npm install
```

### 4. Environment Configuration
```bash
cp env.example .env
```

Edit `.env` file and configure:

```env
# Application
APP_NAME="PDF Template Designer"
APP_ENV=local
APP_KEY=base64:YOUR_APP_KEY_HERE
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=mergepdf
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=your-s3-bucket-name

# Sanctum Configuration
SANCTUM_STATEFUL_DOMAINS=localhost:3000,127.0.0.1:3000

# PDF Configuration
MAX_PDF_SIZE=10485760
PDF_STORAGE_DISK=s3
```

### 5. Generate Application Key
```bash
php artisan key:generate
```

### 6. Run Database Migrations
```bash
php artisan migrate
```

### 7. Build Frontend Assets
```bash
npm run build
```

## 🚀 Development

### Start Development Servers

**Backend (Laravel):**
```bash
php artisan serve
```

**Frontend (Vite):**
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api

### Development Workflow

1. **Upload PDF Template**: Use the templates page to upload a PDF file
2. **Design Template**: Use the visual editor to place and configure fields
3. **Save Template**: Save your template configuration for reuse
4. **Generate PDFs**: Call the API endpoint with data to generate filled PDFs

## 📝 API Documentation

### Authentication Endpoints

```bash
# Register
POST /api/auth/register
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "password",
  "password_confirmation": "password"
}

# Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password"
}

# Logout
POST /api/auth/logout
Authorization: Bearer {token}

# Get User
GET /api/auth/user
Authorization: Bearer {token}
```

### Template Management

```bash
# List Templates
GET /api/templates
Authorization: Bearer {token}

# Upload Template
POST /api/templates
Authorization: Bearer {token}
Content-Type: multipart/form-data
{
  "pdf_file": file,
  "name": "Template Name",
  "description": "Template Description"
}

# Get Template
GET /api/templates/{id}
Authorization: Bearer {token}

# Update Template Fields
PUT /api/templates/{id}/fields
Authorization: Bearer {token}
{
  "fields_config": [
    {
      "name": "field_name",
      "type": "text",
      "position": {"x": 100, "y": 200},
      "width": 150,
      "height": 25,
      "fontSize": 12,
      "fontColor": "#000000"
    }
  ]
}

# Delete Template
DELETE /api/templates/{id}
Authorization: Bearer {token}
```

### PDF Generation

```bash
# Generate PDF
POST /api/generate/{template_id}
Authorization: Bearer {token}
{
  "data": {
    "field_name": "Field Value",
    "another_field": "Another Value"
  },
  "filename": "generated_document.pdf"
}

# List Generated PDFs
GET /api/generate
Authorization: Bearer {token}

# Download Generated PDF
GET /api/generate/{generated_pdf_id}/download
Authorization: Bearer {token}

# Delete Generated PDF
DELETE /api/generate/{generated_pdf_id}
Authorization: Bearer {token}
```

## 🔒 Security Considerations

### Authentication
- All API endpoints (except auth) require Bearer token authentication
- Tokens are managed by Laravel Sanctum
- Users can only access their own templates and generated PDFs

### File Upload Security
- PDF files only (MIME type validation)
- Maximum file size: 10MB
- Files stored in user-specific S3 directories
- Server-side encryption enabled

### Data Isolation
- Complete user data separation
- Database foreign key constraints
- API-level authorization checks

## 🌐 Deployment

### Production Environment Setup

1. **Server Requirements**
   - PHP 8.1+ with required extensions
   - Node.js 16+ for PDF generation worker
   - MySQL 8.0+
   - Web server (Nginx/Apache)
   - SSL certificate

2. **Environment Configuration**
   ```env
   APP_ENV=production
   APP_DEBUG=false
   APP_URL=https://yourdomain.com
   
   # Use production database credentials
   DB_HOST=your_production_db_host
   DB_DATABASE=your_production_db
   DB_USERNAME=your_production_db_user
   DB_PASSWORD=your_production_db_password
   
   # Production S3 configuration
   AWS_ACCESS_KEY_ID=your_production_access_key
   AWS_SECRET_ACCESS_KEY=your_production_secret_key
   AWS_BUCKET=your_production_bucket
   
   # Set stateful domains for your production URLs
   SANCTUM_STATEFUL_DOMAINS=yourdomain.com,www.yourdomain.com
   ```

3. **Deployment Steps**
   ```bash
   # Install dependencies
   composer install --optimize-autoloader --no-dev
   npm ci --production
   
   # Build production assets
   npm run build
   
   # Run migrations
   php artisan migrate --force
   
   # Cache configuration
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   
   # Set proper permissions
   chmod -R 755 storage bootstrap/cache
   ```

### Web Server Configuration

**Nginx Example:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /path/to/your/app/public;
    index index.php index.html;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.ht {
        deny all;
    }
}
```

## 🧪 Testing

### Running Tests
```bash
# Backend tests
php artisan test

# Frontend tests (if configured)
npm run test
```

### Manual Testing Workflow

1. Register a new user account
2. Login and verify authentication
3. Upload a PDF template
4. Use the visual editor to add fields
5. Save the template configuration
6. Generate a PDF with sample data
7. Download and verify the generated PDF

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, please create an issue in the repository or contact the development team.

## 🔄 Changelog

### Version 1.0.0
- Initial release with complete PDF template designer and generator
- Laravel + Vue 3 stack implementation
- @pdfme/ui integration for visual editing
- AWS S3 storage integration
- Laravel Sanctum authentication
- Comprehensive API endpoints
- Modern, responsive UI 