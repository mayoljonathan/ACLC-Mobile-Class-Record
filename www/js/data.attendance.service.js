(function () {
	app.service('DataAttendanceService', function ($q, $rootScope) {
		var _attendanceData;
		this.getStatesCount = function (ecode, date) {
			return $q.when($rootScope._db.query(function (doc) {
				emit([doc.table, doc.ecode, doc.attendance_date])
			}, {
				key: ['tbl_attendanceData', ecode, date],
				include_docs: !0
			}).then(function (docs) {
				var states = [];
				var lecState = {
					stateP: 0,
					stateA: 0,
					stateL: 0,
					stateE: 0
				};
				var labState = {
					stateP: 0,
					stateA: 0,
					stateL: 0,
					stateE: 0
				};
				docs.rows.map(function (row) {
					if (row.doc.state == 0) {
						lecState.stateP++
					} else if (row.doc.state == 1) {
						lecState.stateA++
					} else if (row.doc.state == 2) {
						lecState.stateL++
					} else if (row.doc.state == 3) {
						lecState.stateE++
					}
					if (row.doc.state1 == 0) {
						labState.stateP++
					} else if (row.doc.state1 == 1) {
						labState.stateA++
					} else if (row.doc.state1 == 2) {
						labState.stateL++
					} else if (row.doc.state1 == 3) {
						labState.stateE++
					}
				});
				states.push({
					ecode, date, lecState, labState
				});
				return states
			}).catch(function (err) {}))
		}
		this.getState = function (ecode, student_no, attendance_date) {
			return $q.when($rootScope._db.query(function (doc) {
				emit([doc.table, doc.ecode, doc.student_no, doc.attendance_date])
			}, {
				key: ['tbl_attendanceData', ecode, student_no, attendance_date],
				include_docs: !0
			}).then(function (docs) {
				if (docs.rows.length != 0) {
					_attendanceData = docs.rows.map(function (row) {
						return {
							_id: row.doc._id,
							_rev: row.doc._rev,
							attendance_date: row.doc.attendance_date,
							ecode: row.doc.ecode,
							state: row.doc.state,
							state1: row.doc.state1,
							student_no: row.doc.student_no,
							table: row.doc.table
						}
					})
				} else {
					_attendanceData = !1
				}
				$rootScope._db.changes({
					live: !0,
					since: 'now',
					include_docs: !0
				}).on('change', onDatabaseChange);
				return _attendanceData
			}).catch(function (err) {}))
		}
		this.addAttendanceData = function (data) {
			return $q.when($rootScope._db.post(data))
		}
		this.updateAttendanceData = function (data) {
			return $q.when($rootScope._db.put(data))
		}
		this.deleteAttendanceData = function (data) {
			return $q.when($rootScope._db.query(function (doc) {
				emit([doc.table, doc.ecode, doc.attendance_date])
			}, {
				key: ['tbl_attendanceData', data.ecode, data.field],
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
		this.getAllAttendanceData = function (ecode) {
			return $q.when($rootScope._db.query(function (doc) {
				emit([doc.table, doc.ecode])
			}, {
				key: ['tbl_attendanceData', ecode],
				include_docs: !0
			}).then(function (docs) {
				_attendanceData = docs.rows.map(function (row) {
					return row.doc
				});
				$rootScope._db.changes({
					live: !0,
					since: 'now',
					include_docs: !0
				}).on('change', onDatabaseChange);
				return _attendanceData
			}).catch(function (err) {}))
		}

		function onDatabaseChange(change) {
			var index = findIndex(_attendanceData, change.id);
			var _attendance = _attendanceData[index];
			if (change.deleted) {
				if (_attendance) {
					_attendanceData.splice(index, 1)
				}
			} else {
				if (_attendance && _attendance._id === change.id) {
					_attendanceData[index] = change.doc
				} else {
					try {
						_attendanceData.splice(index, 0, change.doc)
					} catch (e) {}
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