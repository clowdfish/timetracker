// Saves options to chrome.storage.sync.
// A permission to "storage" is required.
function save_options() {

  var url = document.getElementById('sharepoint_url').value;
  var username = document.getElementById('sharepoint_username').value;
  var password = document.getElementById('sharepoint_password').value;

  chrome.storage.sync.set({
    url: url,
    username: username,
    password: password
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

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {

  // Use default value url = '' and 'username' = ''.
  chrome.storage.sync.get({
    url: '',
    username: '',
    password: ''
  }, function(items) {
    document.getElementById('sharepoint_url').value = items.url;
    document.getElementById('sharepoint_username').value = items.username;
    document.getElementById('sharepoint_password').value = items.password;
  });
}

function addTranslations() {
  document.getElementById('github_username_label').innerHTML = chrome.i18n.getMessage("options_form_username");
  document.getElementById('github_password_label').innerHTML = chrome.i18n.getMessage("options_form_password");
  document.getElementById('sharepoint_url_label').innerHTML = chrome.i18n.getMessage("options_form_sharepoint_url");
  document.getElementById('sharepoint_username_label').innerHTML = chrome.i18n.getMessage("options_form_username");
  document.getElementById('sharepoint_password_label').innerHTML = chrome.i18n.getMessage("options_form_password");
  document.getElementById("save").innerHTML = chrome.i18n.getMessage("options_form_save");
}

// initialize page
addTranslations();
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);