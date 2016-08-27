var express = require("express")
var mongo = require('mongodb').MongoClient
var autoIncrement = require("mongodb-autoincrement")

var app = express()

app.get('/',function(req, res) {
    var content = `Example creation usage:<br/>
https://little-url.herokuapp.com/new/https://www.google.com<br/>
https://little-url.herokuapp.com/new/http://foo.com:80<br/>
Example creation output<br/>
{ "original_url":"http://foo.com:80", "short_url":"https://little-url.herokuapp.com/8170" }<br/>
Usage:<br/>
https://little-url.herokuapp.com/2871<br/>
Will redirect to:<br/>
https://www.google.com/`;
res.end(content);
})

app.get('/:id',function (req,res) {
    findInMongo(req.params.id,res)
})

app.get('/new/:url*',function (req,res) {
  if(validateURL(req.url.slice(5)))
    insetToMongo(req.url.slice(5),res)
  else
    res.end('Invailed URL')
})

app.listen(process.env.PORT || 8080, function () {
  console.log('Example app listening on port 80!');
});




function findInMongo(id,res) {
    mongo.connect('mongodb://client:3253628@ds017636.mlab.com:17636/urlbase', function(err, db) {
      if (err) {
        res.end(err);
      }
      var collection = db.collection('websites');
      
       collection.find({
      short_url: { $eq: parseInt(id) }
    }).toArray(function(err, documents) {
      if(!documents.toString() || err)
        res.end('Cannot find website');
      else
        res.redirect(documents[0]['original_url'].toString());
    });
    
    db.close();
    
    });
}

function insetToMongo(url,res) {
    mongo.connect('mongodb://client:3253628@ds017636.mlab.com:17636/urlbase', function(err, db) {
       if (err) {
        res.end(err);
      }
      var collection = db.collection('websites');
        
        collection.find({
      original_url: { $eq: url }
    }).toArray(function(err, documents) {
      if(documents.toString() || !err){
        res.redirect(documents[0]['original_url'].toString());
        db.close();
      }
        
    });
    
      autoIncrement.getNextSequence(db, 'websites', function (err, autoIndex) {
          if (err) {
        res.end(err);
      }
        
        collection.insert({
            original_url: url,
            short_url: autoIndex
            
        }, function(err, data) {
      // handle error
      if(err)
        return err;
      // other operations
      else
        res.send(JSON.stringify({
      original_url: url,
      short_url: autoIndex
    }));
    
    });
    db.close();
});
});
}

function validateURL(url) {
    // Checks to see if it is an actual url
    // Regex from https://gist.github.com/dperini/729294
    var regex = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;
    return regex.test(url);
  }