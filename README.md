##  Next.js Portfolio Website and Admin Panel 

This project showcases a personal portfolio website built using Next.js with Tailwind CSS. It also features an admin panel for managing the website content.

### Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Development Server](#running-the-development-server)
- [Usage](#usage)
  - [Portfolio Website](#portfolio-website)
  - [Admin Panel](#admin-panel)
- [Contributing](#contributing)
- [License](#license)

### Features

- **Portfolio Website:**
  - Interactive profile section with typing animation and social links.
  - Accordion-based About Me section with details on education, skills, and achievements.
  - Skill card component for showcasing expertise with level indication.
  - Project card component for showcasing completed projects with interactive details.
  - Categorized project display with tag-based filtering.
  - Engaging blog section with latest posts and a link to view all posts.
  - Contact section with a form for sending messages and social links.
  - Responsive design for various screen sizes.

- **Admin Panel:**
  - Secure login with email and password authentication.
  - User management with registration and password reset functionality.
  - Email verification for new users.
  - Content management for blog posts with advanced editor and AI assistance.
  - Rich text editor with features like formatting, headings, lists, code blocks, and image upload.
  - AI-powered title suggestions, outline generation, content writing, and description writing.
  - Integration with Canva API for managing designs and exporting them.
  - Excalidraw integration for creating and managing diagrams.
  - File upload and management using AWS S3.
  - Contact message listing and management.

### Tech Stack

- **Frontend:**
  - Next.js
  - React
  - Tailwind CSS
  - Novel (Rich Text Editor)
  - Embla Carousel React
  - Recharts
  - Radix UI (Components)
  - Lucide React (Icons)
  - Sonner (Toasts)

- **Backend:**
  - Node.js
  - Next.js API Routes
  - Prisma (Database ORM)
  - PostgreSQL (Database)
  - bcrypt (Password Hashing)
  - NextAuth.js (Authentication)
  - AWS SES (Email Service)
  - AWS S3 (File Storage)
  - Canva Connect API
  - Google Generative AI API

### Getting Started

#### Prerequisites

- Node.js >= 16
- npm >= 8 / yarn
- PostgreSQL installed locally or a cloud instance

#### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/project.git
   ```
2. Navigate to the project directory:
   ```bash
   cd project
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up environment variables:
   - Create a `.env` file:
     ```env
     DATABASE_URL=postgres://username:password@host:port/database_name
     NEXTAUTH_SECRET=your-secret
     CANVA_CLIENT_ID=your-canva-client-id
     CANVA_CLIENT_SECRET=your-canva-client-secret
     BASE_CANVA_CONNECT_API_URL=https://api.canva.com
     AWS_ACCESS_KEY_ID=your-aws-access-key-id
     AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
     AWS_REGION=your-aws-region
     S3_BUCKET_NAME=your-s3-bucket-name
     EMAIL_SENDER_ADDRESS=your-email-sender-address
     GEMINI_API_KEY=your-gemini-api-key
     ```
   - Replace the placeholder values with your actual credentials.

#### Running the Development Server

1. Start the development server:
   ```bash
   npm run dev
   ```
   - The portfolio website will be accessible at: `http://localhost:3000`
   - The admin panel will be accessible at: `http://localhost:3000/admin`

### Usage

#### Portfolio Website

- Navigate to `http://localhost:3000` to view the portfolio website.
- Explore different sections of the website.
- Click on project cards to view detailed information.
- Fill out the contact form to get in touch.

#### Admin Panel

1. Access the admin panel at `http://localhost:3000/admin`.
2. Login using the email and password you used for registration.
3. Manage content for blog posts:
   - Create new posts.
   - Edit existing posts.
   - Delete posts.
   - Use the AI-powered features to enhance writing efficiency.
4. Manage Canva designs:
   - Create new designs.
   - View existing designs.
   - Edit designs in Canva.
   - Export designs as images or PDFs.
5. Manage diagrams:
   - Create new diagrams using Excalidraw.
   - Edit existing diagrams.
6. Manage uploaded media:
   - Upload files to AWS S3.
   - View uploaded files.
   - Download uploaded files.
7. Manage contact messages:
   - View received messages.
   - Delete messages.

### Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-name`).
3. Commit your changes (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature-name`).
5. Create a pull request.

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 