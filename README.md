# ✈️ Airline Ticket Management & Booking Website  
## Arigatou Airlines
A full-stack web application for managing and booking airline tickets, built with **Spring Boot**, **ReactJS**, and **MySQL**.

[![Docs](https://img.shields.io/readthedocs/avocado-classifier?label=docs)](https://drive.google.com/drive/u/0/folders/1NcZfJaf1MckYIvrxc7rkXjluYjSqDRSk)
### 1. Requirements 
* Java 17+
* Maven 3.8+
* MySQL 8+
* Node.js 18+
* npm
### 2. Installation
Clone the repository: ``` git clone https://github.com/vllddlvh/ArigatouAirlines ```

### 2.1. Configuration Database
* ```cd backend cd database```
* Then run arigatouAirlines.sql
![Alt text](https://foldr.space/d/Screenshot%202025-12-31%20at%2023.46.34.png)
* Config file application.yaml:
![Alt text](https://foldr.space/d/Screenshot%202025-12-31%20at%2023.43.48.png)

### 2.2. Build & Run Backend 
* ``` cd backend ```
* ``` mvn clean install ```
* ``` mvn spring-boot:run ```

Backend run in: http://localhost:8080/arigatouAirlines

### 2.3. Build & Run Frontend
* ```cd frontend```
* ``` npm install ```
* ``` npm run dev ```

Frontend run in: http://localhost:3000

### 3. Default Accounts
* Account Admin:
  username: admin
  password: admin
* Account User:
  username: accountuser
  password: accountuser
### 4. Payment Testing
![Alt text](https://foldr.space/d/Screenshot%202025-12-31%20at%2023.58.10.png)
