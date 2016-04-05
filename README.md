###Udacity Front-End Web Developer Nanodegree – Project 06


#Health Tracker



###Project Requirements:

<br>
Using Backbone, you will develop a single page app that tracks the user's calorie intake, and optionally, other health-related metrics. Typing food names into the search field will display a list of matching foods as provided by the health API. Users will be able to select an item from the list, and the item will be added to the list of foods the user is tracking. The total calorie count will also update to reflect the new daily total.
<br><br>

-------

ONLINE  VERSION of the project: [http://www.thefullresolution.com/health_tracker/](http://www.thefullresolution.com/health_tracker/)

-------

###General Usage Notes

- If you want to test the project locally, you have to use a local-host to display a website. The site uses Backbone routers and it won't work properly if you just open index.html
- Page uses external APIs, you need an active internet connection to test the project.



###Reviewing The Code

Files are in the folder public_html. Inside the folder 'dist' you will find minified and concatenated files.


LOGIN and PASSWORD: health@tracker.com / test



###App's Functionality


- You can use search functionality without logging in.
	- Once you start typing in the input filed, auto-complete will be used from Nutritionix API 2.0.
		*This functionality is not available on Safari, since I am using a datalist element currently.*

	- After pressing the button 'search' or the 'enter' key, a table with products names, weight and calories will be displayed.

- To use a food tracking functionality you have to log in: use one of the two user credentials mentioned above.

- Once you are logged in, and you searched for certain product, you can press on one of the results. Item will be added to the table food tracked.  

- You can change the date by clicking on of the arrows or pick a date from pop calendar.






####Sources used in the project:


- [https://www.firebase.com/](https://www.firebase.com/)
- [https://developer.nutritionix.com/docs/v1_1](https://developer.nutritionix.com/docs/v1_1) 
- [https://developer.nutritionix.com/docs/v2/autocomplete](https://developer.nutritionix.com/docs/v2/autocomplete)
