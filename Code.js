function controlHeating() {
    //obtain all non-empty rows in the sheet from row FIRST_ROW
    var rows = sheet.getRange(FIRST_ROW, 1, sheet.getLastRow() - (FIRST_ROW-1), sheet.getLastColumn()).getValues();
    var parsedRows = rows.map(parseRow);

    var now = new Date();

    parsedRows.filter(device => device.rules.length > 0).forEach(device => {
        var rule = device.rules.find(rule => {
            return rule.startTime <= now && now <= rule.endTime;
        });
        if (rule) {
            var temp = getTemp(device.tempDeviceId);
            if (rule.tempMin > temp && device.heatingStatus === STATUS_OFF) {
                turnOn(device);
            } else if (temp > rule.tempMax && device.heatingStatus === STATUS_ON) {
                turnOff(device);
            }
        } else if (device.heatingStatus === STATUS_ON) {
            turnOff(device);
        }
    });
}

var tempCache = {};

function getTemp(deviceId) {
    if (tempCache[deviceId]) {
        return tempCache[deviceId];
    }
    var commandItem = COMMAND_LIST["get_device_status"];
    var response = callSwitchbotApi(commandItem, {"device_id": deviceId});
    var json = JSON.parse(response.getContentText());
    tempCache[deviceId] = json.body.temperature;
    return json.body.temperature;
}

function turnOn(device) {
    var commandItem = COMMAND_LIST["turn_on"];
    if (device.acSetting !== "") {
        commandItem = COMMAND_LIST["set_all"];
        commandItem.payload.parameter = [
            device.acTemp,
            HEAT_MODE[device.acSetting],
            FAN_SPEED_AUTO,
            "on"
        ].join(",");
    }
    if (DRY_RUN) {
        console.log("Turn on " + device.deviceName);
        console.log(JSON.stringify(commandItem));
    } else {
        var response = callSwitchbotApi(commandItem, {"device_id": device.deviceId});
        console.log(response.getContentText());
        // update sheet
        sheet.getRange(device.rawIndex, COL_IDX["HEATING_STATUS"] + 1).setValue(STATUS_ON);
    }
}

function turnOff(device) {
    var commandItem = COMMAND_LIST["turn_off"];
    if (device.acSetting !== "") {
        commandItem = COMMAND_LIST["set_all"];
        commandItem.payload.parameter = [
            device.acTemp,
            HEAT_MODE[device.acSetting],
            FAN_SPEED_AUTO,
            "off"
        ].join(",");
    }
    if (DRY_RUN) {
        console.log("Turn off " + device.deviceName);
        console.log(JSON.stringify(commandItem));
    } else {
        var response = callSwitchbotApi(commandItem, {"device_id": device.deviceId});
        console.log(response.getContentText());
        // update sheet
        sheet.getRange(device.rawIndex, COL_IDX["HEATING_STATUS"] + 1).setValue(STATUS_OFF);
    }
}

function listDevices() {
    var commandItem = COMMAND_LIST["list_devices"];
    var response = callSwitchbotApi(commandItem);
    var json = JSON.parse(response.getContentText());
    console.log(JSON.stringify(json));
}

function parseRow(rawRow, idxRow) {
    var rules = []
    for (var i = 0; i < 3; i++) {
        if (rawRow[COL_IDX["RULE" + (i + 1) + "_TIME"]] !== "") {
            var times = rawRow[COL_IDX["RULE" + (i + 1) + "_TIME"]].split("~");
            var rule = {
                "startTime": parseTime(times[0]),
                "endTime": parseTime(times[1]),
                "tempMin": rawRow[COL_IDX["RULE" + (i + 1) + "_TEMP_MIN"]],
                "tempMax": rawRow[COL_IDX["RULE" + (i + 1) + "_TEMP_MAX"]]
            }
            rules.push(rule);
        }
    }
    return {
        "rawIndex": idxRow + FIRST_ROW,
        "floor": rawRow[COL_IDX["FLOOR"]],
        "deviceName": rawRow[COL_IDX["DEVICE_NAME"]],
        "heatingStatus": rawRow[COL_IDX["HEATING_STATUS"]],
        "deviceId": rawRow[COL_IDX["DEVICE_ID"]],
        "acSetting": rawRow[COL_IDX["AC_SETTING"]],
        "acTemp": rawRow[COL_IDX["AC_TEMP"]],
        "tempDeviceId": rawRow[COL_IDX["TEMP_DEVICE_ID"]],
        "rules": rules
    }
}

function parseTime(timeStr) {
    var time = timeStr.split(":");
    var date = new Date();
    date.setHours(time[0]);
    date.setMinutes(time[1]);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
}