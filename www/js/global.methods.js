(function () {
	app.service('GlobalService', function ($mdToast) {
		this.ucwords = function (str) {
			return str.replace(/\w\S*/g, function (txt) {
				return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
			})
		}
		this.toStandardTime = function (time) {
			var hour, min;
			time = time.split(":");
			hour = time[0];
			min = time[1];
			if (min == 0) {
				min = "00"
			}
			if (hour < 12) {
				if (hour == 0) {
					hour = 12
				}
				time = hour + ":" + min + " AM"
			} else if (hour == 12 && min == 0) {
				time = hour + ":" + min + " NN"
			} else {
				if (hour != 12) {
					hour -= 12
				}
				time = hour + ":" + min + " PM"
			}
			return time
		}
		this.toTimeObject = function (time) {
			var new_time = [];
			if (time.length == 7) {
				hour = time.slice(0, 1);
				minute = time.slice(2, 4)
			} else if (time.length == 8) {
				hour = time.slice(0, 2);
				minute = time.slice(3, 5)
			}
			meridian = time.slice(-2);
			new_time.hour = hour;
			new_time.minute = minute;
			new_time.meridian = meridian;
			return new_time
		}
		this.toMilitaryTime_Home = function (hours, minutes, meridian) {
			hours = parseInt(hours);
			minutes = parseInt(minutes);
			if (meridian == "PM" && hours < 12) hours = hours + 12;
			if (meridian == "AM" && hours == 12) hours = hours - 12;
			var sHours = hours.toString();
			var sMinutes = minutes.toString();
			if (hours < 10) sHours = "0" + sHours;
			if (minutes < 10) sMinutes = "0" + sMinutes;
			var nextClass = [];
			nextClass.hour = sHours;
			nextClass.minute = sMinutes;
			return nextClass
		}
		this.toMilitaryTime = function (time) {
			var hour, minute, meridiem;
			meridiem = time.trim().slice(-2);
			time = time.replace(/(AM|PM|NN)/, '');
			time = time.split(":");
			hour = parseInt(time[0]);
			minute = parseInt(time[1]);
			if (minute == 0) {
				minute = "00"
			}
			if (meridiem == "PM") {
				if (hour != 12) {
					hour += 12
				}
			}
			return hour + ":" + minute
		}
		this.standardToDecimalTime = function (time) {
			var hour, minute, meridiem;
			meridiem = time.trim().slice(-2);
			time = time.replace(/(AM|PM|NN)/, '');
			time = time.split(":");
			hour = parseFloat(time[0]);
			minute = parseFloat(time[1]);
			if (meridiem == "PM") {
				hour += 12
			}
			if (minute == 30) {
				minute = 0.5
			}
			return (+hour) + (+minute)
		}
		this.toDay = function (number) {
			var day;
			if (number == 1) {
				day = "Mon"
			} else if (number == 2) {
				day = "Tue"
			} else if (number == 3) {
				day = "Wed"
			} else if (number == 4) {
				day = "Thu"
			} else if (number == 5) {
				day = "Fri"
			} else if (number == 6) {
				day = "Sat"
			} else {
				day = "Sun"
			}
			return day
		}
		this.toState = function (state) {
			if (state == 0) {
				return "<ng-md-icon icon=\"check\" style=\"fill:green\"></ng-md-icon>"
			} else if (state == 1) {
				return "<ng-md-icon icon=\"close\" style=\"fill:red\"></ng-md-icon>"
			} else if (state == 2) {
				return "<ng-md-icon icon=\"access_time\" style=\"fill:orange\"></ng-md-icon>"
			} else if (state == 3) {
				return "<ng-md-icon icon=\"directions_walk\" style=\"fill:gray\"></ng-md-icon>"
			} else {
				return ""
			}
		}
		this.toCompleteDay = function (date) {
			return moment(date).format("dddd")
		}
		this.toFullName = function (last, first, mi) {
			var fullname = last + ", " + first + " " + mi + ".";
			return fullname = fullname.toUpperCase()
		}
		this.showToast = function (content, milliseconds) {
			$mdToast.show($mdToast.simple().textContent(content).hideDelay(milliseconds))
		}
	});
	app.animation('.animate-fade', function () {
		return {
			enter: function (element, done) {
				$(element).hide().fadeIn(400, done)
			},
			leave: function (element, done) {
				$(element).hide().fadeOut(400, done)
			}
		}
	});
	app.filter('toFullExamName', function () {
		return function (term) {
			if (term == 'PEX') {
				term = "Prelim"
			} else if (term == 'MEX') {
				term = "Midterm"
			} else if (term == 'PFEX') {
				term = 'Pre-Final'
			} else if (term == 'FEX') {
				term = 'Final'
			}
			return term + " Exam"
		}
	})
	app.filter('toFullCSName', function () {
		return function (term) {
			if (term == 'PCS') {
				term = "Prelim"
			} else if (term == 'MCS') {
				term = "Midterm"
			} else if (term == 'PFCS') {
				term = 'Pre-Final'
			} else if (term == 'FCS') {
				term = 'Final'
			}
			return term + " Class Standing"
		}
	})
	app.filter('toCompleteDay', function () {
		return function (date) {
			return moment(date).format("dddd")
		}
	})
	app.filter('toShowOption', function () {
		return function (recordType) {
			if (recordType == undefined) {
				return !0
			} else if (recordType == 1) {} else if (recordType == 2) {}
		}
	});
	app.filter('toFullGradeSheet', function () {
		return function (gradesheet) {
			if (gradesheet == 0) {
				return 'Lecture'
			} else if (gradesheet == 1) {
				return 'Laboratory'
			} else {
				return 'Lec & Lab'
			}
		}
	})
	app.filter('capitalize', function () {
		return function (input) {
			if (input != null) input = input.toLowerCase().split(' ');
			for (var i = 0; i < input.length; i++) {
				input[i] = input[i].charAt(0).toUpperCase() + input[i].substring(1)
			}
			return input.join(' ')
		}
	});
	app.directive('validNumber', function () {
		return {
			require: '?ngModel',
			link: function (scope, element, attrs, ngModelCtrl) {
				if (!ngModelCtrl) {
					return
				}
				element.bind('keypress', function (event) {
					if (event.keyCode === 32 || event.keyCode === 45 || event.keyCode === 189) {
						event.preventDefault()
					}
				})
			}
		}
	})
}())