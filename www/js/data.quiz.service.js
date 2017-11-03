(function () {
	app.service('DataQuizService', function ($q, $rootScope) {
		var _quiz;
		this.addQuizData = function (quizData) {
			return $q.when($rootScope._db.post(quizData))
		}
		this.updateQuizData = function (quizData) {
			return $q.when($rootScope._db.put(quizData))
		}
		this.deleteQuizData = function (quizData) {
			return $q.when($rootScope._db.query(function (doc) {
				emit([doc.table, doc.ecode, doc.column_name, doc.class_type])
			}, {
				key: ['tbl_quizData', quizData.ecode, quizData.name, quizData.class_type],
				include_docs: !0
			}).then(function (docs) {
				if (docs.rows.length != 0) {
					docs.rows.forEach(function (row, i) {
						$q.when($rootScope._db.remove(row.doc))
					})
				}
				return !0
			}).catch(function (err) {}))
		}
		this.isUpdate = function (quizData) {
			return $q.when($rootScope._db.query(function (doc) {
				emit([doc.table, doc.column_name, doc.ecode, doc.student_no, doc.term, doc.class_type])
			}, {
				key: ['tbl_quizData', quizData.column_name, quizData.ecode, quizData.student_no, quizData.term, quizData.class_type],
				include_docs: !0
			}).then(function (docs) {
				if (docs.rows.length != 0) {
					_quiz = docs.rows.map(function (row) {
						return row.doc
					})
				} else {
					_quiz = !1
				}
				$rootScope._db.changes({
					live: !0,
					since: 'now',
					include_docs: !0
				}).on('change', onDatabaseChange);
				return _quiz
			}).catch(function (err) {}))
		}
		this.getAllQuizData = function (ecode) {
			return $q.when($rootScope._db.query(function (doc) {
				emit([doc.table, doc.ecode])
			}, {
				key: ['tbl_quizData', ecode],
				include_docs: !0
			}).then(function (docs) {
				_quiz = docs.rows.map(function (row) {
					return row.doc
				});
				$rootScope._db.changes({
					live: !0,
					since: 'now',
					include_docs: !0
				}).on('change', onDatabaseChange);
				return _quiz
			}).catch(function (err) {}))
		}

		function onDatabaseChange(change) {
			var index = findIndex(_quiz, change.id);
			var attendance = _quiz[index];
			if (change.deleted) {
				if (attendance) {
					_quiz.splice(index, 1)
				}
			} else {
				if (attendance && attendance._id === change.id) {
					_quiz[index] = change.doc
				} else {
					_quiz.splice(index, 0, change.doc)
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