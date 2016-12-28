# LibraryManagement
A simple Library Management using NodeJS

1. Install NodeJS from http://nodejs.org/
2. Install MongoDb `npm install -g mongodb`
3. Intall Express `npm install -g express`
4. Install body-parser `npm install -g body-parser`

**Database Creation**

In Command Prompt,

	mongo
	use LibraryManagement
	db.createCollection('book')
	db.createCollection('entries')
	

**Strat Node Server**

	cd <Target Folder of the project>/server
	node app.js
