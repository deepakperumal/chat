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
      if (!username || !password) {
        alertService.sendAlert(
          "Notice",
          "Please fill the email and password",
          "red"
        );
        return;
      }

      const ref = firebase.storage().ref();
      const file = document.querySelector("#profile").files[0];

      if (!file) {
        alertService.sendAlert("Notice", "Please choose a file", "red");
        return;
      }

      const name = +new Date() + "-" + file.name;
      const metadata = {
        contentType: file.type
      };
      const task = ref.child(name).put(file, metadata);
      task
        .then(snapshot => snapshot.ref.getDownloadURL())
        .then(url => {
          var auth = $firebaseAuth();
          auth
            .$createUserWithEmailAndPassword(username, password)
            .then(function(data) {
              var ref = firebase.firestore();
              ref
                .collection("users")
                .doc(data.user.uid)
                .set({
                  name: $scope.reg.name,
                  email: $scope.reg.email,
                  dob: $scope.reg.dob,
                  user_id: data.user.uid,
                  url: url,
                  online: false,
                  contacts: []
                });

              alertService.sendAlert(
                "Registration successful",
                "User has been created",
                "green"
              );

              $state.go("login");
            })
            .catch((error)=> {
              alertService.sendAlert("Notice", error.message, "red");
              $scope.errMsg = true;
              $scope.errorMessage = error.message;
            });
        });
    };
  }
})();
