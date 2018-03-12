# Project Structure

Below is a general overview of the most important directories and files in the project.

```
├── app
│   ├── data
│   │   ├── NASDAQ_mapping.txt     # List of Nasdaq companies
│   │   └── NYSE_mapping.txt       # List of NYSE companies
│   ├── jobs
│   │   └── update.js              # A scheduled job that runs the stock update
│   ├── models
│   │   └── error.js               # Convenience class for specifying errors
│   ├── routes.js                  # Specifies the valid http paths for the app
│   ├── services
│   │   ├── alphaVantage.js        # Service to abstract interacting with AlphaVantage stock APIs
│   │   ├── discovery.js           # Service to abstract interacting with Watson Discvoery
│   │   ├── stockService.js        # Service to abstract interaction with DB
│   │   └── stockUpdate.js         # Update task for discovering and storing new articles
│   └── util
│       ├── cloudantDb.js          # Utility class for performing database operations
│       └── utils.js               # Various utilities
├── bower.json                     # Defines dependencies for the client side of the web portal
├── config.js                      # Performs setup for node application, loading environment vars
├── env.sample                     # Sample environment variable files that needs to be copied to .env file
├── manifest.yml                   # Specifies cloud services to auto-provision when deploying to IBM Cloud
├── package.json                   # Defines node dependencies and performs bower install
├── public                         # Root dir accessible to web clients
│   ├── css
│   │   └── style.css              # Defines the styles of the web portal
│   ├── index.html                 # The landing page for the web portal
│   └── js
│       ├── app.js                 # Creates the main angular module for the application
│       ├── appRoutes.js           # Sets up routing for the application
│       ├── charts.js              # Contains the JS for rendering charts in the portal
│       ├── controllers
│       │   └── MainCtrl.js        # The main angular controller
│       ├── main.js                # Performs webpage setup that should be performed immediately
│       └── services
│           └── StockService.js    # A service for abstracting http calls to retrieve stock data
└── server.js                      # The entry point to the node server application
```