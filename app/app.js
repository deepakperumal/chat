(function() {
  angular
    .module("app", ["ui.router", "cp.ngConfirm", "firebase"])
    .config(config);

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

  authInterceptor.$inject = ["$q", "$location"];

  function authInterceptor($q, $location) {
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
      apiKey: "AIzaSyD_C2M20G73VS7L6jg5gU0dQdhv-feU_1M",
    authDomain: "chat-dadb8.firebaseapp.com",
    databaseURL: "https://chat-dadb8.firebaseio.com",
    projectId: "chat-dadb8",
    storageBucket: "chat-dadb8.appspot.com",
    messagingSenderId: "64594912113",
    appId: "1:64594912113:web:f34839b85e5386cf99ccd0",
    measurementId: "G-G80GP7QGE1"
    };
    firebase.initializeApp(firebaseConfig);
    firebase.analytics();
    firebase.auth();
    firebase.database();
    firebase.firestore();
    firebase.storage();
  }
})();
