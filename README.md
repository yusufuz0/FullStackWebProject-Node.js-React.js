📘 NotesMarket

NotesMarket is a comprehensive e-commerce platform where students can buy and sell class notes. It features seller and customer roles, as well as a dedicated admin panel for platform-wide management.

<br>

🧠 Project Evolution

The frontend of the project was initially developed using plain HTML, CSS, and JavaScript. Later, it was rebuilt using React.js and TailwindCSS to achieve a more modern, maintainable, and scalable architecture.

<br><br>

 ## Features

👨‍🏫 Seller Panel

Add, edit, and delete class notes (products)<br>
View sales statistics and total revenue<br>
Define payment details via Stripe API

<br>


🎓 Customer Panel

Filter, preview, and purchase products<br>
Secure payment with Stripe<br>
Full access to purchased notes<br>
Ratings

<br>

🛠️ Admin Panel

Sales analytics with charts (via Chart.js)<br>
View top-selling products and high-revenue sellers<br>
Authority to view and delete any product<br>

<br>


💰 Revenue Distribution

Sales income is split as follows:<br>
80% to the seller<br>
20% to the platform<br>
This distribution is automatically processed on the 1st of every month using a node-cron scheduler.


<br>

🔐 Security

JWT for authentication<br>
Rate limiting to prevent brute-force attacks<br>
Protection against unauthorized access<br>


<br>

🛠️ Technologies Used

Frontend: 

HTML <br>CSS<br> JavaScript<br> React.js<br> TailwindCSS<br> Axios<br> Chart.js



Backend:

Node.js (Express)<br> RESTful API<br> JWT Authentication<br> Node-cron<br> Stripe API & Webhooks<br> Firebase Firestore


Tools:

Git & GitHub<br> Postman

<br>
📎 Notes

The project has been developed with real-world deployment in mind, prioritizing security, sustainability, and scalability. All development was managed with version control, and each feature was implemented on separate branches for maintainability.
<br>

Home page:
![HomePage](https://github.com/user-attachments/assets/d3fdf6c9-1dd2-473b-8e21-909b2b6c7cf6)


Admin Dashboard:
![AdminDashboard](https://github.com/user-attachments/assets/0e8c67e3-2e68-475a-becd-c0ed4ea75d65)

Admin Dashbaord:
![AdminDashboardd](https://github.com/user-attachments/assets/ae3d8a94-cf31-4590-9ac5-1ed9cbe11313)


Seller Dashboard:
![SellerDashboard](https://github.com/user-attachments/assets/1ef3c0de-c388-41d1-911f-9e6fe3deb482)


Product Detail:
![ProductDetail](https://github.com/user-attachments/assets/4c65e017-0d7b-47b8-9154-6b7547588a54)


Cart Page:
![Cart](https://github.com/user-attachments/assets/4b391aa3-c668-4236-a0bc-94c949985ab3)


