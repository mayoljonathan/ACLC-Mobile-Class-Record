(function () {
	app.service('ColumnQuizService', function ($q, $rootScope) {
		var _quiz;
		this.addQuizColumn = function (quiz) {
			return $q.when($rootScope._db.post(quiz))
		}
		this.updateQuizColumn = function (quiz) {
			return $q.when($rootScope._db.put(quiz))
		}
		this.deleteQuizColumn = function (quiz) {
			return $q.when($rootScope._db.remove(quiz))
		}
		this.validateQuizColumnName = function (quiz) {
			var message = "";
			var type;
			return $q.when($rootScope._db.query(function (doc) {
				emit([doc.table, doc.term, doc.ecode, doc.class_type, doc.field])
			}, {
				key: ['tbl_quiz', quiz.term, quiz.ecode, quiz.class_type, quiz.field],
				include_docs: !0
			}).then(function (docs) {
				if (docs.rows.length != 0) {
					if (!quiz.class_type) {
						type = "lecture."
					} else {
						type = "laboratory."
					}
					return message = "Existing column name found in the same term in " + type
				} else {
					return !1
				}
				$rootScope._db.changes({
					live: !0,
					since: 'now',
					include_docs: !0
				}).on('change', onDatabaseChange)
			}).catch(function (err) {}))
		}
		this.getAllQuiz = function (ecode, class_type, term) {
			return $q.when($rootScope._db.query(function (doc) {
				emit([doc.table, doc.ecode, doc.class_type, doc.term])
			}, {
				key: ['tbl_quiz', ecode, class_type, term],
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
			var quiz = _quiz[index];
			if (change.deleted) {
				if (quiz) {
					_quiz.splice(index, 1)
				}
			} else {
				if (quiz && quiz._id === change.id) {
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