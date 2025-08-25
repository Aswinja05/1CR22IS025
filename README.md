# URL SHORTENER

A lightweight URL shortener service built with Node.js, Express, and MongoDB, featuring a logging middleware that integrates with an evaluation logging service.

# 📸 API Testing with Postman  

Below are sample requests and responses tested using Postman:  

---

**POST** `/shorturls` 

Request Body:  
```json
{
  "url": "https://example.com",
  "validity": 10
}
