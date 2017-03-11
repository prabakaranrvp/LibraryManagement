const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const assert = require('assert');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const fs = require('fs');
const path = require('path');
const db = require('./dbUtil');
const _ = require('underscore');

//System Related Configs
const dir = '/Users/prabraja/Documents/Others/LibraryManagement/local/' //Local URL for Front End
const url = 'mongodb://localhost:27017/LibraryManagement';  //MongoDB URL
const dueDay = 15;

const mime = {
    html: 'text/html',
    txt: 'text/plain',
    css: 'text/css',
    gif: 'image/gif',
    jpg: 'image/jpeg',
    png: 'image/png',
    svg: 'image/svg+xml',
    js: 'application/javascript',
    template: 'text/html',
};

app.use(bodyParser.urlencoded({ extended: true })); 

//For Getting All HTML, CSS, JS, Images etc., from the server
app.get('*', function (req, res) {
    var file = path.join(dir, req.path.replace(/\/$/, '/index.html'));
    var type = mime[path.extname(file).slice(1)] || 'text/plain';
    var s = fs.createReadStream(file);
    s.on('open', function () {
        res.set('Content-Type', type);
        s.pipe(res);
    });
    s.on('error', function () {
        res.set('Content-Type', 'text/plain');
        res.status(404).end('Not found');
    });
});

//For inserting a book Info
app.post('/insert', function(req, res) {
    db.insert('book', req.body, function() {
        res.sendStatus(200);
    });
});


//For Updating a book Info
app.post('/edit', function(req, res) {
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        req.body._id = ObjectId(req.body._id);
        var cursor =db.collection('book').save(req.body);
        db.close();
        res.send('Book Updated!');
    });
});


//For inserting a Entry
app.post('/entry', function(req, res) {
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        var cursor =db.collection('entries').insert(req.body);
        db.close();
        res.send('Entry Inserted!');
    });
});

// For searching Books
app.post('/search', function(req, res) {
    var bookData = new Array();
    var self = this;
    db.readTable('book', function(tableData) {
        bookData = (tableData.length>0)?JSON.parse(tableData):bookData;
        var data = req.body;
        var filteredData = bookData;
        if(!_.isEmpty(data)) {
            filteredData = _.filter(bookData, function(row) {            
                for (key in row) {
                    if(data[key]!=undefined) {
                        var searchExp = new RegExp(data[key],"ig");
                        if((((row[key]).toString().toLowerCase()).indexOf((data[key]).toLowerCase()))>=0) {
                            return true;
                            break;
                        }
                    }
                }
            });
        }
        
        console.log(filteredData);
        res.send(filteredData);
    });
});

// // For searching Books
// app.post('/search', function(req, res) {
//     MongoClient.connect(url, function(err, db) {
//         assert.equal(null, err);
        
//         var data = req.body, searchData = [];

//         for (key in data) {
//             var currData = {};
//             currData[key] = new RegExp(data[key],"ig");
//             searchData.push(currData);
//         }

//         if(searchData.length>1)
//             searchData = {'$and' : searchData}
//         else
//             searchData = searchData[0];

//         collection = db.collection('book');
//         collection.find(searchData).toArray(function(error, documents) {
//             if (err) throw error;
//             res.send(documents);
//             db.close();
//         });
//     });
// });

// For Updating Book Info
app.post('/updateBook', function(req, res) {
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection('book').update({"_id" : ObjectId(req.body.id)},{$set : req.body.setter}, function() {
            db.close();
            res.send('Book Updated!');
        });
    });
});

// Delete a Book
app.post('/deleteBook', function(req, res) {
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection('book').remove({"_id" : ObjectId(req.body.id)}, function() {
            db.close();
            res.send('Book Deleted!');
        });
    });
});

// Get a Book
app.post('/getBook', function(req, res) {
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection('book').find({"_id" : ObjectId(req.body.id)}).toArray(function(error, documents) {
            if (err) throw error;
            res.send(documents);
            db.close();
        });
    });
});

// Get the Entries
app.post('/getEntries', function(req, res) {   
    var bookStartDate = new Date(), bookEndDate = new Date(), searchQuery = {};
    bookStartDate.setHours(0, 0, 0, 0);
    bookEndDate.setHours(0, 0, 0, 0);
    bookStartDate.setDate(bookStartDate.getDate()-(dueDay+1));
    bookEndDate.setDate(bookEndDate.getDate()-dueDay);
    bookStartDate = bookStartDate.toString();
    bookEndDate = bookEndDate.toString();
    if(parseInt(req.body.due) == -1) {
        searchQuery = {$lte : bookStartDate};
    }
    else if(parseInt(req.body.due) == 0) {
        searchQuery = {$lte : bookEndDate, $gte : bookStartDate};
    }
    else {
        searchQuery = {$gte : bookEndDate};
    }
    console.log(searchQuery);
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        db.collection('entries').find({"bookdate" : searchQuery}).toArray(function(error, documents) {
            if (err) throw error;
            res.send(documents);
            db.close();
        });
    });
});

app.listen(5050, function() {
    console.log('Server running at http://127.0.0.1:5050/');
});

