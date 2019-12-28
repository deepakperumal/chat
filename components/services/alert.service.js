(function() {
  "use strict";

  angular.module("app").service("alertService", function($ngConfirm) {
    this.sendAlert = (title, context, color) => {
      $ngConfirm({
        title: "<h5>" + title + "</h5>",
        content: "<h6>" + context + "</h6>",
        type: color,
        typeAnimated: true,
        buttons: {
          close: function() {}
        }
      });
    };
  });
})();
