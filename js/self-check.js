/* CONSTANTS */
var baseURL = "http://127.0.0.1:5000/";

//var apiKey = ""
var libraryName = "GC";
var circDesk = "GRI Open S";


function initiate() {
	getModalBox();
	
	$("#barcode").bind("keypress", function(e) {
		var code = e.keyCode || e.which;
		if(code == 13) {
			loan();
		 }
	});
	

	$("#userid").bind("keypress", function(e) {
		var code = e.keyCode || e.which;
		if(code == 13) {
			login();
		 }
	});
}

var modal;
var span;
var user;

function getModalBox() {
	
	// Get the modal
	modal = document.getElementById('myModal');
	$("#myModal").hide();
	
	// Get the <span> element that closes the modal
	span = document.getElementsByClassName("close")[0];

	// When the user clicks on <span> (x), close the modal
	span.onclick = function() {
		$("#myModal").hide();
	}

	// When the user clicks anywhere outside of the modal, close it
	/*
	window.onclick = function(event) {
	    if (event.target == modal) {
	    	$("#myModal").hide();
	    }
	}
	*/
}

function returnToBarcode() {
	$("#barcode").prop("disabled", false);
	$("#myModal").hide();
	
	$("#barcode").val("");
	$("#barcode").focus();
}


/* LOGIN */

function login() {
    var loginid = $("#userid").val();
    if ((loginid != null) && (loginid != "")) {
    	
    	$("#userid").prop("disabled", true);
    	$("#loginerror").addClass("hide");
    	
    	$("#modalheader").text("loading data, please wait...");
        $("#myModal").show();
        $(".close").hide();
        
        $.ajax({
    		type: "GET",
    		//url: baseURL + "almaws/v1/users/" + $("#userid").val() + "?apikey=" + apiKey + "&expand=loans,requests,fees&format=json",
    		url: baseURL + "almaws/v1/users/" + $("#userid").val() + "&expand=loans,requests,fees&format=json",
			contentType: "text/plain",
			dataType : "json",
			crossDomain: true
			
		}).done(function(data) {
			user = data;
			patron = data.full_name;
			status = data.user_group.desc;

			// prepare scan box
			$("#scanboxtitle").text("Welcome " + data.first_name + " " + data.last_name);
			$("#userloans").text(data.loans.value);
			$("#userrequests").text(data.requests.value);
			$("#userfees").text("$" + data.fees.value);
			//$("#usernotes").text(data.user_note.length);
			
			 $("#loanstable").find("tr:gt(0)").remove();
			
			$("#loginbox").addClass("hide");
			$("#scanbox").toggleClass("hide");
			
			$("#barcode").focus();
			
		}).fail(function(jqxhr, textStatus, error) {
		    $("#loginerror").toggleClass("hide");
		    console.log(jqxhr.responseText);
		    
		}).always(function() {
			$("#userid").prop("disabled", false);
		    $("#myModal").hide();
		});
    }
}

function loaduser(data) {
	alert(data);
}

function loan() {
	
	var barcode = $("#barcode").val();
    if ((barcode != null) && (barcode != "")) {
    	
    	$("#modalheader").text("processing request, please wait...");
        $("#myModal").show();
        $(".close").hide();

		$("#barcode").prop("disabled", true);

    	$.ajax({
    		type: "GET",
    		//url: baseURL + "almaws/v1/users/" + user.primary_id + "/loans?user_id_type=all_unique&item_barcode=" + $("#barcode").val() + "&apikey=" + apiKey,
			url: baseURL + "almaws/v1/users/" + user.primary_id + "/loans&user_id_type=all_unique&item_barcode=" + $("#barcode").val(),
    		contentType: "application/xml",
    		//data: "<?xml version='1.0' encoding='UTF-8'?><item_loan><circ_desk>" + circDesk + "</circ_desk><library>" + libraryName + "</library></item_loan>",
    		dataType: "xml"
    	}).done(function(data){
    		
    		var dueDate = new Date($(data).find("due_date").text());
    		var dueDateText = (parseInt(dueDate.getMonth()) + 1) + "/" + dueDate.getDate() + "/" + dueDate.getFullYear();
    		$("#loanstable").append("<tr><td>" + $(data).find("title").text() + "</td><td>" + dueDateText + "</td><td>" + $(data).find("item_barcode").text() + "</td></tr>");
			
			html = "<font size='6'><b>" + patron + 
			"</font></b><br><font size='4'>" + status + 
			"<br><br>" + new Date() +
			"</font><br><br><b>Location: </b>" + $(data).find("location_code").text() + 
			"</font><br><b>Call Number: </b>" + $(data).find("call_number").text() + 
    		"</font><br><br><b>Title: </b>" + $(data).find("title").text() + 
    		"<b><br>Author: </b>" + $(data).find("author").text() + 
    		"<br><b>Barcode: </b>" + $(data).find("item_barcode").text() + 
    		"<br><b>Due Date: </b>" + dueDateText +
    		'<br><br><img src="footer_logo.gif">'
    		
    	 	// write receipt and print, patron info found in login
    		var receipt = window.open('','','width=200,height=100');
    		receipt.document.write(html);
    		receipt.print();
    		receipt.close();
    		
    		returnToBarcode();
    		
    	}).fail(function(jqxhr, textStatus, error) {
    		console.log(jqxhr.responseText);
    		
    		$("#modalheader").text("");
    		$("#modalheader").append("item not avaiable for loan.<br/><br/>please see the reference desk for more information<br/><br/><input class='modalclose' type='button' value='close' id='barcodeerrorbutton' onclick='javascript:returnToBarcode();'/>");
    		$("#barcodeerrorbutton").focus();
    		
    		$(".close").show();
    		$("#barcode").val("");

    	}).always(function() {
    		
    	});
    	
    }
} 

function logout() {
	$("#userid").val("");
	$("#loginbox").toggleClass("hide");
	$("#scanbox").toggleClass("hide");
	$("#userid").focus();
}

$( document ).ready(function() {
	  $( "#userid" ).focus();
	});