(function() {
  angular.module("app").controller("loginController", MainController);

  MainController.$inject = [
    "$scope",
    "$firebaseAuth",
    "$state",
    "alertService"
  ];

  function MainController($scope, $firebaseAuth, $state, alertService) {
    $scope.user = {};

    $scope.signIn = () => {
      let email = $scope.user.email;
      let password = $scope.user.password;
      var auth = $firebaseAuth();
      if (email && password)
        auth
          .$signInWithEmailAndPassword(email, password)
          .then(function(data) {
            $state.go("chat");
            alertService.sendAlert(
              "Login Successful",
              "You are be redirected to chat section",
              "green"
            );
          })
          .catch(function(error) {
            alertService.sendAlert("Notice", error.message, "red");
          });
      else alertService.sendAlert("Notice", "Fields cannot be empty", "red");
    };
  }
})();
