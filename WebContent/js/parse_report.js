var levelProgress = {};
var reports = {};
var sessionID = "";
var isFilterOn=false;
var CIRCUIT = "CLOSE";
var report0="";
var report1="";
var report2="";
var report3="";
var report4="";
var countReports=-1;
var addedURLsreport0="";
var addedURLsreport1="";
var addedURLsreport2="";
var addedURLsreport3="";
var addedURLsreport4="";
// set value to zero if undefined
function setZeroIfUndefined(value) {
	if (!value) {
		return "-";
	} else if (value == 0)
	{
		return "-"
	}
	else{
		return value;
	}
}
// Function to add new node into treeTable under parent node
function addTreeNode(table, url, parent, type, code, total, crawled, valid,
		invalid, skipped, status, domainName, base, filterCheck) {
			console.log("Status from addTree: "+status);
	crawled = setZeroIfUndefined(crawled);
	valid = setZeroIfUndefined(valid);
	invalid = setZeroIfUndefined(invalid);
	skipped = setZeroIfUndefined(skipped);
	switch(status)
	{
		case "valid":
				if(valid=='-')
				{
					valid="&#10004"; 
				}
				break;
		case "invalid":
				if(invalid=='-')
				{
					invalid="&#10004"; 
				}
				break;
		case "skipped":
				if(skipped=='-')
				{
					skipped="&#10004"; 
				}
				break;
		default:
				break;
	}
	
	var shortURL=url;
	if(url.length > 40)
	{
		shortURL = url.substring(0, 15) + "....."+url.substring(url.length-20, url.length);
	}
	
	
	
	//console.log("Parent: "+parent);
	var flag=0;
	
	if(parent!=='')
	{
		//console.log("URLs: "+eval("addedURLs"+table));
		var urls=eval("addedURLs"+table).split(',');
		var i;
		for (i = 0; i < urls.length; i++) {
    
			//console.log("Key: "+urls[i]);
			if(urls[i] !== '')
			{
				if(urls[i]!==parent)
				{
					//console.log("Inside != parent");
					flag=1;
				}
				else if(urls[i]===parent)
				{
					//console.log("Inside = parent");
					flag=0;
					break;
				}
			}
		
		}
		if(flag==1)
		{
			//console.log("Adding: "+parent);
			//Add that urls[i] as a node
			//console.log("Adding parent");
			console.log("Base: "+base);
			//eval(report+ "='"+url+"'");
			eval("addedURLs"+table+ "='"+eval("addedURLs"+table)+ ","+parent+"'");
			
			//eval("addedURLs"+table) = eval("addedURLs"+table) + ',' + parent;
			//console.log("Added URLS: "+eval("addedURLs"+table));
			
			var baseNode = $("#" + table).treetable("node", base);
			var newParent = '<tr data-tt-id="' + parent + '" data-tt-parent-id="' + base
			+ '" >' + ' <td class="re_url"     > <a href="'+parent+'" target="_blank" >' + parent + '</a></td>'
			+ '<td class="re_type"    >' + reports[base][parent].type + '</td>  '
			+ '<td class="re_crawled" >' + reports[base][parent].crawled + '</td> '
			+ '<td class="re_valid"   >' + reports[base][parent].valid + '</td>   '
			+ '<td class="re_invalid" >' + reports[base][parent].invalid + '</td> '
			+ '<td class="re_skipped" >' + reports[base][parent].skipped + '</td> ' + '<td class="re_code"    >' + reports[base][parent].code + '</td>  '+ '</tr>';
	
			$("#" + table).treetable("loadBranch", baseNode, newParent);
		}
		else{
			//do nothing
			console.log("Doing nothing");
		}
		
	}
	var parentNode = $("#" + table).treetable("node", parent);
	//console.log("Revealed: "+($("#" + table).treetable("reveal", parent)));
	console.log("Adding: "+url);
	var newNode = '<tr data-tt-id="' + url + '" data-tt-parent-id="' + parent
			+ '" >' + ' <td class="re_url"     > <a href="'+url+'" target="_blank" >' + shortURL + '</a></td>'
			+ '<td class="re_type"    >' + type + '</td>  '
			+ '<td class="re_crawled" >' + crawled + '</td> '
			+ '<td class="re_valid"   >' + valid + '</td>   '
			+ '<td class="re_invalid" >' + invalid + '</td> '
			+ '<td class="re_skipped" >' + skipped + '</td> ' + '<td class="re_code"    >' + code + '</td>  '+ '</tr>';
	
	
	$("#" + table).treetable("loadBranch", parentNode, newNode);
	eval("addedURLs"+table+ "='"+eval("addedURLs"+table)+ ","+url+"'");
			
	var isExistType = !!$("#showURLFilter" + table + " option").filter(function() {
        return $(this).attr('value').toLowerCase() === type.toLowerCase();
    }).length;

    if (!isExistType) {
        $('<option>').val(type).text(type).appendTo($("#showURLFilter" + table));
    }
	
	var isExistCode = !!$("#showHTTPFilter" + table + " option").filter(function() {
        return $(this).attr('value') == code;
    }).length;

    if (!isExistCode) {
        $('<option>').val(code).text(code).appendTo($("#showHTTPFilter" + table));
    }
	
	/*var isExistDomain = !!$("#showDomainFilter" + table + " option").filter(function() {
        return $(this).attr('value').toLowerCase() === domainName.toLowerCase();
    }).length;

    if (!isExistDomain) {
		console.log("New Domain: "+domainName);
        $('<option>').val(domainName).text(domainName).appendTo($("#showDomainFilter" + table));
    }*/
}

// Function to show report of selected tab
function showReport(url, counter) 
{
	var report = reports[url];

	$("#" + counter + " > tbody").empty();
	
	$.each(report, function(key, value) {
		addTreeNode(counter, key, value.parent, value.type, value.code,
				value.total, value.crawled, value.valid, value.invalid,
				value.skipped, value.status, value.domainName, value.baseUrl)
	});

}


// Function to show the filtered report
function showFilteredReport(url, counter, urlType, HTTPStatus, statusType, domainName) 
{
	//eval("addedURLs"+table+ "='"+eval("addedURLs"+table)+ ","+parent+"'");
			
	eval("addedURLs"+counter+ "=''");
			
	var report = reports[url];

	$("#" + counter + " > tbody").empty();
	var rootAdded=false;
	
	$.each(report, function(key, value) {
		var addNode=false;
		if(!rootAdded)
		{
			addNode=true;
			rootAdded=true;
			
		}
		else
		{ 
			if(urlType === "All")
			{
				if(statusType === "All")
				{
					if(domainName === "All")
					{
						if(value.code == HTTPStatus)
						{
							addNode=true;
						}
					}
					else if(HTTPStatus == "All")
					{
						if(value.domainName ===domainName)
						{
							addNode=true;
						}
					}
					else
					{
						if(value.domainName === domainName && value.code == HTTPStatus)
						{
							addNode=true;
						}
					}
				}
				else if(domainName === "All")
				{
					if(HTTPStatus == "All")
					{
						if((value.status).toUpperCase() === statusType.toUpperCase())
						{
							addNode=true;
						}
					}
					else
					{
						if((value.status).toUpperCase() === statusType.toUpperCase() && value.code == HTTPStatus)
						{
							addNode=true;
						}
					}
				}
				else if(HTTPStatus === "All")
				{
					if((value.status).toUpperCase() === statusType.toUpperCase() && value.domainName == domainName)
					{
						addNode=true;
					}
				}
				else
				{
					if((value.status).toUpperCase() === statusType.toUpperCase() && value.code == HTTPStatus && value.domainName == domainName)
					{
						addNode=true;
					}
				}
			}
		
		
		
		
		
			else if(statusType === "All")
			{
				if(urlType === "All")
				{
					if(domainName === "All")
					{
						if(value.code == HTTPStatus)
						{
							addNode=true;
						}
					}
					else if(HTTPStatus == "All")
					{
						if(value.domainName ===domainName)
						{
							addNode=true;
						}
					}
					else
					{
						if(value.domainName === domainName && value.code == HTTPStatus)
						{
							addNode=true;
						}
					}
				}
				else if(domainName === "All")
				{
					if(HTTPStatus == "All")
					{
						if((value.type).toUpperCase() === urlType.toUpperCase())
						{
							addNode=true;
						}
					}
					else
					{
						if((value.type).toUpperCase() === urlType.toUpperCase() && value.code == HTTPStatus)
						{
							addNode=true;
						}
					}
				}
				else if(HTTPStatus === "All")
				{
					if((value.type).toUpperCase() === urlType.toUpperCase() && value.domainName == domainName)
					{
						addNode=true;
					}
				}
				else
				{
					if((value.type).toUpperCase() === urlType.toUpperCase() && value.code == HTTPStatus && value.domainName == domainName)
					{
						addNode=true;
					}
				}
			}
					
			else if(domainName === "All")
			{
				if(urlType === "All")
				{
					if(statusType === "All")
					{
						if(value.code == HTTPStatus)
						{
							addNode=true;
						}
					}
					else if(HTTPStatus == "All")
					{
						if((value.status).toUpperCase() === statusType.toUpperCase())
						{
							addNode=true;
						}
					}
					else
					{
						if((value.status).toUpperCase() === statusType.toUpperCase() && value.code == HTTPStatus)
						{
							addNode=true;
						}
					}
				}
				else if(statusType === "All")
				{
					if(HTTPStatus == "All")
					{
						if((value.type).toUpperCase() === urlType.toUpperCase())
						{
							addNode=true;
						}
					}
					else
					{
						if((value.type).toUpperCase() === urlType.toUpperCase() && value.code == HTTPStatus)
						{
							addNode=true;
						}
					}
				}
				else if(HTTPStatus === "All")
				{
					if((value.type).toUpperCase() === urlType.toUpperCase() && (value.status).toUpperCase() === statusType.toUpperCase())
					{
						addNode=true;
					}
				}
				else
				{
					if((value.type).toUpperCase() === urlType.toUpperCase() && value.code == HTTPStatus && (value.status).toUpperCase() === statusType.toUpperCase())
					{
						addNode=true;
					}
				}
			}
			
			else if(HTTPStatus === "All")
			{
				if(urlType === "All")
				{
					if(statusType === "All")
					{
						if(value.domainName === domainName)
						{
							addNode=true;
						}
					}
					else if(domainName === "All")
					{
						if((value.status).toUpperCase() === statusType.toUpperCase())
						{
							addNode=true;
						}
					}
					else
					{
						if((value.status).toUpperCase() === statusType.toUpperCase() && value.domainName == domainName)
						{
							addNode=true;
						}
					}
				}
				else if(statusType === "All")
				{
					if(domainName == "All")
					{
						if((value.type).toUpperCase() === urlType.toUpperCase())
						{
							addNode=true;
						}
					}
					else
					{
						if((value.type).toUpperCase() === urlType.toUpperCase() && (value.status).toUpperCase() === statusType.toUpperCase())
						{
							addNode=true;
						}
					}
				}
				else if(domainName === "All")
				{
					if((value.type).toUpperCase() === urlType.toUpperCase() && (value.status).toUpperCase() === statusType.toUpperCase())
					{
						addNode=true;
					}
				}
				else
				{
					if((value.type).toUpperCase() === urlType.toUpperCase() && value.domainName == domainName && (value.status).toUpperCase() === statusType.toUpperCase())
					{
						addNode=true;
					}
				}
			}
			
			else{
				if((value.status).toUpperCase() === statusType.toUpperCase() && (value.type).toUpperCase() === urlType.toUpperCase() && value.code == HTTPStatus && value.domainName === domainName)
				{
					addNode=true;
				}
			}
				
		}
		
		if(addNode)
			{
				
				console.log("Base URL: "+value.baseUrl);
				addTreeNode(counter, key, value.parent, value.type, value.code,
					value.total, value.crawled, value.valid, value.invalid,
					value.skipped, value.status, value.domainName, value.baseUrl)
			}
	});
}

//updating counter in table column 
function setColumnValue(counter,parent, pos, value) {
	var someNode = $("#"+counter).treetable("node", parent);
	someNode.row.children("td")[pos].innerHTML = value;
}

/*
//updating progress bar
function loadProgressBar()
{
	var progress =levelProgress[currentReport];
	$.each(progress, function(key) {
		updateProgress(key);
		
	});
}
*/

var currentCrawlLevel = 1;

//This function will be executed on the click of generate button.This function will get the websites from textarea and put new request for each website into queue.
function getReports()
{
	$(".modal").on("hidden.bs.modal", function(){
		$(".modal-body-body").html("");
	});
	
	checkCrawlerService();
	if(CIRCUIT == "CLOSE")
	{
		checkNodeService();
		/*if(CIRCUIT == "CLOSE")
		{
			//check queue health
			checkQueue();
		}*/
	}
	
	console.log("-------Circuit from Crawler-------: "+CIRCUIT);
	var level =$('#level').val();
	if(CIRCUIT == "CLOSE" && level == 2)
	{
		$('#getData').attr('data-target', '#myModal');
        $('#getData').attr('data-toggle', 'modal');
		
		$("#site").prop('disabled', true);
		var text = $('#site').val();
		$("#popularReportDiv").hide();
	
		if (text != '') {
		
		text=text.replace(/\n/g, "");
		console.log("Websites: "+text);
		var allwebsites = text.split(sessionStorage.getItem('URL_SEPARATOR'));
		var serviceurl = sessionStorage.getItem('SERVICE_URL');
		$('#report tbody > tr').remove();

		var len = allwebsites.length;
		totalReports=len;
		responseReceived=0;
		var isValidRequest=true;
		var hasUrl=false;
		var invalidWebsites ="";
		for (var i = 0; i < len && i < 5 ; i++) 
		{
			if(!isUrlValid(allwebsites[i]))
			{
				isValidRequest=false;
				invalidWebsites = invalidWebsites+" "+allwebsites[i];
			}
		}
		if(!isValidRequest)
		{
			$('#getData').attr('data-target', '');
			$('#getData').attr('data-toggle', '');
			$("#errornote").empty();
			$("#errornote").append('Invalid website url ('+invalidWebsites+' ), Please enter correct format');
			$("#errornote").show();
		}
		else{
			$('#getData').attr('data-target', '#myModal');
			$('#getData').attr('data-toggle', 'modal');
		}
		
		for (var i = 0; i < len && i < 5 && isValidRequest ; i++) 
		{
			for(var x=i-1;x>=0;x--)
			{
				if(allwebsites[x]===allwebsites[i])
					{
						allwebsites[i]='';
						totalReports--;
						break;
					}
			}
			
			if(allwebsites[i]!=='')
			{
				
				var modalData='<input type="checkbox" id="websites"  />&nbsp;' + allwebsites[i] + '<br/>';
				
				$("#linksCheckbox").append(modalData);
				$("#websites").attr('id','website'+i);
			}
		}
	} 
	}
	else if(CIRCUIT === "CLOSE" && level!=2){
		$('#getData').attr('data-target', '');
        $('#getData').attr('data-toggle', '');
		putToQueue(false);
	}
	else{
		$('#getData').attr('data-target', '');
        $('#getData').attr('data-toggle', '');
		console.log("crawler service is down");
		var result={
					"action": "ALERT",
					"message": "Crawler service is down. You can try after 2 minutes."
				   }
		performNextAction(result)
	}
}

function putToQueue(booleanValue)
{
	clearTreeTable();
	var text = $('#site').val();
	var level =$('#level').val();
	currentCrawlLevel=level;
	reports = {};
	$("#popularReportDiv").hide();
	
	console.log("current session "+sessionID);
	if (text != '') {
		$('#reports').empty();
		$('#tabs').empty();
		$("#getData").hide();
		$("#errornote").hide();
		$("#errornote1").hide();
		
		selectedLink="";
		text=text.replace(/\n/g, "");
		console.log("Websites: "+text);
		var allwebsites = text.split(sessionStorage.getItem('URL_SEPARATOR'));
		var serviceurl = sessionStorage.getItem('SERVICE_URL');
		$('#report tbody > tr').remove();

		var len = allwebsites.length;
		totalReports=len;
		responseReceived=0;
		var isValidRequest=true;
		var hasUrl=false;
		var invalidWebsites ="";
		for (var i = 0; i < len && i < 5 ; i++) 
		{
			if(!isUrlValid(allwebsites[i]))
			{
				isValidRequest=false;
				invalidWebsites = invalidWebsites+" "+allwebsites[i];
			}
		}
		if(!isValidRequest)
		{
			$("#errornote").empty();
			$("#errornote").append('Invalid website url ('+invalidWebsites+' ), Please enter correct format');
			$("#errornote").show();
		}
		var countWebsites=0;
		for (var i = 0; i < len && i < 5 && isValidRequest ; i++) 
		{
			for(var x=i-1;x>=0;x--)
			{
				if(allwebsites[x]===allwebsites[i])
					{
						allwebsites[i]='';
						totalReports--;
						break;
					}
			}
			
			if(allwebsites[i]!=='')
			{
				{
					var external='';
					if(booleanValue === false)
					{
						external=false;
					}
					else
					{
						external = $('#website' + i).prop("checked");
					}
					console.log(i+"      "+external);
					var getReportRequest = 'website=' + encodeURIComponent(allwebsites[i]) + '&crawllevel=' + level + '&id=' + sessionID + '&externallinks=' + external + '&counter=report' +countWebsites ;
					
					var reqData = {};
					reqData["request"] = getReportRequest;
					
					//ajax request to put new request into queue
					  
					$.ajax({
					type : "POST",
					url : "/put-new-request",
					contentType : "application/json",
					data: JSON.stringify(reqData),
					dataType: "json",
					success : function(data, status) 
					{
						printLog('SERVICE_REQUEST', 'Response status '+status);
											
					}
				});
				
				}
				countWebsites++;
			}
		}
	} 
}

function clearTreeTable()
{
	$("#progress").empty();
	
	$("#divHeadreport0").remove();
	$("#divHeadreport1").remove();
	$("#divHeadreport2").remove();
	$("#divHeadreport3").remove();
	$("#divHeadreport4").remove();
	$("#reportAnchor0").remove();
	$("#reportAnchor1").remove();
	$("#reportAnchor2").remove();
	$("#reportAnchor3").remove();
	$("#reportAnchor4").remove();
	report0="";
	report1="";
	report2="";
	report3="";
	report4="";
	$("#report0").remove();
	$("#report1").remove();
	$("#report2").remove();
	$("#report3").remove();
	$("#report4").remove();	
}

/*
function completePercentage()
{
	$.each(levelProgress, function(website,progress) 
	{
		$.each(progress, function(level,counters){
			levelProgress[website][level].total=levelProgress[website][level].crawled;
			if(website==currentReport)
				{
					updateProgress(level);
				}
		});
	});
}
*/
//function to update the progress bar based on the no of links crawled
function updateProgress(level, report) 
{
	var $ppc = $("#progressBar"+level+""+report);

	var crawled = levelProgress[eval(report)][level].crawled;
	var total = levelProgress[eval(report)][level].total;
	
	var percent = (100 * crawled)/total;
	if(percent>100)
	{
		percent=100;
	}
	var deg = (360 * percent)/100;

	if (percent > 50) {
		$ppc.addClass('gt-50');
	} else {
		$ppc.removeClass('gt-50');
	}
	
	if(percent == 100 && level == currentCrawlLevel)
	{
		var data = {};
		data[eval(report)]=reports[eval(report)];
		saveReport(data);
	}

	$("#level"+level+"progress"+report).css('transform', 'rotate(' + deg + 'deg)');
	$("#level"+level+"percents"+report).html(parseInt(percent, 10) + '%');
}


//This function will add new progress bar for the level passed as parameter
function addNewLevelProgress(level, report)
{
	var newProgressBar = '<div style="float:left;margin-top:9px;"><span class="spanLevelProgress">Level '+level+' Progress</span>   <div class="progress-pie-chart" id="progressBar'+level+""+report+'" data-percent="0">'+
								'<div class="ppc-progress">'+
								'<div class="ppc-progress-fill" id="level'+level+'progress'+report+'"></div>'+
								'</div>'+
								'<div class="ppc-percents">'+
									'<div class="pcc-percents-wrapper">'+
										'<span id="level'+level+'percents'+report+'">0%</span>'+
									'</div>'+
								'</div>'+
							'</div></div>';
	$("#progress"+report).append(newProgressBar);
}

//function to check validity of website url entered
function isUrlValid(url) {
    return /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(url);
}

var newTable;
//This function will enable the socket client which will listen on the SESSIONID variable
function enableSocketClient() {
	
	//var socketUrl=sessionStorage.getItem("SOCKET_IO_URL");
	var socketUrl = document.URL;
	printLog("report ", "Connecting |" + socketUrl+"|");
	var socket = io.connect(socketUrl);
	
	console.log("report ", "Connected with session "+sessionID);
	socket
			.on(sessionID,function(data) {
						//console.log("DATA from Socket: "+JSON.stringify(data));
						var parentNode;
						var currentURLLevel = 1;
						// If this is first packet of website
						//Reports is an object,in which we will add all the URLs
						//levelProgress is also an object
						//this is checking if the reports[data.baseUrl] is empty(means not already added),then it will create a new tab for that in UI
						//and will create an object reports[data.baseUrl]
						//and will create an object levelProgress[data.baseUrl]
						if (!reports[data.baseUrl]) 
						{
							reports[data.baseUrl] = {};
							levelProgress[data.baseUrl]={};
							//in this function currentReport value will be set to data.baseUrl
							addNewTab(data.counter, data.baseUrl);
							newTable = '<a name="tab1" id="linkTab">'
							+'<div class="panel-heading" id="divHead" style="clear:both;">'
							+'<h3 id="reportHead" class="panel-title">'
							+'Report for &nbsp<strong><span id="currentURL"></span></strong>'
							+'</h3>'
							+'</div>'
							
							+'<fieldset>'
							+'<div class="col-md-8" style="float:left;">'
							+'<table id="currentReport" class="table table-bordered alternateRow">'
							+'<thead>'
							+'<tr>'
							+'<th>URL</th>'
							+'<th>URL Type</th>'
							+'<th>Crawled</th>'
							+'<th>Valid</th>'
							+'<th>Invalid</th>'
							+'<th>Skipped</th>'
							+'<th>Code</th>'
							+'</tr>'
							
							+'<tr>'
							+'<td>'
							+'<select class="form-control" id="showDomainFilter">'
							+'<option value="All">All</option>'
							+'</select>'
							+'</td>'
							+'<td>'
							+'<select class="form-control" id="showURLFilter">'
							+'<option value="All">All</option>'
							+'</select>'
							+'</td>'
							+'<td>Crawled</td>'
							+'<td colspan="3">'
							+'<select class="form-control" id="showQualityFilter">'
							+'<option value="All">All</option>'
							+'<option value="Valid">Valid</option>'
							+'<option value="Invalid">Invalid</option>'
							+'<option value="Skipped">Skipped</option>'
							+'</select>'
							+'</td>'
							+'<td>'
							+'<select class="form-control" id="showHTTPFilter">'
							+'<option value="All">All</option>'
							+'</select>'
							+'</td>'
							+'</tr>'
							+'</thead>'
							+'<tbody>'
							+'</tbody>'
							+'</table>'
							+'</div>'
							+'<div class="col-md-4" id="progress" style="float:left;">'
							+'</div>'
							+'</fieldset>'
							+'</a>'
							
			$("#details").append(newTable);
			$("#currentURL").attr('id','currentURL'+data.counter);
			$("#currentURL"+data.counter).append(data.baseUrl);
			$("#currentReport").attr('id',data.counter);
			$("#divHead").attr('id','divHead'+data.counter);
			$("#showURLFilter").attr('id','showURLFilter'+data.counter);
			$("#showQualityFilter").attr('id','showQualityFilter'+data.counter);
			$("#showDomainFilter").attr('id','showDomainFilter'+data.counter);
			$("#showHTTPFilter").attr('id','showHTTPFilter'+data.counter);
			$("#linkTab").attr('name','div'+data.counter);
			//$("#"+data.counter).expandAll();
			var str=data.counter;
			$("#linkTab").attr('id','reportAnchor'+str.substring(str.length-1, str.length));
			$("#"+data.counter).treetable({ expandable: true });
			
			$("#progress").attr('id','progress'+data.counter);
			
					//Filters
					 
					$("#showURLFilter"+data.counter).change(function(){
						var urlType = $("option:selected",this).val();
						var e = document.getElementById("showQualityFilter"+data.counter);
						var statusType = e.options[e.selectedIndex].value;
						e = document.getElementById("showHTTPFilter"+data.counter);
						var HTTPStatus=e.options[e.selectedIndex].value;
						e = document.getElementById("showDomainFilter"+data.counter);
						var domainName=e.options[e.selectedIndex].value;
						console.log("domainName for filter: " + domainName);
						
						if(urlType === "All" && HTTPStatus === "All" && statusType==="All" && domainName === "All")
						{
							isFilterOn=false;
							showReport(data.baseUrl, data.counter);
						}
						else
						{
							isFilterOn=true;
							showFilteredReport(data.baseUrl, data.counter, urlType, HTTPStatus, statusType, domainName);
						}
					});
					
					$('#showHTTPFilter'+data.counter).change(
							function() {
								var HTTPStatus = $("option:selected",this).val();
								var e = document.getElementById("showQualityFilter"+data.counter);
								var statusType = e.options[e.selectedIndex].value;
								e = document.getElementById("showURLFilter"+data.counter);
								var urlType=e.options[e.selectedIndex].value;
								e = document.getElementById("showDomainFilter"+data.counter);
								var domainName=e.options[e.selectedIndex].value;
						
								if(urlType === "All" && HTTPStatus === "All" && statusType==="All" && domainName === "All")
								{
									isFilterOn=false;
									showReport(data.baseUrl, data.counter);
								}
								else
								{
									isFilterOn=true;
									showFilteredReport(data.baseUrl, data.counter, urlType, HTTPStatus, statusType, domainName);
								}
	
							});
							
					$("#showQualityFilter"+data.counter).change(function(){
						var statusType = $("option:selected",this).val();
						var e = document.getElementById("showURLFilter"+data.counter);
						var urlType = e.options[e.selectedIndex].value;
						e = document.getElementById("showHTTPFilter"+data.counter);
						var HTTPStatus=e.options[e.selectedIndex].value;
						e = document.getElementById("showDomainFilter"+data.counter);
						var domainName=e.options[e.selectedIndex].value;
						
						if(urlType === "All" && HTTPStatus === "All" && statusType==="All" && domainName === "All")
								{
									isFilterOn=false;
									showReport(data.baseUrl, data.counter);
								}
								else
								{
									isFilterOn=true;
									showFilteredReport(data.baseUrl, data.counter, urlType, HTTPStatus, statusType, domainName);
								}
					});
					
					$("#showDomainFilter"+data.counter).change(function(){
						var domainName = $("option:selected",this).val();
						var e = document.getElementById("showQualityFilter"+data.counter);
						var statusType = e.options[e.selectedIndex].value;
						e = document.getElementById("showHTTPFilter"+data.counter);
						var HTTPStatus=e.options[e.selectedIndex].value;
						e = document.getElementById("showURLFilter"+data.counter);
						var urlType=e.options[e.selectedIndex].value;
						
						if(urlType === "All" && HTTPStatus === "All" && statusType==="All" && domainName === "All")
								{
									isFilterOn=false;
									showReport(data.baseUrl, data.counter);
								}
								else
								{
									isFilterOn=true;
									showFilteredReport(data.baseUrl, data.counter, urlType, HTTPStatus, statusType, domainName);
								}
					});

						parentNode = $("#"+data.counter).treetable("node", data.parentUrl);
					}
						
						//Creating an object urldetailsand assigning socket event to urldetails
						var urldetails = new Object();
						urldetails.parent = data.parentUrl;
						urldetails.total = data.totalChildren;
						urldetails.code = data.linkResponseCode;
						urldetails.type = data.linkType;
						urldetails.status = data.linkStatus;
						//console.log("urldetails.status: "+urldetails.status+"--------------"+data.linkStatus);
						urldetails.crawled = 0;
						urldetails.valid = 0;
						urldetails.invalid = 0;
						urldetails.skipped = 0;
						urldetails.level = currentURLLevel;
						urldetails.counter = data.counter;
						urldetails.domainName = data.domainName;
						urldetails.baseUrl = data.baseUrl;
						var alreadyExists = true;
						//it is checking if the currenrUrl from the socket event already exists or not,if it doesn't,then it is setting alreadyExits=false and craeting object
						//reports[data.baseUrl][data.currenrUrl]=urldetails
						if(!reports[data.baseUrl][data.currenrUrl])
						{
							reports[data.baseUrl][data.currenrUrl]=urldetails;
							alreadyExists=false;
							//it doesn't exist already
						}							

						//means not the base url
						if (data.parentUrl) {

						//crawling one child of data.parentUrl
							var parentLevel = reports[data.baseUrl][data.parentUrl].level;    //1
							currentURLLevel = parentLevel + 1     //2
							if(reports[data.baseUrl][data.currenrUrl].level > currentURLLevel)     //(1>2)
							{
								reports[data.baseUrl][data.currenrUrl]=urldetails;
								reports[data.baseUrl][data.currenrUrl].level = currentURLLevel;
							}
							
							if(!alreadyExists)
							{
								reports[data.baseUrl][data.currenrUrl].level = currentURLLevel;     //2
							}
							//everytime we are coming here,one child of data.parentUrl gets crawled
							var crawled = reports[data.baseUrl][data.parentUrl].crawled;
							crawled++;
							reports[data.baseUrl][data.parentUrl].crawled = crawled;

							try {
								levelProgress[data.baseUrl][parentLevel].crawled = levelProgress[data.baseUrl][parentLevel].crawled+1;
							}
							catch(err) {
								console.log("INVALID DATA : "+JSON.stringify(data)); 
								console.log("parent level "+parentLevel+"  "+JSON.stringify(levelProgress));
								parentLevel--;
								levelProgress[data.baseUrl][parentLevel].crawled = levelProgress[data.baseUrl][parentLevel].crawled+1;	
								reports[data.baseUrl][data.currenrUrl].level = parentLevel+1;
								reports[data.baseUrl][data.parentUrl]=parentLevel;
							}
							//updating progress of parent node
							if (data.baseUrl == eval(data.counter)) {
								setColumnValue(data.counter, data.parentUrl, 2, crawled);
								updateProgress(parentLevel, data.counter);    //updateProgress(1)
							}
							if (data.linkStatus == "invalid") {
								var invalidcount = reports[data.baseUrl][data.parentUrl].invalid;
								invalidcount++;
								reports[data.baseUrl][data.parentUrl].invalid = invalidcount;

								if (data.baseUrl == eval(data.counter)) {
									//setColumnValue(data.parentUrl, 4, invalidcount);
								}
							} else if (data.linkStatus == "skipped") {
								var skipped = reports[data.baseUrl][data.parentUrl].skipped;
								skipped++;
								reports[data.baseUrl][data.parentUrl].skipped = skipped;
								if (data.baseUrl == eval(data.counter)) {
									//setColumnValue(data.parentUrl, 5, skipped);
								}
							} else {
								
								var validcount = reports[data.baseUrl][data.parentUrl].valid;
								validcount++;
								reports[data.baseUrl][data.parentUrl].valid = validcount;
								if (data.baseUrl == eval(data.counter)) {
									//setColumnValue(data.parentUrl, 3, validcount);
								}
							}
						}

						//Adding updating progress if url is a branch(not leaf node)
						if (data.totalChildren != 0) {
							//Adding new progress bar for new level
							if (!levelProgress[data.baseUrl][currentURLLevel]) {
								levelProgress[data.baseUrl][currentURLLevel]={};
								levelProgress[data.baseUrl][currentURLLevel].total = data.totalChildren;
								levelProgress[data.baseUrl][currentURLLevel].crawled = 0;
								if(data.baseUrl == eval(data.counter))
									addNewLevelProgress(currentURLLevel, data.counter);
							}
							//updating progress bar of existing level
							else 
							{
								levelProgress[data.baseUrl][currentURLLevel].total = levelProgress[data.baseUrl][currentURLLevel].total + data.totalChildren;
								if(eval(data.counter) == data.baseUrl)
									{
										updateProgress(currentURLLevel, data.counter);
									}
							}
						}

						// Adding table row in selected report
						if (data.baseUrl == eval(data.counter)) 
						{
							if(isFilterOn)
								{
									showFilteredReport(eval(data.counter));
								}
							else if (!alreadyExists)
							{
								addTreeNode(data.counter, data.currenrUrl, data.parentUrl,data.linkType, data.linkResponseCode, data.totalChildren, 0, 0, 0,	0, data.linkStatus, data.domainName, data.baseUrl);
							}
						}
						
						if(totalReports==responseReceived)
							{
								//completePercentage();
								//saveReport();
							}
					});
}

//function to save the reports once crawling is completed
function saveReport(data)
{
	//console.log("Saved Report: "+JSON.stringify(data));
	$("#getData").show();
	$("#reportFilter").show();
	$("#site").prop('disabled', false);	
	checkDataService();
	var report = {};
	report['report'] = data; 
	if(CIRCUIT = "CLOSE")
	{
	// Test connection	
	 $.ajax({
			type : "GET",
			url : "/listener-health-check",
			async: false,
			timeout:sessionStorage.getItem('SERVICE_TIMEOUT_THRESHOLD'),
			success : function(result) 
			{
				console.log("listener-health-check == " + result);				
			}
		});
		
	$.ajax({
		type : "POST",
		url : "/put-new-report",//sessionStorage.getItem('DATASERVICE_UPDATE_REPORT_URL'),
		contentType : "application/json",
		async : true,
		dataType: 'json',
		data  : JSON.stringify(report), 
		success : function(data, status) 
		{
			console.log("Success");
		},
		error : function(xhr) {
			console.log("some error "+JSON.stringify(xhr));
		}
	});
	}
	else{
		console.log("data service is down");
		var result={
					"action": "ALERT",
					"message": "Data service is down. Report will not be saved."
				   }
		performNextAction(result);
	}
}

function trim(link, limit) {
	if (link.length < limit) {
		return link;
	} else {
		var trimmedLink = link.substring(0, limit) + "...";
		return trimmedLink;
	}
}

var totalReports = 0;
var responseReceived = 0;

function printLog(action, msg) {
	var appName = "WEBSITEREPORT_USERINTERFACE";
	var time = $.now();

	console.log('APP:' + appName + ' ' + 'TIME:' + time + ' EVENT:' + action
			+ ' MESSAGE:' + msg);
}

//To get popular websites
function getPopularWebsites()
{
	var msg={
					"action": "ALERT",
					"message": "Router service is down. Please try after some time."
			   }
	checkRouterService();
	if(CIRCUIT == "CLOSE")
	{
		var result = checkWsqcService("/service-management");
		console.log('CACHE_POPULAR_REPORT_URL == ' + result);
		//alert(result);
	//$.ajax({
		//type : "GET",
		//url : sessionStorage.getItem('CACHE_POPULAR_REPORT_URL'),		
		//contentType : "application/json",
		//success : function(result) {
			//console.log(result);
			if(result==="please try again later")
			{
				msg={
					"action": "ALERT",
					"message": "Cache service and Database are down. Please try after some time."
			   }
			   performNextAction(msg);
			}
		
			else{
				$("#popularReportDiv").show();
				var reports=result.split(",");
				$.each(reports, function(index,value) {
					var popularReportCheckBox = '<tr><td><input class="messageCheckbox" type="checkbox" value="'+value+'" name="'+value+'" >&nbsp'+value+' </td></tr>';
					$('#popularReportTable tbody').append(popularReportCheckBox);
				});
			}
		//}
	//});
	}
	else{
		console.log("router service is down");
		//performNextAction(msg)
	}
}

//Perform next best action if any service is down
function performNextAction(result)
{
	if(result.action == "ERROR_PAGE")
	{
		sessionStorage.setItem('ERROR_MESSAGE',result.message);
		window.location.href = '/error';
	}
	else if(result.action == "ALERT")
	{
		$("#errornote").empty();
		//$("#errornote").append(result.message);
		//$("#errornote").show();		
	}
}

//To retrieve popular reports from cache
function retrievePopularReports()
{
	var checkedValue = []; 
	var inputElements = document.getElementsByClassName('messageCheckbox');
	var requestParam="";
	for(var i=0; inputElements[i]; ++i){
	      if(inputElements[i].checked){
	           checkedValue.push(inputElements[i].value);
	           requestParam+="website="+inputElements[i].value+"&";
	      }
	}
	requestParam = requestParam.substring(0,requestParam.length-1);
	
	var result = getService('/popularcrawlreport', requestParam);
	console.log('CACHE_RETRIEVE_REPORT_URL == ' + result);

//	$.ajax({
	//	type : "GET",
		url = sessionStorage.getItem('CACHE_RETRIEVE_REPORT_URL') + '/popularcrawlreport?' + requestParam;
	//	success : function(result) 
		{
			$("#popularReportDiv").hide();
			$.each(result, function(url,report) {
				var jsonReport= JSON.parse(report);
				console.log("report: " + report)
				console.log("jsonReport: " + jsonReport)
				reports[url]=JSON.parse(jsonReport);
			});
			showTabs();
		}
	//});	
}

function updateCurrentReport(report, url)
{
	eval(report+ "='"+url+"'");
	$('#currentURL').empty();
	$('#currentURL').append(url);
}

var j=0;
//to add new tab for new website
function addNewTab(report, url)
{	
	if (eval(report) === "") 
	{
		updateCurrentReport(report, url);
		$("#TabPanel").show();
		$("#reportPanel").show();
		$('#tabs').append('<li class="tab tab-selected"> <a href="#tab" class="tabAnchor" id="tab">'+url+'</a></li>');
	} else {
		$('#tabs').append('<li class="tab"> <a href="#tab" id="tab">'+url+'</a></li>');
	}
	$("#tab").attr('href','#div'+report);
	$("#tab").attr('id',url+''+j);
	j++;
}
//Showing table panel
var newTable1="";
var getValue="";
var stri="";
function showTabs()
{
	$("#TabPanel").show();
	$("#reportPanel").show();
	$("#popularReportDiv").hide();

	$.each(reports, function(website,report) {
		countReports++;
		addNewTab("report"+countReports, website);
		newTable1 = '<a name="tab1" id="linkTab">'
							+'<div class="panel-heading" id="divHead">'
							+'<h3 id="reportHead" class="panel-title">'
							+'Report for &nbsp<strong><span id="currentURL"></span></strong>'
							+'</h3>'
							+'</div>'
							
							+'<fieldset>'
							+'<div class="col-md-8">'
							+'<table id="currentReport" class="table table-bordered alternateRow">'
							+'<thead>'
							+'<tr>'
							+'<th>URL</th>'
							+'<th>URL Type</th>'
							+'<th>Crawled</th>'
							+'<th>Valid</th>'
							+'<th>Invalid</th>'
							+'<th>Skipped</th>'
							+'<th>Code</th>'
							+'</tr>'
							
							+'<tr>'
							+'<td>'
							+'<select class="form-control" id="showDomainFilter">'
							+'<option value="All">All</option>'
							+'</select>'
							+'</td>'
							+'<td>'
							+'<select class="form-control" id="showURLFilter">'
							+'<option value="All">All</option>'
							+'</select>'
							+'</td>'
							+'<td>Crawled</td>'
							+'<td colspan="3">'
							+'<select class="form-control" id="showQualityFilter">'
							+'<option value="All">All</option>'
							+'<option value="Valid">Valid</option>'
							+'<option value="Invalid">Invalid</option>'
							+'<option value="Skipped">Skipped</option>'
							+'</select>'
							+'</td>'
							+'<td>'
							+'<select class="form-control" id="showHTTPFilter">'
							+'<option value="All">All</option>'
							+'</select>'
							+'</td>'
							+'</tr>'
							+'</thead>'
							+'<tbody>'
							+'</tbody>'
							+'</table>'
							+'</div>'
							+'</fieldset>'
							+'</a>'
							
			$("#details").append(newTable1);
			
			$("#currentReport").attr('id',"report"+countReports);
			$("#currentURL").attr('id','currentURL'+countReports);
			$("#currentURL"+countReports).append(website);
			$("#divHead").attr('id','divHeadreport'+countReports);
			$("#linkTab").attr('name','divreport'+countReports);
			$("#linkTab").attr('id','reportAnchor'+countReports);
			$("#report"+countReports).treetable({ expandable: true });
			$("#showURLFilter").attr('id','showURLFilterreport'+countReports);
			$("#showQualityFilter").attr('id','showQualityFilterreport'+countReports);
			$("#showDomainFilter").attr('id','showDomainFilterreport'+countReports);
			$("#showHTTPFilter").attr('id','showHTTPFilterreport'+countReports);
			
			//Filters
			
					$("#showURLFilterreport"+countReports).change(function(){
						getValue=$(this).attr('id');
						stri=getValue.substring(getValue.length-1, getValue.length);
						var urlType = $("option:selected",this).val();
						var e = document.getElementById("showQualityFilterreport"+stri);
						var statusType = e.options[e.selectedIndex].value;
						e = document.getElementById("showHTTPFilterreport"+stri);
						var HTTPStatus=e.options[e.selectedIndex].value;
						e = document.getElementById("showDomainFilterreport"+stri);
						var domainName=e.options[e.selectedIndex].value;
						
						if(urlType === "All" && HTTPStatus === "All" && statusType==="All" && domainName === "All")
						{
							isFilterOn=false;
							showReport(website, 'report'+stri);
						}
						else
						{
							isFilterOn=true;
							showFilteredReport(website, 'report'+stri, urlType, HTTPStatus, statusType, domainName);
						}
					});
					
					$('#showHTTPFilterreport'+countReports).change(
							function() {
								getValue=$(this).attr('id');
								stri=getValue.substring(getValue.length-1, getValue.length);
								//console.log("Inside count reports: "+countReports);
								var HTTPStatus = $("option:selected",this).val();
								var e = document.getElementById("showQualityFilterreport"+stri);
								var statusType = e.options[e.selectedIndex].value;
								e = document.getElementById("showURLFilterreport"+stri);
								var urlType=e.options[e.selectedIndex].value;
								e = document.getElementById("showDomainFilterreport"+stri);
								var domainName=e.options[e.selectedIndex].value;
						
								if(urlType === "All" && HTTPStatus === "All" && statusType==="All" && domainName === "All")
								{
									isFilterOn=false;
									showReport(website, 'report'+stri);
								}
								else
								{
									isFilterOn=true;
									showFilteredReport(website, 'report'+stri, urlType, HTTPStatus, statusType, domainName);
								}
	
							});
							
					$("#showQualityFilterreport"+countReports).change(function(){
						getValue=$(this).attr('id');
						stri=getValue.substring(getValue.length-1, getValue.length);
						console.log("Inside count reports: "+countReports);
						var statusType = $("option:selected",this).val();
						var e = document.getElementById("showURLFilterreport"+stri);
						var urlType = e.options[e.selectedIndex].value;
						e = document.getElementById("showHTTPFilterreport"+stri);
						var HTTPStatus=e.options[e.selectedIndex].value;
						e = document.getElementById("showDomainFilterreport"+stri);
						var domainName=e.options[e.selectedIndex].value;
						
						if(urlType === "All" && HTTPStatus === "All" && statusType==="All" && domainName === "All")
								{
									isFilterOn=false;
									showReport(website, 'report'+stri);
								}
								else
								{
									isFilterOn=true;
									showFilteredReport(website, 'report'+stri, urlType, HTTPStatus, statusType, domainName);
								}
					});
					
					$("#showDomainFilterreport"+countReports).change(function(){
						getValue=$(this).attr('id');
						stri=getValue.substring(getValue.length-1, getValue.length);
						console.log("Inside count reports: "+countReports);
						var domainName = $("option:selected",this).val();
						var e = document.getElementById("showQualityFilterreport"+stri);
						var statusType = e.options[e.selectedIndex].value;
						e = document.getElementById("showHTTPFilterreport"+stri);
						var HTTPStatus=e.options[e.selectedIndex].value;
						e = document.getElementById("showURLFilterreport"+stri);
						var urlType=e.options[e.selectedIndex].value;
						
						if(urlType === "All" && HTTPStatus === "All" && statusType==="All" && domainName === "All")
								{
									isFilterOn=false;
									showReport(website, 'report'+stri);
								}
								else
								{
									isFilterOn=true;
									showFilteredReport(website, 'report'+stri, urlType, HTTPStatus, statusType, domainName);
								}
					});
			
					showReport(website, 'report'+countReports);
	});
}

//Treetable expandAll functionality
/*$.fn.expandAll = function() {  
    $(this).find("tr").removeClass("collapsed").addClass("expanded").each(function(){  
        $(this).expand();  
    });  
}; */ 


$(document)
		.ready(
				function() {
					sessionID = 'SESSION'+(Math.floor((Math.random() * 10000000000) + 1));
					//Here expandable: true means tree is expandable
					$("#wait").hide();
					$('#getData').prop('disabled', true);
					// Disable button if textbox is empty
					$('#site').keyup(
							function() {
								$('#getData').prop('disabled',
										this.value == "" ? true : false);
							})

					// To Remove Space character
					$('#site').keydown(function(e) {
						if (e.keyCode == 32) // 32 is the ASCII value for a
												// space
						{
							e.preventDefault();
						} else if (e.keyCode == 13) {
							//if (totalReports === responseReceived)
								//getReports();
							//e.preventDefault();

						}

					});
					printLog('GETENV', 'AJAX call to get the ENV variables');
					//ajax request to get all env attributes
					$.ajax({
								type : "GET",
								url : "getenv",
								contentType : "application/json",
								success : function(result) {
									var env = result.split("|");
									printLog('GETENV',
											'Successfully got ENV variables');
									printLog('GETENV', 'CRAWL_LEVEL = '+ env[0]);
									sessionStorage.setItem('CRAWL_LEVEL',env[0]);
									sessionStorage.setItem('SERVICE_URL',env[1]);
									printLog('GETENV', 'SERVICE_URL = '+ env[1]);
									sessionStorage.setItem('URL_SEPARATOR',	env[2]);
									printLog('GETENV', 'URL_SEPARATOR = '+ env[2]);
									sessionStorage.setItem(	'REPORT_TABLE_LIMIT', env[3]);
									printLog('GETENV', 'REPORT_TABLE_LIMIT = '
											+ env[3]);
									sessionStorage.setItem('SOCKET_IO_URL',env[4]);
									sessionStorage.setItem('CACHE_POPULAR_REPORT_URL',env[5]);
									sessionStorage.setItem('CACHE_RETRIEVE_REPORT_URL',env[6]);
									sessionStorage.setItem('DATASERVICE_UPDATE_REPORT_URL',env[7]);
									sessionStorage.setItem('DATASERVICE_CONNECTION_TEST_URL',env[8]);
									sessionStorage.setItem('CRAWLER_SERVICE_CONNECTION_TEST_URL',env[9]);
									sessionStorage.setItem('CACHE_CONNECTION_TEST_URL',env[10]);
									sessionStorage.setItem('SERVICE_TIMEOUT_THRESHOLD',env[11]);
									sessionStorage.setItem('ROUTER_SERVICE_URL',env[12]);
									sessionStorage.setItem('CRAWLER_HEALTH_CHECK',env[13]);
									sessionStorage.setItem('NODE_HEALTH_CHECK',env[14]);
									sessionStorage.setItem('QUEUE_HEALTH_CHECK',env[15]);
									
									$('#separator').empty();

									$('#separator')
											.append(
													"Please prefix the Website URL with \"http(s)://www\". To enter multiple URL's use separator("
															+ sessionStorage.URL_SEPARATOR
															+ "). Maximum 5 websites at a time."
															+"<br/>The percentage shown is indicative and may be reset as and when new links are discovered.");
									}
							}).done(function(){
								enableSocketClient();
								getPopularWebsites();
							});

					//Changing reports on click of tab
					$("#tabs").on('click', 'li', function() {
						$('.tab').removeClass('tab-selected');
						  
						   $(this).addClass('tab-selected');
						   //$("#currentURL").empty();
						   //var str = $('a', this).attr('id');
						   //$("#currentURL").append(str.substring(0, str.length-1));
					});

					$("#getData").click(function() {
						
						getReports();
					}); // getData click function
					
					$("#startCrawl").click(function() {						
						putToQueue(true);
					}); //done button of Modal
					
					$("#retrivePopularRepots").click(function() {
						retrievePopularReports();
					});
					
					$(window).scroll(function() {
						if ($(this).scrollTop() >= 80) {        // If page is scrolled more than 50px
							$('#return-to-top').fadeIn(200);    // Fade in the arrow
						} else {
							$('#return-to-top').fadeOut(200);   // Else fade out the arrow
						}
					});
					$('#return-to-top').click(function() {      // When arrow is clicked
						$('body,html').animate({
							scrollTop : 0                       // Scroll to top of body
						}, 500);
					});

				});