(function () {
	app.service('StudentService', function ($q, $rootScope) {
		var _students;
		this.checkStudentNo = function (ecode, student_no) {
			return $q.when($rootScope._db.query(function (doc) {
				emit([doc.table, doc.ecode, doc.student_no])
			}, {
				key: ['tbl_student', ecode, student_no],
				include_docs: !0
			}).then(function (docs) {
				if (docs.rows.length != 0) {
					return !0
				} else {
					return !1
				}
			}).catch(function (err) {}))
		}
		this.addStudent = function (student) {
			return $q.when($rootScope._db.post(student))
		}
		this.updateStudent = function (student) {
			return $q.when($rootScope._db.put(student))
		}
		this.deleteDataOfStudent = function (ecode, student) {
			return $q.when($rootScope._db.query(function (doc) {
				emit([doc.table, doc.ecode, doc.student_no])
			}, {
				key: ['tbl_attendanceData', ecode, student.student_no],
				include_docs: !0
			}).then(function (docs) {
				if (docs.rows.length != 0) {
					docs.rows.forEach(function (row, i) {
						$rootScope._db.remove(row.doc)
					})
				}
				return $q.when($rootScope._db.remove(student))
			}).catch(function (err) {}))
		}
		this.getAllStudents = function (ecode) {
			return $q.when($rootScope._db.query(function (doc) {
				emit([doc.table, doc.ecode])
			}, {
				key: ['tbl_student', ecode],
				include_docs: !0
			}).then(function (docs) {
				_students = docs.rows.map(function (row) {
					return row.doc
				});
				$rootScope._db.changes({
					live: !0,
					since: 'now',
					include_docs: !0
				}).on('change', onDatabaseChange);
				return _students
			}).catch(function (err) {}))
		}

		function onDatabaseChange(change) {
			var index = findIndex(_students, change.id);
			var student = _students[index];
			if (change.deleted) {
				if (student) {
					_students.splice(index, 1)
				}
			} else {
				if (student && student._id === change.id) {
					_students[index] = change.doc
				} else {
					_students.splice(index, 0, change.doc)
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