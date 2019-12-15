  
var detailsTable = document.getElementById("details");
var headerTable = document.getElementById("headers");
var mainPanel = document.getElementById("main-panel");

var query = { active: true, currentWindow: true };
function updateTable(tabs) {
  url = tabs[0].url;
  var details = JSON.parse(localStorage.getItem(url));
  var time = new Date(details.timeStamp).toTimeString();

  if (details.statusCode == 200) {
    mainPanel.className = "panel panel-success";
  } else {
    mainPanel.className = "panel panel-danger";
  }
  detailsTable.innerHTML = '<tr> \
                              <td>URL</td> \
                              <td><a href="' + url + '">' + url +'</a></td> \
                            <tr> \
                            <tr> \
                              <td>Method</td> \
                              <td>' + details.method + '</td> \
                            <tr> \
                            <tr> \
                              <td>Status Code</td> \
                              <td>' + details.statusCode + '</td> \
                            <tr> \
                            <tr> \
                              <td>Time</td> \
                              <td>' + time + '</td> \
                            <tr> \
                           ';
  var responseHeaders = details.responseHeaders;
  if (responseHeaders) {
    headerTable.innerHTML = "";
    for (var i = 0; i < responseHeaders.length; i++) {
      var responseHeader = responseHeaders[i];
      var tr = "<tr>";
      var name = "<td>" + responseHeader.name + "</td>";
      var value = "<td>" + responseHeader.value + "</td>";
      tr += name + value + "</tr>";
      headerTable.innerHTML += tr;
    }
  }
}
chrome.tabs.query(query, updateTable);
