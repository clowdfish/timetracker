/**
 *
 *
 * @constructor
 */
function Selection() {
  this.helper = new Helper();
}

Selection.prototype = {

  constructor: Selection,

  /**
   *
   */
  processEntries: function() {

    var _this = this;

    var projectElement = document.getElementById('project-item');

    var projectId = projectElement.value;
    var projectTitle = projectElement.options[ projectElement.selectedIndex ].text;

    var requirementElement = document.getElementById('requirement-item');

    var requirementId = requirementElement.value;
    var requirementTitle = requirementElement.options[ requirementElement.selectedIndex ].text;

    var typeElement = document.getElementById('item').checked;
    var type = typeElement ? 'item' : 'github';

    if (!projectTitle || !requirementTitle) {
      _this.helper.renderStatus('Select a project and requirement.', 'error');
      return;
    }

    chrome.storage.sync.set({
      projectId: projectId,
      projectTitle: projectTitle,
      requirementId: requirementId,
      requirementTitle: requirementTitle,
      type: type
    }, function () {

      _this.helper.renderStatus('', '', false);
      window.location.href = '../recording.html';
    });
  },

  /**
   *
   */
  restoreSelection: function() {

    var _this = this;

    chrome.storage.sync.get({
      projectId: '',
      requirementId: '',
      type: '',
      rememberProject: false
    }, function(items) {

      _this.loadProjects(function() {

        if(items.rememberProject) {

          if (items.projectId) {
            document.getElementById('project-item').value = items.projectId;

            _this.loadRequirements(items.projectId, function() {
              if (items.requirementId)
                document.getElementById('requirement-item').value = items.requirementId;
            });
          }

          document.getElementById('item').checked = items.type == 'item';
          document.getElementById('issue').checked = items.type == 'github';
        }
      });
    });
  },

  /**
   *
   *
   * @param callback
   */
  loadProjects: function(callback) {

    chrome.storage.sync.get({
      sharepointUrl: '',
      sharepointUsername: '',
      sharepointPassword: ''
    }, function(items) {

      if (!items.sharepointUrl || !items.sharepointUsername || !items.sharepointPassword) {
        console.error('Cannot connect to SharePoint, connection data missing.');
      }

      new SharePointConnector(items.sharepointUrl, items.sharepointUsername, items.sharepointPassword, Config)
        .getProjects(function (resultList) {

          var projectsList = document.getElementById('project-item');

          if (resultList && resultList.length) {

            // delete all existing nodes first
            while (projectsList.firstChild) {
              projectsList.removeChild(projectsList.firstChild);
            }

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
  },

  /**
   *
   *
   * @param projectId
   * @param callback
   */
  loadRequirements: function(projectId, callback) {

    var _this = this;

    _this.helper.showWaitingAnimation();

    chrome.storage.sync.get({
      sharepointUrl: '',
      sharepointUsername: '',
      sharepointPassword: ''
    }, function(items) {

      if (!items.sharepointUrl || !items.sharepointUsername || !items.sharepointPassword) {
        console.error('Cannot connect to SharePoint, connection data missing.');
      }

      new SharePointConnector(items.sharepointUrl, items.sharepointUsername, items.sharepointPassword, Config)
        .getRequirements(projectId, function (resultList) {

          var requirementsList = document.getElementById('requirement-item');

          // delete all existing nodes first
          while (requirementsList.firstChild) {
            requirementsList.removeChild(requirementsList.firstChild);
          }

          if (resultList && resultList.length) {

            resultList.forEach(function (result) {

              var option = document.createElement('option');
              option.text = result['Title'];
              option.value = result['Id'];

              requirementsList.appendChild(option);
            });
          }

          _this.helper.hideWaitingAnimation();

          callback()
        }
      );
    });
  },

  /**
   *
   */
  addTranslations: function() {
    document.getElementById("record").innerHTML = chrome.i18n.getMessage("selection_form_record");
  }
};

// initialize page
document.addEventListener('DOMContentLoaded', function() {

  var selection = new Selection();

  selection.addTranslations();
  selection.restoreSelection();

  document.getElementById('project-item').addEventListener('change',  function(event) {
    selection.loadRequirements(event.target.value, function() {});
  });

  document.getElementById('record').addEventListener('click',  selection.processEntries.bind(selection));
});
