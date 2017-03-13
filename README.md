# LibraryManagement
A simple Library Management using NodeJS

1. Install NodeJS from http://nodejs.org/
2. `cd <Target Folder of the project>`
3. `npm init`
4. Intall Express `npm install -g express --save`
5. Install body-parser `npm install -g body-parser --save`
6. Install underscore `npm install -g underscore --save`

**Database Creation**

In Command Prompt,

	mongo
	use LibraryManagement
	db.createCollection('book')
	db.createCollection('entries')
	

**Start Node Server**

	cd <Target Folder of the project>/server
	node app.js
