(function() {
  angular.module("app").controller("chatController", MainController);

  MainController.$inject = [
    "$scope",
    "storageService",
    "$state",
    "userService",
    "alertService"
  ];

  function MainController(
    $scope,
    storageService,
    $state,
    userService,
    alertService
  ) {
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
      .where("contacts", "array-contains", $scope.sender)
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

            $scope.count[d] = querySnapshot.data()[d]["count"];
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
      if ($scope.selected === section) {
        var postRef = db.collection("last_received").doc($scope.sender);
        var obj = {};

        obj[$scope.receiver] = {
          post: "",
          count: 0
        };

        postRef.set(obj, { merge: true });
      }
      return $scope.selected === section;
    };

    $scope.postData = () => {
      let formatted_date = userService.getTime();
      if ($scope.receiver && $scope.post.trim())
        db.collection("posts").add({
          sender: $scope.sender,
          receiver: $scope.receiver,
          post: $scope.post,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          currentDate: formatted_date,
          seen: 0
        });

      var postRef = db.collection("last_received").doc($scope.receiver);
      let post = $scope.post;
      postRef.get().then(function(doc) {
        var obj = {};
        if (doc.data())
          for (d in doc.data()) {
            if (d == $scope.sender) {
              if (!doc.data()[d].count) doc.data()[d].count = 0;
              obj[$scope.sender] = {
                post: post,
                count: ++doc.data()[d].count
              };
            }
          }
        else
          obj[$scope.sender] = {
            post: $scope.post,
            count: 1
          };

        postRef.set(obj, { merge: true });
      });

      $scope.post = "";
    };

    $scope.sendPost = event => {
      if (event.keyCode === 13) $scope.postData();
    };

    $scope.startContact = (user_id, name, url, received) => {
      $scope.selected = user_id;
      $scope.receiver = user_id;
      $scope.url = url;
      $scope.name = name;
    };

    $scope.addContact = (user_id, contact) => {
      $scope.search = "";
      $scope.searchResult = [];
      var postRef = db.collection("users").doc(user_id);
      let obj = {};
      let temp = [];
      if (contact.length != 0)
        for (let i = 0; i < contact.length; i++) temp.push(contact[i]);
      temp.push($scope.sender);
      temp = [...new Set(temp)];
      obj["contacts"] = temp;
      postRef.set(obj, { merge: true });
      alertService.sendAlert(
        "Notice",
        "User has been added to contact",
        "green"
      );
    };

    $scope.signOut = () => {
      storageService.setItem("user_id", "");
      userService.userStatus($scope.sender, false);
      $state.go("login");
    };

    let setResult = data => {
      $scope.searchResult = data;
      $scope.$apply(function() {
        $scope.searchResult = $scope.searchResult;
      });
    };

    $scope.searchUser = event => {
      if (event.keyCode == 13) {
        var promise = new Promise(function(resolve, reject) {
          db.collection("users")
            .where("name", "==", $scope.search)
            .get()
            .then(function(querySnapshot) {
              let temp = [];
              querySnapshot.forEach(function(doc) {
                temp.push(doc.data());
              });
              resolve(temp);
            });
        });
        promise.then(function(data) {
          setResult(data);
        });
      }
    };
  }
})();
