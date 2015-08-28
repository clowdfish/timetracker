var helper = new Helper();

describe('Status field', function() {
  var status = document.getElementById('status');

  it('should exist in the DOM', function() {
    expect(status).to.not.equal(null);
  });

  it('should not show any message', function() {
    expect(status.innerText).to.equal('');
  });
});

describe('Helper class', function() {

  describe('Status field', function() {
    var status = document.getElementById('status');

    it('should trigger the status', function () {
      helper.renderStatus('Test', 'error');

      expect(status.innerText).to.equal('Test');
    });

    it('should add the proper class', function () {
      expect(status.classList.contains('error')).to.equal(true);
    });
  });

  describe('Waiting animation', function() {
    var spinner = document.getElementById('spinner');

    it('should trigger the animation', function () {
      helper.showWaitingAnimation();

      expect(spinner.style.display).to.equal('block');
    });

    it('should un-trigger the animation', function () {
      helper.hideWaitingAnimation();

      expect(spinner.style.display).to.equal('none');
    });
  });
});