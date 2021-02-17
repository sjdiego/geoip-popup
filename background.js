chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if ('queryGeoIP' === request.method) {
        fetch('http://ip-api.com/json/' + request.ip + '?fields=17038875')
            .then((res) => { return res.json() })
            .then((text) => { sendResponse(text) })
        return true // Will respond asynchronously.
    }
});
