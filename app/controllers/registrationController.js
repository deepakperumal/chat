(function() {
  angular
    .module("app")
    .controller("registrationController", MainController);

  MainController.$inject = ["$scope", "$firebaseAuth","$state","alertService"];

  function MainController($scope, $firebaseAuth, $state,alertService) {
    $scope.reg = {};
    $scope.submitForm = () => {
      var username = $scope.reg.email;
      var password = $scope.reg.password;

      if (username && password) {
        var auth = $firebaseAuth();
        auth
          .$createUserWithEmailAndPassword(username, password)
          .then(function() {
            alertService.sendAlert(
              "Registration successful",
              "User has been created",
              "green"
            );

            $state.go("login");
          })
          .catch(function(error) {
            alertService.sendAlert("Notice", error.message, "red");
            $scope.errMsg = true;
            $scope.errorMessage = error.message;
          });
      }

      else
      alertService.sendAlert("Notice",'Please fill the email and password', "red");

    };
  }
})();
