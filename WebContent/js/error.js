
$(document).ready(
		function() {
			$("#note").show();
			$(".waitmsg").append(sessionStorage.getItem('ERROR_MESSAGE'));
		});