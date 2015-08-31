/**
 * The options class.
 *
 * @constructor
 */
function Options() {
  this.helper = new Helper();

  chrome.runtime.connect({ name: "stateChannel" })
    .postMessage({ state: 'options' });

  this.port = chrome.runtime.connect({ name: "optionsChannel" });
}

Options.prototype = {

  constructor: Options,

  /**
   * Saves options to chrome.storage.sync.
   * A permission to "storage" is required.
   */
  saveOptions: function() {

    var _this = this;

    var sharepointUrl = document.getElementById('sharepoint-url').value;
    var sharepointUsername = document.getElementById('sharepoint-username').value;
    var sharepointPassword = '';

    var githubUsername = document.getElementById('github-username').value;
    var githubPassword = '';

    var rememberProject = document.getElementById('remember-project').checked;
    var rememberPassword = document.getElementById('remember-password').checked;

    if(rememberPassword) {
      sharepointPassword = document.getElementById('sharepoint-password').value;
      githubPassword = document.getElementById('github-password').value;
    }

    chrome.storage.sync.set({
      sharepointUrl: sharepointUrl,
      sharepointUsername: sharepointUsername,
      sharepointPassword: sharepointPassword,
      githubUsername: githubUsername,
      githubPassword: githubPassword,
      rememberProject: rememberProject,
      rememberPassword: rememberPassword
    }, function() {
      _this.helper.renderStatus(chrome.i18n.getMessage("status_options_saved"), 'success', true);
    });
  },

  /**
   * Restore options from chrome.storage.sync.
   */
  restoreOptions: function() {

    chrome.storage.sync.get({
      sharepointUrl: '',
      sharepointUsername: '',
      sharepointPassword: '',
      githubUsername: '',
      githubPassword: '',
      rememberPassword: false,
      rememberProject: false
    }, function(items) {

      if(items.rememberPassword) {
        document.getElementById('sharepoint-password').value = items.sharepointPassword;
        document.getElementById('github-password').value = items.githubPassword;
      }

      document.getElementById('sharepoint-url').value = items.sharepointUrl;
      document.getElementById('sharepoint-username').value = items.sharepointUsername;
      document.getElementById('github-username').value = items.githubUsername;

      document.getElementById('remember-project').checked = items.rememberProject;
      document.getElementById('remember-password').checked = items.rememberPassword;
    });
  },

  /**
   * Add translations to the options page.
   */
  addTranslations: function() {

    document.getElementsByTagName('title').item(0).innerHTML = chrome.i18n.getMessage("options_title");
    document.getElementById('github-title').innerHTML = chrome.i18n.getMessage("options_github_title");
    document.getElementById('github-username-label').innerHTML = chrome.i18n.getMessage("options_form_username");
    document.getElementById('github-password-label').innerHTML = chrome.i18n.getMessage("options_form_token");
    document.getElementById('sharepoint-title').innerHTML = chrome.i18n.getMessage("options_form_sharepoint_url");
    document.getElementById('sharepoint-url-label').innerHTML = chrome.i18n.getMessage("options_form_sharepoint_url");
    document.getElementById('sharepoint-username-label').innerHTML = chrome.i18n.getMessage("options_form_username");
    document.getElementById('sharepoint-password-label').innerHTML = chrome.i18n.getMessage("options_form_password");
    document.getElementById('settings-title').innerHTML = chrome.i18n.getMessage("options_other_title");
    document.getElementById('remember-project-label').innerHTML = chrome.i18n.getMessage("options_form_project_remember");
    document.getElementById('remember-password-label').innerHTML = chrome.i18n.getMessage("options_form_password_remember");
    document.getElementById('back').innerHTML = chrome.i18n.getMessage("form_back");
    document.getElementById('save').innerHTML = chrome.i18n.getMessage("form_save");
  },

  /**
   * Sends all input changes to the event page to be persisted in case the user
   * closes the pop-up unintentionally.
   */
  addEventListeners: function() {

    var _this = this;

    /* user data */

    document.getElementById("sharepoint-url").addEventListener("keydown", function(event) {
      setTimeout(function() {
        _this.port.postMessage({ "sharepointUrl": event.target.value });    
      }, 50);
    });

    document.getElementById("sharepoint-username").addEventListener("keydown", function(event) {
      setTimeout(function() {
        _this.port.postMessage({ "sharepointUsername": event.target.value });
      }, 50);
    });

    document.getElementById("github-username").addEventListener("keydown", function(event) {
      setTimeout(function() {
        _this.port.postMessage({ "githubUsername": event.target.value });
      }, 50);
    });

    /* password inputs */

    chrome.storage.sync.get({
      rememberPassword: false
    }, function(items) {

      if(items.rememberPassword) {

        document.getElementById("sharepoint-password").addEventListener("keydown", function (event) {
          setTimeout(function() {
            _this.port.postMessage({"sharepointPassword": event.target.value});
          }, 50);
        });

        document.getElementById("github-password").addEventListener("keydown", function(event) {
          setTimeout(function() {
            _this.port.postMessage({ "githubPassword": event.target.value });
          }, 50);
        });
      }
    });

    /* other settings */

    document.getElementById("remember-project").addEventListener("change", function(event) {
      _this.port.postMessage({ "rememberProject": event.target.checked });
    });

    document.getElementById("remember-password").addEventListener("change", function(event) {
      _this.port.postMessage({ "rememberPassword": event.target.checked });
    });
  }
};

// initialize page
document.addEventListener('DOMContentLoaded', function() {
  var options = new Options();

  options.addTranslations();
  options.addEventListeners();
  options.restoreOptions();

  document.getElementById('save').addEventListener('click', options.saveOptions.bind(options));
});