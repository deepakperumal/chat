(function() {
  angular.module("app").controller("chatController", MainController);

  MainController.$inject = ["$scope", "storageService"];

  function MainController($scope, storageService) {
    $scope.sender = storageService.getItem("user_id");
    var db = firebase.firestore();
    $scope.receiver = "";
    /* Watch users data  */

    db.collection("users").onSnapshot(function(querySnapshot) {
      $scope.users = [];
      querySnapshot.forEach(function(doc) {
        $scope.users.push(doc.data());
      });
      $scope.$apply(function() {
        $scope.users = $scope.users;
      });
    });

    /* Watch post data  */

    $scope.$watch("receiver", function() {
      db.collection("posts")
        .where("sender", "in", [$scope.sender, $scope.receiver])
        .orderBy("timestamp")
        .onSnapshot(function(querySnapshot) {
          $scope.posts = [];
          querySnapshot.forEach(function(doc) {
            if (
              doc.data().sender == $scope.sender &&
              doc.data().receiver != $scope.receiver
            )
              $scope.posts.push({});
            else $scope.posts.push(doc.data());
          });
          $scope.$apply(function() {
            $scope.posts = $scope.posts;
          });

          setTimeout(function() {
            var elem = document.getElementById("conversation");
            elem.scrollTop = elem.scrollHeight;
          }, 200);
        });
    });

    $scope.postData = () => {
      if ($scope.receiver && $scope.post.trim())
        db.collection("posts").add({
          sender: $scope.sender,
          receiver: $scope.receiver,
          post: $scope.post,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
      $scope.post = "";
    };

    $scope.sendPost = event => {
      if (event.keyCode === 13) $scope.postData();
    };

    $scope.startContact = user_id => {
      $scope.receiver = user_id;
    };
  }
})();