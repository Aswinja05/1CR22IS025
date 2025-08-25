# URL SHORTENER

A lightweight URL shortener service built with Node.js, Express, and MongoDB, featuring a logging middleware that integrates with an evaluation logging service.

# API Testing with Postman  

Below are sample requests and responses tested using Postman:  

---

**POST** `/shorturls` 

Request Body:  
```json
{
  "url": "https://www.youtube.com",
  "validity": 30,
  "shortcode":"abcd1"
}
```
<img width="926" height="623" alt="image" src="https://github.com/user-attachments/assets/7e995057-bb9b-4ff9-af1b-182f3585b79e" />


