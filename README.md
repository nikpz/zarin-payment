- Zarin Pal Payment Gateway.
This project is a server-side project and is suitable for a test environment (sandbox) and demonstrates how to integrate the zarinpal payment gateway into a Node.js application. With this setup, you can securely process payments for goods or services on your website.
- Payment Gateway:  Zarin Pal
- Clone:  https://github.com/nikpz/zarin-payment.git
- Navigate to the project directory in your terminal..
- Run:  npm i && npm start
- Configuration:
  - Create a .env file in the root directory of your project.
  - Add your API keys to the .env file:
    - ZAR_MERCHANT_ID='35ab132c-e623-49d3-896a-3442b1c6561c'  (random uuid for sandbox environment)
    - ZAR_API_KEY='SDFDADFFRGKREROBKRBVGORY'  (Sandbox environment starts with S char)
    - PORT=4000

Replace your_stripe_secret_key and your_stripe_publishable_key with your actual Stripe API keys.
- Nodejs , Postgres , zarinpal-checkout , Sequelize , axios , winston & morgan logger , express and manual cors 
 
Author: Nikpz.co  (nikpz.co@gmail.com) , if you need some help to configuration send me an email.


  
  
