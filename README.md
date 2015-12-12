#frontend-nanodegree-Health_Tracker

backbone.js project to build interactive calorie counter.

API used for the project:
    - Nutritionix API - Home
    - Firebase

===============================

LIVE VERSION of the project: http://www.thefullresolution.com/health_tracker/index.html

===============================
LOG IN 

There is no user sing up available.

You can use following log in data for testing app:

1)
email:  health@tracker.com
password: test

2)
email: calories@health.com
password: test

===============================

GENERAL USAGE NOTES

- If you want to test website on your locally, you have to use localhost to display website.
Since the site uses Backbonone routers, page won't work properly if you just open index.html
- Page uses external APIs, you need active internet connection to test the project.

===============================

REVIEWING THE CODE

Files are in folder 'public_html'. 
Inside folder 'dist' you will find minified and concatenated files.

===============================

APP'S FUNCTIONALITY

- You can use search functionality without logging in. 
    - Once you start typing in input filed autocomplete will be used from Nutritionix API 2.0
      This functionality is not available on Safari, since I am using datalist element currently.
    - After pressing button 'search' or enter key table with products names, weight and calories will be displayed
- To use food tracking functionality you have to log in: use of the two user credentials mentioned above.
- Once you log in, and search for certain product, you can press on it. Item will be added to the table food tracked.
- You can change the date by clicking on of the arrows or pick a date from pop calendar.

     

===============================

Sources used in the project:
- https://www.firebase.com/
- https://developer.nutritionix.com/docs/v1_1
- https://developer.nutritionix.com/docs/v2/autocomplete
