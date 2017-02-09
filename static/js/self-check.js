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

function inactive() {
var time;
window.onload = clearTimeout(time);
document.onmousemove = clearTimeout(time);
document.onkeypress = clearTimeout(time);

clearTimeout(time);
time = setTimeout(logout(), 6000);
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
    		url: baseURL + "login/" + $("#userid").val(),
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
			url: baseURL + "checkout/" + user.primary_id + "/" + $("#barcode").val(),
    		contentType: "application/xml",
    		dataType: "xml"
    	}).done(function(data){
    		
    		//var dueDate = new Date($(data).find("due_date").text());
            var dueDate = new Date(data["due_date"]);
    		var dueDateText = (parseInt(dueDate.getMonth()) + 1) + "/" + dueDate.getDate() + "/" + dueDate.getFullYear();
    		$("#loanstable").append("<tr><td>" + data["title"] + "</td><td>" + dueDateText + "</td><td>" + data["item_barcode"] + "</td></tr>");
    		
    		// write receipt and print, patron info found in login
    		var receipt = window.open('','','width=200,height=100');
    		receipt.document.write(
    		"<font size='6'><b>Patron: </b>" + patron + "</font><br><font size='4'><b>Staff Status: </b>" + status + 
    		"</font><br><b>Title: </b>" + data["title"] + 
    		"<b><br>Author: </b>" + data["author"] + 
    		"<br><b>Barcode: </b>" + data["item_barcode"] + 
    		"<br><b>Due Date: </b>" + dueDateText);
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

function inactive() {
var t;
window.onload = clearTimeout(t);
document.onmousemove = clearTimeout(t);
document.onkeypress = clearTimeout(t);
t = setTimeout(function(){ alert("Hello"); }, 3000);
console.log(t);
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