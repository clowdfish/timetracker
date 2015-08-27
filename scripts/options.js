/**
 * Saves options to chrome.storage.sync.
 * A permission to "storage" is required.
 */
function saveOptions() {

  var sharepointUrl = document.getElementById('sharepoint_url').value;
  var sharepointUsername = document.getElementById('sharepoint_username').value;
  var sharepointPassword = '';

  var githubUsername = document.getElementById('github_username').value;
  var githubPassword = '';

  var rememberProject = document.getElementById('remember_project').checked;
  var rememberPassword = document.getElementById('remember_password').checked;

  if(rememberPassword) {
    sharepointPassword = document.getElementById('sharepoint_password').value;
    githubPassword = document.getElementById('github_password').value;
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
    // Update status to let user know options were saved.
    var status = document.getElementById('status');

    status.textContent = chrome.i18n.getMessage("options_saved");
    status.className = "success";

    setTimeout(function() {
      status.textContent = '';
      status.className = '';
    }, 1500);
  });
}

/**
 *
 */
function restoreOptions() {

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
      document.getElementById('sharepoint_password').value = items.sharepointPassword;
      document.getElementById('github_password').value = items.githubPassword;
    }

    document.getElementById('sharepoint_url').value = items.sharepointUrl;
    document.getElementById('sharepoint_username').value = items.sharepointUsername;
    document.getElementById('github_username').value = items.githubUsername;

    document.getElementById('remember_project').checked = items.rememberProject;
    document.getElementById('remember_password').checked = items.rememberPassword;
  });
}

function addTranslations() {
  document.getElementById('github_username_label').innerHTML = chrome.i18n.getMessage("options_form_username");
  document.getElementById('github_password_label').innerHTML = chrome.i18n.getMessage("options_form_token");
  document.getElementById('sharepoint_url_label').innerHTML = chrome.i18n.getMessage("options_form_sharepoint_url");
  document.getElementById('sharepoint_username_label').innerHTML = chrome.i18n.getMessage("options_form_username");
  document.getElementById('sharepoint_password_label').innerHTML = chrome.i18n.getMessage("options_form_password");
  document.getElementById("save").innerHTML = chrome.i18n.getMessage("options_form_save");
}

// initialize page
addTranslations();
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);