var ip = require('ip');
var express = require('express');
var app = express();
var request = require('request'),
	Promise = require('q'),
    http = require('request-promise-json'),
    _ = require("lodash"),
    CommandsFactory = require("hystrixjs/lib/command/CommandFactory");


app.use(express.static('WebContent'));
var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '50mb'}));	

app.get('/', function (req, res) {
   res.sendFile( __dirname + "/WebContent/html/" + "quality_report_view.html" );
})

app.get('/error', function (req, res) {
   res.sendFile( __dirname + "/WebContent/html/" + "error.html" );
})

app.get('/getenv',function(req,res){
	
		var crawlLevel = 	process.env.CRAWL_LEVEL;
		var url = 			process.env.CRAWLER_SERVICE_URL;
		var separator = 	process.env.WEBSITE_SEPARATER;
		var limit = 		process.env.REPORT_TABLE_DATA_LIMIT;
		var stackatoURL = 	process.env.SOCKET_IO_URL;
		var popularReport = process.env.CACHE_POPULAR_REPORT_URL;
		var retriveReport = process.env.CACHE_RETRIEVE_REPORT_URL;
		var saveReport = 		process.env.DATASERVICE_UPDATE_REPORT_URL;
		var testDataServUrl = 	process.env.DATASERVICE_CONNECTION_TEST_URL;
		var testCrawlServUrl = 	process.env.CRAWLER_SERVICE_CONNECTION_TEST_URL;
		var testCacheServUrl = 	process.env.CACHE_CONNECTION_TEST_URL;
		var timeout = process.env.SERVICE_TIMEOUT_THRESHOLD;
		var routerService = process.env.ROUTER_SERVICE_URL;
		var crawlerHealth = process.env.CRAWLER_HEALTH_CHECK_URL;
		var nodeHealth = process.env.NODE_HEALTH_CHECK_URL;
		var queueHealth = process.env.QUEUE_HEALTH_CHECK_URL;
		
		var details = crawlLevel+"|"+url+"|"+separator+"|"+limit+"|"+stackatoURL+"|"+popularReport+"|"+retriveReport+"|"+saveReport+"|"+testDataServUrl+"|"+testCrawlServUrl+"|"+testCacheServUrl+"|"+timeout+"|"+routerService+"|"+crawlerHealth+"|"+nodeHealth+"|"+queueHealth;
		res.send(details);

} );


/*
Rabbitmq service credentials
*/
var stackato_services=process.env.STACKATO_SERVICES;
var creds = {};
if(process.env.STACKATO_SERVICES){
  var services = JSON.parse(process.env.STACKATO_SERVICES);
  creds = services[process.env.RABBITMQ_SERVICE];
}

//REPORT_DATA_QUEUE


app.post('/put-new-report', function (req, res) 
{
		
	console.log(' ------ Inside Put New Report -------');
	var amqp = require('amqplib/callback_api');
	
	console.log("new report "+req.body.report);
	
	amqp.connect(creds['uri'] , function(err,conn) 
	{
		conn.createChannel(function(err, ch) 
		{
			var rep=JSON.stringify(req.body.report);
			var q = process.env.REPORT_QUEUE;
			var msg = new Buffer(rep);
			console.log("before queue assert ");
			ch.assertQueue(q, {durable: false});
			console.log("before queue send ");
			ch.sendToQueue(q, msg);
			
		});
			
		setTimeout(function() { conn.close();  }, 5000);
	});
				
  
   
})


app.post('/put-new-request', function (req, res) 
{
	var amqp = require('amqplib/callback_api');	
	console.log(' ------ Inside Put New Request -------');
	console.log(' ------ ' + creds['uri'] + ' ----- ');
	
	amqp.connect(creds['uri'] , function(err,conn) 
	{
		conn.createChannel(function(err, ch) {
				
			var q = process.env.CRAWLER_QUEUE;
			var msg = new Buffer(req.body.request);
			console.log("before queue assert ");
			ch.assertQueue(q, {durable: false});
			console.log("before queue send ");
			ch.sendToQueue(q, msg);
			
		});
			
		setTimeout(function() { conn.close();  }, 5000);
	});  
   
})



var port = process.env.PORT || 8081;
var server = app.listen(port, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)

})

// To listen the data from Crawler service
var io = require('socket.io').listen(server);

var emitCounter=0;
app.post('/post_report_packet', function (req, res) 
{
    console.log(JSON.stringify(req.body));
   
	var obj = req.body;
	for (var name in obj) 
	{
		io.sockets.emit(name, obj[name]);
		emitCounter++;
		console.log("Emit count ==> "+emitCounter);
	}
 	res.status(200).end();
	
})


/*
	Hystrix implementation
*/

console.log("Entered Hystrix")

var makeRequest = function(options) {
	console.log("Inside run method");
    return http.request(options);
};

var fallbackMethod = function(options) {
    console.log("Requested service is not available");
};

var serviceCommandCrawler = CommandsFactory.getOrCreate("Key-1")
				.timeout(400000)
				.run(makeRequest)
				.circuitBreakerRequestVolumeThreshold(0)
				.circuitBreakerSleepWindowInMilliseconds(60000)
                .errorHandler(isErrorHandler)
				.fallbackTo(fallbackMethod)
                .build();
				
var serviceCommandNode = CommandsFactory.getOrCreate("Key-2")
				.timeout(400000)
				.run(makeRequest)
				.circuitBreakerRequestVolumeThreshold(0)
				.circuitBreakerSleepWindowInMilliseconds(60000)
                .errorHandler(isErrorHandler)
				.fallbackTo(fallbackMethod)
                .build();
				
var serviceCommandQueue = CommandsFactory.getOrCreate("Key-3")
				.timeout(400000)
				.run(makeRequest)
				.circuitBreakerRequestVolumeThreshold(0)
				.circuitBreakerSleepWindowInMilliseconds(60000)
                .errorHandler(isErrorHandler)
				.fallbackTo(fallbackMethod)
                .build();				

//For crawler health check

app.get("/crawler-health-check", function(req, res) {
		console.log("Crawler Health Check")
				var url = process.env.CRAWLER_SERVICE_CONNECTION_TEST_URL;

                var promise = serviceCommandCrawler.execute({
                    method: "GET",
                    url: url
                })
				console.log(url);
				Promise.resolve(promise).then(function(results) { 
				res.send(results);
				console.log("Result: "+results);
				}).catch(function(error) {
					console.log("error")
				});
        });
		
		
		
//For node health check

app.get("/node-health-check", function(req, res) {
		console.log("Node Health Check")
				var url = process.env.NODE_SERVICE_CONNECTION_TEST_URL;							
				
                var promiseNode = serviceCommandNode.execute({
                    method: "GET",
                    url: url
                })
				console.log(url);
				Promise.resolve(promiseNode).then(function(results) { 
				res.send(results);
				console.log("Result: "+results);
				}).catch(function(error) {
					console.log("error")
				});
        });
		

//For queue health check
		
var username = "auuk1TEyGcy9je",
    password = "ap8Kf69dq5Rhva";
var url = process.env.QUEUE_SERVICE_CONNECTION_TEST_URL;
var auth;
	app.get("/queue-health-check", function(req, res) {
		console.log("Queue Health check")
		auth = "Basic " + new Buffer(username + ":" + password).toString("base64");
                var promiseQueue = serviceCommandQueue.execute({
                    method: "GET",
                    url: url,
					headers : {
						"Authorization" : auth
					}
                })
				console.log(url);
				Promise.resolve(promiseQueue).then(function(results) { 
				console.log("result: "+results.status);
				res.send(results.status);
	}).catch(function(error) {
			console.log("error")
			});
            
        });
		
	//For communication health check

	app.get("/communication-health-check", function(req, res) {
			console.log("Communication Health Check")
					var url = process.env.CACHE_CONNECTION_TEST_URL;

	                var promise = serviceCommandCrawler.execute({
	                    method: "GET",
	                    url: url
	                })
					console.log(url);
					Promise.resolve(promise).then(function(results) { 
					res.send(results);
					console.log("Result: "+results);
					}).catch(function(error) {
						console.log("error")
					});
	        });
	
	app.get("/service-management", function(req, res) {
		console.log("Service Management")
				var url = process.env.CACHE_POPULAR_REPORT_URL;

                var promise = serviceCommandCrawler.execute({
                    method: "GET",
                    url: url
                })
				console.log(url);
				Promise.resolve(promise).then(function(results) { 
				res.send(results);
				console.log("Result: "+results);
				}).catch(function(error) {
					console.log("error")
				});
        });


	app.get("/db-check-Availability", function(req, res) {
		console.log("Service Management")
				var url = process.env.DATASERVICE_CONNECTION_TEST_URL;

                var promise = serviceCommandCrawler.execute({
                    method: "GET",
                    url: url
                })
				console.log(url);
				Promise.resolve(promise).then(function(results) { 
				res.send(results);
				console.log("Result: "+results);
				}).catch(function(error) {
					console.log("error")
				});
        });
	
	app.get("/popularcrawlreport*", function(req, res) {
		console.log("popular crawler report" + req.url)
				var reporturl = process.env.CACHE_RETRIEVE_REPORT_URL;				
				var url = reporturl + req.url;
				console.log("url == " + url);
                var promise = serviceCommandCrawler.execute({
                    method: "GET",
                    url: url
                })
				console.log(url);
				Promise.resolve(promise).then(function(results) { 
				res.send(results);
				console.log("Result: "+results);
				}).catch(function(error) {
					console.log("error")
				});
        });


var isErrorHandler = function(error) {
        if (error) {
			console.log("Error: "+error);
            return error;
        }
        if (error.statusCode == 503) {
            var unavailableError = new Error();
            unavailableError.name = "ServiceUnavailableError";
            return unavailableError;
        }
        return null;
    };


   //Node Health check
	app.get("/listener-health-check", function(req, res) {
		res.send("SUCCESS");
    });	

 // ------------------ Eureka Config --------------------------------------------

 /*   const Eureka = require('eureka-js-client').Eureka;

    const client = new Eureka({
      // application instance information
    	instance: {
        app: 'wsqcuserinterface',
        hostName: 'wsqcuserinterface',
        ipAddr: ip.address(),
        port: {
          '$': 8081,
          '@enabled': 'true',
        },
        vipAddress: 'wsqcuserinterface',
        statusPageUrl: 'http://' + ip.address() + ':8081/info',
        dataCenterInfo: {
          '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
          name: 'MyOwn',
        }
      },
      eureka: {
        // Eureka server host and port
     	host: process.env.EUREKA_SERVER_HOST,
        port: process.env.EUREKA_SERVER_PORT,
        servicePath: process.env.EUREKA_SERVICE_PATH
      }
    });
    client.logger.level('debug');
    client.start(function(error){	  

      console.log('########################################################');
      console.log(JSON.stringify(error) || 'Eureka registration complete');   
      console.log(error || 'complete');
	  
	  //var service = getWorkingInstance("WSQCREPORTS");	

	 // console.log('http' + '://' + service[0] + '/about')
	  
	  var service = getServerURL("http://wsqcreports:8066/websitequalitychecker/sdjfvdsfdj?");	  
	  console.log('service reports url: ' + service)
    });

        
   function getWorkingInstance(name) {
	   console.log('name : ' + name)
    var instances = client.getInstancesByAppId (name);
    var array = new Array();
	var i;
    if (instances) {
         // prefetch that only the executables have
 
        instances.forEach ( function ( instance ) {

             if (instance.status !== "UP" ) {
                 return ;
            }
			
			array.push(instance.hostName + ':' + instance.port. $);
        });
    }
    i = (i >= array.length -1 )? 0 : (i + 1 );
		
    return array;
} 

function getServerURL(urlString) {
	
	var url = require('url');
				
	var q = url.parse(urlString,true);
	var host = q.host;
	var pathname = q.pathname;
	var search = q.search;
	var serviceURL = "";
	
	if(host.includes(':')){
			var hostName = host.substring(0, host.indexOf(':'))
			console.log('hostName : ' + hostName);
			var service = getWorkingInstance(hostName.toUpperCase())			
			
				if(search != null){
					console.log('PathName: ' + pathname + search);
					serviceURL = 'http' + '://' + service[0] + pathname + search
				} else{
					console.log('PathName: ' + pathname );
					serviceURL = 'http' + '://' + service[0] + pathname
				}

	}

	console.log('serviceURL: ' + serviceURL)

	return serviceURL;
}

*/