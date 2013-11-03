chrome.runtime.sendMessage({"type": "nbn_tab"}, function(r) {})
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.type == "lookup") {
		$.get('http://www.nbnco.com.au/api/map/search.html', request.data, sendResponse)
		return true
	}
})
