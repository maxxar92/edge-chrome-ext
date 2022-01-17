function in_srcset(element, srcUri) {
  if ($(element).attr('srcset') !== undefined) {
    return $(element)
      .attr('srcset')
      .split(',')
      .some((urlsub) => srcUri.includes(urlsub.trim().split(' ')[0]))
  }

  return false
}

function wrap(req) {
  var handled = false
  $('img').each(function (index, element) {
    var srcUri = decodeURI(req.requesturl)
    if (srcUri.includes($(element).attr('src')) || in_srcset(element, srcUri)) {
      var name = req.host_info['deviceName']
      var city = req.host_info['city'] == '' ? 'unknown' : req.host_info['city']
      var location = city + '-' + req.host_info['country']
      var hosttext =
        '<div class="text-block"><p>' + name + ' (' + location + ')</p> </div>'
      var tags = $(element)
        .parents()
        .map(function () {
          return this.tagName
        })
        .get()
      if (tags.some((el) => el === 'A')) {
        // don't wrap if parent is a link, as this would hide the image somehow
        $(element).after(hosttext)
      } else {
        $(element)
          .wrap('<div class="host-img-container"></div>')
          .after(hosttext)
      }
      handled = true
    }
  })

  return handled
}

var unhandled = []
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.device_id !== null && message.requesturl !== undefined) {
    var handled = wrap(message)
    if (!handled) {
      unhandled.push(message)
    }
    sendResponse(true)
  }
})

window.addEventListener(
  'load',
  function load(event) {
    window.removeEventListener('load', load, false)
    //enter here the action you want to do once loaded
    // try to wrap unhandled images
    for (let i = unhandled.length - 1; i >= 0; i--) {
      if (wrap(unhandled[i])) {
        unhandled.splice(i, 1)
      }
    }
  },
  false
)

$(document).ready(function () {
  // Handler for .ready() called.
  $('<style>')
    .prop('type', 'text/css')
    .html(
      `.text-block {
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

	`
    )
    .appendTo('head')
})
