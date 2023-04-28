import {
    TARGET_URL
} from './constants.js';

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'sendPageHtml') {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            const tab = tabs[0];

            chrome.scripting.executeScript({
                target: {tabId: tab.id}, function() {
                    return document.documentElement.outerHTML;
                }
            }, function (result) {
                if (chrome.runtime.lastError) {
                    sendResponse({success: false, error: JSON.stringify(chrome.runtime.lastError)});
                    return
                }

                if (!Array.isArray(result)) {
                    sendResponse({success: false, error: "Unable to grab page's content"});
                    return;
                }

                const pageHtml = result[0];
                fetch(TARGET_URL, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({pageHtml: pageHtml["result"]})
                })
                    .then(response => {
                        if (response.ok) {
                            return response.json();
                        } else {
                            throw new Error('Network response was not ok.');
                        }
                    })
                    .then(json_data => {
                        const modified_html = json_data.data.modified_html;
                        chrome.scripting.executeScript({
                            target: {tabId: tab.id},
                            function: (modified_html) => {
                                document.documentElement.innerHTML = modified_html;
                            },
                            args: [modified_html]
                        });

                        sendResponse({success: true});
                    })
                    .catch(error => {
                        sendResponse({success: false, error: error.message});
                    });
            });
        });

        return true;
    }
});
