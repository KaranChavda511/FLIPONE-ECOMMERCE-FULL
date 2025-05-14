# FlipOne eCommerce Platform (v1)

> eCommerce platform built with the MERN stack.

<img src="./frontend/public/images/screens.png">

This project is part of my [MERN Stack From Scratch | eCommerce Platform](https://courses.chaicode.com/learn/Web-Dev-Cohort/Web-Dev-Cohort-Live) course. 

This is version 1.0 of the app.



## Features

- Full featured shopping cart
- Product ratings
- Product pagination
- Product search feature
- User profile with orders
- Admin product management
- Admin user management
- Admin Order details page. (datewise revenue, individual seller revenue)
- Mark orders as delivered option
- Checkout process (shipping, payment method, etc)
- Database seeder (products & users)

## Usage

- Create a MongoDB database and obtain your `MongoDB URI` - [MongoDB compass]


### Env Variables

Rename the `.env.example` file to `.env` and add the following

```
NODE_ENV = development
PORT = 5000
MONGO_URI = your mongodb uri
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=1d
FILE_UPLOAD_PATH=./public/uploads
BASE_URL=http://localhost:5000
```


### Install Dependencies (frontend & backend)

```
npm install
cd frontend
npm install
```

### Run

```

# Run frontend (:3000) & backend (:5000)
npm run dev

# Run backend only
npm run dev
```

## Build & Deploy

```
# Create frontend prod build
cd frontend
npm run build
```


---
