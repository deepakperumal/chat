(function() {
  angular.module("app").controller("registrationController", MainController);

  MainController.$inject = [
    "$scope",
    "$firebaseAuth",
    "$state",
    "alertService",
    "$firebaseArray"
  ];

  function MainController(
    $scope,
    $firebaseAuth,
    $state,
    alertService,
    $firebaseArray
  ) {
    $scope.reg = {};
    $scope.submitForm = () => {
      var username = $scope.reg.email;
      var password = $scope.reg.password;

      if (username && password) {
        var auth = $firebaseAuth();
        auth
          .$createUserWithEmailAndPassword(username, password)
          .then(function(data) {
            var ref = firebase
              .database()
              .ref()
              .child("users");
            $scope.posts = $firebaseArray(ref);
            $scope.posts.$add({
              name: $scope.reg.name,
              email: $scope.reg.email,
              dob: $scope.reg.dob,
              user_id:data.user.uid
            });

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
      } else
        alertService.sendAlert(
          "Notice",
          "Please fill the email and password",
          "red"
        );
    };
  }
})();
