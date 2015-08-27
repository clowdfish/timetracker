
/**
 *
 *
 */
function editDate() {

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
}

/**
 * Create a date string according to German standards.
 *
 * @param date
 * @returns {string}
 */
function createDateString(date) {

  var day = date.getDate();
  var month = date.getMonth() + 1;
  var year = date.getFullYear();

  return '' + day + '.' + month + '.' + year;
}

/**
 *
 *
 */
function addTimeRecord() {

  // check if input is valid
  if(!checkInput()) return;

  // TODO start spinner

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

        // TODO stop spinner

        renderStatus('Could not add time record', 'error');
      }

      // TODO stop spinner

      renderStatus('Time record added!', 'success', true);
    });
  });
}

/**
 *
 *
 * @returns {boolean}
 */
function checkInput() {

  if(document.getElementById("category-list").selectedIndex == -1) {
    renderStatus('Select category first!', 'error');
    return false;
  }

  renderStatus('');
  return true;
}

/**
 * Render status to the popup.
 *
 * @param statusText
 * @param type
 * @param hide
 */
function renderStatus(statusText, type, hide) {
  var status = document.getElementById('status');

  status.textContent = statusText;

  switch(type) {
    case 'error':
      status.className = "error";
      break;
    case 'warning':
      status.className = "warn";
      break;
    case 'success':
      status.className = "success";
      break;
    default:
      status.className = "";
      break;
  }

  if(hide)
    setTimeout(function() {
      status.textContent = '';
      status.className = '';
    }, 2000);
}

// initialize page
document.addEventListener('DOMContentLoaded', function() {

  document.getElementById('date').textContent = createDateString(new Date());

  document.getElementById('date-change').addEventListener('click', editDate);
  document.getElementById('store').addEventListener('click', addTimeRecord);

  chrome.storage.sync.get({
    projectTitle: '',
    requirementId: '',
    type: ''
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
        });
    }
    else {
      document.getElementById('work-item').style.display =  "none";
      document.getElementById('github').style.display =  "block";

      // TODO retrieve Github items
    }
  });
});

