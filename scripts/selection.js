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

    loadProjects(function() {

      if(items.rememberProject) {
        if (items.projectId)
          document.getElementById('project-item').value = items.projectId;

        if (items.requirementId)
          document.getElementById('requirement-item').value = items.requirementId;

        document.getElementById('item').checked = items.type == 'item';
        document.getElementById('issue').checked = items.type == 'github';
      }
    });
  });
}

/**
 *
 *
 * @param callback
 */
function loadProjects(callback) {

  chrome.storage.sync.get({
    sharepointUrl: '',
    sharepointUsername: '',
    sharepointPassword: ''
  }, function(items) {

    if (!items.sharepointUrl || !items.sharepointUsername || !items.sharepointPassword) {
      console.error('Cannot connect to SharePoint, connection data missing.');
    }

    new SharePointConnector(items.sharepointUrl, items.sharepointUsername, items.sharepointPassword, 'Projekte', 'Requirements')
      .getProjects(function (resultList) {

          var projectsList = document.getElementById('project-item');

          if (!resultList || resultList.length == 0) {
            var option = document.createElement('option');
            option.text = "No project available.";
            option.value = -1;

            projectsList.appendChild(option);
          }
          else {
            resultList.forEach(function (result) {

              var option = document.createElement('option');
              option.text = result['Title'];
              option.value = result['Id'];

              projectsList.appendChild(option);
            });
          }

          callback()
        }
    );
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

function addTranslations() {
  document.getElementById("record").innerHTML = chrome.i18n.getMessage("selection_form_record");
}

// initialize page
document.addEventListener('DOMContentLoaded', function() {

  addTranslations();
  restoreSelection();

});

document.getElementById('record').addEventListener('click',  processEntries);
