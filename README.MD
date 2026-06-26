# VidStream Backend

## Overview

VidStream Backend is a scalable RESTful API for a video-sharing platform inspired by YouTube. The project is built using Node.js, Express.js, MongoDB, and Cloudinary, with a strong focus on authentication, authorization, media management, and efficient database operations.

The backend provides APIs for user management, video publishing, subscriptions, playlists, likes, comments, tweets, watch history, and dashboard analytics while following a clean MVC architecture and RESTful design principles.

**Repository:** https://github.com/VaibhavKhandelwal-git/First-Backend/tree/main

---

# Features

## Authentication & Authorization

* User Registration
* User Login
* JWT Authentication
* Access Token & Refresh Token Generation
* Refresh Token Rotation
* HTTP-Only Cookie Authentication
* User Logout
* Change Password
* Protected Routes
* Ownership Validation

---

## User Management

* Update Account Details
* Update Avatar
* Update Cover Image
* View User Profile
* Watch History

---

## Video Management

* Publish Videos
* Update Video Details
* Delete Videos
* Toggle Public / Private Visibility
* Track Video Views
* Fetch Channel Videos
* Pagination
* Sorting

---

## Comments

* Add Comment
* Update Comment
* Delete Comment
* Fetch Video Comments

---

## Likes

* Like / Unlike Videos
* Like / Unlike Comments
* Like / Unlike Tweets
* Fetch Liked Videos

---

## Subscriptions

* Subscribe to Channels
* Unsubscribe from Channels
* Fetch Subscribers
* Fetch Subscribed Channels

---

## Playlists

* Create Playlist
* Update Playlist
* Delete Playlist
* Add Videos to Playlist
* Remove Videos from Playlist
* Fetch Playlist Details

---

## Tweets

* Create Tweet
* Update Tweet
* Delete Tweet
* Fetch User Tweets

---

## Dashboard

* Channel Statistics
* Total Videos
* Total Views
* Total Likes
* Dashboard Analytics

---

# Tech Stack

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* Mongoose

### Authentication

* JSON Web Tokens (JWT)
* Refresh Tokens
* bcrypt

### Media Management

* Cloudinary
* Multer

---

# Project Structure

```text
src/
│
├── controllers/
├── db/
├── middlewares/
├── models/
├── routes/
├── utils/
├── constants/
├── app.js
└── index.js
```

---

# Architecture

The project follows the MVC (Model-View-Controller) architecture.

```text
                Client
                   │
                   ▼
           Express Routes
                   │
                   ▼
             Controllers
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
   MongoDB               Cloudinary
    (Database)         (Media Storage)
```

---

# Major Backend Concepts

* RESTful API Design
* MVC Architecture
* JWT Authentication
* Refresh Token Strategy
* Authorization
* Middleware
* MongoDB Aggregation Pipelines
* Pagination
* Sorting
* File Uploads
* Cloudinary Integration
* Error Handling
* Async Programming

---

# Aggregation Pipelines

MongoDB Aggregation Pipelines are used throughout the project to efficiently retrieve and process complex relational data.

Examples include:

* Video Details
* Channel Videos
* Liked Videos
* Dashboard Statistics
* Subscription Information
* Like Counts
* Comment Counts
* Owner Information

---

# Security

The backend implements several security practices, including:

* Password Hashing using bcrypt
* JWT Authentication
* Refresh Token Rotation
* HTTP-Only Cookies
* Ownership Validation
* Protected Routes
* Input Validation
* Secure File Uploads
* Cloudinary Resource Cleanup

---

# Installation

Clone the repository.

```bash
git clone https://github.com/VaibhavKhandelwal-git/First-Backend.git
```

Navigate into the project.

```bash
cd First-Backend
```

Install dependencies.

```bash
npm install
```

Run the development server.

```bash
npm run dev
```

---

# API Modules

The backend exposes REST APIs for:

* Authentication
* Users
* Videos
* Comments
* Likes
* Subscriptions
* Playlists
* Tweets
* Dashboard

---

# What I Learned

Through this project I gained practical experience in:

* Designing scalable RESTful APIs
* Implementing secure authentication using JWT access and refresh tokens
* Building authorization and ownership-based access control
* Designing MongoDB schemas and relationships
* Writing complex MongoDB aggregation pipelines
* Managing media uploads using Cloudinary and Multer
* Implementing pagination, sorting, filtering, and search-ready APIs
* Structuring backend applications using the MVC architecture
* Building reusable middleware and utility functions
* Following clean coding practices and modular project organization

---

# Future Improvements

* Video Streaming
* Video Recommendations
* Search Functionality
* Notifications
* Live Streaming
* Docker Support
* CI/CD Pipeline
* Automated Testing
* API Documentation using Swagger/OpenAPI

---

# Author

**Vaibhav Khandelwal**

GitHub: https://github.com/VaibhavKhandelwal-git

---

# License

This project is intended for educational purposes and to demonstrate backend development concepts using the MERN stack.
