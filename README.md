## Switchbot Temperature Control

This repository contains files to run temperature control using Switchbot thermometers and
Switchbot Hubs and/or Bots for activating and deactivating heaters and ACs.

It is designed to run on Google Apps Script platform and interfaces with Google Sheets and
Switchbot API to enforce temperature selections.

### What this aims to solve

- Switchbot Bots working in "press mode" do not store the Switchbot state anywhere, which
makes it difficult to automate heaters that can be started and stopped with a single button.
- The Switchbot interface is not really well designed for storing multiple conditions that
take into account both schedule and temperature.

### What you need to run this script

- A Google account (it does not have to be a Google workspace one, can also be a free Gmail
account)
- A Switchbot account with linked heaters (or ACs) or Bots controlling heating (we set them
to custom mode in our case, but it can be changed to press mode with minimal changes)
- A Switchbot API token and API secret. Follow [Switchbot official instructions](https://support.switch-bot.com/hc/en-us/articles/12822710195351-How-to-obtain-a-Token-) to get them.
- Preferably, install and setup [clasp](https://github.com/google/clasp) to your environment to simplify pushing code to Google Apps Script.

### Preliminary setup (do it once)

- Import the [switchbot_template.xlsx](./switchbot_template.xlsx) file to your Google Sheets, copy the long ID included in the URL and paste it to the `SPREADSHEET_ID` value in const.js file.
- Due to potential issues with number formats, it is recommended to change the spreadsheet settings so that the sheet uses the "United States" locale (but time zone should be your own). You can find the setting in File > Parameters.
- Push the code in this repository using clasp to your Google Apps Script project.
- You should now be able to see and enter your project from [Google Apps Script console](https://script.google.com/home). In the created project, you should see three files: `Code.gs`, `const.gs` and `switchbot.gs`.
- Open `switchbot.gs`, and replace the placeHolders for API token and secret to their values, then save the file.
```js
    var apiToken = "SWITCHBOT_API_KEY";
    var apiSecret = "SWITCHBOT_API_SECRET";
```
- Select the `setSwitchBotApiKeyInProperties` function in the functions to run, then run it. It will save your API token and secret to the function setup for more security. (You might have to give permission to the function to access your Spreadsheets at this timing, due to how the script is implemented.)
- Once run, revert the `apiToken` and `apiSecret` to their placeholder values.

### Creating device and schedule lists

Now it is time to setup your device list and the schedule you want your heaters / AC to kick in.

For this, open the spreadsheet and add one device per line. Here are a few notes regarding formats and contents of each cells:
- First column is intended to contain the floor your device is in, but it can contain anything (it is not used by the script)
- Second column contains the name of the device. It will be output at script execution and can serve to check execution works as expected.
- Third column is the status (`ON` or `OFF`). Set it to the current status of your device. Note that is is **not updated by manual actions or changes of state done directly in Switchbot app**, so you should make sure to update it manually if needed.
- The `DeviceTempId` column contains the Switchbot ID of the thermometer device that is checked for determining whether the heater/AC should be ON or OFF.
- AC settings and AC temp should only be set when working with an AC.
- The `Device ID` column contains the Switchbot ID of the heating/AC device itself.
- You can set up to three rules per device. They are based on a schedule (format is `HH:mm~HH:mm`) and a minimum and maximum temperature. If there are no rules, the device is ignored. Rules overlapping days are not supported and rules overlapping each others have not been tested. Make sure the rules make sense.
- Temperatures are in Celsius.
- **DO NOT** add more to the file than the necessary lines for each device, as it will likely break the script logic.

Regarding the `DeviceTempId` and `Device ID` values, they can be obtained from Switchbot API. To do so, you can go to the `Code.gs` file and run the `listDevices` function. It will output a JSON file containing the list of all the devices in your account. Check the contents and copy/paste the `deviceId` value corresponding to each of your devices.

### Testing heating control and setting a schedule

Now, everything should be ready to make sure things are working fine.

We will first run things in "dry run" to make sure setting are set properly.

In the `const.js` file, set `DRY_RUN` value to true.  
Then, in the `Code.gs` file, run the `controlHeating` function.  
Look at the output and make sure:
- There is no error output
- The devices checked correspond to the devices that should be checked based on the current time and your schedule.

If you have no issue, revert the `DRY_RUN` value to false, and rerun the `controlHeating` function.  
Try modifying some of the schedule values or the current status of your heater in your spreadsheet so that some Switchbot device should be triggered on or off. If everything works correctly, great! It is now time to set up a schedule.

In Google Apps Script menu, choose Triggers, and add a trigger to run along a specific schedule.  
You should calculate the schedule so that it does not go over the [Google Apps Script quotas](https://developers.google.com/apps-script/guides/services/quotas), especially the URL Fetch calls one. Consider that in the worst case scenario, each device requires 2 calls URL Fetch calls per execution (one to check current temperature, and one to modify the heater setting).

Enjoy your automated life!

### Disclaimer

- This has only been tested in winter so far, so summer will require changes in the temperature handling logic. Look forward to it!
- Use this script with care. Especially, make sure the values you set for everything are valid! I cannot be held responsible for any damage this script might do due to wrong settings.


