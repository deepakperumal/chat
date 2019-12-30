(function() {
  "use strict";

  angular
  .module('app').service("storageService", [
    function() {
      this.setItem = (key, value) => {
        localStorage.setItem(key, value);
      };

      this.getItem = key => {
        return localStorage.getItem(key);
      };
    }
  ]);
})();
