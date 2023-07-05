//
let environment = "production"

// load overlay. get channel id and switch staging/production
async function loadOverlay(url) {
    let overlayUrl = document.getElementById("url").value;
    if (overlayUrl.includes("staging")) environment = "stoging";
    let iframe = document.getElementById("iframe");
    iframe.src = overlayUrl;
    overlayUrlArr = overlayUrl.split("/");
    let channelid = overlayUrlArr[overlayUrlArr.length - 3];
    document.getElementById("channelId").value = channelid;
}
// fire the event
async function fireEvent() {
    let jwtToken = document.getElementById("jwtToken").value;
    let channelId = document.getElementById("channelId").value;
    let eventType = document.getElementById("eventType").value;
    let amount = document.getElementById("amount").value;
    let sender = document.getElementById("sender").value;
    let receiver = document.getElementById("receiver").value;
    let message = document.getElementById("message").value;
    let indicator = document.getElementById("indicator");
    indicator.textContent = "Sending...";
    let activityGroup = Math.random() * 9000000;

    let json = getMockJson({ "eventType": eventType, "amount": amount, "sender": sender, "receiver": receiver, "activityGroup": activityGroup });
    await fetchJson(json, jwtToken, channelId);
    if (eventType == "community gift") {
        for (i = 0; i < amount; i++) {
            let json = getMockJson({ "eventType": eventType, "amount": amount, "sender": sender, "receiver": "receiver" + i, "activityGroup": activityGroup });
            await fetchJson(json, jwtToken, channelId);
        }
    }
    indicator.textContent = "Sent";
}

// get the body for the message
function getMockJson(data) {
    if (!data.time) {
        data.time = Date.now();
    }
    if (!data.amount || data.amount == "") {
        data.amount = 10;
    }
    if (!data.sender || data.sender == "") {
        data.sender = "streamelements"
    }
    if (!data.message || data.message == "") {
        data.message = "How are you today?"
    }
    switch (data.eventType) {
        case "community gift":
            return {
                "type": "communityGiftPurchase", "provider": "twitch", "activityGroup": `${data.activityGroup}`, "createdAt": `${data.time}`, "isMock": true,
                "data": {
                    "providerId": "100135110", "username": "someone", "displayName": "Someone", "amount": data.amount,
                    "gifted": true, "sender": `${data.sender}`, "tier": "1000"
                }
            }
        case "single community gift":
            return {
                "type": "subscriber", "provider": "twitch", "createdAt": `${data.time}`, "isMock": true,
                "data": {
                    "providerId": "100135110", "username": `${data.reciever}`, "displayName": "Someone", "amount": data.amount,
                    "gifted": true, "sender": `${data.sender}`, "tier": "1000"
                }
            }
        case "subscriber":
            return {
                "type": "subscriber", "provider": "twitch", "createdAt": `${data.time}`, "isMock": true,
                "data": {
                    "providerId": "100135110", "username": "someone", "displayName": "Someone", "amount": data.amount,
                    "gifted": false, "sender": `${data.sender}`, "tier": "1000"
                }
            }
        case "follower":
            return {
                "type": "follow", "provider": "twitch", "createdAt": `${data.time}`, "isMock": true,
                "data": {
                    "providerId": "100135110", "username": `${data.sender}`, "displayName": "Someone",
                    "sender": `${data.sender}`, "tier": "1000"
                }
            }
        case "tip":
            return {
                "provider": "twitch", "type": "tip", "createdAt": `${data.time}`, "isMock": true,
                "data": { "providerId": "100135110", "username": `${data.sender}`, "amount": data.amount, "message": `${data.message}` }
            }
         case "merch":
            
                return {
                    "provider": "twitch", "type": "merch", "createdAt": `${data.time}`, "isMock": true,
                    "data": { "providerId": "100135110", "username": `${data.sender}`, "amount": data.amount ,"items":[{"name":"Hat","price":5,"quantity":1},{"name":"Shirt","price":5,"quantity":1}]}
                }
        case "cheer":
            return {
                "provider": "twitch", "type": "cheer", "createdAt": `${data.time}`, "isMock": true,
                "data": { "providerId": "100135110", "username": `${data.sender}`, "amount": data.amount, "message": `${data.message}` }
            }
        case "raid":
            return {
                "provider": "twitch", "type": "raid", "createdAt": `${data.time}`, "isMock": true,
                "data": { "providerId": "100135110", "username": `${data.sender}`, "amount": `${data.amount}`, "message": `${data.message}` }
            }
        case "community gifted sub":
            return {
                "type": "subscriber", "provider": "twitch", "activityGroup": `${data.activityGroup}`, "createdAt": `${data.time}`, "isMock": true,
                "data": {
                    "providerId": "100135110", "username": `${data.reciever}`, "displayName": "Someone", "amount": data.amount,
                    "gifted": true, "sender": `${data.sender}`, "tier": "1000"
                }
            }
    }
}

// helper function to fetch json
async function fetchJson(json, auth, channelid) {
    let url = `https://api.streamelements.com/kappa/v2/activities/${channelid}`
    if (environment == "staging") {
        url = `https://api.staging.streamelements.com/kappa/v2/activities/${channelid}`
    }
    fetch(url, {
        method: 'POST',
        headers: {
            'authority': 'api.staging.streamelements.com',
            'pragma': 'no-cache',
            'cache-control': 'no-cache',
            'sec-ch-ua': '"Chromium";v="95"',
            'accept': 'application/json, text/plain, */*',
            'content-type': 'application/json',
            'authorization': `Bearer ${auth}`,
            'sec-ch-ua-mobile': '?0',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 OBS/27.2.2 Safari/537.36',
            'sec-ch-ua-platform': '"Mac OS X"',
            'origin': 'https://obs.streamelements.com',
            'sec-fetch-site': 'same-site',
            'sec-fetch-mode': 'cors',
            'sec-fetch-dest': 'empty',
            'referer': 'https://obs.streamelements.com/',
            'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8'
        },
        body: JSON.stringify(json)
    })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch((error) => console.log('Error:', error));
}

// not needed
async function fetchOverlayJson(id, auth) {
    return fetch("https://api.streamelements.com/kappa/v2/overlays/" + id + "/bootstrap?isEditor=false&isMobile=false&isObs=false&isObsLive=false&isXsplit=false", {
        "headers": {
            "authorization": "apikey " + auth,
        },
        "method": "GET",

    }).then(r => r.json()).then(console.log("here"));
}