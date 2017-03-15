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

//For inserting a book Info
app.post('/bulkInsert', function(req, res) {
    // var jsonData = JSON.parse(req.body.bulkData);
    // db.insert('book', jsonData, function() {
    //     res.sendStatus(200);
    // });
    db.readTable('book', function(tableData) {
        tableData = (tableData.length>0)?JSON.parse(tableData):tableData;
        tableData = (tableData.length==undefined)?(new Array()).push(tableData):tableData;
        var maxId =  Math.floor(Math.random() * (9999 - 1000) + 1000);
        _.each(tableData, function(row) {
            var currId = row._id || 0;
            maxId = (maxId>currId)?maxId:currId+1;
        });
        _.each(tableData, function(row) {
            row._id = row._id || maxId++;
            row.available = row.available || 'Y';
        });
        db.writeTable('book',JSON.stringify(tableData),function() {
            res.send('ok');
        })
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
        db.readTable('book', function(tableData) {
            tableData = (tableData.length>0)?JSON.parse(tableData):tableData;
            tableData = (tableData.length==undefined)?(new Array()).push(tableData):tableData;
            var book = _.findWhere(tableData,{"_id": parseInt(req.body.book_id)});
            book.available = 'N';
            db.update('book', book, function() {
                 res.send('success');
            });
        });
    });
});

//For inserting a Entry
app.post('/entryUpdate', function(req, res) {
    console.log('data Recieved');
    console.log(req.body);
    db.updatePartially('entry', req.body, function() {
        db.readTable('book', function(tableData) {
            tableData = (tableData.length>0)?JSON.parse(tableData):tableData;
            tableData = (tableData.length==undefined)?(new Array()).push(tableData):tableData;
            var book = _.findWhere(tableData,{"_id": parseInt(req.body.book_id)});
            book.available = 'Y';
            db.update('book', book, function() {
                 res.send('success');
            });
        });
    });
});

// For searching Books
app.post('/search', function(req, res) {
    db.searchRecords('book',req.body, {}, function(data) {
        res.send(data);
    });
    
});

// For searching Available Books
app.post('/searchAvailable', function(req, res) {
    db.searchRecords('book',req.body, {available:'Y'}, function(data) {
        res.send(data);
    });
    
});

// For searching Books
app.post('/searchEntry', function(req, res) {
    db.searchRecords('entry',req.body, {status: 'open'}, function(data) {
        res.send(data);
    });
    
});

// For Updating Book Info
app.post('/updateBook', function(req, res) {
    db.updatePartially('book', req.body, function() {
        res.send('Book Updated!');
    });
});

// Delete a Book
app.post('/deleteBook', function(req, res) {
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

// Get a Entry
app.post('/getEntry', function(req, res) {
    var self = this;
    db.readTable('entry', function(tableData) {
        tableData = (tableData.length>0)?JSON.parse(tableData):tableData;
        tableData = (tableData.length==undefined)?(new Array()).push(tableData):tableData;
        if(req.body.id)
            res.send(_.findWhere(tableData,{"_id": parseInt(req.body.id)}));
        else if(req.body.book_id)
            res.send(_.findWhere(tableData,{"book_id": req.body.book_id, "status" : 'open'}));
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
});

app.listen(5050, function() {
    fs.readFile('bulk.json', 'utf8', function (err,data) {
        if(err) {
            console.log(err);
            
        }

        if(data.length>0) {
            data = JSON.parse(data);
            var jsonData;
            db.readTable('book', function(tableData) {
                if(tableData.length>0) {
                    tableData = JSON.parse(tableData);
                    jsonData = (tableData.length==undefined)?(new Array()).push(tableData):tableData;
                }
                else {
                    jsonData = new Array();
                }
                
                if(data.length!=undefined) {
                    jsonData = jsonData.concat(data);
                }
                else
                    jsonData.push(data);
                var maxId =  Math.floor(Math.random() * (9999 - 1000) + 1000);
                _.each(jsonData, function(row) {
                    var currId = row._id || 0;
                    maxId = (maxId>currId)?maxId:currId+1;
                });
                _.each(jsonData, function(row) {
                    row._id = row._id || maxId++;
                    row.available = row.available || 'Y';
                });
                db.writeTable('book',JSON.stringify(jsonData),function() {
                    fs.writeFile('bulk.json', '', function(err) {
                        if(err) {
                            console.log(err);
                        }
                    });
                })
            });

        }
    });

    console.log('Server running at http://127.0.0.1:5050/');
    exec('open http://127.0.0.1:5050/');
    exec('start chrome http://127.0.0.1:5050/');
});

