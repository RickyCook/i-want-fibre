nbn_tabs = []
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	console.log('Message [%s]: %O', request['type'], request)
	if (request.type == "nbn_tab") {
		console.log("New NBN Tab: " + sender.tab.id)
		nbn_tabs.push(sender.tab)
	} else if (request.type = "lookup") {
		try_tab = function(tab) {
			if (tab === undefined) {
				nbn_tabs.shift()
				chrome.tabs.get(nbn_tabs[0].id, try_tab)
			} else {
				chrome.tabs.sendMessage(tab.id, request, function(response) {
					sendResponse(response)
				})
			}
		}
		chrome.tabs.get(nbn_tabs[0].id, try_tab)
		return true
	}
})
