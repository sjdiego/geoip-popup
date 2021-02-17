/**
 * GeoIP Popup
 * 
 * It shows a popup with geolocation info when a IPv4 is hovered or selected
 */

const validIPv4 = new RegExp("^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$");
const storageKeyPrefix = 'geoip-popup-data-';

function parseDOM(elements) {
    elements.forEach((element) => appendPopup(element, element.innerHTML));
}

function parseSelectedText(element) {
    let text = '';

    if (typeof window.getSelection != "undefined") {
        text = window.getSelection().toString();
    } else if (typeof document.selection != "undefined" && document.selection.type == "Text") {
        text = document.selection.createRange().text;
    }

    appendPopup(element, text)
}

function appendPopup(element, ip) {
    if (!validIPv4.test(ip)) {
        return false;
    }

    element.addEventListener('mouseenter', async () => {
        let dataIP = getCachedIP(ip) || await getNewIP(ip), html = '';

        Object.keys(dataIP).forEach((value) => {
            html += value + ': ' + dataIP[value] + '<br />';
        });

        tippy(element, {
            allowHTML: true,
            content: html,
            showOnCreate: true,
            followCursor: true,
        })
    });
}

function getCachedIP(ip) {
    return JSON.parse(
        window.localStorage.getItem(
            storageKeyPrefix + ip.replaceAll('.', '-')
        )
    )
}

function getNewIP(ip) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({method: "queryGeoIP", ip: ip}, (response, error) => {
            if (response.status && 'success' === response.status) {
                window.localStorage.setItem(
                    storageKeyPrefix + ip.replaceAll('.', '-'),
                    JSON.stringify(response)
                );
                resolve(response);
            } else {
                reject(error);
            }
        });
    });
}


setTimeout(() => { 
    parseDOM(document.querySelectorAll("td")) 
    window.addEventListener('mouseup', (event) => parseSelectedText(event.target))
}, 1500);