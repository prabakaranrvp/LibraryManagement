var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var app     = express();

var url = 'mongodb://localhost:27017/LibraryManagement';
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected correctly to server.");
  var cursor =db.collection('book').find( );
   cursor.each(function(err, doc) {
      assert.equal(err, null);
      if (doc != null) {
         // console.log(doc);
      }

	  db.close();
   });
});

app.use(bodyParser.urlencoded({ extended: true })); 

//app.use(express.bodyParser());
app.get('/insert', function(req, res) {
    fs.readFile("./local/index.html",'utf8',function(err, data) {
      console.log("File Read!");
        res.writeHead(200, {
            'content-type': 'text/html'
        });
        console.log(data);
        res.write(data);
        res.end();
    });
    
});

app.post('/insert', function(req, res) {
  console.log(req.body);
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log("Connected correctly to server.");
    var cursor =db.collection('book').insert(req.body);
    db.close();
    res.send('Book Inserted!')
  });
});

app.get('/list', function(req, res) {
    console.log('list');

});

app.listen(5050, function() {
  console.log('Server running at http://127.0.0.1:8080/');
});

function processAllFieldsOfTheForm(req, res) {
    var form = new formidable.IncomingForm();

    form.parse(req, function (err, fields, files) {
        //Store the data from the fields in your data store.
        //The data store could be a file or database or any other store based
        //on your application.
        res.writeHead(200, {
            'content-type': 'text/plain'
        });
        res.write('received the data:\n\n');
        res.end(util.inspect({
            fields: fields,
            files: files
        }));
    });
}
