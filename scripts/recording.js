/**
 * The recording class.
 *
 * @constructor
 */
function Recording() {
  this.helper = new Helper();
}

Recording.prototype = {

  constructor: Recording,

  /**
   * Handles the UI elements for selecting a different date.
   *
   */
  editDate: function() {

    var dateDisplayElement = document.getElementById('date');
    var dateChangeElement = document.getElementById('date-change');
    var dateInputElement = document.getElementById('date-input');
    var dateInputButton = document.getElementById('date-input-button');

    dateDisplayElement.style.display = "none";
    dateChangeElement.style.display = "none";

    dateInputElement.value = dateDisplayElement.textContent;
    dateInputElement.style.display = "inline-block";
    dateInputButton.style.display = "inline-block";

    dateInputButton.addEventListener('click', function() {
      dateDisplayElement.textContent = dateInputElement.value;

      dateInputElement.style.display = "none";
      dateInputButton.style.display = "none";

      dateDisplayElement.style.display = "inline";
      dateChangeElement.style.display = "inline-block";
    });
  },

  /**
   * Create a date string according to German standards.
   *
   * @param date
   * @returns {string}
   */
  createDateString: function(date) {

    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();

    return '' + day + '.' + month + '.' + year;
  },

  /**
   * Adds a time record to the back end.
   *
   */
  addTimeRecord: function() {

    var _this = this;

    // check if input is valid
    if(!_this.checkInput()) return;

    _this.helper.showWaitingAnimation();

    chrome.storage.sync.get({
      sharepointUrl: '',
      sharepointUsername: '',
      sharepointPassword: '',
      type: ''
    }, function(items) {

      if (!items.sharepointUrl || !items.sharepointUsername || !items.sharepointPassword) {
        _this.helper.hideWaitingAnimation();
        _this.helper.renderStatus('Cannot connect to SharePoint, connection data missing.', 'error');
        return;
      }

      var list;

      if(items.type == 'item')
        list = document.getElementById("category-list");
      else
        list = document.getElementById("github-issue-list");

      var category = list.options[list.selectedIndex].value;

      var timeArray = document.getElementById('time-input').value.split(':');
      var time = parseInt(timeArray[0]) * 60 + parseInt(timeArray[1]);

      var record = {
        duration: time,
        date: document.getElementById('date').value,
        description: document.getElementById('description').value,
        summary: '',
        category: category,
        requirementId: document.getElementById('selected-requirement').textContent
      };

      new SharePointConnector(items.sharepointUrl, items.sharepointUsername, items.sharepointPassword, Config)
        .addTimeRecord(record, function (error) {

        if (error) {
          console.error('Could not add time record: ' + error.message);

          _this.helper.hideWaitingAnimation();
          _this.helper.renderStatus('Could not add time record', 'error');
        }

        _this.helper.hideWaitingAnimation();
        _this.helper.renderStatus('Time record added!', 'success', true);
      });
    });
  },

  /**
   * Checks the input and renders a error message, if some input is missing.
   *
   * @returns {boolean}
   */
  checkInput: function() {

    var _this = this;

    if(document.getElementById("category-list").selectedIndex == -1) {
      _this.helper.renderStatus('Select category first!', 'error');
      return false;
    }

    // TODO

    _this.helper.renderStatus('');
    return true;
  },

  /**
   * Fill issue list or category list respectively.
   */
  prepareView: function() {

    var _this = this;

    _this.helper.showWaitingAnimation();

    document.getElementById('date').textContent = _this.createDateString(new Date());

    chrome.storage.sync.get({
      projectId: '',
      projectTitle: '',
      requirementId: '',
      type: '',
      sharepointUrl: '',
      sharepointUsername: '',
      sharepointPassword: '',
      githubUsername: '',
      githubPassword: ''
    }, function(items) {

      document.getElementById('selected-project').textContent = items.projectTitle;
      document.getElementById('selected-requirement').textContent = items.requirementId;

      if(items.type == 'item') {
        document.getElementById('work-item').style.display = "block";
        document.getElementById('github').style.display = "none";

        new SharePointConnector(items.sharepointUrl, items.sharepointUsername, items.sharepointPassword, Config)
          .getCategories(function (resultList) {

            var categoryList = document.getElementById('category-list');

            if (resultList && resultList.length) {

              resultList.forEach(function (result) {

                var option = document.createElement('option');
                option.text = result;

                categoryList.appendChild(option);
              });
            }

            _this.helper.hideWaitingAnimation();
          });
      }
      else {
        document.getElementById('work-item').style.display =  "none";
        document.getElementById('github').style.display =  "block";

        new GithubConnector(items.githubUsername, items.githubPassword, Config.githubOrganization)
          .getIssues(items.projectId, items.requirementId, function(error, resultList) {

            if(error)
              _this.helper.renderStatus('Could not retrieve issues from Github.', 'error');
            else {
              var issueList = document.getElementById('github-issue-list');

              if (resultList && resultList.length) {

                resultList.forEach(function (result) {

                  var option = document.createElement('option');
                  option.text = result['title'];

                  issueList.appendChild(option);
                });
              }

              _this.helper.hideWaitingAnimation();
            }
          });
      }
    });
  },

  /**
   * Add translations to the recording page.
   */
  addTranslations: function() {

    document.getElementsByTagName('title').item(0).innerHTML = chrome.i18n.getMessage("title");
    document.getElementById('selected-project-label').innerHTML = chrome.i18n.getMessage("recording_project_label");
    document.getElementById('selected-project').innerHTML = chrome.i18n.getMessage("recording_project_empty");
    document.getElementById('github-title').innerHTML = chrome.i18n.getMessage("recording_issue_label");
    document.getElementById('work-item-title').innerHTML = chrome.i18n.getMessage("recording_category_label");
    document.getElementById('description-title').innerHTML = chrome.i18n.getMessage("recording_description_label");
    document.getElementById('description').placeholder = chrome.i18n.getMessage("recording_description_placeholder");
    document.getElementById('time-title').innerHTML = chrome.i18n.getMessage("recording_time_label");
    document.getElementById('time-input').placeholder = chrome.i18n.getMessage("recording_time_placeholder");
    document.getElementById('date-change').innerHTML = chrome.i18n.getMessage("recording_date_change");
    document.getElementById('back').innerHTML = chrome.i18n.getMessage("form_back");
    document.getElementById('save').innerHTML = chrome.i18n.getMessage("recording_save");
  }
};

// initialize page
document.addEventListener('DOMContentLoaded', function() {

  var recording = new Recording();

  recording.prepareView();
  recording.addTranslations();

  document.getElementById('date-change').addEventListener('click', recording.editDate.bind(recording));
  document.getElementById('store').addEventListener('click', recording.addTimeRecord.bind(recording));
});

