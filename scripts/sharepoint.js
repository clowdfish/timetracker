/**
 *
 *
 * @param url
 * @param username
 * @param password
 * @param projectListName
 * @param requirementsListName
 * @constructor
 */
function SharePointConnector(url, username, password, projectListName, requirementsListName) {

  this.url = url;
  this.username = username;
  this.password = password;
  this.projectListName = projectListName;
  this.requirementsListName = requirementsListName;
}

SharePointConnector.prototype = {

  constructor: SharePointConnector,

  /**
   *
   *
   * @param callback
   */
  getProjects: function(callback) {

    var _this = this;

    var fullUrl = _this.prepareApiUrl(_this.url) + 'web/lists/GetByTitle(\'' + _this.projectListName + '\')/items';

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
   *
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
   *
   *
   * @param username
   * @param password
   * @returns {string}
   */
  encodeAuthKey: function(username, password) {
    return "Basic " + btoa(username + ':' + password);
  },

  /**
   *
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
   *
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
   *
   *
   * @returns {string[]}
   */
  getCategories: function() {

    return [
      'Development',
      'Documentation',
      'Something else'
    ]
  }
};
