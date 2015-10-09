/**
 * The selection class.
 *
 * @constructor
 */
function Selection() {

  this.helper = new Helper();

  chrome.runtime.connect({ name: "stateChannel" })
    .postMessage({ state: 'selection' });
}

Selection.prototype = {

  constructor: Selection,

  /**
   * Check selections and put to storage.
   */
  processEntries: function() {

    var _this = this;

    var projectElement = document.getElementById('project-item');
    var requirementElement = document.getElementById('requirement-item');

    if (projectElement.selectedIndex == -1 || requirementElement.selectedIndex == -1) {
      _this.helper.renderStatus(chrome.i18n.getMessage("status_selection_incomplete"), 'error');
      return;
    }

    var projectId = projectElement.value;
    var projectTitle = projectElement.options[ projectElement.selectedIndex ].text;

    var requirementId = requirementElement.value;
    var requirementTitle = requirementElement.options[ requirementElement.selectedIndex ].text;

    var typeElement = document.getElementById('item').checked;
    var type = typeElement ? 'item' : 'github';

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
   * Load recently selected project.
   */
  restoreSelection: function() {

    var _this = this;

    _this.helper.showWaitingAnimation();

    chrome.storage.sync.get({
      projectId: '',
      requirementId: '',
      type: '',
      rememberProject: false
    }, function(items) {

      _this.loadProjects(function() {

        if(items.rememberProject && items.projectId) {

          document.getElementById('project-item').value = items.projectId;

          _this.loadRequirements(items.projectId, function() {
            if (items.requirementId)
              document.getElementById('requirement-item').value = items.requirementId;
          });
        }

        document.getElementById('item').checked = items.type == 'item';
        document.getElementById('issue').checked = items.type == 'github';

        _this.helper.hideWaitingAnimation();
      });
    });
  },

  /**
   * Load projects from the back end.
   *
   * @param callback
   */
  loadProjects: function(callback) {

    var _this = this;

    chrome.storage.sync.get({
      sharepointUrl: '',
      sharepointUsername: '',
      sharepointPassword: ''
    }, function(items) {

      if (!items.sharepointUrl || !items.sharepointUsername || !items.sharepointPassword) {
        _this.helper.renderStatus(chrome.i18n.getMessage("status_sharepoint_missing"), 'error');
      }

      new SharePointConnector(items.sharepointUrl, items.sharepointUsername, items.sharepointPassword, Config)
        .getProjects(function (error, resultList) {

          if(error) {
            _this.helper.renderStatus(chrome.i18n.getMessage("status_sharepoint_error"), 'error');
            callback();
          }

          var projectsList = document.getElementById('project-item');

          if (resultList && resultList.length) {
            document.getElementById("project-query-button").style.display =
              resultList.length > 1 ? 'block' : 'none';

            // delete all existing nodes first
            while (projectsList.firstChild) {
              projectsList.removeChild(projectsList.firstChild);
            }

            resultList.forEach(function (result) {

              var option = document.createElement('option');
              option.text = result['Number'] + ' - ' + result['Title'];
              option.value = result['Id'];

              projectsList.appendChild(option);
            });
          }
          else
            document.getElementById("project-query-button").style.display = 'none';

          callback()
        }
      );
    });
  },

  /**
   * Load requirements from the back end.
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
        _this.helper.renderStatus(chrome.i18n.getMessage("status_sharepoint_missing"), 'error');
      }

      new SharePointConnector(items.sharepointUrl, items.sharepointUsername, items.sharepointPassword, Config)
        .getRequirements(projectId, function (error, resultList) {

          if(error) {
            _this.helper.renderStatus(chrome.i18n.getMessage("status_sharepoint_error"), 'error');
            callback();
          }

          var requirementsList = document.getElementById('requirement-item');

          // delete all existing nodes first
          while (requirementsList.firstChild) {
            requirementsList.removeChild(requirementsList.firstChild);
          }

          if (resultList && resultList.length) {
            document.getElementById("requirement-query-button").style.display = 
              resultList.length > 1 ? 'block' : 'none';
            
            resultList.forEach(function (result) {
              var option = document.createElement('option');
              option.text = result['Title'];
              option.value = result['Id'];

              requirementsList.appendChild(option);
            });
          }
          else
            document.getElementById("requirement-query-button").style.display = 'none';

          _this.helper.hideWaitingAnimation();

          callback()
        }
      );
    });
  },

  /**
   * Open the project query and add event listeners and handlers.
   */
  handleProjectQuery: function() {

    var _this = this;

    var queryButton = document.getElementById("project-query-button");
    var queryContainer = document.getElementById("project-query");
    var queryInput = document.getElementById("project-query-input");
    var queryCloseButton = document.getElementById("project-query-close-button");
    var projectList = document.getElementById('project-item');

    if(projectList.length > 1) {

      queryButton.style.display = 'none';
      queryContainer.style.display = 'block';

      queryInput.focus();

      var optionArray = [];

      for(var i=0; i<projectList.length; i++) {
        optionArray.push({
          text: projectList[i].text,
          value: projectList[i].value
        });
      }

      queryCloseButton.addEventListener('click', function() {
        showSearchResults("");
        queryButton.style.display = 'inline-block';
        queryContainer.style.display = 'none';
      });

      queryInput.addEventListener('keyup', function() {
        var queryString = this.value;

        showSearchResults(queryString);
      });
    }

    /**
     * Show search results in result list based on query string.
     *
     * @param queryString
     */
    function showSearchResults(queryString) {

      optionArray.forEach(function(option, index) {

        if (option.text.indexOf(queryString) == -1) {
          var elementIndex = _this.getElementIndex(projectList, option.value);

          if (elementIndex > -1)
            projectList.removeChild(projectList[elementIndex]);
        }
        else {
          if(_this.getElementIndex(projectList, option.value) == -1) {

            var child = document.createElement('option');
            child.text = option.text;
            child.value = option.value;

            projectList.add(child, index)
          }
        }
      });
    }
  },

  /**
   * Open the requirement query and add event listeners and handlers.
   */
  handleRequirementQuery: function() {

    var _this = this;

    var queryButton = document.getElementById("requirement-query-button");
    var queryContainer = document.getElementById("requirement-query");
    var queryInput = document.getElementById("requirement-query-input");
    var queryCloseButton = document.getElementById("requirement-query-close-button");
    var requirementsList = document.getElementById('requirement-item');

    if(requirementsList.length > 1) {

      queryButton.style.display = 'none';
      queryContainer.style.display = 'block';

      queryInput.focus();

      var optionArray = [];

      for(var i=0; i<requirementsList.length; i++) {
        optionArray.push({
          text: requirementsList[i].text,
          value: requirementsList[i].value
        });
      }

      queryCloseButton.addEventListener('click', function() {
          showSearchResults("");
          queryButton.style.display = 'inline-block';
          queryContainer.style.display = 'none';
        });

      queryInput.addEventListener('keyup', function() {
        var queryString = this.value;

        showSearchResults(queryString);
      });
    }

    /**
     * Show search results in result list based on query string.
     *
     * @param queryString
     */
    function showSearchResults(queryString) {

      optionArray.forEach(function(option, index) {

        if (option.text.indexOf(queryString) == -1) {
          var elementIndex = _this.getElementIndex(requirementsList, option.value);

          if (elementIndex > -1)
            requirementsList.removeChild(requirementsList[elementIndex]);
        }
        else {
          if(_this.getElementIndex(requirementsList, option.value) == -1) {

            var child = document.createElement('option');
            child.text = option.text;
            child.value = option.value;

            requirementsList.add(child, index)
          }
        }
      });
    }
  },

  /**
   * Returns the element index or -1 if the given value is not available in the
   * given select element.
   *
   * @param selectElement
   * @param value
   * @returns {number}
   */
  getElementIndex: function(selectElement, value) {

    for(var i=0; i<selectElement.length; i++) {
      if(selectElement[i].value == value) return i;
    }
    return -1;
  },

  /**
   * Add translations to the selection page.
   */
  addTranslations: function() {
    document.getElementsByTagName('title').item(0).innerHTML = chrome.i18n.getMessage("title");
    document.getElementById("project-title").innerHTML = chrome.i18n.getMessage("selection_project_label");
    document.getElementById("project-empty-tag").innerHTML = chrome.i18n.getMessage("selection_project_empty");
    document.getElementById("requirement-title").innerHTML = chrome.i18n.getMessage("selection_requirement_label");
    document.getElementById("type-title").innerHTML = chrome.i18n.getMessage("selection_type_label");
    document.getElementById("item-label").innerHTML = chrome.i18n.getMessage("selection_type_item");
    document.getElementById("issue-label").innerHTML = chrome.i18n.getMessage("selection_type_issue");
    document.getElementById("button-options").innerHTML = chrome.i18n.getMessage("form_options");
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

  document.getElementById('requirement-query-button').addEventListener('click',
    selection.handleRequirementQuery.bind(selection));

  document.getElementById('project-query-button').addEventListener('click',
    selection.handleProjectQuery.bind(selection));
});
