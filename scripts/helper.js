
function Helper() {

}

Helper.prototype = {

  constructor: Helper,

  /**
   *
   */
  showWaitingAnimation: function() {

    var spinner = document.getElementById('spinner');
    spinner.style.display =  "block";
  },

  /**
   *
   */
  hideWaitingAnimation: function() {

    var spinner = document.getElementById('spinner');
    spinner.style.display =  "none";
  },

  /**
   * Render status to the popup.
   *
   * @param statusText
   * @param type
   * @param hide
   */
  renderStatus: function(statusText, type, hide) {
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
};