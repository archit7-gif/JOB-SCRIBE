

# 🎯 JobScribe

### AI Resume Optimizer & Job Application Tracker

🔗 **Live Demo:** [https://jobscribe.vercel.app](https://job-scribe-neon.vercel.app)

---

## 🚀 Overview

**JobScribe** is a **full-stack MERN application** that helps job seekers **analyze resumes, optimize them for specific job descriptions, and track job applications in one place**.

It combines **AI-assisted resume evaluation** with a **structured job-tracking system**, solving both resume quality and application management problems together.

---

## 🎯 What Problem It Solves

* Generic resumes that fail ATS screening
* No clear feedback on resume weaknesses
* Manual resume editing for every job
* Poor tracking of job applications and interviews

---

## ✨ Key Features

### 🤖 AI Resume Analysis

* Resume + job description analysis using **Google Gemini**
* Match score (0–100%)
* Missing keywords & improvement suggestions
* Section-wise feedback (skills, experience, summary)

### ✍️ Resume Optimization

* AI-assisted resume rewriting
* ATS-friendly keyword integration
* Optimized resumes ready for download
* Caching to reduce repeated AI calls and rate-limit issues

### 💼 Job Application Tracker

* Track applications by status:
  **Saved → Applied → Interview → Offer / Rejected**
* Store company details and job descriptions
* Visual status indicators for quick review

### 📝 Notes & Interview Prep

* Save interview notes and company research
* Organize preparation per application

---

## 🧰 Tech Stack (Clear & Direct)

### 🖥️ Frontend

* React.js
* Redux Toolkit
* React Router
* Axios

### ⚙️ Backend

* Node.js
* Express.js
* MongoDB (Mongoose)
* JWT Authentication + bcrypt

### 🤖 AI & Utilities

* Google Gemini API
* File uploads
* Rate limiting & caching

---

## 🏗️ Architecture (High Level)

```
React Client
     │
 REST APIs
     ▼
Node.js + Express Backend
     │
MongoDB (Data Storage)
     │
Google Gemini (AI Analysis)
```

---

## 👤 Author

**Archit Pandey** Full-Stack Developer (MERN)







