function callSwitchbotApi(commandItem, parameterMap) {
    if (parameterMap === undefined) {
        parameterMap = {};
    }

    const t = new Date().getTime().toString();
    const nonce = Utilities.getUuid();
    var signature = Utilities.base64Encode(
        Utilities.computeHmacSha256Signature(SWITCHBOT_API_TOKEN + t + nonce,
        SWITCHBOT_API_SECRET, Utilities.Charset.UTF_8));

    var options = {
        method: commandItem.method,
        headers: {
            "Authorization": "Bearer " + SWITCHBOT_API_TOKEN,
            "sign": signature,
            "nonce": nonce,
            "t": t
        }
    };

    if (commandItem.method === "POST") {
        options.headers["Content-Type"] = "application/json";
        options.payload = JSON.stringify(commandItem.payload);
    }
    
    var url = Object.keys(parameterMap).reduce( (switchbotApiUrl, cur) => {
        return switchbotApiUrl.replace("{" + cur + "}", parameterMap[cur]);
    }, SWITCHBOT_BASE_URL + commandItem.url)

    return UrlFetchApp.fetch(url, options);
}

let SWITCHBOT_BASE_URL = "https://api.switch-bot.com/v1.1";
let COMMAND_LIST = {
    "list_devices" : {
        "url": "/devices",
        "method": "GET"
    },
    "get_device_status": {
        "url": "/devices/{device_id}/status",
        "method": "GET"
    },
    "turn_on": {
        "url": "/devices/{device_id}/commands",
        "method": "POST",
        "payload": {
            "command": "turnOn",
            "parameter": "default",
            "commandType": "command"
        }
    },
    "turn_off": {
        "url": "/devices/{device_id}/commands",
        "method": "POST",
        "payload": {
            "command": "turnOff",
            "parameter": "default",
            "commandType": "command"
        }
    },
    "set_all": {
        "url": "/devices/{device_id}/commands",
        "method": "POST",
        "payload": {
            "command": "setAll",
            "parameter": "{{ac_param}}",
            "commandType": "command"
        }
    },
};

let FAN_SPEED_AUTO = "1";
let HEAT_MODE = {
    "Hot": "5",
    "Cool": "2"
};

let scriptProperties = PropertiesService.getScriptProperties();
let SWITCHBOT_API_TOKEN = getSwitchBotApiTokenFromProperties();
let SWITCHBOT_API_SECRET = getSwitchBotApiSecretFromProperties();

function setSwitchBotApiKeyInProperties() {
    var apiToken = "SWITCHBOT_API_KEY";
    var apiSecret = "SWITCHBOT_API_SECRET";
    scriptProperties.setProperty("SWITCHBOT_API_KEY", apiToken);
    scriptProperties.setProperty("SWITCHBOT_API_SECRET", apiSecret);
}

function getSwitchBotApiTokenFromProperties() {
    return scriptProperties.getProperty("SWITCHBOT_API_KEY");
}
function getSwitchBotApiSecretFromProperties() {
    return scriptProperties.getProperty("SWITCHBOT_API_SECRET");
}