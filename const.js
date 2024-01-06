// Spreadsheet ID and name of the sheet containing settings
// Import the switchbot_template.xlsx to your Google Drive and get the ID from the URL
let SPREADSHEET_ID = "XXXXXX";
let SHEET_NAME = "Tempstate";

let STATUS_ON = "ON";
let STATUS_OFF = "OFF";
var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
var sheet = spreadsheet.getSheetByName(SHEET_NAME);
let FIRST_ROW = 3;

let COL_IDX = {
    "FLOOR": 0,
    "DEVICE_NAME": 1,
    "HEATING_STATUS": 2,
    "TEMP_DEVICE_ID": 3,
    "AC_SETTING": 4,
    "AC_TEMP": 5,
    "DEVICE_ID": 6,
    "RULE1_TIME": 7,
    "RULE1_TEMP_MIN": 8,
    "RULE1_TEMP_MAX": 9,
    "RULE2_TIME": 10,
    "RULE2_TEMP_MIN": 11,
    "RULE2_TEMP_MAX": 12,
    "RULE3_TIME": 13,
    "RULE3_TEMP_MIN": 14,
    "RULE3_TEMP_MAX": 15
}

let DRY_RUN = false;

