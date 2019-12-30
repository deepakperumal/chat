(function() {
  angular.module("app").controller("loginController", MainController);

  MainController.$inject = [
    "$scope",
    "$firebaseAuth",
    "$state",
    "alertService",
    "storageService"
  ];

  function MainController($scope, $firebaseAuth, $state, alertService,storageService) {
    $scope.user = {};
    $scope.signIn = () => {
      let email = $scope.user.email;
      let password = $scope.user.password;
      var auth = $firebaseAuth();
      if (email && password)
        auth
          .$signInWithEmailAndPassword(email, password)
          .then(function(data) {
            storageService.setItem("user_id", data.user.uid)
            $state.go("chat");
          })
          .catch(function(error) {
            alertService.sendAlert("Notice", error.message, "red");
          });
          else alertService.sendAlert("Notice", "Fields cannot be empty", "red");
    };
  }
})();
