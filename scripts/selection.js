/**
 *
 */
function processEntries() {

  var projectElement = document.getElementById('project-item');

  var projectId = projectElement.value;
  var projectTitle = projectElement.options[ projectElement.selectedIndex ].text;

  var requirementElement = document.getElementById('requirement-item');

  var requirementId = requirementElement.value;
  var requirementTitle = requirementElement.options[ requirementElement.selectedIndex ].text;

  var typeElement = document.getElementById('item').checked;
  var type = typeElement ? 'item' : 'github';

  if (!projectTitle || !requirementTitle) {
    renderStatus('Select a project and requirement.', 'error');
    return;
  }

  chrome.storage.sync.set({
    projectId: projectId,
    projectTitle: projectTitle,
    requirementId: requirementId,
    requirementTitle: requirementTitle,
    type: type
  }, function () {

    renderStatus('', 'success');
    window.location.href = '../recording.html';
  });
}

/**
 *
 *
 */
function restoreSelection() {


  chrome.storage.sync.get({
    projectId: '',
    requirementId: '',
    type: '',
    rememberProject: false
  }, function(items) {

    if(items.rememberProject) {
      if (items.projectId)
        document.getElementById('project-item').value = items.projectId;

      if (items.requirementId)
        document.getElementById('requirement-item').value = items.requirementId;

      document.getElementById('item').checked = items.type == 'item';
      document.getElementById('issue').checked = items.type == 'github';
    }
  });
}

/**
 * Render status to the popup.
 *
 * @param statusText
 * @param type
 */
function renderStatus(statusText, type) {
  var status = document.getElementById('status');

  status.textContent = statusText;

  switch(type) {
    case 'error':
      status.className = "error";
      break;
    case 'warning':
      status.className = "error";
      break;
    default:
      status.className = "";
      break;
  }
}

/**
 * @param {function(string,number,number)} callback - Called when an image has
 *   been found. The callback gets the URL, width and height of the image.
 * @param {function(string)} errorCallback - Called when the image is not found.
 *   The callback gets a string that describes the failure reason.
 */
function getProjects(callback, errorCallback) {

  // TODO get SharePoint url from storage
  var searchUrl = "";

  var x = new XMLHttpRequest();

  x.open('GET', searchUrl);

  // SharePoint responds with JSON, so let Chrome parse it.
  x.responseType = 'json';

  x.onload = function() {
    var response = x.response;

    if (!response || !response.responseData || !response.responseData.results ||
        response.responseData.results.length === 0) {
      errorCallback('No response from SharePoint!');
      return;
    }

    // TODO do something with the response and then return it in the callback

    callback();
  };

  x.onerror = function() {
    errorCallback('Network error.');
  };

  x.send();
}

function addTranslations() {
  document.getElementById("record").innerHTML = chrome.i18n.getMessage("selection_form_record");
}

// initialize page
addTranslations();

document.addEventListener('DOMContentLoaded', function() {

  restoreSelection();
  // do something after the popup loaded

});

document.getElementById('record').addEventListener('click',  processEntries);
