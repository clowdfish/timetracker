/**
 *
 *
 * @constructor
 */
function Recording() {
  this.helper = new Helper();
}

Recording.prototype = {

  constructor: Recording,

  /**
   *
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
   *
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
      sharepointPassword: ''
    }, function(items) {

      if (!items.sharepointUrl || !items.sharepointUsername || !items.sharepointPassword) {
        console.error('Cannot connect to SharePoint, connection data missing.');
      }

      var sharePointConnector =
        new SharePointConnector(items.sharepointUrl, items.sharepointUsername, items.sharepointPassword, Config);

      var list = document.getElementById("category-list");
      var category = list.options[list.selectedIndex].value;

      // TODO implement alternative for Github

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

      sharePointConnector.addTimeRecord(record, function (error) {

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
   *
   *
   * @returns {boolean}
   */
  checkInput: function() {

    var _this = this;

    if(document.getElementById("category-list").selectedIndex == -1) {
      _this.helper.renderStatus('Select category first!', 'error');
      return false;
    }

    _this.helper.renderStatus('');
    return true;
  },

  /**
   *
   *
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
  }
};

// initialize page
document.addEventListener('DOMContentLoaded', function() {

  var recording = new Recording();

  recording.prepareView();

  document.getElementById('date-change').addEventListener('click', recording.editDate.bind(recording));
  document.getElementById('store').addEventListener('click', recording.addTimeRecord.bind(recording));
});

