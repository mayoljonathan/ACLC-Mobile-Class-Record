(function () {
	app.service('SubjectService', function ($q, $rootScope, StudentService) {
		var _subjects;
		this.checkEcode = function (ecode) {
			return $q.when($rootScope._db.query(function (doc) {
				emit([doc.table, doc.ecode])
			}, {
				key: ['tbl_subject', ecode],
				include_docs: !0
			}).then(function (docs) {
				if (docs.rows.length != 0) {
					return !0
				} else {
					return !1
				}
			}).catch(function (err) {}))
		}
		this.addSubject = function (subject) {
			return $q.when($rootScope._db.post(subject))
		}
		this.updateSubject = function (subject) {
			return $q.when($rootScope._db.put(subject))
		}
		this.deleteSubject = function (subject) {
			return $q.when($rootScope._db.remove(subject))
		}
		this.getSelectedSubject = function (ecode) {
			return $q.when($rootScope._db.query(function (doc) {
				emit([doc.table, doc.ecode])
			}, {
				key: ['tbl_subject', ecode],
				include_docs: !0
			}).then(function (docs) {
				_selectedSubject = docs.rows.map(function (row) {
					return row.doc.day
				});
				$rootScope._db.changes({
					live: !0,
					since: 'now',
					include_docs: !0
				}).on('change', onDatabaseChange);
				return _selectedSubject
			}).catch(function (err) {}))
		}
		this.changeEcodeOfStudents = function (new_ecode, old_ecode) {
			return $q.when($rootScope._db.query(function (doc, emit) {
				emit([doc.table, doc.ecode])
			}, {
				key: ['tbl_student', old_ecode],
				include_docs: !0
			}).then(function (docs) {
				var _students;
				_students = docs.rows.map(function (row) {
					row.doc.ecode = new_ecode;
					StudentService.updateStudent(row.doc)
				});
				$rootScope._db.changes({
					live: !0,
					since: 'now',
					include_docs: !0
				}).on('change', onDatabaseChange);
				return !0
			}).catch(function (err) {}))
		}
		this.getAllSubjects = function () {
			return $q.when($rootScope._db.query(function (doc, emit) {
				emit(doc.table)
			}, {
				key: 'tbl_subject',
				include_docs: !0
			}).then(function (docs) {
				_subjects = docs.rows.map(function (row) {
					return row.doc
				});
				$rootScope._db.changes({
					live: !0,
					since: 'now',
					include_docs: !0
				}).on('change', onDatabaseChange);
				return _subjects
			}).catch(function (err) {}))
		}
		this.getClasses = function (today, tomorrow) {
			return $q.when($rootScope._db.query(function (doc, emit) {
				emit(doc.table)
			}, {
				key: 'tbl_subject',
				include_docs: !0
			}).then(function (docs) {
				var validSubjects = {};
				validSubjects.today = [];
				validSubjects.tomorrow = [];
				_subjects = docs.rows.map(function (row) {
					for (var x = 0; x < row.doc.day.length; x++) {
						if (row.doc.day[x] == today) {
							validSubjects.today.push(row.doc)
						} else if (row.doc.day[x] == tomorrow) {
							validSubjects.tomorrow.push(row.doc)
						}
					}
				});
				$rootScope._db.changes({
					live: !0,
					since: 'now',
					include_docs: !0
				}).on('change', onDatabaseChange);
				return validSubjects
			}).catch(function (err) {}))
		}

		function onDatabaseChange(change) {
			var index = findIndex(_subjects, change.id);
			var subject = _subjects[index];
			if (change.deleted) {
				if (subject) {
					_subjects.splice(index, 1)
				}
			} else {
				if (subject && subject._id === change.id) {
					_subjects[index] = change.doc
				} else {
					_subjects.splice(index, 0, change.doc)
				}
			}
		}

		function findIndex(array, id) {
			try {
				var low = 0,
					high = array.length,
					mid;
				while (low < high) {
					mid = (low + high) >>> 1;
					array[mid]._id < id ? low = mid + 1 : high = mid
				}
				return low
			} catch (e) {}
		}
	})
})()