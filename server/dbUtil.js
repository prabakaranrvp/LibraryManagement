const fs = require('fs');
const _ = require('underscore');

module.exports = {
    insert: function(table, recordset, callback) {
        var jsonData = new Array();
        var self = this;
        this.readTable(table, function(tableData) {
            jsonData = (tableData.length>0)?JSON.parse(tableData):jsonData;
            jsonData.push(recordset);
            jsonData = self.createId(jsonData);
            self.writeTable(table, JSON.stringify(jsonData), callback);
        });
    },

    readTable: function(table, callback) {
        fs.readFile('../db/' + table + '.json', 'utf8', function (err,data) {
            if(err) {
                console.log(err);
                callback('');
            }
            else 
                callback(data);
        });
    }, 

    writeTable: function(table, data, callback) {
        fs.writeFile('../db/' + table + '.json', data, function(err) {
            if(err) {
                console.log(err);
            }
            callback();
        });
    },

    createId: function(records) {
        var recordSets = JSON.parse(JSON.stringify(records));
        recordSets = (recordSets.length)?recordSets:((new Array()).push(recordSets));
        var maxId =  Math.floor(Math.random() * (9999 - 1000) + 1000);
        _.each(recordSets, function(row) {
            var currId = row._id || 0;
            maxId = (maxId>currId)?maxId:currId+1;
        });
        _.each(recordSets, function(row) {
            row._id = row._id || maxId++;
        });
        return recordSets;
    },

    update: function(table, recordset, callback) {
        var jsonData = new Array();
        var self = this;
        this.readTable(table, function(tableData) {
            // jsonData = (tableData.length>0)?JSON.parse(tableData):jsonData;
            var ids = _.pluck(recordset._id);
            console.log(ids);
            // _.findWhere()

            
            // self.writeTable(table, JSON.stringify(jsonData), callback);
        });
    }
}
