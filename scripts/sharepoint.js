/**
 * The SharePoint Connector class.
 *
 * @param url
 * @param username
 * @param password
 * @param config
 * @constructor
 */
function SharePointConnector(url, username, password, config) {

  this.url = url;
  this.username = username;
  this.password = password;
  this.projectsListName = config.projectsListName;
  this.requirementsListName = config.requirementsListName;
  this.timeRecordsListName = config.timeRecordsListName;
}

SharePointConnector.prototype = {

  constructor: SharePointConnector,

  /**
   * Retrieve all available projects.
   *
   * @param callback
   */
  getProjects: function(callback) {

    var _this = this;

    var fullUrl = _this.prepareApiUrl(_this.url) + 'web/lists/GetByTitle(\'' + _this.projectsListName + '\')/items';

    $.ajax({
      url: fullUrl,
      type: "GET",
      contentType: "application/json; odata=verbose",
      dataType: "json",
      headers: {
        "Authorization": _this.encodeAuthKey(_this.username, _this.password),
        "Accept": "application/json; odata=verbose"
      },
      success: function(result) {
        callback(_this.formatProjects(result));
      },
      error: function(err) {
        console.error("An error occurred: " + err);
        callback([]);
      }
    });
  },

  /**
   * Format projects list to fit the plugin's needs.
   *
   * @param results
   * @returns {*}
   */
  formatProjects: function(results) {

    return results['d']['results'].map(function(result) {

      return {
        'Id': result['Id'],
        'Title': result['Title'],
        'Status': result['Status'],
        'StartDate': result['StartDate']
      };
    });
  },

  /**
   * Retrieve the requirements for the given project.
   *
   * @param projectId
   * @param callback
   */
  getRequirements: function(projectId, callback) {

    var _this = this;

    var fullUrl = _this.prepareApiUrl(_this.url) + 'web/lists/GetByTitle(\'' + _this.requirementsListName + '\')/items';

    $.ajax({
      url: fullUrl,
      type: "GET",
      contentType: "application/json; odata=verbose",
      dataType: "json",
      headers: {
        "Authorization": _this.encodeAuthKey(_this.username, _this.password),
        "Accept": "application/json; odata=verbose"
      },
      success: function(result) {
        callback(_this.formatRequirement(result, projectId));
      },
      error: function(err) {
        console.error("An error occurred: " + err);
        callback([]);
      }
    });
  },

  /**
   * Format requirements list to fit the plugin's needs.
   *
   * @param results
   * @param projectId
   * @returns {*}
   */
  formatRequirement: function(results, projectId) {

    return results['d']['results'].map(function(item) {
      return {
        'Id': item['Id'],
        'Title': item['Title'],
        'Description': item['Body'],
        'ProjectId': item['ProjectId'],
        'Date': item['Date']
      };
    }).filter(function(requirement) {
      return projectId && requirement['ProjectId'] == projectId;
    });
  },

  /**
   * Return a list of categories.
   *
   * @param callback
   */
  getCategories: function(callback) {

    callback(Config.categories);
  },

  /**
   * Add new time record to SharePoint.
   *
   * @param record:
   *        record.duration,
   *        record.date,
   *        record.description,
   *        record.summary,
   *        record.category,
   *        record.requirementId
   * @param callback
   */
  addTimeRecord: function(record, callback) {

    var _this = this;

    chrome.storage.sync.get({
      timeRecordsListFullName: ''
    }, function(items) {

      if(items.timeRecordsListFullName) {
        // we already have the 'ListItemEntityTypeFullName'
        addListItem(items.timeRecordsListFullName);
      }
      else {

        $.ajax({
          url: _this.prepareApiUrl(_this.url) + 'web/lists/GetByTitle(\'' + _this.timeRecordsListName + '\')',
          type: "GET",
          contentType: "application/json; odata=verbose",
          dataType: "json",
          headers: {
            "Authorization": _this.encodeAuthKey(_this.username, _this.password),
            "Accept": "application/json; odata=verbose"
          },
          success: function(result) {
            var fullName = result['d']['ListItemEntityTypeFullName'];

            chrome.storage.sync.set({
              timeRecordsListFullName: fullName
            }, function () {});

            // add list item
            addListItem(fullName);
          },
          error: function(err) {
            console.error("An error occurred: " + err);
          }
        });
      }
    });

    /**
     * Add list item to time record list.
     *
     * @param listFullName
     */
    function addListItem(listFullName) {

      _this.getFormDigestToken(function(error, token) {

        if(error) {
          console.error(error.message);
          return;
        }

        var fullUrl = _this.prepareApiUrl(_this.url) + 'web/lists/GetByTitle(\'' + _this.timeRecordsListName + '\')/items';

        var data = JSON.stringify({
          '__metadata': {
            'type': listFullName // ListItemEntityTypeFullName
          },
          'Title': 'TimeTrackingItem',
          'Duration': record.duration,
          'Date': record.date,
          'Description': record.description,
          'Summary': record.summary,
          'Category': record.category,
          'RequirementId': record.requirementId
        }, null, 0);

        $.ajax({
          url: fullUrl,
          type: "POST",
          data: data,
          contentType: "application/json; odata=verbose",
          dataType: "json",
          headers: {
            "Authorization": _this.encodeAuthKey(_this.username, _this.password),
            "Accept": "application/json; odata=verbose",
            "X-RequestDigest": token
          },
          success: function() {
            callback(null);
          },
          error: function(err) {
            callback(Error('Could not add time Record: ' + err));
          }
        });
      });
    }
  },

  /**
   * Add the api string to the given SharePoint url.
   *
   * @param url
   * @returns {string}
   */
  prepareApiUrl: function(url) {

    if(url.substr(-1, 1) != '/')
      url += '/';

    url += '_api/';

    return url;
  },

  /**
   * Encode the key for basic authentication.
   *
   * @param username
   * @param password
   * @returns {string}
   */
  encodeAuthKey: function(username, password) {
    return "Basic " + btoa(username + ':' + password);
  },

  /**
   * Retrieve for digest token to authenticate for list creation request.
   *
   * @param callback
   */
  getFormDigestToken: function(callback) {

    var _this = this;

    chrome.storage.sync.get({
      formDigestToken: '',
      formDigestTokenTimeout: 0
    }, function(items) {

      if (items.formDigestTokenTimeout && items.formDigestToken)
        callback(null, items.formDigestToken);
      else {
        // get new token
        $.ajax({
          url: _this.prepareApiUrl(_this.url) + 'contextinfo',
          type: "POST",
          contentType: "application/json; odata=verbose",
          dataType: "json",
          headers: {
            "Authorization": _this.encodeAuthKey(_this.username, _this.password),
            "Accept": "application/json; odata=verbose",
            "Content-Length": 2
          },
          success: function (result) {
            var digestToken = result['d']['GetContextWebInformation']['FormDigestValue'];
            var digestTokenTimeout = result['d']['GetContextWebInformation']['FormDigestTimeoutSeconds'];

            chrome.storage.sync.set({
              formDigestToken: digestToken,
              formDigestTokenTimeout: digestTokenTimeout
            }, function () {});

            callback(null, digestToken);
          },
          error: function (err) {
            callback(Error('Could not get form digest token: ' + err), null);
          }
        });
      }
    });
  }
};