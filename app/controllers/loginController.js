(function() {
  angular.module("app").controller("loginController", MainController);

  MainController.$inject = [
    "$scope",
    "$firebaseAuth",
    "$state",
    "alertService",
    "storageService",
    "userService"
  ];

  function MainController(
    $scope,
    $firebaseAuth,
    $state,
    alertService,
    storageService,
    userService
  ) {
    $scope.user = {};
    if(storageService.getItem("user_id"))
    $state.go("chat");
    $scope.signIn = () => {
      let email = $scope.user.email;
      let password = $scope.user.password;
      var auth = $firebaseAuth();
      if (email && password)
        auth
          .$signInWithEmailAndPassword(email, password)
          .then((data)=> {
            storageService.setItem("user_id", data.user.uid);
            userService.userStatus(data.user.uid, true);
            $state.go("chat");
          })
          .catch((error)=> {
            alertService.sendAlert("Notice", error.message, "red");
          });
      else alertService.sendAlert("Notice", "Fields cannot be empty", "red");
    };
  }
})();
