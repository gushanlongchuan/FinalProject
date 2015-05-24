=================================================================
Final Project for Cloud Computing 2015 Spring
Team member: Alice Berard, Bowen Wang, Miao Lin, Shanlongchuan Gu
=================================================================
Instruction:
In the root directory,
1. Make sure you have installed npm.
2. Type npm install
3. Tyoe node app.js to start the server
4. Go to localhost:3000 to start InsTrade!

ps. You need a stormpath apikey to run the code.

ps. In you app.js file, you add this line below and you will connect to the mongodb cloud
	mongoose.connect('mongodb://gushan:gs524410@ds061721.mongolab.com:61721/finalproject');

My account is "gushan", password is: "gs524410"
if you want to login the website, you can type https://mongolab.com/ in your web browser and login with the account and password above.
After you login, click 'finalproject' and you will see all the tables. If you have questions about that, let me know.

Framework:
In the code, except the index page, there are 6 URLs, /profile, /user, /newpost, /stranger, /posts/:id, /discover. These compose the whole web application. 

Uasge:
In the index page, the new user will need to register a new user account. The middleware we used is Stormpath. It takes care of user management such for us. When the user is logged in, the index page will show the latest posts posted by the trader the user followed based on post times. The user can go to the /profile to modufify its personal information and upload its new profile image. If the user is following nobody, then there will be no post showed. In this case, the user needs to go the /discover URL which shows one post from each user that the current user that are not following.  The user can go to another user’s home page which is /stranger/user_id to click on the follow button to follow that user. The user’s home page shows the number of follower, followee and posts, the user’s profile image, follow button and all the posts of that user. If you are following someone then the follow button will change to following. If you click on that button again, you will unfollow that user. If you click on the post picture, you will go to the /posts/:id URL.  In this page, it will show the name of the item, price, post time, trader, comments on this posts, number of likes, comment button and buy button. You can leave comments under every post. You need to fill in the comment blank and press publish button. When you want to purchase an item, you need to click buy button. After you purchase one item successfully, the system will show you the information. Once the item been purchased, the purchase button on its post page will become unavailable. When you want to have a new post, you can go to /newpost URL, fill in the information about the item, upload one picture of your item and click on the post button. There is a menu bar on top of the page so the user can switch between URL easily and also the menu bar shows the current logged in user’s profile image and notification. Our application has a notification system which will shows the number of new notification on menu bar when someone purchase your item or comment on your posts. You can click on the notification then there will be a pull down window shows all unread notifications. Click on the ok button of each notification to dismiss it. The user will use the logout button on the menu bar to logout.
