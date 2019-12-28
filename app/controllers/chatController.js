(function() {
  angular.module("app").controller("chatController", MainController);

  MainController.$inject = [
    "$scope",
    "$firebaseArray"
  ];

  function MainController(
    $scope,
    $firebaseArray
  ) {
    $scope.post = "";
    var ref = firebase
      .database()
      .ref()
      .child("post");
    $scope.posts = $firebaseArray(ref);






    $scope.users = "";
    var ref = firebase
      .database()
      .ref()
      .child("users");
    $scope.users = $firebaseArray(ref);
  
    $scope.postData = () => {
      $scope.date = new Date();

      $scope.posts
        .$add({
          title: "firstUser",
          post: $scope.post,
          data: 12
        })
        .then(
          function(data) {},
          function(error) {}
        );
    };

    $scope.sendPost = event => {
      if (event.keyCode === 13) $scope.postData();
    };



    
      
    $scope.startContact = user_id=>{

          alert(user_id)


    }




  }
})();
