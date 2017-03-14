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
        fs.readFile('db/' + table + '.json', 'utf8', function (err,data) {
            if(err) {
                console.log(err);
                callback('');
            }
            else 
                callback(data);
        });
    }, 

    writeTable: function(table, data, callback) {
        fs.writeFile('db/' + table + '.json', data, function(err) {
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
            tableData = (tableData.length>0)?JSON.parse(tableData):tableData;
            tableData = (tableData.length==undefined)?(new Array()).push(tableData):tableData;
            var ids = _.pluck(tableData, '_id');
            recordset._id = parseInt(recordset._id);
            tableData = _.without(tableData,_.findWhere(tableData,{'_id' : recordset._id}));
            tableData.push(recordset);
            self.writeTable(table, JSON.stringify(tableData), callback);
        });
    },

    updatePartially: function(table, recordset, callback) {
        var self = this;
        this.readTable(table, function(tableData) {
            tableData = (tableData.length>0)?JSON.parse(tableData):tableData;
            tableData = (tableData.length==undefined)?(new Array()).push(tableData):tableData;
            var ids = _.pluck(tableData, '_id');
            recordset._id = parseInt(recordset._id);
            _.each(tableData, function(row) {
                if(recordset._id == row._id) {
                    for (key in recordset) {
                        console.log(key);
                        if(key != "_id")
                            row[key] = recordset[key];
                    }
                }
            });
            self.writeTable(table, JSON.stringify(tableData), callback);
        });
    },

    deleteRecord: function(table, id, callback) {
        var self = this;
        this.readTable(table, function(tableData) {
            tableData = (tableData.length>0)?JSON.parse(tableData):tableData;
            tableData = (tableData.length==undefined)?(new Array()).push(tableData):tableData;
            tableData = _.without(tableData,_.findWhere(tableData,{'_id':parseInt(id)}));
            self.writeTable(table, JSON.stringify(tableData), callback);
        });
    },


    searchRecords: function(table, data, constraint, callback) {
        var bookData = new Array();
        this.readTable(table, function(tableData) {
            bookData = (tableData.length>0)?JSON.parse(tableData):bookData;
            var filteredData = _.where(bookData,constraint);
            if(!_.isEmpty(data)) {
                filteredData = _.filter(filteredData, function(row) {            
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
            callback(filteredData);
        });
    }


}
