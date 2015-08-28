/**
 * The Github Connector class.
 *
 * @param username
 * @param password
 * @param organization
 * @constructor
 */
function GithubConnector(username, password, organization) {

  this.username = username;
  this.password = password;
  this.organization = organization;
}

GithubConnector.prototype = {

  constructor: GithubConnector,

  /**
   * Retrieve issues for the given project id and requirement id.
   *
   * @param projectId
   * @param requirementId
   * @param callback
   */
  getIssues: function(projectId, requirementId, callback) {

    var _this = this;

    _this.getRepos(projectId, function(error, repo) {

      if(error)
        console.error(error);

      if(error || !repo || repo.length == 0)
        callback(Error(chrome.i18n.getMessage("status_github_repo")), null);

      var url = 'https://api.github.com/repos/' + _this.organization + '/' +
        repo[0]['name'] + '/issues';

      $.ajax({
        url: url,
        type: "GET",
        contentType: "application/json",
        dataType: "json",
        headers: {
          "Authorization": _this.encodeAuthKey(_this.username, _this.password),
          "Accept": "application/json"
        },
        success: function(result) {

          if(!result || result.length == 0) {
            callback(Error(chrome.i18n.getMessage("status_github_issue")), null);
          }

          var issuesForRequirementId = _this.formatIssues(result, requirementId);

          if(issuesForRequirementId.length == 0)
            console.warn('No issue available for the current requirement id.');

          callback(null, issuesForRequirementId);
        },
        error: function(err) {
          console.error("An error occurred: " + err.message);
          callback(err, null);
        }
      });
    });
  },

  /**
   * Format issues to fit the plugin's needs.
   *
   * @param issueList
   * @param requirementId
   */
  formatIssues: function(issueList, requirementId) {

    return issueList.filter(function(issue) {
      if(issue['body'].indexOf('Req-' + requirementId) > -1) {

        if(issue['state'] == 'open' || issue['closed_at']) {
          return true;
        }
        else if(issue['closed_at'] != null) {
          var date = new Date(issue['closed_at']);
          var difference = new Date().getTime() - date.getTime();

          // also return issue that have been closed in the last two hours
          if(difference < 7200) return true;
        }
      }
    }).map(function(issue) {
      return {
        title: issue['title'],
        description: issue['body']
      };
    });
  },

  /**
   * Retrieve repositories for the given project id.
   *
   * @param projectId
   * @param callback
   */
  getRepos: function(projectId, callback) {

    var _this = this;

    $.ajax({
      url: 'https://api.github.com/user/repos',
      type: "GET",
      contentType: "application/json",
      dataType: "json",
      headers: {
        "Authorization": _this.encodeAuthKey(_this.username, _this.password),
        "Accept": "application/json"
      },
      success: function(result) {

        if(!result || result.length == 0) {
          callback(Error(chrome.i18n.getMessage("status_github_repo")), null);
        }

        var reposForProjectId = _this.formatRepos(result, projectId);

        if(reposForProjectId.length == 0)
          callback(Error(chrome.i18n.getMessage("status_github_repo")), null);

        if(reposForProjectId.length > 1)
          console.warn('More than one repo available for the current project id.');

        callback(null, reposForProjectId);
      },
      error: function(err) {
        callback(err, null);
      }
    });
  },

  /**
   * Format repositories to fit the plugin's needs.
   *
   * @param repoList
   * @param projectId
   * @returns {*}
   */
  formatRepos: function(repoList, projectId) {

    return repoList.filter(function(repo) {
      if(repo['description'].indexOf('Pro-' + projectId) > -1)
        return true;
    }).map(function(repo) {
      return {
        name: repo['name'],
        description: repo['description']
      };
    });
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
  }
};
