(function () {
	app.service('ColumnAttendanceService', function ($q, $rootScope) {
		var _attendance;
		this.addAttendanceDate = function (attendance) {
			return $q.when($rootScope._db.post(attendance))
		}
		this.updateAttendanceDate = function (attendance) {
			return $q.when($rootScope._db.put(attendance))
		}
		this.deleteAttendanceDate = function (attendance) {
			return $q.when($rootScope._db.remove(attendance))
		}
		this.validateAttendanceDate = function (attendance) {
			var message = "";
			return $q.when($rootScope._db.query(function (doc) {
				emit([doc.table, doc.ecode, doc.field])
			}, {
				key: ['tbl_attendance', attendance.ecode, attendance.field],
				include_docs: !0
			}).then(function (docs) {
				if (docs.rows.length != 0) {
					return message = "The selected date exists in this subject. Please choose another date"
				} else {
					var notMatchCount = 0;
					for (var i = 0; i < attendance.class_days.length; i++) {
						if (attendance.attendance_day != attendance.class_days[i]) {
							notMatchCount++
						}
						if (notMatchCount == attendance.class_days.length) {
							return message = "The selected date didn't match the class days in your subject"
						}
						$rootScope._db.changes({
							live: !0,
							since: 'now',
							include_docs: !0
						}).on('change', onDatabaseChange)
					}
				}
			}).catch(function (err) {}))
		}
		this.getAllAttendanceDate = function (ecode, term) {
			return $q.when($rootScope._db.query(function (doc) {
				emit([doc.table, doc.ecode, doc.term])
			}, {
				key: ['tbl_attendance', ecode, term],
				include_docs: !0
			}).then(function (docs) {
				moment.createFromInputFallback = function (config) {
					config._d = new Date(config._i)
				};
				_attendance = docs.rows.map(function (row) {
					return row.doc
				});
				_attendance = _attendance.sort(function (left, right) {
					return moment.utc(left.field).diff(moment.utc(right.field))
				});
				$rootScope._db.changes({
					live: !0,
					since: 'now',
					include_docs: !0
				}).on('change', onDatabaseChange);
				return _attendance
			}).catch(function (err) {}))
		}

		function onDatabaseChange(change) {
			var index = findIndex(_attendance, change.id);
			var attendance = _attendance[index];
			if (change.deleted) {
				if (attendance) {
					_attendance.splice(index, 1)
				}
			} else {
				if (attendance && attendance._id === change.id) {
					_attendance[index] = change.doc
				} else {
					_attendance.splice(index, 0, change.doc)
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