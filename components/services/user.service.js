(function() {
	'use strict';

	angular.module('app').service('userService', [
		'dateService',
		function(dateService) {
			this.userStatus = (user_id, value) => {
				const db = firebase.firestore();
				const usersRef = db.collection('users');
				usersRef.doc(user_id).set(
					{
						online: value,
						last_seen: dateService.getTime(),
					},
					{ merge: true }
				);
			};
		},
	]);

	angular.module('app').service('dateService', [
		function() {
			this.getTime = () => {
				let dt = new Date();
				return `${(dt.getMonth() + 1).toString().padStart(2, '0')}/${dt
					.getDate()
					.toString()
					.padStart(2, '0')}/${dt
					.getFullYear()
					.toString()
					.padStart(4, '0')} ${dt
					.getHours()
					.toString()
					.padStart(2, '0')}:${dt
					.getMinutes()
					.toString()
					.padStart(2, '0')}:${dt
					.getSeconds()
					.toString()
					.padStart(2, '0')}`;
			};
		},
	]);
})();
