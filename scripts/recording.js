// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 *
 *
 */
function editDate() {

  var dateDisplayElement = document.getElementById('date');
  var dateInputElement = document.getElementById('date-input');

  document.getElementById('date-change').style.display = "none";

  dateDisplayElement.style.display = "none";

  dateInputElement.value = dateDisplayElement.textContent;
  dateInputElement.style.display = "block";
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

// initialize page
document.addEventListener('DOMContentLoaded', function() {

  document.getElementById('date').textContent = createDateString(new Date());

  chrome.storage.sync.get({
    projectTitle: '',
    type: ''
  }, function(items) {
    document.getElementById('selected-project').textContent = items.projectTitle;

    if(items.type == 'item') {
      document.getElementById('work-item').style.display =  "block";
      document.getElementById('github').style.display =  "none";
    }
    else {
      document.getElementById('work-item').style.display =  "none";
      document.getElementById('github').style.display =  "block";
    }
  });
});

document.getElementById('date-change').addEventListener('click', editDate);

