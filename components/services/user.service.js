(function() {
  "use strict";

  angular.module("app").service("userService", [
    function() {
      this.userStatus = (user_id, value) => {
        const db = firebase.firestore();
        const usersRef = db.collection("users");
        usersRef.doc(user_id).set(
          {
            online: value
          },
          { merge: true }
        );
      };
    }
  ]);
})();
