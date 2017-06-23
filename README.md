Translation Workflow
==========
A way to translate strings for your [react-intl](https://github.com/yahoo/react-intl) powered React web app.

Overview
--------
This workflow consists of two parts, scripts that live inside the code base and a Google Sheet which acts as the interface for a translator to make translations without having to edit code. There are two scripts, one that pulls from Google Sheets and builds messages for each language and one that exports the built messages to Google Sheets. The workflow assumes that you are using both [react-intl](https://github.com/yahoo/react-intl) and the [babel plugin](https://github.com/yahoo/babel-plugin-react-intl) for react-intl in your project.

There's quite a few things to get setup but once everything is in place, translations will be a breeze.

The Setup
-----------
### Install
```npm install git+ssh://git@github.com:ratehub/translation-workflow.git --save-dev```

### Google Sheet for Translations
#### 1. Grab the Translation Template Sheet
Go to [this link](https://docs.google.com/spreadsheets/d/1xO96w8DqzW_feS5-uCVnKP9gj2ZOmklXW4io8M174HE/edit?usp=sharing), click **File** then click **Make a Copy**.
You will notice some sample messages. This isn't a problem, you will not have to clear them out as running the scripts will update the Message IDs and Default Messages with the latest from your web app.
WARNING: make sure there are no translated messages to start with, that is the French and Language 3 columns should be empty. 

#### 2. Adding Languages and Renaming
Read the 'README' sheet and follow the instructions to add new languages if and rename the language headings and sheets if needed. For example if you wanted Spanish instead of Language 3, rename the cell in 'All Messages' to Spanish and the 'lang3' sheet to 'es'.

#### 3. Jot Down Sheet IDs
* Take note of the Spreadsheet ID
    * e.g. the ID for the Translation Template Sheet is found in the URL
    docs.google.com/spreadsheets/d/**1xO96w8DqzW_feS5-uCVnKP9gj2ZOmklXW4io8M174HE**/edit#gid=0
* Take note of the Sheet ID for the default language
    * e.g. the ID for 'en' is in the Translation Template Sheet is found in the URL when you are on that sheet    docs.google.com/spreadsheets/d/1xO96w8DqzW_feS5-uCVnKP9gj2ZOmklXW4io8M174HE/edit#gid=**1485390473**
* Take note of the Sheet ID for each translated language
    * e.g. the ID for 'fr' is **765385960** and the ID for 'lang 3' is **1859455466**

#### 4. Share
* Go to **File** > **Share...** and set so that anyone with the link can view
* In the same modal, explicitly share the spreadsheet with developers who will need to run the script as well as the translators by entering their emails

### Google API
1. The Google Spreadsheet APIs that are used in the scripts require authentication. Visit the [Sheets API Console](https://console.developers.google.com/apis/api/sheets.googleapis.com/) and click **Enable**.
2. Use the sidebar to navigate to **Credentials**
3. Click on the **Create Credentials** dropdown and choose **OAuth Client ID**
4. Choose **Web application** as the the application type and give it a name, something like "Translation Workflow"
5. For the **Authorized redirect URIs** field enter the URL for localhost with any port for example http://127.0.0.1:1234
Note: If you chose a port not in use, you will be redirected to a page that cannot be reached but for our purposes, this doesn't matter since we want to grab the authentication code found in the query string of the redirected url.
6. Once you are done creating the OAuth Client ID, you should be back on the Credentials page. From here click on the OAuth Client you've just created under the list of **OAuth 2.0 client IDs**. If you named it "Translation Workflow" you should see it here.
7. Click **Download JSON** and save the file as ```client_id.json``` at the root of your project under the folder ```.credentials/``` if you are following the default path for credentials. Feel free to change the path for credentials in ```lang.conf.js``` if you'd like but the file name should be ```client_id.json```

### lang.conf.js
With the sheet IDs you jotted down earlier, create and fill out a ```lang.conf.js``` file and place it in the root directory of your project.
#### Sample config for the Translation Template Google Sheet
```
module.exports = {
   default_lang: 'en',
   build_path: 'build/locales/',
   messages_path: 'build/messages/',
   credentials_path: '.credentials/',
   spreadsheet_id: '1okMK8TQM1pWoww9Kx7prE6dwvd9_mPPasvhpofPI5Os',
   all_messages: {
      sheet_id: '1485390473'
   },
   translated_langs: {
      fr: {
         sheet_id: '765385960',
      },
      lang3: {
         sheet_id: '1859455466',
      }
   }
};
```
The Process
-----------
#### Translating Messages
1. Open Google Sheets and pull up the 'All Messages' tab
2. In the appropriate language column type in your translation
3. Notify the developer that new translations are available

### Building Languages
Run this if you've just cloned your web app project and have no languages built or you've been notified of new translations.
1. Run babel or babel loaders through webpack to output your react-intl formatted messages
2. Run ```translation build``` to grab messages generated by the previous step and output your builds to the directory defined in your ```lang.conf.js```
3. Your app should now have the latest translations

#### Exporting Default Messages
Run this when you've added new messages to your code for example a new label is added to a component.
1. Run ```translation export```
2. Follow the Google API authentication process if prompted
3. Request translations from your translator on Google Sheets

Ideas for Improvement
----------------------
* Add screenshots to README.md to show the steps visually
* Google Sheets add-on that automatically adds a new sheet for a new language
* Hooks to notify developers of new translations and the translator of new untranslated strings
