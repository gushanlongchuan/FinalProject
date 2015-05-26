
##Final Project for Cloud Computing 2015 Spring

Team members: Alice Berard, Bowen Wang, Miao Lin, Shanlongchuan Gu

## Instructions
In the root directory:

1. Make sure you have installed npm.
2. Type `npm install`.
3. Type `node app.js` to start the server.
4. Go to [localhost:3000](localhost:3000) to start **InsTrade**!

**NB:** You need a stormpath apikey to run the code.

**NB:** In you `app.js` file, you add this line below and you will connect to our [mongoDB](https://www.mongodb.org/) cloud database:

```javascript
mongoose.connect('mongodb://gushan:gs524410@ds061721.mongolab.com:61721/finalproject');
```

The account is `gushan`, password is: `gs524410`.
If you want to login the website to view the tables, you can go to [Mongolab](https://mongolab.com) and login with the account and password above.
After you login, click `finalproject` and you will see all the tables.

## Framework
In the code, there are 7 main URLs including the index page:

1. `/`
2. `/user`
3. `/profile`
4. `/discover`
5. `/stranger/:id`
6. `/posts/:id`
7. `/newpost`

These compose the whole web application. 

## Authentication

In the index page, the new user will need to register a new user account. The middleware we used is [Stormpath](https://stormpath.com/). It takes care of user management and authentication for us.

We also use it as our **user database**: it can store basic information about a user such as his name, but also customized data, such as profile pictures, address, etc. Each user is assigned a user id of the following form `3f0Qw7Y9AvRFPvGWNLZeKh`. This key enables us to **match users** in our own database with [Stormpath API](http://docs.stormpath.com/rest/product-guide/). 

## Functionalities

1. `/`
When the user is logged in, the **index** page will show the latest posts by traders followed by the user. The posts showed are based on post time, and the most recent ones appear first.

2. `/user` The user can see his **current posts**, their states (whether they have been sold or not), the number of likes and comments. He can also **delete** his post.

3. `/profile` The user can go to his profile, personal information, and **modify** his personal information and upload his new **profile picture**.

4. `/discover` If the user is following nobody, then there will be no post showed in `/`. In this case, the user needs to go the discover URL which shows **one post from each user** that the current user is not following. 

5. `/stranger/:id` The user can go to another user’s home page to click on the **Follow** button to follow this user. The user’s home page shows the number of followers, followees and posts, as well as the user’s profile image, follow button and all the posts of that user. If you are following someone, then the follow button will change to following. If you click on that button again, you will unfollow that user.

6. `/posts/:id` If you click on a **post picture**, you will go to the this post's URL. In this page, it will show the name of the item, price, post time, trader, comments on this posts, number of likes, comment button and buy button. You can leave comments under each post. You just need to fill in the comment blank and press the publish button. When you want to purchase an item, you need to click buy button. After you purchase one item successfully, the system will show you the information. Once the item has been purchased, the purchase button on its post page will become unavailable.

7. `/newpost` When you want to **create a new post** (meaning selling an item yourself), you can go to  this URL, fill in the information about the item, upload one picture of your item and click on the post button.

To navigate between all these functionalities, there is a menu bar on top of the page so the user can switch between URLs easily.

The **menu bar** also shows the current logged-in user’s profile picture and his notifications.
Our application has a notification system which will show the number of new notifications on menu bar when someone purchases your item or comments on your post. You can click on the notification, then there will be a dropdown menu showing all unread notifications. Click on the **OK** button of each notification to dismiss it.

The user will use the **logout** button on the menu bar to logout.

## Database relations and tables

We have **5** main tables in our database.
They represent the following entities:

* **Posts**
* **Likes**
* **Comments**
* **Friends**
* **Notifications**

You can find the description for the schemas in the folder `/module`.
The user id refers to the **hash key** automatically created by the [Stormpath](https://stormpath.com/) middleware when a new user registers to our app.

The database is updated after **any action by any user**.

* **Posts** are inserted when a new post is created, and removed when a user deleted his own post.

* **Likes** and **Comments** are inserted when a user likes/comments on a post, and removed when a post is deleted by its owner.

* **Friends** are inserted when a user starts following another one, and removed when a user unfollows another one.

* **Notifications** are inserted after any action by a user regarding another user is done:
 * Started following you
 * Commented on one of your posts
 * Bought one of your items
 
Notifications are removed from the table when the user dismisses his notifications by clicking OK.
