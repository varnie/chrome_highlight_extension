document.addEventListener('DOMContentLoaded', function () {
    const sendDataButton = document.getElementById('send-html-button');

    sendDataButton.addEventListener('click', function () {
        chrome.runtime.sendMessage({action: 'sendPageHtml'}, function (response) {
            if (response.success) {
                console.log('Page HTML processed successfully!');
            } else {
                console.error('There was a problem during sending the page HTML:', response.error);
            }
        });
    });
});
