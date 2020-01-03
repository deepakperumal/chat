(function() {
  angular.module("app").controller("chatController", MainController);

  MainController.$inject = [
    "$scope",
    "storageService",
    "$state",
    "userService"
  ];

  function MainController($scope, storageService, $state, userService) {
    $scope.sender = storageService.getItem("user_id");
    if (!$scope.sender) $state.go("login");
    var db = firebase.firestore();
    $scope.receiver = "";
    $scope.changeLimit = () => {
      setTimeout(function() {
        var elem = document.getElementById("conversation");
        elem.scrollTop = elem.scrollHeight;
      }, 200);
    };

    /* Watch users data  */

    db.collection("users")
      .orderBy("name")
      .onSnapshot(function(querySnapshot) {
        $scope.users = [];
        querySnapshot.forEach(function(doc) {
          $scope.users.push(doc.data());
        });
        $scope.$apply(function() {
          $scope.users = $scope.users;
          last_received_mail();
        });
      });

    /* Watch Last Received */
    let last_received_mail = () => {
      $scope.count = {};
      db.collection("last_received")
        .doc($scope.sender)
        .onSnapshot(function(querySnapshot) {
          $scope.last_received = [];

          for (d in querySnapshot.data()) {
            $scope.last_received[d] = querySnapshot.data()[d]["post"];
            if (!querySnapshot.data()[d]["count"]) $scope.count[d] = 0;
            else $scope.count[d] = querySnapshot.data()[d]["count"];
          }
          $scope.users = $scope.users.map(x => {
            if (!$scope.last_received[x["user_id"]])
              $scope.last_received[x["user_id"]] = "";
             x["received"] = $scope.last_received[x["user_id"]];
             x["count"] = $scope.count[x["user_id"]];
            return x;
          });

          $scope.$apply(function() {
            $scope.users = $scope.users;
          });
        });
    };

    /* Watch post data  */

    $scope.$watch("receiver", function() {
      db.collection("posts")
        .orderBy("timestamp")
        .onSnapshot(function(querySnapshot) {
          $scope.posts = [];
          querySnapshot.forEach(function(doc) {
            if (
              (doc.data().sender == $scope.sender ||
                doc.data().receiver == $scope.sender) &&
              (doc.data().sender == $scope.receiver ||
                doc.data().receiver == $scope.receiver)
            )
              $scope.posts.push(doc.data());
          });
          $scope.$apply(function() {
            $scope.posts = $scope.posts;
          });
          $scope.changeLimit();
        });
    });

    $scope.isSelected = function(section) {
      return $scope.selected === section;
    };

    $scope.postData = () => {
      let dt = new Date();
      let formatted_date = `${(dt.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${dt
        .getDate()
        .toString()
        .padStart(2, "0")}/${dt
        .getFullYear()
        .toString()
        .padStart(4, "0")} ${dt
        .getHours()
        .toString()
        .padStart(2, "0")}:${dt
        .getMinutes()
        .toString()
        .padStart(2, "0")}:${dt
        .getSeconds()
        .toString()
        .padStart(2, "0")}`;

      if ($scope.receiver && $scope.post.trim())
        db.collection("posts").add({
          sender: $scope.sender,
          receiver: $scope.receiver,
          post: $scope.post,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          currentDate: formatted_date,
          seen: 0
        });
      console.log($scope.count);
      var postRef = db.collection("last_received").doc($scope.receiver);
      var obj = {};
      obj[$scope.sender] = {
        post: $scope.post,
        count: ++$scope.count[$scope.receiver]
      };

      postRef.set(obj, { merge: true });

      $scope.post = "";
    };

    $scope.sendPost = event => {
      if (event.keyCode === 13) $scope.postData();
    };

    $scope.startContact = (user_id, name, url) => {
      $scope.selected = user_id;
      $scope.receiver = user_id;
      $scope.url = url;
      $scope.name = name;
    };

    $scope.signOut = () => {
      storageService.setItem("user_id", "");
      userService.userStatus($scope.sender, false);
      $state.go("login");
    };
  }
})();
