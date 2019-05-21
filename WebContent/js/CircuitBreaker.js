function checkRouterService()
{
	//checkService(sessionStorage.getItem('CACHE_CONNECTION_TEST_URL'));
	//checkService("http://wsqc-routerservice.16.202.66.191.xip.io/check-Availability");
	checkService("/communication-health-check");
}


function checkDataService()
{
	//checkService(sessionStorage.getItem('DATASERVICE_CONNECTION_TEST_URL'));
	checkService("/db-check-Availability");
}

function checkCrawlerService()
{
	checkService("/crawler-health-check");
}

function checkNodeService()
{
	checkService("/node-health-check");
}

function checkQueue()
{
	checkService("/queue-health-check");
}


function checkService(serviceurl)
{
	console.log("Calling "+serviceurl);
	$.ajax({
		type : "GET",
		url : serviceurl,
		async: false,
		timeout:sessionStorage.getItem('SERVICE_TIMEOUT_THRESHOLD'),
		success : function(result) 
		{
			console.log(result);
			if (result.toUpperCase() ==="SUCCESS" || result.toUpperCase() === "OK") {
				CIRCUIT = "CLOSE";	
			}
			else{
				CIRCUIT = "OPEN";
			}
		},
		error : function(exception)
		{
			CIRCUIT = "OPEN";	
		}
	});
}


function checkWsqcService(serviceurl)
{
	var ajaxResponse;

	console.log("Calling "+ serviceurl);
	$.ajax({
		type : "GET",
		url : serviceurl,
		async: false,
		timeout:sessionStorage.getItem('SERVICE_TIMEOUT_THRESHOLD'),
		success : function(result) 
		{
			console.log('result: ' + result);
			ajaxResponse = result;
		},
		error : function(exception)
		{
			console.log('In Exception: ' + exception);
			ajaxResponse = exception;	
		}
	});
	
	return ajaxResponse;
}


function getService(serviceurl, requestParam)
{
	var ajxResponse;

	console.log("Calling "+ serviceurl + '?' + requestParam);
	$.ajax({
		type : "GET",
		url : serviceurl + "?" + requestParam,
		async: false,
		timeout:sessionStorage.getItem('SERVICE_TIMEOUT_THRESHOLD'),
		success : function(result) 
		{
			console.log('result: ' + result);
			ajxResponse = result;
		},
		error : function(exception)
		{
			console.log('In Exception: ' + exception);
			ajxResponse = exception;	
		}
	});
	
	return ajxResponse;
}
