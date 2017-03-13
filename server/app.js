//const MongoClient = require('mongodb').MongoClient;
// const ObjectId = require('mongodb').ObjectId;
// const assert = require('assert');
const config = require('../config');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;
const db = require('./dbUtil');
const _ = require('underscore');



//System Related Configs
const dir = config.path //Local URL for Front End
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
    var file = path.join(dir, req.path.replace(/\/$/, '/local/index.html'));
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
    db.update('book', req.body, function() {
        res.send('Book Updated!');
    });
});


//For inserting a Entry
app.post('/entry', function(req, res) {
    db.insert('entry', req.body, function() {
        res.send('success');
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
        res.send(filteredData);
    });
});

// For Updating Book Info
app.post('/updateBook', function(req, res) {
    db.updatePartialy('book', req.body, function() {
        res.send('Book Updated!');
    });
});

// Delete a Book
app.post('/deleteBook', function(req, res) {
    // MongoClient.connect(url, function(err, db) {
    //     assert.equal(null, err);
    //     db.collection('book').remove({"_id" : ObjectId(req.body.id)}, function() {
    //         db.close();
    //         res.send('Book Deleted!');
    //     });
    // });
    db.deleteRecord('book', req.body.id, function() {
        res.send('Book Updated!');
    });
});

// Get a Book
app.post('/getBook', function(req, res) {
    var self = this;
    db.readTable('book', function(tableData) {
        tableData = (tableData.length>0)?JSON.parse(tableData):tableData;
        tableData = (tableData.length==undefined)?(new Array()).push(tableData):tableData;
        res.send(_.findWhere(tableData,{"_id": parseInt(req.body.id)}));
    });
});

// Get the Entries
app.post('/getEntries', function(req, res) {  
    db.readTable('entry', function(tableData) {
        tableData = (tableData.length>0)?JSON.parse(tableData):tableData;
        tableData = (tableData.length==undefined)?(new Array()).push(tableData):tableData;
        var filteredData = _.where(tableData,{"status": 'open'});

        filteredData = (filteredData.length==undefined)?[filteredData]:filteredData;
        var today = new Date();
        var dueBookData = _.filter(filteredData, function(row) {
            var bookDate = new Date(row.bookdate);
            bookDate.setDate(bookDate.getDate()+parseInt(row.waitingperiod));
            var diff = Math.floor((Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) - Date.UTC(bookDate.getFullYear(), bookDate.getMonth(), bookDate.getDate()) ) /(1000 * 60 * 60 * 24));
            if((parseInt(req.body.due) == -1) && (diff>0)) {
                return true;
            }
            else if((parseInt(req.body.due) == 0) && (diff==0)) {
                return true;
            }
            else if((parseInt(req.body.due) == 5) && (diff>0) && (diff<5)) {
                return true;
            }
        });

        res.send(dueBookData);
        // 
    }); 
    // var bookStartDate = new Date(), bookEndDate = new Date(), searchQuery = {};
    // bookStartDate.setHours(0, 0, 0, 0);
    // bookEndDate.setHours(0, 0, 0, 0);
    // bookStartDate.setDate(bookStartDate.getDate()-(dueDay+1));
    // bookEndDate.setDate(bookEndDate.getDate()-dueDay);
    // bookStartDate = bookStartDate.toString();
    // bookEndDate = bookEndDate.toString();
    // if(parseInt(req.body.due) == -1) {
    //     searchQuery = {$lte : bookStartDate};
    // }
    // else if(parseInt(req.body.due) == 0) {
    //     searchQuery = {$lte : bookEndDate, $gte : bookStartDate};
    // }
    // else {
    //     searchQuery = {$gte : bookEndDate};
    // }
    // console.log(searchQuery);
    // MongoClient.connect(url, function(err, db) {
    //     assert.equal(null, err);
    //     db.collection('entries').find({"bookdate" : searchQuery}).toArray(function(error, documents) {
    //         if (err) throw error;
    //         res.send(documents);
    //         db.close();
    //     });
    // });
});

app.listen(5050, function() {
    console.log('Server running at http://127.0.0.1:5050/');
    exec('open http://127.0.0.1:5050/');
});

