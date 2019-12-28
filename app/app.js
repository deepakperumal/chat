(function() {
  angular.module("app", ["ui.router","cp.ngConfirm","firebase"]).config(config);

  config.$inject = ["$stateProvider", "$httpProvider", "$locationProvider"];

  function config($stateProvider, $httpProvider, $locationProvider) {
    $locationProvider.html5Mode(false);

    $stateProvider
      .state("login", {
        url: "/",
        templateUrl: "views/templates/login.html",
        controller: "loginController"
      })
      .state("register", {
        url: "/register",
        templateUrl: "views/templates/registration.html",
        controller: "registrationController"
      })
      .state("chat", {
        url: "/chat",
        templateUrl: "views/templates/chat.html",
        controller: "chatController"
      });

    $httpProvider.interceptors.push("authInterceptor");
  }

  angular.module("app").factory("authInterceptor", authInterceptor);

  authInterceptor.$inject = ["$rootScope", "$q", "LocalStorage", "$location"];

  function authInterceptor($rootScope, $q, LocalStorage, $location) {
    return {
      request: function(config) {
        config.headers = config.headers || {};
        return config;
      },

      responseError: function(response) {
        if (response.status === 404) {
          $location.path("/");
          return $q.reject(response);
        } else {
          return $q.reject(response);
        }
      }
    };
  }

  angular.module("app").run(run);

  run.$inject = ["$rootScope", "$location"];

  function run($rootScope, $location) {

    var firebaseConfig = {
      apiKey: "AIzaSyBdKXoCtI3fULi0s7V0WtFRMzcm_wTl5J0",
      authDomain: "webapp-5d40f.firebaseapp.com",
      databaseURL: "https://webapp-5d40f.firebaseio.com",
      projectId: "webapp-5d40f",
      storageBucket: "webapp-5d40f.appspot.com",
      messagingSenderId: "963884867488",
      appId: "1:963884867488:web:4a46036404d8df4b6d4ec5",
      measurementId: "G-5NTNQ3T04E"
    };
    firebase.initializeApp(firebaseConfig);
    firebase.analytics();
    firebase.auth();
    firebase.database();


  }
})();
