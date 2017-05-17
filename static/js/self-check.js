/* CONSTANTS */
var BASE_URL = window.location.origin;
var TIMEOUT = 180;


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

	$("#lastname").bind("keypress", function(e) {
		var code = e.keyCode || e.which;
		if(code == 13) {
			login();
		 }
	});
}

var modal;
var span;
var user;
var contact_info;

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
    var lastname = $("#lastname").val();
    if ((loginid != null) && (loginid != "") && (lastname != null) && (lastname != "")){
    	
    	$("#userid").prop("disabled", true);
    	$("#lastname").prop("disabled", true);
    	$("#loginerror").addClass("hide");
    	
    	$("#modalheader").text("loading data, please wait...");
        $("#myModal").show();
        $(".close").hide();
        
        $.ajax({
    		type: "GET",
    		url: BASE_URL + "/login/" + $("#userid").val() + '/' + $("#lastname").val(),
			contentType: "text/plain",
			dataType : "json",
			crossDomain: true
			
		}).done(function(data) {
			user = data;
			rpatron = data['full_name'];
			contact_info = data.contact_info.address[0];
			function address(data) {
				var workAddress = "";
				for (i = 1; i < 6; i++) {
					line = "line" + i.toString()
  					if (data[line] != null) {
						workAddress = workAddress + "\n" + data[line]
  					}
				}
				return workAddress;
			}
			rstatus = address(contact_info);
			loans = data.loans.value;
			// prepare scan box
			//$("#scanboxtitle").text("Welcome " + data.first_name + " " + data.last_name);
			//$("#userloans").text(data.loans.value);  //line 46-48 self-check.html
			//$("#userrequests").text(data.requests.value); //line 47 self-check.html
			//$("#userfees").text("$" + data.fees.value); //line 48 self-check.html
			//$("#usernotes").text(data.user_note.length);
			$("#scanboxtitle").text("Welcome " + data.first_name + " " + data.last_name);			
			$("#loanstable").find("tr:gt(0)").remove();	
			$("#loginbox").addClass("hide");
			$("#scanbox").toggleClass("hide");			
			$("#barcode").focus();
						
		}).fail(function(jqxhr, textStatus, error) {
		    $("#loginerror").toggleClass("hide");
		    console.log(jqxhr.responseText);
		    
		}).always(function() {
			$("#userid").prop("disabled", false);
			$("#lastname").prop("disabled", false);
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
			url: BASE_URL + "/checkout/" + user.primary_id + "/" + $("#barcode").val(),
    		contentType: "application/json",
    		dataType: "json"
    	}).done(function(data){
            
            var dueDate = new Date(data["due_date"]);
    		var dueDateText = (parseInt(dueDate.getMonth()) + 1) + "/" + dueDate.getDate() + "/" + dueDate.getFullYear();
    		$("#loanstable tr:first").after("<tr><td>" + data["title"] + "</td><td>" + dueDateText + "</td><td>" + data["item_barcode"] + "</td></tr>");
    		
    		// set values to be entered into receipt
			var value = '';
			for (var key in data['location_code']) {
			value = data['location_code'][key];
			}
			var d = new Date();
			var date = d.toLocaleString();
			
    		var templateData = {
        		patron: rpatron,
        		status: rstatus,
        		duedate: dueDateText,
        		title: data['title'],
        		author: data['author'],
        		barcode: data['item_barcode'],
        		location: value,
        		callnumb: data['call_number'],
        		date: date
        	};
        	//load receipt template and load in values to template
        	try {
    		$.get('static/receipt.html', function(templates){
    		var template = $(templates).filter('#receipt').html();
    		var html = Mustache.to_html(template, templateData); 
    		receipt = window.open('', '', "width=600,height=600");
    		receipt.document.write(html);
    		receipt.print();
    		receipt.close();
    		});
    		}
    		catch (exception) {
    			function silentErrorHandler() {return true;}
				window.onerror=silentErrorHandler;
    		}
    		//updates loans
    		//loans += 1; //line 46 self-check.html
            //$("#userloans").text(loans); //line 46 self-check.html
            
    		returnToBarcode();
    		
    	}).fail(function(jqxhr, textStatus, error) {
    		console.log(jqxhr.responseText);
        console.log(textStatus);
        console.log(error);
    		$("#modalheader").text("");
    		if (jqxhr.status == 409 || jqxhr.status == 404 && jqxhr.responseText == 'Error: Invalid Barcode' || jqxhr.status == 403 ) {
    		console.log(jqxhr.error);
    		$("#modalheader").append(jqxhr.responseText + "<br/><br/>See the reference desk for more information<br/><br/><input class='modalclose' type='button' value='close' id='barcodeerrorbutton' onclick='javascript:returnToBarcode();'/>");
    		}
    		else {
    		$("#modalheader").append("Unable to checkout item <br/><br/>Please see the reference desk for more information<br/><br/><input class='modalclose' type='button' value='close' id='barcodeerrorbutton' onclick='javascript:returnToBarcode();'/>");
    		}
    		$("#barcodeerrorbutton").focus();
    		
    		$(".close").show();
    		$("#barcode").val("");

    	}).always(function() {
    		
    	});
    }
}


var idleseconds = 0;
document.onclick = function() {
    idleseconds = 0;
};
document.onmousemove = function() {
    idleseconds = 0;
};
document.onkeypress = function() {
    idleseconds = 0;
};
window.setInterval(inactive, 1000);

function inactive() {
    idleseconds++;
    //console.log(idleseconds)
    if (idleseconds >= TIMEOUT) {
        window.location.assign(BASE_URL);
    }
}

function logout() {
	$("#userid").val("");
	$("#lastname").val("");
	$("#barcode").val("");
	$("#loginbox").toggleClass("hide");
	$("#scanbox").toggleClass("hide");
	$("#userid").focus();
}

$( document ).ready(function() {
	  $( "#userid" ).focus();
	});
