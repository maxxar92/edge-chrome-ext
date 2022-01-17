var hosts = null

var xmlhttp = new XMLHttpRequest()
xmlhttp.onreadystatechange = function () {
  if (this.readyState == 4 && this.status == 200) {
    var myArr = JSON.parse(this.responseText)
    hosts = myArr
  }
}
var url = 'https://public-api.edge.network/devices'
xmlhttp.open('GET', url, true)
xmlhttp.setRequestHeader(
  'Authorization',
  'Bearer J3PSTRRW74YZNWZ4FZWSUCJSPPFV56VE'
)
xmlhttp.send()

function get_device(details) {
  var responseHeaders = details.responseHeaders
  if (responseHeaders) {
    for (var i = 0; i < responseHeaders.length; i++) {
      var responseHeader = responseHeaders[i]
      if (responseHeader.name === 'edge-device') {
        return responseHeader.value
      }
    }
  }

  return null
}

function onHeadersReceivedCallback(details) {
  chrome.extension.getBackgroundPage().console.log(details)
  var device_id = get_device(details)
  var host_info = hosts.filter((i) => i.networkid === device_id)
  if (host_info.length > 0) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        {
          requesturl: details.url,
          details: details,
          device_id: device_id,
          host_info: host_info[0],
        },
        function (response) {}
      )
    })
  }
}

// only listen to specified domains we know to serve edge cdn images
chrome.webRequest.onHeadersReceived.addListener(
  onHeadersReceivedCallback,
  { urls: ['https://cdn.edge.network/*', 'https://img.monocle.com/*'] },
  ['blocking', 'responseHeaders']
)
