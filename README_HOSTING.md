# Hosting Your Wedding QR System (cPanel)

Follow these steps to host your project on your subdomain `wedding.kal-logistics-and-trading.com` using cPanel.

## Step 1: Set up MongoDB Atlas (Database)

1.  Create a free account at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas).
2.  Create a new **Cluster** (Free tier).
3.  Go to **Database Access** and create a user.
4.  Go to **Network Access** and click **Add IP Address**. Choose "Allow Access from Anywhere" (0.0.0.0/0).
5.  Go to **Clusters** -> **Connect** -> **Connect your application** and copy the connection string.

## Step 2: Create Subdomain in cPanel

1.  Log in to your cPanel.
2.  Go to **Domains** -> **Subdomains**.
3.  Create `wedding` for the domain `kal-logistics-and-trading.com`.

## Step 3: Setup Node.js App in cPanel

1.  In cPanel, find and click **Setup Node.js App**.
2.  Click **Create Application**.
3.  **Application root**: The folder for your subdomain (e.g., `wedding.kal-logistics-and-trading.com`).
4.  **Application URL**: `wedding.kal-logistics-and-trading.com`.
5.  **Application startup file**: `server.js`.
6.  **Environment variables**: Click **Add Variable** for each:
    - `MONGO_URI`: (Your MongoDB Atlas string)
    - `PORT`: `5000` (or leave as default if cPanel manages it)
    - `FRONTEND_URL`: `https://wedding.kal-logistics-and-trading.com`
    - `REACT_APP_API_URL`: `https://wedding.kal-logistics-and-trading.com`

## Step 4: Upload and Install

1.  Use cPanel **File Manager** to upload all your project files to the application root.
2.  **Ensure you include the `scanner-app/build` folder!**
3.  In the **Setup Node.js App** interface, click **Run NPM Install**.
4.  Click **Restart** to start your app.

Your wedding system will now be live at `https://wedding.kal-logistics-and-trading.com`! 🤵‍♂️👰‍♀️✨
