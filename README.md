TO RUN THE PROJECT

STEP 1:
    npm init -y
    npm install express mongoose cors dotenv bcryptjs jsonwebtoken multer razorpay

    Add this to package.json in "scripts":

        Copy code
        "start": "node backend/server.js",
        "dev": "nodemon backend/server.js"
    
    
    npm install nodemailer

    
    Run this command to install the Firebase SDK, which includes firebase/storage:

bash
Copy code
npm install firebase

STEP 2:
    npm run dev

    now the server runs and mongodb is connected
    MongoDB Connected: localhost
    Server running on port 5000


STEP 3:
    npx serve .

    its provide localhost:id aaddress
    and network id : id address


*weather updates*

TRIAL Ends on 09/Aug/2025

🔐 Replace YOUR_API_KEY with your real WeatherAPI key in javascript

Folder/File	            Purpose
backend/config/db.js	MongoDB connection setup
backend/controllers/    Logic for routes (like adding product, contracts)
backend/models/     	MongoDB schemas (User, Contract, Payment)
backend/routes/	        API endpoints like /api/farmer/add-product
backend/uploads/	    Save land proof or crop images
frontend/	            All your HTML pages and UI code
frontend/assets/	    CSS, JavaScript, Images
.env	                Secrets (DB URI, JWT, Razorpay keys)
server.js	            Starts backend server, loads routes



for payment 

we need to install the strip
npm install stripe


Set up Stripe Webhook in Dashboard
run bash 

stripe listen --forward-to localhost:5000/api/payment/webhook
