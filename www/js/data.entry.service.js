(function () {
	app.service('DataEntryService', function ($q, $rootScope) {
		var _entryData;
		this.getAttendanceDataByTerm = function (ecode, term) {
			return $q.when($rootScope._db.query(function (doc) {
				emit([doc.table, doc.ecode, doc.term])
			}, {
				key: ['tbl_attendanceData', ecode, term],
				include_docs: !0
			}).then(function (docs) {
				_entryData = docs.rows.map(function (row) {
					return row.doc
				});
				return _entryData
			}).catch(function (err) {}))
		}
		this.getQuizDataByTerm = function (ecode, class_type) {
			return $q.when($rootScope._db.query(function (doc) {
				emit([doc.table, doc.ecode, doc.class_type])
			}, {
				key: ['tbl_quizData', ecode, class_type],
				include_docs: !0
			}).then(function (docs) {
				_entryData = docs.rows.map(function (row) {
					return row.doc
				});
				return _entryData
			}).catch(function (err) {}))
		}
		this.getQuizMaxScoreByTerm = function (ecode, class_type) {
			return $q.when($rootScope._db.query(function (doc) {
				emit([doc.table, doc.ecode, doc.class_type])
			}, {
				key: ['tbl_quiz', ecode, class_type],
				include_docs: !0
			}).then(function (docs) {
				_entryData = docs.rows.map(function (row) {
					return row.doc
				});
				return _entryData
			}).catch(function (err) {}))
		}
		this.getExamScore = function (ecode, class_type) {
			return $q.when($rootScope._db.query(function (doc) {
				emit([doc.table, doc.ecode, doc.class_type])
			}, {
				key: ['tbl_examData', ecode, class_type],
				include_docs: !0
			}).then(function (docs) {
				_entryData = docs.rows.map(function (row) {
					return row.doc
				});
				return _entryData
			}).catch(function (err) {}))
		}
		this.isUpdateExamScore = function (examData) {
			return $q.when($rootScope._db.query(function (doc) {
				emit([doc.table, doc.exam_name, doc.ecode, doc.student_no, doc.term, doc.class_type])
			}, {
				key: ['tbl_examData', examData.exam_name, examData.ecode, examData.student_no, examData.term, examData.class_type],
				include_docs: !0
			}).then(function (docs) {
				if (docs.rows.length != 0) {
					_entryData = docs.rows.map(function (row) {
						return row.doc
					})
				} else {
					_entryData = !1
				}
				$rootScope._db.changes({
					live: !0,
					since: 'now',
					include_docs: !0
				}).on('change', onDatabaseChange);
				return _entryData
			}).catch(function (err) {}))
		}
		this.addExamData = function (examData) {
			return $q.when($rootScope._db.post(examData))
		}
		this.updateExamData = function (examData) {
			return $q.when($rootScope._db.put(examData))
		}
		this.getCSScore = function (ecode, class_type) {
			return $q.when($rootScope._db.query(function (doc) {
				emit([doc.table, doc.ecode, doc.class_type])
			}, {
				key: ['tbl_CSData', ecode, class_type],
				include_docs: !0
			}).then(function (docs) {
				_entryData = docs.rows.map(function (row) {
					return row.doc
				});
				return _entryData
			}).catch(function (err) {}))
		}
		this.isUpdateCSScore = function (csData) {
			return $q.when($rootScope._db.query(function (doc) {
				emit([doc.table, doc.exam_name, doc.ecode, doc.student_no, doc.term, doc.class_type])
			}, {
				key: ['tbl_CSData', csData.exam_name, csData.ecode, csData.student_no, csData.term, csData.class_type],
				include_docs: !0
			}).then(function (docs) {
				if (docs.rows.length != 0) {
					_entryData = docs.rows.map(function (row) {
						return row.doc
					})
				} else {
					_entryData = !1
				}
				$rootScope._db.changes({
					live: !0,
					since: 'now',
					include_docs: !0
				}).on('change', onDatabaseChange);
				return _entryData
			}).catch(function (err) {}))
		}
		this.addCSData = function (csData) {
			return $q.when($rootScope._db.post(csData))
		}
		this.updateCSData = function (csData) {
			return $q.when($rootScope._db.put(csData))
		}
		this.getAllGradeStatus = function (ecode, class_type) {
			return $q.when($rootScope._db.query(function (doc) {
				emit([doc.table, doc.ecode, doc.class_type])
			}, {
				key: ['tbl_gradeStatusData', ecode, class_type],
				include_docs: !0
			}).then(function (docs) {
				_entryData = docs.rows.map(function (row) {
					return row.doc
				});
				$rootScope._db.changes({
					live: !0,
					since: 'now',
					include_docs: !0
				}).on('change', onDatabaseChange);
				return _entryData
			}).catch(function (err) {}))
		}
		this.addGradeStatusData = function (gradeStatusData) {
			return $q.when($rootScope._db.post(gradeStatusData))
		}
		this.updateGradeStatusData = function (gradeStatusData) {
			return $q.when($rootScope._db.put(gradeStatusData))
		}
		this.getGradeStatus = function (ecode, class_type, student_no) {
			return $q.when($rootScope._db.query(function (doc) {
				emit([doc.table, doc.ecode, doc.class_type, doc.student_no])
			}, {
				key: ['tbl_gradeStatusData', ecode, class_type, student_no],
				include_docs: !0
			}).then(function (docs) {
				if (docs.rows.length != 0) {
					_entryData = docs.rows.map(function (row) {
						return row.doc
					})
				} else {
					_entryData = !1
				}
				$rootScope._db.changes({
					live: !0,
					since: 'now',
					include_docs: !0
				}).on('change', onDatabaseChange);
				return _entryData
			}).catch(function (err) {}))
		}

		function onDatabaseChange(change) {
			var index = findIndex(_entryData, change.id);
			var _attendance = _entryData[index];
			if (change.deleted) {
				if (_attendance) {
					_entryData.splice(index, 1)
				}
			} else {
				if (_attendance && _attendance._id === change.id) {
					_entryData[index] = change.doc
				} else {
					_entryData.splice(index, 0, change.doc)
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