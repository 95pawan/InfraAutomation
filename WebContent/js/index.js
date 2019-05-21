
function trim(link,limit)
{
	if(link.length<limit)
	{
		return link;
	}
	else
	{
		var trimmedLink = link.substring(0,limit)+"...";
		return trimmedLink;
	}
}

function addRow(id, link, type) {

	$('#report > tbody:last-child').append(
			'<tr class="alert alert-warning"><td><a target="_blank" href="'
					+ link + '">' + trim(link,100) + '</a></td><td>' + type
					+ '</td> </tr>');

}

function setReport(url) {
	
	$('#reports').empty();
	$('#details').empty();
	$('#currentURL').empty();
	$('#currentURL').append(url);
	printLog('PRINTING_REPORT', 'Printing Report for website '+url);
	
	var report = reports[url];

	var validurl = false;

	
	
	var $ppc = $("#per1");
	  
    percent = report.progress;
    deg = 360 * percent / 100;

	if (percent > 50) {
		$ppc.addClass('gt-50');
	}else
	{
		$ppc.removeClass('gt-50');
	}
	
	$("#perf").css('transform', 'rotate(' + deg + 'deg)');
	$("#pers1").html(parseInt(percent, 10) + '%');
	
	

	var summaryTable = '<div id="summarydiv" ><table id="summarytable" class="table table-bordered table-hover">'
			+ '          <thead>'
			+ '            <tr >'
			+ '              <th colspan="3" class="text-center" >Summary</th>'
			+ '            </tr>'
			+ '            <tr>'
			+ '              <th>Type</th>'
			+ '              <th>Total</th>'
			+ '              <th>Invalid</th>'
			+ '            </tr>'
			+ '          </thead>'
			+ '          <tbody>'
			+ '            <tr>'
			+ '              <td>URL</td>' + '              <td>'
			+ report.totalUrlCount
			+ '</td>'
			+ '              <td>'
			+ report.invalidUrlCount
			+ '</td>'
			+ '            </tr>'
			+ '            <tr>'
			+ '              <td>Download</td>'
			+ '              <td>'
			+ report.totalDownload
			+ '</td>'
			+ '              <td>'
			+ report.invalidDownloadCount
			+ '</td>'
			+ '            </tr>'
			+ '            <tr>'
			+ '              <td>Email</td>'
			+ '              <td>'
			+ report.totalEmail
			+ '</td>'
			+ '              <td>'
			+ report.invalidEmailCount
			+ '</td>'
			+ '            </tr>'
			+ '            <tr>'
			+ '              <td>SkippedURL</td>'
			+ '              <td colspan="2">'
			+ report.skippedURL
			+ '</td>'
			+ '            </tr>' + '          </tbody>' + '</table> </div>';

	validurl = report.isValid;
	printLog('PRINTING_REPORT', 'valid URL ='+validurl);
	if (validurl !== true) 
	{
		
		var msg = "Website URL is not Valid";
		if (report.crawled === 'incomplete') 
		{
			msg = "This website was not crawled as the time limit was exceeded";
		}
    
		summaryTable = '<div  id="summarydiv" ><table id="summarytable" class="table table-bordered table-hover">'
				+ '          <thead>'
				+ '            <tr >'
				+ '              <th  class="text-center" >Summary</th>'
				+ '            </tr> </thead> <tbody>'
				+ '            <tr>'
				+ '                 <td class="alert alert-danger" > '
				+ msg
				+ ' </td>' + '				</tr>' + '				</tbody></table></div>';

	}

	var reportTable = '<div id="reportDiv" class="col-md-12"><table id="report" class="table table-bordered table-hover">'
			+ '	<thead>'
			+ '							<tr>'
			+ '								<th>Invalid Link</th>'
			+ '								<th>Type</th>'
			+ '							</tr>'
			+ '						</thead>'
			+ '						<tbody>' + '						</tbody>' + '</table></div>';

	$("#details").append(summaryTable);

	var emptyList = true;
	if (validurl) 
	{
		printLog('PRINTING_REPORT', 'Adding rows in report table');
		$("#reports").append(reportTable);

		$.each(report.invalidDownloads, function(key, link) {
			emptyList = false;
			addRow('report', link, 'Download');
		});
		$.each(report.invalidUrls, function(key, link) {
			emptyList = false;
			addRow('report', link, 'URL');
		});
		$.each(report.invalidEmails, function(key, link) {
			emptyList = false;
			addRow('report', link, 'Email');

		});
	/*	if (report.crawled === 'partial') 
		{
			printLog('PRINTING_REPORT', 'Report is partial');	
			$('#summary > tbody:last-child')
					.append(
							'<tr class="alert alert-warning"><td>Report Type</td><td colspan="2" >Partial</td> </tr>');
		}*/

		$('#report').paging
		({
			limit : sessionStorage.getItem('REPORT_TABLE_LIMIT')
		});

	}

	if (!validurl || emptyList) {

		$('#reportDiv').hide();
	//	$("#summarydiv").removeClass("col-md-3").addClass("col-md-12");

	}

}

var reports = {};



var selectedLink = "";
function refreshReports()
{
	
	$('#reports').empty();
	$('#tabs').empty();
	$('#report tbody > tr').remove();
	$('#wait').hide();
	if(totalReports>1)
		{
			$('#note1').show();
		}
	
	
	$.each(reports, function(link) 
	{
		if (selectedLink === "") 
		{
			selectedLink = link;
			$('#tabs').append(	'<li class="tab tab-selected" >'+ link + '</li>');
		} else 
		{
			if(selectedLink === link)
				{
					$('#tabs').append(	'<li class="tab tab-selected" >'+ link + '</li>');
				}
			else
				{
					$('#tabs').append('<li class="tab">' + link	+ '</li>');
				}
		}
	});
	setReport(selectedLink);
	$("#TabPanel").show();
	$("#reportPanel").show();
}




var sessionID;



function enableSocketClient()
{
	
		var socketUrl=sessionStorage.getItem('SOCKET_IO_URL');
		printLog("report ","Connecting "+socketUrl);
		var socket=io.connect(socketUrl);
		printLog("report ","Connected");
		socket.on(sessionID, function(data)
		{
			printLog("Report",JSON.stringify(data));
			$.each(data,function(key,value){
					reports[trim(key, 20)]=value;
			});
			refreshReports();
		});
}


var totalReports=0;
var responseReceived=0;
function getReports()
{
	
	sessionStorage.removeItem('reports');
	$("#site").prop('disabled', true);
	var text = $('#site').val();
	var level =$('#level').val();
	reports = {};
	sessionID = 'SESSION'+(Math.floor((Math.random() * 10000000000) + 1));
	
	//sessionStorage.setItem("CurrentSessionID",sessionID);
	if (text != '') {
		
		$('#reports').empty();
		$('#tabs').empty();
		$("#getData").hide();
		$('#wait').show();
		$('#note').hide();
		$("#reportPanel").hide();
		$("errornote").hide();
		$("errornote1").hide();
		
		selectedLink="";
		var allwebsites = text.split(sessionStorage.getItem('URL_SEPARATOR'));
		var serviceurl = sessionStorage.getItem('SERVICE_URL');
		
		$('#report tbody > tr').remove();

		var len = allwebsites.length;
		totalReports=len;
		responseReceived=0;
		enableSocketClient();
		var hasUrl=false;
		for (var i = 0; i < len && i < 5 ; i++) 
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
				var getreport = serviceurl + 'website='+ encodeURIComponent(allwebsites[i]) + '&crawllevel='+ level+'&id='+sessionID;
				$.ajax({
					type : "GET",
					url : getreport,
					contentType : "application/json",
					async : true,
					success : function(data, status) 
					{
						printLog('SERVICE_REQUEST', 'Response status '+status);
						//reports = data.reportList;
						responseReceived++;
						if(totalReports===responseReceived)
							{
								$("#getData").show();
								$("#site").prop('disabled', false);	
							}
					},
					error : function(xhr) {
						printLog('SERVICE_REQUEST_ERROR', JSON.stringify(xhr));
						
						responseReceived++;
						if(totalReports===responseReceived)
							{
								$("#getData").show();
								$("#site").prop('disabled', false);
							}
						if(xhr.status===0)
						{
							$("#errornote").show();
						}
						else
						{
							$("#errornote1").show();
						}
					}
				});
				
			}
		}
		

	} 
}





function printLog(action,msg)
{
	var appName="WEBSITEREPORT_USERINTERFACE";
	var time =$.now();
	
	console.log('APP:'+appName+' '+'TIME:'+time+' EVENT:'+action+' MESSAGE:'+msg);
}

$(document).ready(
		function() {
			
			$("#TabPanel").hide();
			$("#reportPanel").hide();
			$("#wait").hide();
			$("#note").show();
			

			$('#getData').prop('disabled', true);

			// Disable button if textbox is empty
			$('#site').keyup(
					function() {
						$('#getData').prop('disabled',
								this.value == "" ? true : false);
					})

			// To Remove Space character
			$('#site').keydown(function(e) 
					{
				if (e.keyCode == 32) // 32 is the ASCII value for a space
					{
						e.preventDefault();
					}
				else if(e.keyCode == 13)
					{
						if(totalReports===responseReceived)
							getReports();
						
					}
				
				
			});

			
	/*		
			if (sessionStorage.getItem('reports')) 
			{
				var firstLink="";
				
				reports = JSON.parse(sessionStorage.getItem('reports'));
				printLog('PRINTING_REPORT', 'Reading the report from session');
				$.each(reports, function(link) 
				{
					if (firstLink === "") {
						firstLink = link;
						
						$('#tabs').append(
								'<li class="tab tab-selected" >' + link
										+ '</li>');
					} else {
						$('#tabs').append('<li class="tab">' + link + '</li>');
					}

				});
				setReport(firstLink);
				$("#TabPanel").show();
				$("#reportPanel").show();
				$("#getData").show();
				$("#wait").hide();
			}

		*/	// ajax call to get env variables
			printLog('GETENV', 'AJAX call to get the ENV variables');
			
			$.ajax({
				type : "GET",
				url : "getenv",
				contentType : "application/json",
				success : function(result) 
				{
					var env = result.split("|");
					printLog('GETENV', 'Successfully got ENV variables');
					printLog('GETENV', 'CRAWL_LEVEL = '+env[0]);
					sessionStorage.setItem('CRAWL_LEVEL', env[0]);
					
					sessionStorage.setItem('SERVICE_URL', env[1]);
					printLog('GETENV', 'SERVICE_URL = '+env[1]);
					
					sessionStorage.setItem('URL_SEPARATOR', env[2]);
					printLog('GETENV', 'URL_SEPARATOR = '+env[2]);
					
					sessionStorage.setItem('REPORT_TABLE_LIMIT', env[3]);
					printLog('GETENV', 'REPORT_TABLE_LIMIT = '+env[3]);
					
					sessionStorage.setItem('SOCKET_IO_URL', env[4]);
					printLog('GETENV', 'SOCKET_IO_URL = '+env[4]);
					
					
					
					$('#separator').empty();

					$('#separator').append
					(
							"Please prefix the Website URL with \"www\". To enter multiple URL's use separator("
									+ sessionStorage.URL_SEPARATOR + "). Maximum 5 websites at a time  ");

				}
			});

			$("#tabs").on('click', 'li', function() {
				$('.tab').removeClass('tab-selected');
					selectedLink =$(this).text(); 
					setReport(selectedLink);
				$(this).addClass('tab-selected');

			});

			$("#getData").click(
					function() {
						
						getReports();	
					}); // getData click function

		});