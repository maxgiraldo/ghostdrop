'use strict';

// Example on how to write a directive in yo angular-fullstack
app.directive('markRead', function() {
  return function(scope, element) {
    element.bind('click', function() {
      if (element.hasClass('read')) {
        element.removeClass('read');
      } else {
        element.addClass('read');
      }
    });

  };
});
