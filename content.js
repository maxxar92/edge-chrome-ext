
function get_device(details) {
	var responseHeaders = details.responseHeaders;
	if (responseHeaders) {
		for (var i = 0; i < responseHeaders.length; i++) {
	      var responseHeader = responseHeaders[i];
	      if (responseHeader.name === "edge-device") {
	      	return responseHeader.value;
	      }
    	}
    } 

    return null;
}

function in_srcset(element, srcUri) {
	if ($(element).attr('srcset') !== undefined) {
		return $(element).attr('srcset').split(',').some(urlsub=>
			srcUri.includes(urlsub.trim().split(' ')[0]))
	}

	return false;
}

function wrap(req) {
	var handled=false;
	$("img").each(function(index, element) {
		var srcUri=decodeURI(req.requesturl);
		if (srcUri.includes($(element).attr('src')) || in_srcset(element, srcUri)) {
			console.log(element);
			var device = req.device_id;
			var name = req.host_info["host_name"];
			var location = req.host_info["location"];
			if (device != null) {
				// var selected = $(element).parent().prop('nodeName') === "A" ? $(element).parent() : element;
				var hosttext = '<div class="text-block"><p>' + name + " (" + location + ")</p> </div>";
  				var tags = $(element).parents().map(function() { return this.tagName; }).get();
				console.log(tags);
				if (tags.some(el=>el==="A")) {
					$(element).after(hosttext);
				} else {
					$(element).wrap('<div class="host-img-container"></div>').after(hosttext);
				}
			}
			handled=true;
		}
	});
	console.log(handled);

	return handled;
}


var unhandled = [];
chrome.runtime.onMessage.addListener( (message, sender, sendResponse) => { 
	//var details = JSON.parse(localStorage.getItem(message.requesturl));
	if (message.device_id !== null && message.requesturl !== undefined) {
		console.log(message.requesturl);
		// setTimeout(function() {
			var handled = wrap(message);

			if (!handled) {
				unhandled.push(message)
			}
		// }, 100); // add 100 ms delay to increase chance of img being rendered

		sendResponse(true);
	}
});

window.addEventListener("load", function load(event){
    window.removeEventListener("load", load, false); 
    //enter here the action you want to do once loaded 
    	// try to wrap unhandled images
		for (let i = unhandled.length - 1; i >= 0; i--) {
		  if (wrap(unhandled[i])) {
		    unhandled.splice(i, 1);
		  }
		}
},false);

$( document ).ready(function() {
  // Handler for .ready() called.
  $("<style>")
    .prop("type", "text/css")
    .html(`.text-block {
	  position: absolute;
	  text-align: center;
	  top: 0%;
	  width: 100%;
	  background-color: rgba(0,0,0,0.42);
	  color: #00ff18;
	}

	.host-img-container {
		position: relative;
	}

	`)
    .appendTo("head");
});

