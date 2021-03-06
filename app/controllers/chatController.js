(function() {
	angular.module('app').controller('chatController', MainController);

	MainController.$inject = [
		'$scope',
		'storageService',
		'$state',
		'userService',
		'alertService',
		'dateService',
	];

	function MainController($scope, storageService, $state, userService, alertService, dateService) {
		$scope.sender = storageService.getItem('userId');
		if (!$scope.sender) $state.go('login'); // Redirect if user not logged in
		var db = firebase.firestore(); // Fire-store  DB call
		$scope.receiver = '';

		/* Watch users data  */

		db.collection('users')
			.where('contacts', 'array-contains', $scope.sender)
			.orderBy('name')
			.onSnapshot(querySnapshot => {
				$scope.$apply(() => {
					$scope.users = [];
					querySnapshot.docs.map(doc => {
						if ($scope.selected === doc.data().user_id) {
							if ($scope.onlineStatus && !doc.data().online) {
								$scope.lastVisited = dateService.getTime();
								$scope.onlineStatus = false;
							} else {
								$scope.onlineStatus = true;
							}
						}
						$scope.users.push(doc.data());
					});
					lastReceivedMail();
				});
			});

		/* Watch Last Received */

		let lastReceivedMail = () => {
			$scope.count = {};
			db.collection('last_received')
				.doc($scope.sender)
				.onSnapshot(querySnapshot => {
					$scope.$apply(() => {
						$scope.lastReceived = [];
						for (d in querySnapshot.data()) {
							$scope.lastReceived[d] = querySnapshot.data()[d]['post'];
							$scope.count[d] = querySnapshot.data()[d]['count'];
						}
						$scope.users = $scope.users.map(x => {
							if (!$scope.lastReceived[x['user_id']]) $scope.lastReceived[x['user_id']] = '';
							x['received'] = $scope.lastReceived[x['user_id']];
							x['count'] = $scope.count[x['user_id']];
							return x;
						});

						$scope.users.sort(function(a, b) {
							return b.count - a.count;
						});

						if (!$scope.receiver) {
							$scope.receiver = $scope.users[0].user_id;
							$scope.selected = $scope.users[0].user_id;
							$scope.url = $scope.users[0].url;
							$scope.name = $scope.users[0].name;
						}
					});
				});
		};

		/* Watch post data  */

		$scope.$watch('receiver', () => {
			db.collection('posts')
				.orderBy('timestamp')
				.onSnapshot(querySnapshot => {
					$scope.$apply(() => {
						$scope.posts = [];
						querySnapshot.docs.map(doc => {
							if (
								(doc.data().sender == $scope.sender || doc.data().receiver == $scope.sender) &&
								(doc.data().sender == $scope.receiver || doc.data().receiver == $scope.receiver)
							)
								$scope.posts.push(doc.data());
						});
					});
					$scope.changeLimit();
				});
		});

		$scope.isSelected = section => {
			if ($scope.selected === section) {
				var postRef = db.collection('last_received').doc($scope.sender);
				var obj = {};
				obj[$scope.receiver] = {
					count: 0,
				};
				postRef.set(obj, { merge: true });
			}
			return $scope.selected === section;
		};

		$scope.postData = () => {
			let formatted_date = dateService.getTime();
			if ($scope.receiver && $scope.post.trim())
				db.collection('posts').add({
					sender: $scope.sender,
					receiver: $scope.receiver,
					post: $scope.post,
					timestamp: firebase.firestore.FieldValue.serverTimestamp(),
					currentDate: formatted_date,
					seen: 0,
				});

			var postRef = db.collection('last_received').doc($scope.receiver);
			let post = $scope.post;
			postRef.get().then(doc => {
				var obj = {};
				if (doc.data())
					for (d in doc.data()) {
						if (d == $scope.sender) {
							if (!doc.data()[d].count) doc.data()[d].count = 0;
							obj[$scope.sender] = {
								post: post,
								count: ++doc.data()[d].count,
							};
						}
					}
				else
					obj[$scope.sender] = {
						post: $scope.post,
						count: 1,
					};

				postRef.set(obj, { merge: true });
			});

			$scope.post = '';
		};

		/* Watch current users data  */

		db.collection('users')
			.where('user_id', '==', $scope.sender)
			.onSnapshot(querySnapshot => {
				$scope.$apply(() => {
					$scope.currentUser = [];
					querySnapshot.docs.map(doc => {
						$scope.currentUser.push(doc.data());
					});
				});
			});

		$scope.sendRequest = (receiver_id, requests) => {
			var postRef = db.collection('users').doc(receiver_id);
			var obj = {};
			let res = [];
			if (requests.length > 0)
				for (var i = 0; i < requests.length; i++) {
					if (requests[i].user_id === $scope.currentUser[0].user_id) {
						alertService.sendAlert('Notice', 'Request already sent', 'red');
						return;
					}
					res.push(requests[i]);
				}

			res.push($scope.currentUser[0]);
			obj['requests'] = res;
			postRef.set(obj, { merge: true });
			$scope.search = '';
			$scope.searchResult = [];
			alertService.sendAlert('Notice', 'Request has been sent ', 'green');
		};

		$scope.rejectRequest = user_id => {
			let requests = $scope.currentUser[0].requests.filter(x => {
				return x.user_id != user_id;
			});

			var postRef = db.collection('users').doc($scope.sender);
			var obj = {};

			obj['requests'] = requests;
			postRef.set(obj, { merge: true });

			//alertService.sendAlert('Notice', 'Request has been rejected ', 'purple');
		};

		$scope.sendPost = event => {
			if (event.keyCode === 13) {
				$scope.postData();
			}
		};

		$scope.startContact = (userId, name, url, received, contact, status) => {
			if (!status) {
				//alertService.sendAlert('Notice', 'User must be added to contact before chat ', 'red');
				return;
			}
			$scope.post = '';
			$scope.selected = userId;
			$scope.receiver = userId;
			$scope.url = url;
			$scope.lastVisited = contact;
			$scope.name = name;
			$scope.onlineStatus = received;
		};

		$scope.addContact = (userId, contact) => {
			$scope.search = '';
			$scope.searchResult = [];
			var postRef = db.collection('users').doc(userId);
			let obj = {};
			let temp = [];
			if (contact.length != 0) for (let i = 0; i < contact.length; i++) temp.push(contact[i]);
			temp.push($scope.sender);
			temp = [...new Set(temp)];
			obj['contacts'] = temp;
			postRef.set(obj, { merge: true });
			alertService.sendAlert('Notice', 'User has been added to contact', 'green');
		};

		$scope.signOut = () => {
			storageService.setItem('userId', '');
			userService.userStatus($scope.sender, false);
			$state.go('login');
		};

		let setResult = data => {
			$scope.searchResult = data;
			$scope.$apply(() => {
				$scope.searchResult = $scope.searchResult;
			});
		};

		$scope.acceptRequest = (user_id, contacts) => {
			$scope.rejectRequest(user_id);
			let temp = [];
			if (contacts.length > 0) for (var i = 0; i < contacts.length; i++) temp.push(contacts[i]);
			temp.push($scope.sender);

			var postRef = db.collection('users').doc(user_id);
			var obj = {};
			obj['contacts'] = temp;
			postRef.set(obj, { merge: true });

			let receiver = [];
			if ($scope.currentUser[0].contacts.length > 0)
				for (var i = 0; i < $scope.currentUser[0].contacts.length; i++)
					receiver.push($scope.currentUser[0].contacts[i]);
			receiver.push(user_id);

			var postRef = db.collection('users').doc($scope.sender);
			var obj = {};
			obj['contacts'] = receiver;
			postRef.set(obj, { merge: true });
			//console.log($scope.currentUser[0].contacts)
		};

		/*--------------------------------------------------------------------------------*/

		/* Scroll to bottom on new post */

		$scope.changeLimit = () => {
			setTimeout(() => {
				var elem = document.getElementById('conversation');
				elem.scrollTop = elem.scrollHeight;
			}, 200);
		};

		$scope.searchUser = event => {
			if (event.keyCode == 13) {
				var promise = new Promise((resolve, reject) => {
					var ref = db.collection('users').where('name', '==', $scope.search);
					ref.get().then(querySnapshot => {
						let temp = [];
						querySnapshot.docs.map(doc => {
							temp.push(doc.data());
						});
						resolve(temp);
					});
				});
				promise.then(data => {
					setResult(data);
				});
			}
		};
	}
})();
