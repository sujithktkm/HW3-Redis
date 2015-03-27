#####I have chosen option 2 - Complete the workshop assignment with additional considerations.

#####1 Simple Web Server

As per the given instructions, I did the initial setup of downloading redis, express and http-proxy. The code to install server is as follows

var server = app.listen(3001, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)
})

Using redis, I have created a client to the server with additional parameters of port and host address.

var redis = require('redis') var client = redis.createClient(6379, '127.0.0.1', {})

#####2 Route SET

To create route '/set', I used a client.set() to set key value to desired string. Using the client.expire() I made sure that this message expires in 10 seconds (as per the reequirements).

res.send() is used to send the string to display it on the server.

app.get('/set', function(req, res) {
  client.set("string key", str)
    client.expire("string key", 10)
  res.send(str)
})

![img1](/screenshots/img2.jpg)

#####2 Route GET

For route 'get', i used client.get() to obtained the value assigned to the particular key in client.set(). Used res.send() to display it on the server.

app.get('/get', function(req, res) {
  client.get("string key", function(err,value){ console.log(value); res.send(value);})
})

![img2](/screenshots/img3.jpg)

#####2 Route RECENT

For route '/recent', I made use of a global hook to get all the visited URLS. I added all the visited urls to a queue using lpush (push the queue). As per requirements, only 5 most recent urls must be visible, so I trimmed the queue when the urls are more than 5 using ltrim (trims the oldest records on queue). 

In the 'recent' route, I used lrange to get the recently visited urls in the desired order, with first one being the latest.

app.use(function(req, res, next) 
{
  console.log(req.method, req.url);
  var host = server.address().address
  var port = server.address().port
  var urlvisited = req.url;
  var finalurl = "http://"+host+":"+port+urlvisited
  client.lpush("queue", finalurl, function(err, reply) {
    console.log(reply)
  })
  client.ltrim("queue", 0, 4)

  next(); // Passing the request to the next handler in the stack.
});

app.get('/recent', function(req, res) {
  client.lrange("queue", 0, 4, function(err, message) {
      res.send(message);
      console.log(message);
  })
})

![img3](/screenshots/img6.jpg)

#####4 UPLOAD

To upload an image, UPLOAD command can be used in redis. Using lpush, the newly uploaded image is added to the queue. Usually path of the file is added to the queue. 

app.use('/uploads', express.static(__dirname+'/uploads'))

app.post('/upload',[ multer({ dest: './uploads/'}), function(req, res){
   console.log(req.body) // form fields
   console.log(req.files) // form files

   if( req.files.image )
   {
	   fs.readFile( req.files.image.path, function (err, imageval) {
	  		if (err) throw err;
	  		var img = new Buffer(imageval).toString('base64');
	  		//console.log(img);
        client.lpush("queue1", req.files.image.path)
		});
	}

   res.status(204).end()
}]);

![img4](/screenshots/img4.jpg)

#####Route MEOW

Using this route, the recently added image can be displayed on the local host. For this I used rpop, which unlike lpop gives the recently added record(top value) in the queue.

app.get('/meow', function(req, res, err) {
		//if (err) throw err
    client.rpop("queue1", function(err,imagedata)
    {
      res.writeHead(200, {'content-type':'text/html'});
      res.write("<h1>\n<img src='"+imagedata+"'/>");
      console.log(imagedata);
      res.end();
    });
})

![img5](/screenshots/img5.jpg)

#####5 Additional instance on a different port.

I have created an instance similar to the one on port 3001, on port 3002. The advantage of this instance is to accpet request made to the server and to help in load balancing.

![img6](/screenshots/img8.jpg)

#####6 Create proxy to uniformly distibute requests

I have created a proxy which distributes the requests uniformly between servers listening to 3001 and 3002. Forx example, if it gives the first request to 3001, then next request is sent to 3002, then to 3001 and so on.

The source code for this is provded in proxy.js file.

![img7](/screenshots/img7.jpg)

