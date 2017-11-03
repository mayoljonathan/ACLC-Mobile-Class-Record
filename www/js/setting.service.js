(function () {
	app.service('SettingService', function ($q, $rootScope) {
		var _password;
		this.addPassword = function (password) {
			return $q.when($rootScope._db.post(password))
		}
		this.updatePassword = function (password) {
			return $q.when($rootScope._db.put(password))
		}
		this.deletePassword = function (password) {
			return $q.when($rootScope._db.remove(password))
		}
		this.getPassword = function () {
			return $q.when($rootScope._db.query(function (doc) {
				emit(doc.table)
			}, {
				key: 'tbl_password',
				include_docs: !0
			}).then(function (docs) {
				_password = docs.rows.map(function (row) {
					return row.doc
				});
				$rootScope._db.changes({
					live: !0,
					since: 'now',
					include_docs: !0
				}).on('change', onDatabaseChange);
				return _password
			}).catch(function (err) {}))
		}

		function onDatabaseChange(change) {
			var index = findIndex(_password, change.id);
			var password = _password[index];
			if (change.deleted) {
				if (password) {
					_password.splice(index, 1)
				}
			} else {
				if (password && password._id === change.id) {
					_password[index] = change.doc
				} else {
					_password.splice(index, 0, change.doc)
				}
			}
		}

		function findIndex(array, id) {
			var low = 0,
				high = array.length,
				mid;
			while (low < high) {
				mid = (low + high) >>> 1;
				array[mid]._id < id ? low = mid + 1 : high = mid
			}
			return low
		}
	})
})()