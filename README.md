# Wanderlust

Wanderlust is a full-stack travel listing platform inspired by Airbnb-style accommodation discovery. It allows users to browse unique stays, search by destination, filter by category, post new listings, and leave reviews for properties they have visited.

The application combines a secure Express backend, MongoDB data storage, EJS views, and third-party services for geocoding and image management.

## ✨ Features

- Search and filter listings by destination, category, and keywords
- Create, update, and delete travel listings
- Secure user authentication with Passport.js
- Review and rating system for each listing
- Cloudinary-powered image uploads
- MapTiler geocoding for location validation and mapping
- Flash messaging for user feedback
- MongoDB-backed session handling
- Rate limiting and security headers for production readiness

## 🛠️ Tech Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- EJS + EJS Mate
- Passport.js
- Cloudinary
- MapTiler API
- Helmet
- Express Rate Limit
- Connect Mongo

## 📁 Project Structure

```text
Wandarlust/
├── app.js
├── cloudConfig.js
├── middleware.js
├── package.json
├── schema.js
├── controllers/
│   ├── listings.js
│   ├── reviews.js
│   └── users.js
├── init/
│   ├── data.js
│   ├── featuredData.js
│   └── index.js
├── models/
│   ├── listing.js
│   ├── reviews.js
│   └── user.js
├── public/
│   ├── css/
│   └── js/
├── routes/
│   ├── listings.js
│   ├── reviews.js
│   └── users.js
├── tests/
│   └── app.test.js
├── utils/
│   ├── ExpressError.js
│   └── sanitizeRedirect.js
├── views/
│   ├── error.ejs
│   ├── includes/
│   ├── layouts/
│   ├── listings/
│   └── users/
```

## 🚀 Getting Started

### Prerequisites

Before running the app, make sure you have:

- Node.js 24.18.1 or newer
- MongoDB Atlas or a local MongoDB instance
- A Cloudinary account
- A MapTiler API key

### Environment Variables

Create a `.env` file in the project root with the following variables:

```env
ATLASDBURL=your_mongodb_connection_string
SECRET=your_session_secret
MAP_API_KEY=your_maptiler_api_key
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret
PORT=8080
NODE_ENV=development
MONGO_DNS_SERVERS=1.1.1.1,8.8.8.8  # optional
```

Set these values as environment variables in your deployment platform. Keep `.env` local and never commit credentials. Set `NODE_ENV=production` in production.

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd Wandarlust
```

2. Install dependencies

```bash
npm install
```

### Running the App

```bash
npm start
```

Then open:

```text
http://localhost:8080
```

To load the development demo listings and accounts, set `SEED_DEMO_PASSWORD` to a strong local password and run `npm run seed`. The seeder refuses to run when `NODE_ENV=production`.

## 🧭 Main Routes

- `/` → Redirects to the listings home page
- `/listings` → Browse all listings
- `/listings/new` → Create a new listing
- `/listings/:id` → View listing details
- `/signup` → Register a new account
- `/login` → Log in to the app
- `/logout` → Log the current user out

## 🧪 Notes

- The project uses ES modules and is configured with `"type": "module"`.
- Listing images are uploaded to Cloudinary instead of local storage.
- Sessions are persisted in MongoDB via `connect-mongo`.
- The server automatically starts only outside the test environment.
- Run `npm test` to execute the automated tests.

## 📜 License

This project is licensed under the ISC License.

## 👥 Contributors

This project was built as a web development application for travel listing management and user-generated content.
