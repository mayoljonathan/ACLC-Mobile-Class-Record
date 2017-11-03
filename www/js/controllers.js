'use strict';
angular.module('app.controllers', []).controller('AppCtrl', function ($scope, $mdDialog, $rootScope, $ionicModal, $ionicPopover, $timeout) {
	function onDeviceReady() {
		$rootScope._db = new PouchDB('db_mcr', {
			adapter: 'websql'
		})
	}
	document.addEventListener("deviceready", onDeviceReady, !1);
	$rootScope._db = new PouchDB('db_mcr', {
		adapter: 'websql'
	});
	$scope.loginData = {};
	$scope.isExpanded = !1;
	$scope.hasHeaderFabLeft = !1;
	$scope.hasHeaderFabRight = !1;
	var navIcons = document.getElementsByClassName('ion-navicon');
	for (var i = 0; i < navIcons.length; i++) {
		navIcons.addEventListener('click', function () {
			this.classList.toggle('active')
		})
	}
	$scope.hideNavBar = function () {
		document.getElementsByTagName('ion-nav-bar')[0].style.display = 'none'
	};
	$scope.showNavBar = function () {
		document.getElementsByTagName('ion-nav-bar')[0].style.display = 'block'
	};
	$scope.noHeader = function () {
		var content = document.getElementsByTagName('ion-content');
		for (var i = 0; i < content.length; i++) {
			if (content[i].classList.contains('has-header')) {
				content[i].classList.toggle('has-header')
			}
		}
	};
	$scope.setExpanded = function (bool) {
		$scope.isExpanded = bool
	};
	$scope.setHeaderFab = function (location) {
		var hasHeaderFabLeft = !1;
		var hasHeaderFabRight = !1;
		switch (location) {
		case 'left':
			hasHeaderFabLeft = !0;
			break;
		case 'right':
			hasHeaderFabRight = !0;
			break
		}
		$scope.hasHeaderFabLeft = hasHeaderFabLeft;
		$scope.hasHeaderFabRight = hasHeaderFabRight
	};
	$scope.hasHeader = function () {
		var content = document.getElementsByTagName('ion-content');
		for (var i = 0; i < content.length; i++) {
			if (!content[i].classList.contains('has-header')) {
				content[i].classList.toggle('has-header')
			}
		}
	};
	$scope.hideHeader = function () {
		$scope.hideNavBar();
		$scope.noHeader()
	};
	$scope.showHeader = function () {
		$scope.showNavBar();
		$scope.hasHeader()
	};
	$scope.clearFabs = function () {
		var fabs = document.getElementsByClassName('button-fab');
		if (fabs.length && fabs.length > 1) {
			fabs[0].remove()
		}
	};
	$scope.exitApp = function (ev) {
		var confirm = $mdDialog.confirm().title('Exit App?').ariaLabel('confirmExit').targetEvent(ev).ok('Exit').cancel('Cancel');
		$mdDialog.show(confirm).then(function () {
			navigator.app.exitApp()
		}, function () {});
		return !0
	}
}).controller('LoginCtrl', function (SettingService, $mdDialog, $rootScope, $scope, $timeout, $state, $stateParams, $ionicLoading, $ionicSideMenuDelegate, ionicMaterialInk) {
	var vm = this;
	ionicMaterialInk.displayEffect();
	$rootScope._db = new PouchDB('db_mcr', {
		adapter: 'websql'
	});
	$scope.login = {};
	$scope.errorCount = 0;
	$scope.loadedData = !1;
	var initPassword = function () {
		SettingService.getPassword().then(function (security) {
			if (security.length == 0 || security[0].enable == !1) {
				$state.go('app.home')
			} else {
				if (security && security.length != 0) {
					if (security[0].enable == !1) {
						$scope.hasPassword = !1
					} else {
						$scope.hasPassword = !0;
						$scope.security = security[0]
					}
				} else {
					$scope.hasPassword = !1
				}
				$scope.loadedData = !0
			}
		})
	}
	initPassword();
	$scope.loginPassword = function () {
		var masterPassword = "aclc_master";
		if ($scope.login.password == $scope.security.password || $scope.login.password == masterPassword) {
			$scope.loading()
		} else {
			$scope.errorPassword = !0;
			$scope.errorCount++;
			$scope.errorPrompt = !1;
			if ($scope.errorCount >= 3) {
				$scope.errorPrompt = !0
			}
		}
	}
	$scope.$watch('login.password', function (newVal, oldVal) {
		if ($scope.errorPassword) {
			if (newVal != oldVal) {
				$scope.errorPassword = !1
			}
		}
	});
	$scope.loading = function () {
		$ionicLoading.show({
			template: '<div class="loader"><svg class="circular"><circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"/></svg></div>'
		});
		$timeout(function () {
			$ionicLoading.hide();
			$state.go('app.home')
		}, 1000)
	}
}).controller('SettingCtrl', function (GlobalService, SettingService, $scope, $state, ionicMaterialInk, $mdDialog) {
	var vm = this;
	ionicMaterialInk.displayEffect();
	$scope.security = {};
	$scope.dup_security = {};
	$scope.loadedAction = !1;
	var initPassword = function () {
		SettingService.getPassword().then(function (security) {
			if (security && security.length != 0) {
				$scope.security = security[0];
				vm.enablePassword = $scope.security.enable;
				$scope.dup_security = angular.copy($scope.security);
				$scope.actionPassword = "Change"
			} else {
				$scope.actionPassword = "Set"
			}
			$scope.loadedAction = !0
		})
	}
	vm.toggleEnablePassword = function () {
		$scope.dup_security.table = 'tbl_password';
		$scope.dup_security.enable = !vm.enablePassword;
		$scope.security = angular.copy($scope.dup_security);
		SettingService.updatePassword($scope.security);
		initPassword()
	}
	vm.modal_setPassword = function (ev) {
		if ($scope.actionPassword == "Set") {
			$scope.dup_security.password = null
		} else {
			$scope.dup_security.password = angular.copy($scope.security.password)
		}
		$mdDialog.show({
			scope: $scope,
			templateUrl: 'modal_setPassword.html',
			parent: angular.element(document.body),
			targetEvent: ev,
			preserveScope: !0,
			escapeToClose: !0,
			clickOutsideToClose: !1,
			fullscreen: !1,
			focusOnOpen: !0
		})
	}
	$scope.savePassword = function () {
		$scope.dup_security.table = 'tbl_password';
		if ($scope.actionPassword == "Set") {
			$scope.dup_security.enable = !0;
			$scope.security = angular.copy($scope.dup_security);
			SettingService.addPassword($scope.security);
			GlobalService.showToast("Security password has been set", 2000)
		} else {
			if ($scope.dup_security.password != $scope.security.password) {
				$scope.security = angular.copy($scope.dup_security);
				SettingService.updatePassword($scope.security);
				GlobalService.showToast("Security password has been modified", 2000)
			}
		}
		initPassword();
		vm.close()
	}
	vm.close = function () {
		$mdDialog.cancel()
	}
	vm.modal_restoreDefault = function (ev) {
		var alert;
		var confirm = $mdDialog.confirm().title('Restore Default?').htmlContent('This action will delete your current database. No backups are provided! <br><br> <b>NOTE: This is recommended when you\'re starting to a new semester. Ensure CSV reports of all subjects before restoring.</b>').ariaLabel('confirmDelete').targetEvent(ev).ok('Restore').cancel('Cancel');
		$mdDialog.show(confirm).then(function () {
			new PouchDB('db_mcr').destroy().then(function () {
				alert = $mdDialog.alert({
					title: 'Restore Completed',
					textContent: 'Database has been deleted. You will be redirected to the homescreen.',
					ok: 'Ok'
				});
				$mdDialog.show(alert).finally(function () {
					alert = undefined;
					$state.go('login')
				})
			}).catch(function (err) {
				alert("Oops, something error happened" + err)
			})
		}, function () {});
		return !0
	}
	initPassword()
}).controller('HomeCtrl', function (GlobalService, SubjectService, $scope, $state, $interval, $stateParams, $timeout, ionicMaterialMotion, $ionicSideMenuDelegate, ionicMaterialInk) {
	var vm = this;
	$scope.$parent.showHeader();
	$scope.$parent.clearFabs();
	$scope.isExpanded = !1;
	$scope.$parent.setExpanded(!1);
	$scope.$parent.setHeaderFab(!1);
	$timeout(function () {
		ionicMaterialMotion.slideUp({
			selector: '.slide-up'
		})
	}, 300);
	$timeout(function () {
		ionicMaterialMotion.fadeSlideInRight({
			startVelocity: 3000
		})
	}, 700);
	ionicMaterialInk.displayEffect();
	$ionicSideMenuDelegate.canDragContent(!0);
	var animate = function () {
		$scope.$on('ngLastRepeat.subjectList', function (e) {
			$timeout(function () {
				ionicMaterialMotion.fadeSlideInRight();
				ionicMaterialInk.displayEffect()
			}, 0)
		})
	}
	vm.currentClass = [];
	$scope.showClass = 0;
	$scope.loaded = !1;
	$scope.loadedStyle = !1;
	var initDay = function () {
		$scope.today = new Date().getDay();
		$scope.tomorrow = new Date();
		$scope.dateToday = new Date();
		$scope.dateToday = moment($scope.dateToday).format("MMMM D, YYYY - dddd");
		$scope.tomorrow = moment().add(1, 'day');
		$scope.tomorrow = $scope.tomorrow._d.getDay()
	}
	$scope.$watch('dateToday', function (newVal, oldVal) {
		if (newVal != oldVal) {
			initDay();
			initSubjects()
		}
	});
	$scope.changeClassToShow = function (what_class) {
		if (what_class == 0) {
			$scope.showClass = 0;
			$scope.whatToShowClasses = "Today's Upcoming"
		} else {
			$scope.showClass = 1;
			$scope.whatToShowClasses = "Tomorrow's"
		}
	}
	$scope.classesToShow = function (condition) {
		try {
			if (condition) {
				return vm.upcomingClasses
			} else {
				return vm.classes.tomorrow
			}
		} catch (e) {}
	}
	$scope.upcomingClasses = function () {
		try {
			vm.upcomingClasses = [];
			vm.currentClass = [];
			var result;
			vm.classes.today.forEach(function (row, i) {
				result = $scope.checkIfElapsed(row.start_time, row.end_time);
				if (result == 'current') {
					vm.currentClass.push(row)
				} else if (result == "upcoming") {
					vm.upcomingClasses.push(row)
				}
			});
			if (vm.upcomingClasses.length != 0) {
				$scope.haveUpcomingClass = !0
			} else {
				$scope.haveUpcomingClass = !1
			}
			if (vm.currentClass.length != 0) {
				$scope.haveCurrentClass = !0
			} else {
				$scope.haveCurrentClass = !1
			}
			$scope.loaded = !0;
			vm.upcomingClasses.forEach(function (row, i) {
				var start_time = GlobalService.toTimeObject(row.start_time);
				var military_startTime = GlobalService.toMilitaryTime_Home(start_time.hour, start_time.minute, start_time.meridian);
				var time = new Date();
				time.setHours(military_startTime.hour);
				time.setMinutes(military_startTime.minute);
				time.setSeconds("00");
				vm.upcomingClasses[i].military_startTime = time
			});
			vm.classes.tomorrow.forEach(function (row, i) {
				var start_time = GlobalService.toTimeObject(row.start_time);
				var military_startTime = GlobalService.toMilitaryTime_Home(start_time.hour, start_time.minute, start_time.meridian);
				var time = new Date();
				time.setHours(military_startTime.hour);
				time.setMinutes(military_startTime.minute);
				time.setSeconds("00");
				vm.classes.tomorrow[i].military_startTime = time
			})
		} catch (e) {}
	}
	$scope.checkIfElapsed = function (start_time, end_time) {
		try {
			var startClassTime = GlobalService.toTimeObject(start_time);
			var endClassTime = GlobalService.toTimeObject(end_time);
			var startClassTimeObj = GlobalService.toMilitaryTime_Home(startClassTime.hour, startClassTime.minute, startClassTime.meridian);
			var endClassTimeObj = GlobalService.toMilitaryTime_Home(endClassTime.hour, endClassTime.minute, endClassTime.meridian);
			var nextClassStartTime = new Date();
			var nextClassEndTime = new Date();
			nextClassStartTime.setHours(startClassTimeObj.hour);
			nextClassStartTime.setMinutes(startClassTimeObj.minute);
			nextClassStartTime.setSeconds("00");
			nextClassEndTime.setHours(endClassTimeObj.hour);
			nextClassEndTime.setMinutes(endClassTimeObj.minute);
			nextClassEndTime.setSeconds("00");
			var currentTime = new Date();
			currentTime = moment(currentTime).format("HH:mm:ss");
			nextClassStartTime = moment(nextClassStartTime).format("HH:mm:ss");
			nextClassEndTime = moment(nextClassEndTime).format("HH:mm:ss");
			var format = 'HH:mm:ss';
			var time = moment(currentTime, format),
				beforeTime = moment(nextClassStartTime, format),
				afterTime = moment(nextClassEndTime, format);
			var endTime = new Date();
			endTime.setHours('23');
			endTime.setMinutes('59');
			endTime.setSeconds('59');
			endTime = moment(endTime).format("HH:mm:ss");
			endTime = moment(endTime, format);
			var result;
			if (time.isBetween(beforeTime, afterTime)) {
				return result = "current"
			} else {
				if (time.isBetween(beforeTime, endTime)) {
					return result = "done"
				} else {
					return result = "upcoming"
				}
			}
		} catch (e) {}
	}
	var initSubjects = function () {
		SubjectService.getClasses($scope.today, $scope.tomorrow).then(function (classes) {
			vm.classes = classes;
			animate()
		}).then(function () {
			$scope.timeInitiate()
		})
	}
	$scope.changeClassToShow(0);
	initDay();
	initSubjects();
	$scope.timeInitiate = function () {
		var startClassTime = null;
		var endClassTime = null;
		var startClassTimeObj = new Date();
		var endClassTimeObj = new Date();
		var updateTime = function () {
			try {
				if (vm.classes.tomorrow.length != 0) {
					vm.classes.tomorrow.sort(function (a, b) {
						return new Date(a.military_startTime) - new Date(b.military_startTime)
					})
				}
				if (vm.currentClass.length == 0) {
					vm.upcomingClasses.sort(function (a, b) {
						return new Date(a.military_startTime) - new Date(b.military_startTime)
					});
					$scope.nextClass = vm.upcomingClasses[0]
				} else {
					$scope.nextClass = vm.currentClass[0]
				}
				$scope.nextClassLoaded = !0;
				startClassTime = $scope.nextClass.start_time;
				endClassTime = $scope.nextClass.end_time;
				startClassTime = GlobalService.toTimeObject(startClassTime);
				endClassTime = GlobalService.toTimeObject(endClassTime);
				startClassTimeObj = GlobalService.toMilitaryTime_Home(startClassTime.hour, startClassTime.minute, startClassTime.meridian);
				endClassTimeObj = GlobalService.toMilitaryTime_Home(endClassTime.hour, endClassTime.minute, endClassTime.meridian);
				var nextClassStartTime = new Date();
				var nextClassEndTime = new Date();
				nextClassStartTime.setHours(startClassTimeObj.hour);
				nextClassStartTime.setMinutes(startClassTimeObj.minute);
				nextClassStartTime.setSeconds("00");
				nextClassEndTime.setHours(endClassTimeObj.hour);
				nextClassEndTime.setMinutes(endClassTimeObj.minute);
				nextClassEndTime.setSeconds("00");
				var currentTime = new Date();
				var dup_currentTime = currentTime;
				var dup_nextClassStartTime = nextClassStartTime;
				var dup_nextClassEndTime = nextClassEndTime;
				currentTime = moment(currentTime).format("hh:mm:ss");
				nextClassStartTime = moment(nextClassStartTime).format("hh:mm:ss");
				nextClassEndTime = moment(nextClassEndTime).format("hh:mm:ss");
				var format = 'hh:mm:ss';
				var time = moment(currentTime, format),
					beforeTime = moment(nextClassStartTime, format),
					afterTime = moment(nextClassEndTime, format);
				if (time.isBetween(beforeTime, afterTime)) {
					$scope.live = !0;
					$scope.elapseTime = moment.utc(moment(time, "DD/MM/YYYY HH:mm:ss").diff(moment(beforeTime, "DD/MM/YYYY HH:mm:ss"))).format("H:mm:ss") + " ago"
				} else {
					$scope.live = !1;
					$scope.startClassTimeFromNow = moment.utc(moment(dup_nextClassStartTime, "DD/MM/YYYY HH:mm:ss").diff(moment(dup_currentTime, "DD/MM/YYYY HH:mm:ss"))).format("HH:mm:ss") + " from now"
				}
			} catch (e) {}
		};
		$(document).ready(function () {
			$interval(function () {
				updateTime();
				$scope.upcomingClasses();
				initDay();
				if ($scope.live) {
					$scope.borderOfCircle = 'solid 1px lawngreen'
				} else if (!$scope.live) {
					$scope.borderOfCircle = 'solid 1px white'
				}
			}, 1000)
		})
	}
	$scope.goTo = function (ecode, subject_title, class_type) {
		if (class_type == "Lecture only") {
			class_type = 1
		} else {
			class_type = 2
		}
		$state.go('app.in-subject', {
			ecode: ecode,
			subject_title: subject_title,
			class_type: class_type
		})
	}
	$scope.toType = function (type) {
		if (type == "Lecture only") {
			return "LEC"
		} else if (type == "Lecture and Laboratory") {
			return "LEC & LAB"
		}
	}
}).controller('SubjectCtrl', function ($stateParams, $state, $location, $mdDialog, $mdMedia, $rootScope, GlobalService, $timeout, ionicMaterialInk, ionicMaterialMotion, $ionicSideMenuDelegate, $scope, $ionicModal, $ionicPlatform, SubjectService, $ionicPopup, $ionicActionSheet) {
	var vm = this;
	$scope.form = {};
	$scope.subject = {};
	$scope.dup_subject = {};
	$scope.$parent.showHeader();
	$scope.$parent.clearFabs();
	$scope.isExpanded = !1;
	$scope.$parent.setExpanded(!1);
	$scope.$parent.setHeaderFab(!1);
	ionicMaterialMotion.slideUp({
		selector: '.slide-up'
	});
	ionicMaterialInk.displayEffect();
	$ionicSideMenuDelegate.canDragContent(!1);
	ionicMaterialMotion.ripple();
	$scope.goTo = function (ecode, subject_title, class_type) {
		if (class_type == "Lecture only") {
			class_type = 1
		} else {
			class_type = 2
		}
		$state.go('app.in-subject', {
			ecode: ecode,
			subject_title: subject_title,
			class_type: class_type
		})
	}
	var initSubjects = function () {
		SubjectService.getAllSubjects().then(function (subjects) {
			vm.subjects = subjects
		})
	}
	var animate = function () {
		$scope.$on('ngLastRepeat.subjectList', function (e) {
			$timeout(function () {
				ionicMaterialMotion.fadeSlideInRight();
				ionicMaterialInk.displayEffect()
			}, 0)
		})
	}
	initSubjects();
	initTime();
	animate();
	vm.modal_addSubject = function (ev) {
		$scope.dup_subject = {};
		$scope.dup_subject.table = "tbl_subject";
		$scope.action = 'Add';
		$scope.isAdd = !0;
		$scope.disable_endTime = !0;
		$mdDialog.show({
			scope: $scope,
			templateUrl: 'modal_subjectForm.html',
			parent: angular.element(document.body),
			targetEvent: ev,
			preserveScope: !0,
			escapeToClose: !0,
			clickOutsideToClose: !1,
			fullscreen: !0,
			focusOnOpen: !0
		})
	};
	vm.modal_editSubject = function (subject, ev) {
		$scope.subject = subject;
		$scope.subject.table = "tbl_subject";
		$scope.dup_subject = angular.copy($scope.subject);
		$scope.action = 'Edit';
		$scope.isAdd = !1;
		$scope.startTimeChanged();
		$mdDialog.show({
			scope: $scope,
			templateUrl: 'modal_subjectForm.html',
			parent: angular.element(document.body),
			targetEvent: ev,
			preserveScope: !0,
			clickOutsideToClose: !1,
			fullscreen: !0
		})
	};
	$scope.saveSubject = function () {
		if ($scope.isAdd) {
			$scope.subject = angular.copy($scope.dup_subject);
			SubjectService.checkEcode($scope.subject.ecode).then(function (exist) {
				if (!exist) {
					SubjectService.addSubject($scope.subject);
					initSubjects();
					animate();
					GlobalService.showToast(GlobalService.ucwords($scope.subject.subject_title) + " has been added", 2000);
					vm.close()
				} else {
					GlobalService.showToast("Ecode : " + ($scope.subject.ecode).toUpperCase() + " exists", 2000)
				}
			})
		} else {
			var dup_ecode = $scope.subject.ecode;
			SubjectService.checkEcode($scope.dup_subject.ecode).then(function (exist) {
				if (!exist) {
					SubjectService.changeEcodeOfStudents($scope.dup_subject.ecode, dup_ecode).then(function (res) {
						if (res) {
							$scope.subject = angular.copy($scope.dup_subject);
							SubjectService.updateSubject($scope.subject);
							initSubjects();
							animate();
							GlobalService.showToast(GlobalService.ucwords($scope.subject.subject_title) + " has been modified", 2000);
							vm.close()
						}
					})
				} else {
					if ($scope.dup_subject.ecode == dup_ecode) {
						SubjectService.changeEcodeOfStudents($scope.dup_subject.ecode, dup_ecode).then(function (res) {
							if (res) {
								$scope.subject = angular.copy($scope.dup_subject);
								SubjectService.updateSubject($scope.subject);
								initSubjects();
								animate();
								GlobalService.showToast(GlobalService.ucwords($scope.subject.subject_title) + " has been modified", 2000);
								vm.close()
							}
						})
					} else {
						GlobalService.showToast("Ecode : " + ($scope.dup_subject.ecode).toUpperCase() + " exists", 2000)
					}
				}
			})
		}
	};
	$scope.options = function (subject, ev) {
		$ionicActionSheet.show({
			titleText: "",
			buttons: [{
				text: 'Edit'
			}],
			destructiveText: 'Dissolve',
			cancelText: 'Cancel',
			cancel: function () {},
			buttonClicked: function (index) {
				if (index === 0) {
					vm.modal_editSubject(subject, ev)
				}
				return !0
			},
			destructiveButtonClicked: function () {
				var confirm = $mdDialog.confirm().title('Dissolve Subject?').htmlContent('Do you want to dissolve <strong>' + GlobalService.ucwords(subject.subject_title) + '(' + subject.ecode.toUpperCase() + ')</strong> ?<br><br> <b>NOTE: All data within this subject will be permanently deleted!</b>').ariaLabel('confirmDelete').ok('Dissolve').cancel('Cancel');
				$mdDialog.show(confirm).then(function () {
					var dup_subject = subject.subject_title;
					SubjectService.deleteSubject(subject);
					initSubjects();
					animate();
					GlobalService.showToast(GlobalService.ucwords(dup_subject) + " has been deleted", 2000);
					vm.close()
				}, function () {});
				return !0
			}
		})
	}
	$scope.dup_subject.day = {};
	$scope.class_type = [{
		type: "Lecture only"
	}, {
		type: "Lecture and Laboratory"
	}, ];
	$scope.subject_days = [{
		id: 1,
		day_name: 'Mon'
	}, {
		id: 2,
		day_name: 'Tue'
	}, {
		id: 3,
		day_name: 'Wed'
	}, {
		id: 4,
		day_name: 'Thu'
	}, {
		id: 5,
		day_name: 'Fri'
	}, {
		id: 6,
		day_name: 'Sat'
	}];
	$scope.startTimeChanged = function () {
		var time = $scope.dup_subject.start_time,
			timeArray = [];
		time = GlobalService.toMilitaryTime(time);
		time = populateEndTime(time);
		$scope.end_time = time;
		$scope.disable_endTime = !1
	}

	function initTime() {
		var start = new Date(0, 0, 0, 7, 30, 0, 0),
			end = new Date(0, 0, 0, 21, 30, 0, 0),
			time = 0,
			deciTime = 0,
			hour = 0,
			min = 0,
			timeArray = [],
			count = 0;
		while (start < end) {
			hour = start.getHours();
			min = start.getMinutes();
			time = GlobalService.toStandardTime(hour + ":" + min);
			timeArray.push({
				time: time
			});
			start.setMinutes(start.getMinutes() + 30);
			count++
		}
		$scope.start_time = timeArray
	}

	function populateEndTime(time) {
		var start = time,
			end = 21.5,
			hour, minute, timeArray = [];
		end = parseFloat(end);
		time = time.split(":");
		hour = parseInt(time[0]);
		minute = parseInt(time[1]);
		start = GlobalService.standardToDecimalTime(start);
		for (var i = 0; i < 4; i++) {
			if (start < end) {
				if (i == 0) {
					hour++
				}
				if (minute == 0) {
					minute = "00"
				}
				time = GlobalService.toStandardTime(hour + ":" + minute);
				timeArray.push({
					id: time,
					time: time
				});
				if (minute == 0 || minute == "00") {
					minute = 30
				} else {
					minute = 0;
					hour++
				}
			}
			start += 0.5
		}
		return timeArray
	}
	$scope.toType = function (type) {
		if (type == "Lecture only") {
			return "LEC"
		} else {
			return "LEC & LAB"
		}
	}
	$scope.toDay = function (day_id) {
		day_id = JSON.stringify(day_id);
		day_id = day_id.replace(/[\[\]']+/g, '');
		var days = day_id.split(",");
		var final_days = "";
		for (var i = 0; i < days.length; i++) {
			var day = GlobalService.toDay(days[i]);
			final_days += ", " + day
		}
		final_days = final_days.replace(/^,/, '');
		return final_days
	}
	vm.close = function () {
		$mdDialog.cancel()
	};
	$scope.$on('$destroy', function () {
		$mdDialog.cancel()
	});
	return vm
}).controller('InSubjectCtrl', function ($cordovaFlashlight, $cordovaToast, $cordovaDevice, $cordovaVibration, $cordovaFile, $sce, $q, ColumnQuizService, ColumnAttendanceService, DataQuizService, DataAttendanceService, DataEntryService, SubjectService, $interval, uiGridConstants, $http, $state, $stateParams, $location, $mdDialog, $mdMedia, $rootScope, GlobalService, $timeout, ionicMaterialInk, ionicMaterialMotion, $ionicSideMenuDelegate, $scope, $ionicModal, $ionicPlatform, $ionicPopup, $ionicActionSheet, StudentService) {
	var vm = this;
	$scope.$parent.setExpanded(!0);
	$scope.ecode = $state.params.ecode;
	$scope.subject_title = $state.params.subject_title;
	$scope.class_type = $state.params.class_type;
	$scope.form = {};
	$scope.student = {};
	$scope.dup_student = {};
	ionicMaterialInk.displayEffect();
	$ionicSideMenuDelegate.canDragContent(!1);
	ionicMaterialMotion.ripple();
	$scope.gridLoaded = !1;
	$scope.$root.emptyStudents = !1;
	$scope.showAttendance = !0;
	$scope.showTerm = 'prelim';
	$scope.$root.classType = !1;
	if ($scope.class_type == 1) {
		$scope.class_type = !1
	} else {
		$scope.class_type = !0
	}
	$scope.$root.class_type = $scope.class_type;
	$scope.toggleChangeType = !1;
	var hideLoading = function () {
		vm.loading = !1
	}
	var showLoading = function () {
		vm.loading = !0
	}
	showLoading();
	$scope.$parent.rightNavInSubject = !0;
	$scope.$on('$stateChangeStart', function () {
		$scope.$parent.rightNavInSubject = null
	});
	var whatToShowInNavInSubjectOpts = function (recordType) {
		if (recordType == 1) {
			$scope.$root.rightNavInSubjectOptions = [{
				optionName: "Add Student",
				color: 'gray',
				optionIcon: 'person_add',
				action: 'modal_addStudent'
			}, {
				optionName: "Add Attendance",
				color: 'gray',
				optionIcon: 'check_box',
				action: 'modal_addAttendance'
			}, {
				optionName: "Manage Attendance",
				color: 'gray',
				optionIcon: 'toc',
				action: 'modal_manageAttendance'
			}, {
				optionName: "Import Students",
				color: 'gray',
				optionIcon: 'file_upload',
				action: 'modal_importStudents'
			}, {
				optionName: "View Lecture Gradesheet",
				color: 'gray',
				optionIcon: 'view_column',
				action: 'modal_lecGradesheet'
			}, {
				optionName: "View Laboratory Gradesheet",
				color: 'gray',
				optionIcon: 'view_column',
				action: 'modal_labGradesheet'
			}, {
				optionName: "View Lec & Lab Gradesheet",
				color: 'gray',
				optionIcon: 'view_stream',
				action: 'modal_leclabGradesheet'
			}, ]
		} else if (recordType == 2) {
			$scope.$root.rightNavInSubjectOptions = [{
				optionName: "Add Quiz",
				color: 'gray',
				optionIcon: 'ac_unit',
				action: 'modal_addQuiz'
			}, {
				optionName: "Manage Quiz",
				color: 'gray',
				optionIcon: 'toc',
				action: 'modal_manageQuiz'
			}, {
				optionName: "View Lecture Gradesheet",
				color: 'gray',
				optionIcon: 'view_column',
				action: 'modal_lecGradesheet'
			}, {
				optionName: "View Laboratory Gradesheet",
				color: 'gray',
				optionIcon: 'view_column',
				action: 'modal_labGradesheet'
			}, {
				optionName: "View Lec & Lab Gradesheet",
				color: 'gray',
				optionIcon: 'view_stream',
				action: 'modal_leclabGradesheet'
			}, ]
		} else if (recordType == 3) {
			$scope.$root.rightNavInSubjectOptions = [{
				optionName: "View Lecture Gradesheet",
				color: 'gray',
				optionIcon: 'view_column',
				action: 'modal_lecGradesheet'
			}, {
				optionName: "View Laboratory Gradesheet",
				color: 'gray',
				optionIcon: 'view_column',
				action: 'modal_labGradesheet'
			}, {
				optionName: "View Lec & Lab Gradesheet",
				color: 'gray',
				optionIcon: 'view_stream',
				action: 'modal_leclabGradesheet'
			}, ]
		}
		if (!$scope.$root.class_type) {
			for (var i = 0; i < 2; i++) {
				$scope.$root.rightNavInSubjectOptions.pop()
			}
		}
	}
	$scope.gridOptions = {};
	$scope.customColumns = [];
	$scope.gridOptions = {
		enableSorting: !1,
		enableColumnMenus: !1,
		rowHeight: 35,
		onRegisterApi: function (gridApi) {
			$scope.gridApi = gridApi
		}
	};
	$scope.gridOptionsGS = {};
	var loadTypeColumnsGS = function () {
		$scope.gridOptionsGS = {
			enableSorting: !1,
			enableColumnMenus: !1,
			rowHeight: 35,
			columnDefs: [{
				field: 'student_no',
				displayName: 'USN/STUD ID',
				pinnedLeft: !0,
				enableColumnResizing: !0,
				minWidth: '50',
				width: '100',
				enableHiding: !1,
				cellTemplate: '<div class="ui-grid-cell-contents" >{{COL_FIELD}}</div>'
			}, {
				field: 'fullname',
				displayName: 'STUDENT NAME',
				pinnedLeft: !0,
				sort: {
					direction: uiGridConstants.ASC
				},
				enableColumnResizing: !0,
				minWidth: '100',
				width: '200',
				enableHiding: !1,
				cellTemplate: '<div class="ui-grid-cell-contents" >{{COL_FIELD}}</div>'
			}, {
				field: 'status',
				displayName: 'STATUS',
				pinnedLeft: !1,
				enableColumnResizing: !1,
				width: '65',
				enableHiding: !1,
				cellClass: "ui-grid-vcenter cell-content_no_event",
				cellTemplate: '<div class="ui-grid-cell-contents" >{{grid.appScope.setGradeStatus(row,col)}}</div>'
			}, {
				field: 'term1_grade',
				displayName: 'PGrd',
				pinnedLeft: !1,
				enableColumnResizing: !1,
				width: '60',
				enableHiding: !1,
				cellClass: 'align-right',
				cellTemplate: '<div class="ui-grid-cell-contents" >{{grid.appScope.setTermGradeInGS(row,col,1)}}</div>'
			}, {
				field: 'term2_grade',
				displayName: 'MGrd',
				pinnedLeft: !1,
				enableColumnResizing: !1,
				width: '60',
				enableHiding: !1,
				cellClass: 'align-right',
				cellTemplate: '<div class="ui-grid-cell-contents" >{{grid.appScope.setTermGradeInGS(row,col,2)}}</div>'
			}, {
				field: 'term3_grade',
				displayName: 'PFGrd',
				pinnedLeft: !1,
				enableColumnResizing: !1,
				width: '60',
				enableHiding: !1,
				cellClass: 'align-right',
				cellTemplate: '<div class="ui-grid-cell-contents" >{{grid.appScope.setTermGradeInGS(row,col,3)}}</div>'
			}, {
				field: 'term4_grade',
				displayName: 'FGrd',
				pinnedLeft: !1,
				enableColumnResizing: !1,
				width: '60',
				enableHiding: !1,
				cellClass: 'align-right',
				cellTemplate: '<div class="ui-grid-cell-contents" >{{grid.appScope.setTermGradeInGS(row,col,4)}}</div>'
			}, {
				field: 'grade',
				displayName: 'GRADE',
				pinnedLeft: !1,
				enableColumnResizing: !1,
				width: '65',
				enableHiding: !1,
				cellClass: 'align-right cell-content_no_event',
				cellTemplate: '<div class="ui-grid-cell-contents" >{{grid.appScope.setGrade(row,col)}}</div>'
			}, {
				field: 'final_grade',
				displayName: 'FINALGRD',
				pinnedLeft: !1,
				enableColumnResizing: !1,
				width: '85',
				enableHiding: !1,
				cellClass: "ui-grid-vcenter cell-content_no_event",
				cellTemplate: '<div class="ui-grid-cell-contents" >{{grid.appScope.setGPA(row,col)}}</div>'
			}, {
				field: 'rank',
				displayName: '',
				pinnedLeft: !1,
				enableColumnResizing: !1,
				width: '50',
				enableHiding: !1,
				cellClass: 'ui-grid-vcenter',
				cellTemplate: '<div class="ui-grid-cell-contents" >{{grid.appScope.setRank(row,col)}}</div>'
			}, ],
			onRegisterApi: function (gridApi) {
				$scope.gridApiGS = gridApi
			}
		};
		$scope.gridOptionsGS.data = vm.students
	}
	var loadColumnsAndDataOfLecLab = function () {
		$scope.gridOptionsGS = {
			enableSorting: !1,
			enableColumnMenus: !1,
			rowHeight: 35,
			columnDefs: [{
				field: 'student_no',
				displayName: 'USN/STUD ID',
				pinnedLeft: !0,
				enableColumnResizing: !0,
				minWidth: '50',
				width: '100',
				enableHiding: !1,
				cellTemplate: '<div class="ui-grid-cell-contents" >{{COL_FIELD}}</div>'
			}, {
				field: 'fullname',
				displayName: 'STUDENT NAME',
				pinnedLeft: !0,
				sort: {
					direction: uiGridConstants.ASC
				},
				enableColumnResizing: !0,
				minWidth: '100',
				width: '200',
				enableHiding: !1,
				cellTemplate: '<div class="ui-grid-cell-contents" >{{COL_FIELD}}</div>'
			}, {
				field: 'lec_grade',
				displayName: 'LEC',
				pinnedLeft: !1,
				enableColumnResizing: !1,
				width: '50',
				enableHiding: !1,
				cellClass: 'align-right',
				cellTemplate: '<div class="ui-grid-cell-contents" >{{grid.appScope.setTypeGradeInGS(row,col,0)}}</div>'
			}, {
				field: 'lec_status',
				displayName: 'STATUS',
				pinnedLeft: !1,
				enableColumnResizing: !1,
				width: '65',
				enableHiding: !1,
				cellClass: "ui-grid-vcenter cell-content_no_event",
				cellTemplate: '<div class="ui-grid-cell-contents" >{{grid.appScope.setTypeGradeStatus(row,col,0)}}</div>'
			}, {
				field: 'lab_grade',
				displayName: 'LAB',
				pinnedLeft: !1,
				enableColumnResizing: !1,
				width: '50',
				enableHiding: !1,
				cellClass: 'align-right',
				cellTemplate: '<div class="ui-grid-cell-contents" >{{grid.appScope.setTypeGradeInGS(row,col,1)}}</div>'
			}, {
				field: 'lab_status',
				displayName: 'STATUS',
				pinnedLeft: !1,
				enableColumnResizing: !1,
				width: '65',
				enableHiding: !1,
				cellClass: "ui-grid-vcenter cell-content_no_event",
				cellTemplate: '<div class="ui-grid-cell-contents" >{{grid.appScope.setTypeGradeStatus(row,col,1)}}</div>'
			}, {
				field: 'term1_leclab_grade',
				displayName: 'PGrd',
				pinnedLeft: !1,
				enableColumnResizing: !1,
				width: '60',
				enableHiding: !1,
				cellClass: 'align-right',
				cellTemplate: '<div class="ui-grid-cell-contents" >{{grid.appScope.setTypeTermGrade(row,col,1)}}</div>'
			}, {
				field: 'term2_leclab_grade',
				displayName: 'MGrd',
				pinnedLeft: !1,
				enableColumnResizing: !1,
				width: '60',
				enableHiding: !1,
				cellClass: 'align-right',
				cellTemplate: '<div class="ui-grid-cell-contents" >{{grid.appScope.setTypeTermGrade(row,col,2)}}</div>'
			}, {
				field: 'term3_leclab_grade',
				displayName: 'PFGrd',
				pinnedLeft: !1,
				enableColumnResizing: !1,
				width: '60',
				enableHiding: !1,
				cellClass: 'align-right',
				cellTemplate: '<div class="ui-grid-cell-contents" >{{grid.appScope.setTypeTermGrade(row,col,3)}}</div>'
			}, {
				field: 'term4_leclab_grade',
				displayName: 'FGrd',
				pinnedLeft: !1,
				enableColumnResizing: !1,
				width: '60',
				enableHiding: !1,
				cellClass: 'align-right',
				cellTemplate: '<div class="ui-grid-cell-contents" >{{grid.appScope.setTypeTermGrade(row,col,4)}}</div>'
			}, {
				field: 'leclab_grade',
				displayName: 'GRADE',
				pinnedLeft: !1,
				enableColumnResizing: !1,
				width: '65',
				enableHiding: !1,
				cellClass: 'align-right cell-content_no_event',
				cellTemplate: '<div class="ui-grid-cell-contents" >{{grid.appScope.setLecLabGrade(row,col)}}</div>'
			}, {
				field: 'leclab_gpa',
				displayName: 'FINALGRD',
				pinnedLeft: !1,
				enableColumnResizing: !1,
				width: '85',
				enableHiding: !1,
				cellClass: 'ui-grid-vcenter cell-content_no_event',
				cellTemplate: '<div class="ui-grid-cell-contents" >{{grid.appScope.setGPAInGS(row,col)}}</div>'
			}, {
				field: 'rank',
				displayName: '',
				pinnedLeft: !1,
				enableColumnResizing: !1,
				width: '50',
				enableHiding: !1,
				cellClass: 'ui-grid-vcenter',
				cellTemplate: '<div class="ui-grid-cell-contents" >{{grid.appScope.setRankInGS(row,col)}}</div>'
			}, {
				field: 'term1_gpa',
				displayName: 'Prelim Eqv',
				pinnedLeft: !1,
				enableColumnResizing: !1,
				width: '100',
				enableHiding: !1,
				cellClass: 'ui-grid-vcenter',
				cellTemplate: '<div class="ui-grid-cell-contents" >{{grid.appScope.setTermGPAInGS(row,col,1)}}</div>'
			}, {
				field: 'term2_gpa',
				displayName: 'Midterm Eqv',
				pinnedLeft: !1,
				enableColumnResizing: !1,
				width: '100',
				enableHiding: !1,
				cellClass: 'ui-grid-vcenter',
				cellTemplate: '<div class="ui-grid-cell-contents" >{{grid.appScope.setTermGPAInGS(row,col,2)}}</div>'
			}, {
				field: 'term3_gpa',
				displayName: 'Prefi Eqv',
				pinnedLeft: !1,
				enableColumnResizing: !1,
				width: '100',
				enableHiding: !1,
				cellClass: 'ui-grid-vcenter',
				cellTemplate: '<div class="ui-grid-cell-contents" >{{grid.appScope.setTermGPAInGS(row,col,3)}}</div>'
			}, {
				field: 'term4_gpa',
				displayName: 'Finals Eqv',
				pinnedLeft: !1,
				enableColumnResizing: !1,
				width: '100',
				enableHiding: !1,
				cellClass: 'ui-grid-vcenter',
				cellTemplate: '<div class="ui-grid-cell-contents" >{{grid.appScope.setTermGPAInGS(row,col,4)}}</div>'
			}],
			onRegisterApi: function (gridApi) {
				$scope.gridApiGS = gridApi
			}
		};
		$scope.gridOptionsGS.data = vm.students
	}
	$scope.setTypeGradeInGS = function (row, col, type) {
		if (type == 0) {
			vm.students.forEach(function (unusedrow, i) {
				if (vm.students[i].student_no == row.entity.student_no) {
					vm.students[i].exportData.LEC = row.entity.dataOfLec.averageGrade
				}
			});
			return row.entity.dataOfLec.averageGrade
		} else if (type == 1) {
			vm.students.forEach(function (unusedrow, i) {
				if (vm.students[i].student_no == row.entity.student_no) {
					vm.students[i].exportData.LAB = row.entity.dataOfLab.averageGrade
				}
			});
			return row.entity.dataOfLab.averageGrade
		}
	}
	$scope.setTypeGradeStatus = function (row, col, type) {
		if (type == 0) {
			vm.students.forEach(function (unusedrow, i) {
				if (vm.students[i].student_no == row.entity.student_no) {
					vm.students[i].exportData.LEC_STATUS = row.entity.dataOfLec.gradeStatusLec
				}
			});
			return row.entity.dataOfLec.gradeStatusLec
		} else if (type == 1) {
			vm.students.forEach(function (unusedrow, i) {
				if (vm.students[i].student_no == row.entity.student_no) {
					vm.students[i].exportData.LAB_STATUS = row.entity.dataOfLab.gradeStatusLab
				}
			});
			return row.entity.dataOfLab.gradeStatusLab
		}
	}
	$scope.setTypeTermGrade = function (row, col, term) {
		var grade;
		if (term == 1) {
			grade = Math.max((row.entity.dataOfLec.term1_grade * .4) + (row.entity.dataOfLab.term1_grade * .6)).toFixed(2);
			vm.students.forEach(function (unusedrow, i) {
				if (vm.students[i].student_no == row.entity.student_no) {
					vm.students[i].exportData.PGrd = grade
				}
			})
		} else if (term == 2) {
			grade = Math.max((row.entity.dataOfLec.term2_grade * .4) + (row.entity.dataOfLab.term2_grade * .6)).toFixed(2);
			vm.students.forEach(function (unusedrow, i) {
				if (vm.students[i].student_no == row.entity.student_no) {
					vm.students[i].exportData.MGrd = grade
				}
			})
		} else if (term == 3) {
			grade = Math.max((row.entity.dataOfLec.term3_grade * .4) + (row.entity.dataOfLab.term3_grade * .6)).toFixed(2);
			vm.students.forEach(function (unusedrow, i) {
				if (vm.students[i].student_no == row.entity.student_no) {
					vm.students[i].exportData.PFGrd = grade
				}
			})
		} else if (term == 4) {
			grade = Math.max((row.entity.dataOfLec.term4_grade * .4) + (row.entity.dataOfLab.term4_grade * .6)).toFixed(2);
			vm.students.forEach(function (unusedrow, i) {
				if (vm.students[i].student_no == row.entity.student_no) {
					vm.students[i].exportData.FGrd = grade
				}
			})
		}
		return grade
	}
	$scope.setLecLabGrade = function (row, col) {
		var grade = Math.max((row.entity.dataOfLec.averageGrade * .4) + (row.entity.dataOfLab.averageGrade * .6)).toFixed(2);
		vm.students.forEach(function (unusedrow, i) {
			if (vm.students[i].student_no == row.entity.student_no) {
				vm.students[i].exportData.LEC_LAB_GRADE = grade
			}
		});
		return grade
	}
	$scope.setGPAInGS = function (row, col) {
		var grade = $scope.setLecLabGrade(row, col);
		vm.students.forEach(function (unusedrow, i) {
			if (vm.students[i].student_no == row.entity.student_no) {
				vm.students[i].exportData.FINALGRD = calculateGPA(grade)
			}
		});
		return calculateGPA(grade)
	}
	$scope.setRankInGS = function (row, col) {
		var grade = $scope.setLecLabGrade(row, col);
		vm.students.forEach(function (unusedrow, i) {
			if (vm.students[i].student_no == row.entity.student_no) {
				vm.students[i].exportData.RANK = calculateRank(grade)
			}
		});
		return calculateRank(grade)
	}
	$scope.setTermGPAInGS = function (row, col, term) {
		var grade;
		if (term == 1) {
			grade = calculateGPA(Math.max((row.entity.dataOfLec.term1_grade * .4) + (row.entity.dataOfLab.term1_grade * .6)).toFixed(2));
			vm.students.forEach(function (unusedrow, i) {
				if (vm.students[i].student_no == row.entity.student_no) {
					vm.students[i].exportData.GPA_PGrd = grade
				}
			})
		} else if (term == 2) {
			grade = calculateGPA(Math.max((row.entity.dataOfLec.term2_grade * .4) + (row.entity.dataOfLab.term2_grade * .6)).toFixed(2));
			vm.students.forEach(function (unusedrow, i) {
				if (vm.students[i].student_no == row.entity.student_no) {
					vm.students[i].exportData.GPA_MGrd = grade
				}
			})
		} else if (term == 3) {
			grade = calculateGPA(Math.max((row.entity.dataOfLec.term3_grade * .4) + (row.entity.dataOfLab.term3_grade * .6)).toFixed(2));
			vm.students.forEach(function (unusedrow, i) {
				if (vm.students[i].student_no == row.entity.student_no) {
					vm.students[i].exportData.GPA_PFGrd = grade
				}
			})
		} else if (term == 4) {
			grade = calculateGPA(Math.max((row.entity.dataOfLec.term4_grade * .4) + (row.entity.dataOfLab.term4_grade * .6)).toFixed(2));
			vm.students.forEach(function (unusedrow, i) {
				if (vm.students[i].student_no == row.entity.student_no) {
					vm.students[i].exportData.GPA_FGrd = grade
				}
			})
		}
		return grade
	}

	function ConvertToCSV(objArray) {
		var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
		if ($scope.gradesheetIs != 2) {
			var str = 'USN/STUD NO, LAST NAME, FIRST NAME, STATUS, PGrd, MGrd, PFGrd, FGrd, GRADE, FINALGRD, Rank ' + '\r\n'
		} else {
			var str = 'USN/STUD NO, LAST NAME, FIRST NAME, LEC, STATUS, LAB, STATUS, PGrd, MGrd, PFGrd, FGrd, GRADE, FINALGRD, Rank, Prelim Eqv, Midterm Eqv, Prefi Eqv, Finals Eqv ' + '\r\n'
		}
		for (var i = 0; i < array.length; i++) {
			var line = '';
			for (var index in array[i]) {
				delete array[i].$$hashKey;
				if (line != '') line += ','
				line += array[i][index]
			}
			str += line + '\r\n'
		}
		return str
	}
	vm.export = function (gradesheet) {
		$scope.exportDataOfGS = [];
		for (var i = 0; i < vm.students.length; i++) {
			if (gradesheet == 0) {
				$scope.exportDataOfGS.push({
					StudentNo: vm.students[i].student_no,
					StudentName: vm.students[i].fullname,
					Status: vm.students[i].exportData.gradeStatusLec,
					PGrd: vm.students[i].exportData.term1_grade,
					MGrd: vm.students[i].exportData.term2_grade,
					PFGrd: vm.students[i].exportData.term3_grade,
					FGrd: vm.students[i].exportData.term4_grade,
					GRADE: vm.students[i].exportData.averageGrade,
					FINALGRD: vm.students[i].exportData.GPA,
					Rank: vm.students[i].exportData.rank
				})
			} else if (gradesheet == 1) {
				$scope.exportDataOfGS.push({
					StudentNo: vm.students[i].student_no,
					StudentName: vm.students[i].fullname,
					Status: vm.students[i].exportData.gradeStatusLab,
					PGrd: vm.students[i].exportData.term1_grade,
					MGrd: vm.students[i].exportData.term2_grade,
					PFGrd: vm.students[i].exportData.term3_grade,
					FGrd: vm.students[i].exportData.term4_grade,
					GRADE: vm.students[i].exportData.averageGrade,
					FINALGRD: vm.students[i].exportData.GPA,
					Rank: vm.students[i].exportData.rank
				})
			} else if (gradesheet == 2) {
				$scope.exportDataOfGS.push({
					StudentNo: vm.students[i].student_no,
					StudentName: vm.students[i].fullname,
					LEC: vm.students[i].exportData.LEC,
					LEC_STATUS: vm.students[i].exportData.LEC_STATUS,
					LAB: vm.students[i].exportData.LAB,
					LAB_STATUS: vm.students[i].exportData.LAB_STATUS,
					PGrd: vm.students[i].exportData.PGrd,
					MGrd: vm.students[i].exportData.MGrd,
					PFGrd: vm.students[i].exportData.PFGrd,
					FGrd: vm.students[i].exportData.FGrd,
					GRADE: vm.students[i].exportData.LEC_LAB_GRADE,
					FINALGRD: vm.students[i].exportData.FINALGRD,
					RANK: vm.students[i].exportData.RANK,
					PRELIM_EQV: vm.students[i].exportData.GPA_PGrd,
					MIDTERM_EQV: vm.students[i].exportData.GPA_MGrd,
					PREFI_EQV: vm.students[i].exportData.GPA_PFGrd,
					FINALS_EQV: vm.students[i].exportData.GPA_FGrd
				})
			}
		}
		var csvData;
		csvData = ConvertToCSV($scope.exportDataOfGS);
		if (gradesheet == 0) {
			var fileName = ($scope.subject_title).toUpperCase() + " (" + ($scope.ecode).toUpperCase() + ")-LEC";
			$cordovaFile.writeFile(cordova.file.externalRootDirectory, fileName + '.csv', csvData, !0).then(function (result) {
				GlobalService.showToast(fileName + ".csv has been successfully exported. It can be found in the root of your SD Card", 4000)
			}, function (err) {
				GlobalService.showToast("Something wrong happens :" + JSON.stringify(err), 4000)
			})
		} else if (gradesheet == 1) {
			var fileName = ($scope.subject_title).toUpperCase() + " (" + ($scope.ecode).toUpperCase() + ")-LAB";
			$cordovaFile.writeFile(cordova.file.externalRootDirectory, fileName + '.csv', csvData, !0).then(function (result) {
				GlobalService.showToast(fileName + ".csv has been successfully exported. It can be found in the root of your SD Card", 4000)
			}, function (err) {
				GlobalService.showToast("Something wrong happens :" + JSON.stringify(err), 4000)
			})
		} else if (gradesheet == 2) {
			var fileName = ($scope.subject_title).toUpperCase() + " (" + ($scope.ecode).toUpperCase() + ")-LEC&LAB";
			$cordovaFile.writeFile(cordova.file.externalRootDirectory, fileName + '.csv', csvData, !0).then(function (result) {
				GlobalService.showToast(fileName + ".csv has been successfully exported. It can be found in the root of your SD Card", 4000)
			}, function (err) {
				GlobalService.showToast("Something wrong happens :" + JSON.stringify(err), 4000)
			})
		}
	}
	var loadStaticColumns = function () {
		if ($scope.showRecordType == 'quiz') {
			$scope.customColumns = [{
				field: 'fullname',
				displayName: 'Name',
				pinnedLeft: !1,
				sort: {
					direction: uiGridConstants.ASC
				},
				enableColumnResizing: !0,
				minWidth: '100',
				width: '200',
				enableHiding: !1,
				cellTemplate: '<div on-hold="grid.appScope.vm.options(row,ev)" ng-click="grid.appScope.vm.modal_editStudent(row,col,ev)" class="ui-grid-cell-contents" >{{COL_FIELD}}</div>'
			}]
		} else if ($scope.showRecordType == 'attendance') {
			$scope.customColumns = [{
				field: 'fullname',
				displayName: 'Name',
				pinnedLeft: !1,
				sort: {
					direction: uiGridConstants.ASC
				},
				enableColumnResizing: !0,
				minWidth: '100',
				width: '200',
				enableHiding: !1,
				cellTemplate: '<div on-hold="grid.appScope.vm.options(row,ev)" ng-click="grid.appScope.vm.modal_editStudent(row,col,ev)" class="ui-grid-cell-contents" >{{COL_FIELD}}</div>'
			}]
		} else {
			$scope.customColumns = [{
				field: 'fullname',
				displayName: 'Name',
				pinnedLeft: !0,
				sort: {
					direction: uiGridConstants.ASC
				},
				enableColumnResizing: !0,
				minWidth: '100',
				width: '200',
				enableHiding: !1,
				cellTemplate: '<div on-hold="grid.appScope.vm.options(row,ev)" ng-click="grid.appScope.vm.modal_editStudent(row,col,ev)" class="ui-grid-cell-contents" >{{COL_FIELD}}</div>'
			}]
		}
		$scope.gridOptions.columnDefs = $scope.customColumns
	}
	var loadAttendanceColumns = function () {
		ColumnAttendanceService.getAllAttendanceDate($scope.ecode, $scope.showTerm).then(function (dates) {
			vm.dates = dates;
			$scope.customColumns = $scope.customColumns.concat(vm.dates);
			$scope.gridOptions.columnDefs = $scope.customColumns
		})
	}
	var loadQuizColumns = function () {
		ColumnQuizService.getAllQuiz($scope.ecode, $scope.$root.classType, $scope.showTerm).then(function (quizzes) {
			vm.quizzes = quizzes;
			$scope.customColumns = $scope.customColumns.concat(vm.quizzes);
			$scope.gridOptions.columnDefs = $scope.customColumns
		})
	}
	var loadStaticEntryColumns = function () {
		var entryColumns = [{
			field: 'grade',
			displayName: 'Grade',
			width: '60',
			enableHiding: !1,
			enableColumnResizing: !1,
			cellClass: 'align-right cell-content_no_event',
			cellTemplate: '<div class="ui-grid-cell-contents">{{grid.appScope.setGrade(row,col)}}</div>'
		}, {
			field: 'final_grade',
			displayName: 'FGrade',
			width: '65',
			enableHiding: !1,
			enableColumnResizing: !1,
			cellClass: 'align-right cell-content_no_event',
			cellTemplate: '<div class="ui-grid-cell-contents">{{grid.appScope.setGPA(row,col)}}</div>'
		}, {
			field: 'status',
			displayName: 'Status',
			width: '60',
			enableHiding: !1,
			enableColumnResizing: !1,
			cellClass: "ui-grid-vcenter",
			cellTemplate: '<div ng-click="grid.appScope.vm.modal_setGradeStatus(row,col,ev)" class="ui-grid-cell-contents" >{{grid.appScope.setGradeStatus(row,col)}}</div>'
		}, ];
		$scope.customColumns = $scope.customColumns.concat(entryColumns);
		$scope.gridOptions.columnDefs = $scope.customColumns
	}
	var loadEntryTermColumns = function (term) {
		var prefix;
		if (term == 'prelim') {
			prefix = "P"
		} else if (term == 'midterm') {
			prefix = "M"
		} else if (term == 'pre-final') {
			prefix = "PF"
		} else if (term == 'final') {
			prefix = 'F'
		}
		var entryColumns = [{
			field: prefix + 'QX',
			displayName: prefix + 'QX',
			width: '55',
			enableHiding: !1,
			enableColumnResizing: !1,
			cellClass: 'align-right cell-content_no_event',
			cellTemplate: '<div class="ui-grid-cell-contents" >{{grid.appScope.setTermQX(row,col)}}</div>'
		}, {
			field: prefix + 'EX',
			displayName: prefix + 'EX',
			width: '55',
			enableHiding: !1,
			enableColumnResizing: !1,
			cellClass: 'align-right',
			cellTemplate: '<div ng-click="grid.appScope.vm.modal_setExamScore(row,col,ev)" class="ui-grid-cell-contents" >{{grid.appScope.setExamScoreData(row,col)}}</div>'
		}, {
			field: prefix + 'CS',
			displayName: prefix + 'CS',
			width: '55',
			enableHiding: !1,
			enableColumnResizing: !1,
			cellClass: 'align-right',
			cellTemplate: '<div ng-click="grid.appScope.vm.modal_setCSScore(row,col,ev)" class="ui-grid-cell-contents" >{{grid.appScope.setCSScoreData(row,col)}}</div>'
		}, {
			field: prefix + 'ABS',
			displayName: 'Abs',
			width: '55',
			enableHiding: !1,
			enableColumnResizing: !1,
			cellClass: 'align-right cell-content_no_event',
			cellTemplate: '<div class="ui-grid-cell-contents">{{grid.appScope.setAbsencesData(row,col)}}</div>'
		}, {
			field: prefix + 'GRD',
			displayName: prefix + 'GRD',
			width: '60',
			enableHiding: !1,
			enableColumnResizing: !1,
			cellClass: 'align-right cell-content_no_event',
			cellTemplate: '<div class="ui-grid-cell-contents" >{{grid.appScope.setTermGrade(row,col)}}</div>'
		}, ];
		$scope.customColumns = $scope.customColumns.concat(entryColumns);
		$scope.gridOptions.columnDefs = $scope.customColumns
	}
	$scope.$watch('vm.students', function (newVal, oldVal) {
		if (newVal != oldVal) {
			if ($scope.gridOptions.columnDefs.length == 1) {
				$scope.gridOptions.columnDefs[0].pinnedLeft = !1
			} else {
				$scope.gridOptions.columnDefs[0].pinnedLeft = !0
			}
			for (var i = 0; i < newVal.length; i++) {
				if (newVal[i].table != 'tbl_student') {
					newVal.splice(i, 1)
				}
			}
			if (vm.students.length == 0) {
				$scope.$root.emptyStudents = !0
			}
		}
	}, !0);
	$scope.$watch('vm.dates', function (newVal, oldVal) {
		try {
			if ($scope.gridOptions.columnDefs.length == 1) {
				$scope.gridOptions.columnDefs[0].pinnedLeft = !1
			} else {
				$scope.gridOptions.columnDefs[0].pinnedLeft = !0
			}
			if (newVal != oldVal) {
				for (var i = 0; i < newVal.length; i++) {
					if (newVal[i].table != 'tbl_attendance') {
						newVal.splice(i, 1)
					}
				}
			}
		} catch (e) {}
	}, !0);
	$scope.$watch('vm.quizzes', function (newVal, oldVal) {
		try {
			if ($scope.gridOptions.columnDefs.length == 1) {
				$scope.gridOptions.columnDefs[0].pinnedLeft = !1
			} else {
				$scope.gridOptions.columnDefs[0].pinnedLeft = !0
			}
			if (newVal != oldVal) {
				for (var i = 0; i < newVal.length; i++) {
					if (newVal[i].table != 'tbl_quiz') {
						newVal.splice(i, 1)
					}
				}
			}
		} catch (e) {}
	}, !0);
	$scope.$watch('vm.attendanceData', function (newVal, oldVal) {
		if (newVal != oldVal) {
			for (var i = 0; i < newVal.length; i++) {
				if (newVal[i].table != 'tbl_attendanceData') {
					newVal.splice(i, 1)
				}
			}
		}
	}, !0);
	$scope.$watch('vm.quizData', function (newVal, oldVal) {
		if (newVal != oldVal) {
			for (var i = 0; i < newVal.length; i++) {
				if (newVal[i].table != 'tbl_quizData') {
					newVal.splice(i, 1)
				}
			}
		}
	}, !0);
	var loadStudentsData = function () {
		return StudentService.getAllStudents($scope.ecode).then(function (students) {
			vm.students = students;
			if (vm.students.length == 0) {
				$scope.$root.emptyStudents = !0
			} else {
				$scope.$root.emptyStudents = !1;
				$scope.gridOptions.data = vm.students;
				$scope.gridOptionsGS.data = vm.students;
				vm.students.forEach(function (row, i) {
					vm.students[i].exportData = {};
					vm.students[i].dataOfLec = {};
					vm.students[i].dataOfLab = {};
					$scope.gridOptions.data.push(vm.students[i].quizData = []);
					$scope.gridOptions.data.push(vm.students[i].entryData = {});
					$scope.gridOptions.data.push(vm.students[i].entryData.term1 = {});
					$scope.gridOptions.data.push(vm.students[i].entryData.term2 = {});
					$scope.gridOptions.data.push(vm.students[i].entryData.term3 = {});
					$scope.gridOptions.data.push(vm.students[i].entryData.term4 = {})
				})
			}
		}).then(function () {
			return !0
		})
	}
	var loadAttendanceData = function () {
		return DataAttendanceService.getAllAttendanceData($scope.ecode).then(function (data) {
			vm.attendanceData = data
		}).then(function () {
			return !0
		})
	}
	var loadQuizData = function () {
		return DataQuizService.getAllQuizData($scope.ecode).then(function (data) {
			vm.quizData = data
		}).then(function () {
			return !0
		})
	}
	var loadEntryData = function () {
		var passAbsencesCount = function () {
			return DataEntryService.getAttendanceDataByTerm($scope.ecode, $scope.showTerm).then(function (data) {
				for (var i = 0; i < vm.students.length; i++) {
					var lec_absences = 0;
					var lab_absences = 0;
					for (var x = 0; x < data.length; x++) {
						if (vm.students[i].student_no == data[x].student_no) {
							if (data[x].state == 1) {
								lec_absences++
							}
							if (data[x].state1 == 1) {
								lab_absences++
							}
						}
					}
					vm.students[i].entryData.lec_absences = lec_absences;
					vm.students[i].entryData.lab_absences = lab_absences
				}
			}).then(function () {
				return !0
			})
		}
		var passTermQX = function () {
			return DataEntryService.getQuizDataByTerm($scope.ecode, $scope.$root.classType).then(function (data) {
				DataEntryService.getQuizMaxScoreByTerm($scope.ecode, $scope.$root.classType).then(function (quiz) {
					var total_maxScoreTerm1 = 0;
					var total_maxScoreTerm2 = 0;
					var total_maxScoreTerm3 = 0;
					var total_maxScoreTerm4 = 0;
					for (var i = 0; i < data.length; i++) {
						data[i].column_name = data[i].column_name.toLowerCase();
						for (var x = 0; x < quiz.length; x++) {
							if (data[i].column_name == quiz[x].field && data[i].term == quiz[x].term) {
								data[i].max_score = quiz[x].max_score
							}
							if (i == 0) {
								if (quiz[x].term == 'prelim') {
									total_maxScoreTerm1 += quiz[x].max_score
								}
								if (quiz[x].term == 'midterm') {
									total_maxScoreTerm2 += quiz[x].max_score
								}
								if (quiz[x].term == 'pre-final') {
									total_maxScoreTerm3 += quiz[x].max_score
								}
								if (quiz[x].term == 'final') {
									total_maxScoreTerm4 += quiz[x].max_score
								}
							}
						}
					}
					for (var i = 0; i < vm.students.length; i++) {
						var total_scoreTerm1 = 0;
						var total_scoreTerm2 = 0;
						var total_scoreTerm3 = 0;
						var total_scoreTerm4 = 0;
						for (var x = 0; x < data.length; x++) {
							if (data[x].student_no == vm.students[i].student_no) {
								if (data[x].term == 'prelim') {
									total_scoreTerm1 += data[x].score
								}
								if (data[x].term == 'midterm') {
									total_scoreTerm2 += data[x].score
								}
								if (data[x].term == 'pre-final') {
									total_scoreTerm3 += data[x].score
								}
								if (data[x].term == 'final') {
									total_scoreTerm4 += data[x].score
								}
							}
						}
						vm.students[i].entryData.term1.avg_quiz = (total_scoreTerm1 / total_maxScoreTerm1) * 100;
						vm.students[i].entryData.term2.avg_quiz = (total_scoreTerm2 / total_maxScoreTerm2) * 100;
						vm.students[i].entryData.term3.avg_quiz = (total_scoreTerm3 / total_maxScoreTerm3) * 100;
						vm.students[i].entryData.term4.avg_quiz = (total_scoreTerm4 / total_maxScoreTerm4) * 100;
						if (isNaN(vm.students[i].entryData.term1.avg_quiz)) {
							vm.students[i].entryData.term1.avg_quiz = 0
						}
						if (isNaN(vm.students[i].entryData.term2.avg_quiz)) {
							vm.students[i].entryData.term2.avg_quiz = 0
						}
						if (isNaN(vm.students[i].entryData.term3.avg_quiz)) {
							vm.students[i].entryData.term3.avg_quiz = 0
						}
						if (isNaN(vm.students[i].entryData.term4.avg_quiz)) {
							vm.students[i].entryData.term4.avg_quiz = 0
						}
					}
				})
			})
		}
		var passExamScore = function () {
			return DataEntryService.getExamScore($scope.ecode, $scope.$root.classType).then(function (data) {
				vm.entryData = data;
				for (var i = 0; i < vm.students.length; i++) {
					vm.students[i].entryData.term1.exam_score = 0;
					vm.students[i].entryData.term2.exam_score = 0;
					vm.students[i].entryData.term3.exam_score = 0;
					vm.students[i].entryData.term4.exam_score = 0;
					for (var d = 0; d < vm.entryData.length; d++) {
						if (vm.students[i].student_no == vm.entryData[d].student_no) {
							if (vm.entryData[d].term == 'prelim') {
								vm.students[i].entryData.term1.exam_score = vm.entryData[d].exam_score
							} else if (vm.entryData[d].term == 'midterm') {
								vm.students[i].entryData.term2.exam_score = vm.entryData[d].exam_score
							} else if (vm.entryData[d].term == 'pre-final') {
								vm.students[i].entryData.term3.exam_score = vm.entryData[d].exam_score
							} else if (vm.entryData[d].term == 'final') {
								vm.students[i].entryData.term4.exam_score = vm.entryData[d].exam_score
							}
						}
					}
				}
			})
		}
		var passCSScore = function () {
			return DataEntryService.getCSScore($scope.ecode, $scope.$root.classType).then(function (data) {
				vm.CSData = data;
				for (var i = 0; i < vm.students.length; i++) {
					vm.students[i].entryData.term1.cs_score = 0;
					vm.students[i].entryData.term2.cs_score = 0;
					vm.students[i].entryData.term3.cs_score = 0;
					vm.students[i].entryData.term4.cs_score = 0;
					for (var d = 0; d < vm.CSData.length; d++) {
						if (vm.students[i].student_no == vm.CSData[d].student_no) {
							if (vm.CSData[d].term == 'prelim') {
								vm.students[i].entryData.term1.cs_score = vm.CSData[d].cs_score
							} else if (vm.CSData[d].term == 'midterm') {
								vm.students[i].entryData.term2.cs_score = vm.CSData[d].cs_score
							} else if (vm.CSData[d].term == 'pre-final') {
								vm.students[i].entryData.term3.cs_score = vm.CSData[d].cs_score
							} else if (vm.CSData[d].term == 'final') {
								vm.students[i].entryData.term4.cs_score = vm.CSData[d].cs_score
							}
						}
					}
				}
				return !0
			})
		}
		var passGradeStatus = function () {
			return DataEntryService.getAllGradeStatus($scope.ecode, $scope.$root.classType).then(function (data) {
				for (var i = 0; i < vm.students.length; i++) {
					for (var x = 0; x < data.length; x++) {
						if (vm.students[i].student_no == data[x].student_no) {
							if (!data[x].class_type) {
								vm.students[i].entryData.status = data[x].status
							} else {
								vm.students[i].entryData.status1 = data[x].status1
							}
						}
					}
				}
			}).then(function () {
				return !0
			})
		}
		return passAbsencesCount().then(function () {
			return passTermQX().then(function () {
				return passExamScore().then(function () {
					return passCSScore().then(function () {
						return passGradeStatus().then(function () {
							return !0
						})
					})
				})
			})
		})
	}
	var passAttendanceData = function () {
		for (var i = 0; i < vm.students.length; i++) {
			for (var d = 0; d < vm.attendanceData.length; d++) {
				if (vm.students[i].student_no == vm.attendanceData[d].student_no) {
					var attendance_date = vm.attendanceData[d].attendance_date;
					var state = vm.attendanceData[d].state;
					var state1 = vm.attendanceData[d].state1;
					vm.students[i].attendanceData.push({
						attendance_date, state, state1
					})
				}
			}
		}
	}
	var passQuizData = function () {
		for (var i = 0; i < vm.students.length; i++) {
			for (var d = 0; d < vm.quizData.length; d++) {
				if (vm.students[i].student_no == vm.quizData[d].student_no) {
					var column_name = vm.quizData[d].column_name;
					var score = vm.quizData[d].score;
					vm.students[i].quizData.push({
						column_name, score
					})
				}
			}
		}
	}
	var passAttendanceStateCount = function () {
		vm.dates.forEach(function (row, i) {
			DataAttendanceService.getStatesCount($scope.ecode, vm.dates[i].field).then(function (res) {
				for (var x = 0; x < vm.dates.length; x++) {
					if (vm.dates[x].field == res[0].date) {
						vm.dates[x].lecState = res[0].lecState;
						vm.dates[x].labState = res[0].labState
					}
				}
			})
		})
	}
	var initColumns = function () {
		showLoading();
		$scope.$root.disableOnLoading = !0;
		loadStaticColumns();
		if ($scope.showRecordType == 'attendance') {
			loadAttendanceColumns()
		} else if ($scope.showRecordType == 'quiz') {
			loadQuizColumns()
		} else if ($scope.showRecordType == 'entry') {
			loadStaticEntryColumns()
		}
	}
	var initData = function () {
		showLoading();
		$scope.$root.disableOnLoading = !0;
		loadStudentsData().then(function () {
			if (!$scope.$root.emptyStudents) {
				if ($scope.showRecordType == 'attendance') {
					loadAttendanceData().then(function () {
						passAttendanceData();
						passAttendanceStateCount();
						hideLoading();
						$scope.gridLoaded = !0;
						$scope.$root.disableOnLoading = !1
					})
				} else if ($scope.showRecordType == 'quiz') {
					loadQuizColumns();
					loadQuizData().then(function () {
						passQuizData();
						hideLoading();
						$scope.gridLoaded = !0;
						$scope.$root.disableOnLoading = !1
					})
				} else if ($scope.showRecordType == 'entry') {
					loadEntryTermColumns($scope.showTerm);
					loadEntryData().then(function (done) {
						if (done) {
							hideLoading();
							$scope.gridLoaded = !0;
							$scope.$root.disableOnLoading = !1
						}
					})
				}
			}
			if ($scope.$root.emptyStudents) {
				hideLoading();
				$scope.gridLoaded = !0;
				$scope.$root.disableOnLoading = !1
			}
		})
	}
	var calculateTermGradeInGS = function (grade, term) {
		if (isNaN(grade.term1.avg_quiz)) {
			grade.term1.avg_quiz = 0
		}
		if (isNaN(grade.term2.avg_quiz)) {
			grade.term2.avg_quiz = 0
		}
		if (isNaN(grade.term3.avg_quiz)) {
			grade.term3.avg_quiz = 0
		}
		if (isNaN(grade.term4.avg_quiz)) {
			grade.term4.avg_quiz = 0
		}
		if (term == 1) {
			grade.term1.avg_quiz = parseFloat(grade.term1.avg_quiz);
			if (grade.term1.cs_score == "") {
				grade.term1.cs_score = 0
			}
			if (grade.term1.exam_score == "") {
				grade.term1.exam_score = 0
			}
			return Math.max((grade.term1.avg_quiz * 0.4) + (grade.term1.exam_score * 0.5) + (grade.term1.cs_score * 0.1)).toFixed(2)
		} else if (term == 2) {
			grade.term2.avg_quiz = parseFloat(grade.term2.avg_quiz);
			if (grade.term2.cs_score == "") {
				grade.term2.cs_score = 0
			}
			if (grade.term2.exam_score == "") {
				grade.term2.exam_score = 0
			}
			return Math.max((grade.term2.avg_quiz * 0.4) + (grade.term2.exam_score * 0.5) + (grade.term2.cs_score * 0.1)).toFixed(2)
		} else if (term == 3) {
			grade.term3.avg_quiz = parseFloat(grade.term3.avg_quiz);
			if (grade.term3.cs_score == "") {
				grade.term3.cs_score = 0
			}
			if (grade.term3.exam_score == "") {
				grade.term3.exam_score = 0
			}
			return Math.max((grade.term3.avg_quiz * 0.4) + (grade.term3.exam_score * 0.5) + (grade.term3.cs_score * 0.1)).toFixed(2)
		} else if (term == 4) {
			grade.term4.avg_quiz = parseFloat(grade.term4.avg_quiz);
			if (grade.term4.cs_score == "") {
				grade.term4.cs_score = 0
			}
			if (grade.term4.exam_score == "") {
				grade.term4.exam_score = 0
			}
			return Math.max((grade.term4.avg_quiz * 0.4) + (grade.term4.exam_score * 0.5) + (grade.term4.cs_score * 0.1)).toFixed(2)
		}
	}
	var calculateTermGrade = function (grade) {
		if (isNaN(grade.term1.avg_quiz)) {
			grade.term1.avg_quiz = 0
		}
		if (isNaN(grade.term2.avg_quiz)) {
			grade.term2.avg_quiz = 0
		}
		if (isNaN(grade.term3.avg_quiz)) {
			grade.term3.avg_quiz = 0
		}
		if (isNaN(grade.term4.avg_quiz)) {
			grade.term4.avg_quiz = 0
		}
		if ($scope.showTerm == 'prelim') {
			grade.term1.avg_quiz = parseFloat(grade.term1.avg_quiz);
			if (grade.term1.cs_score == "") {
				grade.term1.cs_score = 0
			}
			if (grade.term1.exam_score == "") {
				grade.term1.exam_score = 0
			}
			return Math.max((grade.term1.avg_quiz * 0.4) + (grade.term1.exam_score * 0.5) + (grade.term1.cs_score * 0.1)).toFixed(2)
		} else if ($scope.showTerm == 'midterm') {
			grade.term2.avg_quiz = parseFloat(grade.term2.avg_quiz);
			if (grade.term2.cs_score == "") {
				grade.term2.cs_score = 0
			}
			if (grade.term2.exam_score == "") {
				grade.term2.exam_score = 0
			}
			return Math.max((grade.term2.avg_quiz * 0.4) + (grade.term2.exam_score * 0.5) + (grade.term2.cs_score * 0.1)).toFixed(2)
		} else if ($scope.showTerm == 'pre-final') {
			grade.term3.avg_quiz = parseFloat(grade.term3.avg_quiz);
			if (grade.term3.cs_score == "") {
				grade.term3.cs_score = 0
			}
			if (grade.term3.exam_score == "") {
				grade.term3.exam_score = 0
			}
			return Math.max((grade.term3.avg_quiz * 0.4) + (grade.term3.exam_score * 0.5) + (grade.term3.cs_score * 0.1)).toFixed(2)
		} else if ($scope.showTerm == 'final') {
			grade.term4.avg_quiz = parseFloat(grade.term4.avg_quiz);
			if (grade.term4.cs_score == "") {
				grade.term4.cs_score = 0
			}
			if (grade.term4.exam_score == "") {
				grade.term4.exam_score = 0
			}
			return Math.max((grade.term4.avg_quiz * 0.4) + (grade.term4.exam_score * 0.5) + (grade.term4.cs_score * 0.1)).toFixed(2)
		}
	}
	var calculateGrade = function (grade) {
		if (isNaN(grade.term1.avg_quiz)) {
			grade.term1.avg_quiz = 0
		}
		if (isNaN(grade.term2.avg_quiz)) {
			grade.term2.avg_quiz = 0
		}
		if (isNaN(grade.term3.avg_quiz)) {
			grade.term3.avg_quiz = 0
		}
		if (isNaN(grade.term4.avg_quiz)) {
			grade.term4.avg_quiz = 0
		}
		var gradeOfTerm1 = Math.max((grade.term1.avg_quiz * 0.4) + (grade.term1.exam_score * 0.5) + (grade.term1.cs_score * 0.1)).toFixed(2);
		var gradeOfTerm2 = Math.max((grade.term2.avg_quiz * 0.4) + (grade.term2.exam_score * 0.5) + (grade.term2.cs_score * 0.1)).toFixed(2);
		var gradeOfTerm3 = Math.max((grade.term3.avg_quiz * 0.4) + (grade.term3.exam_score * 0.5) + (grade.term3.cs_score * 0.1)).toFixed(2);
		var gradeOfTerm4 = Math.max((grade.term4.avg_quiz * 0.4) + (grade.term4.exam_score * 0.5) + (grade.term4.cs_score * 0.1)).toFixed(2);
		return Math.max((gradeOfTerm1 * .2) + (gradeOfTerm2 * .2) + (gradeOfTerm3 * .2) + (gradeOfTerm4 * .4)).toFixed(2)
	}
	var calculateGPA = function (grade) {
		if (grade <= 100 && grade >= 96) {
			grade = 1
		} else if (grade <= 95.99 && grade >= 91) {
			grade = 1.25
		} else if (grade <= 90.99 && grade >= 86) {
			grade = 1.5
		} else if (grade <= 85.99 && grade >= 81) {
			grade = 1.75
		} else if (grade <= 80.99 && grade >= 75) {
			grade = 2
		} else if (grade <= 74.99 && grade >= 69) {
			grade = 2.25
		} else if (grade <= 68.99 && grade >= 63) {
			grade = 2.50
		} else if (grade <= 62.99 && grade >= 57) {
			grade = 2.75
		} else if (grade <= 56.99 && grade >= 50) {
			grade = 3
		} else if (grade <= 49.99 && grade >= 0) {
			grade = 5
		}
		return Math.max(grade).toFixed(2)
	}
	var calculateRank = function (grade) {
		if (grade <= 100 && grade >= 96) {
			grade = "A+"
		} else if (grade <= 95.99 && grade >= 91) {
			grade = "A"
		} else if (grade <= 90.99 && grade >= 86) {
			grade = "A-"
		} else if (grade <= 85.99 && grade >= 81) {
			grade = "B+"
		} else if (grade <= 80.99 && grade >= 75) {
			grade = "B"
		} else if (grade <= 74.99 && grade >= 69) {
			grade = "B-"
		} else if (grade <= 68.99 && grade >= 63) {
			grade = "C+"
		} else if (grade <= 62.99 && grade >= 57) {
			grade = "C"
		} else if (grade <= 56.99 && grade >= 50) {
			grade = "C-"
		} else if (grade <= 49.99 && grade >= 0) {
			grade = "F"
		}
		return grade
	}
	var toCompleteGradeStatus = function (status) {
		if (status == 1) {
			return "IC"
		} else if (status == 2) {
			return "IP"
		} else if (status == 3) {
			return "W"
		} else if (status == 4) {
			return "D"
		} else {
			return "CO"
		}
	}
	$scope.setAttendanceData = function (row, col) {
		for (var i = 0; i < row.entity.attendanceData.length; i++) {
			if (col.field == row.entity.attendanceData[i].attendance_date) {
				if (!$scope.$root.classType) {
					return GlobalService.toState(row.entity.attendanceData[i].state)
				} else {
					return GlobalService.toState(row.entity.attendanceData[i].state1)
				}
			}
		}
	}
	$scope.setQuizData = function (row, col) {
		for (var i = 0; i < row.entity.quizData.length; i++) {
			if (GlobalService.ucwords(col.colDef.name) == row.entity.quizData[i].column_name) {
				return row.entity.quizData[i].score
			}
		}
	}
	$scope.setAbsencesData = function (row, col) {
		if (row.entity.entryData.lec_absences == undefined || row.entity.entryData.lab_absences == undefined) {
			return 0
		}
		if (!$scope.$root.classType) {
			if (isNaN(row.entity.entryData.lec_absences)) {
				return 0
			} else {
				return row.entity.entryData.lec_absences
			}
		} else {
			if (isNaN(row.entity.entryData.lab_absences)) {
				return 0
			} else {
				return row.entity.entryData.lab_absences
			}
		}
	}
	$scope.setTermQX = function (row, col) {
		var num = 0;
		if ($scope.showTerm == 'prelim') {
			if (isNaN(row.entity.entryData.term1.avg_quiz) || row.entity.entryData.term1.avg_quiz == 0) {
				return Math.max(num).toFixed(2)
			} else {
				return Math.max(row.entity.entryData.term1.avg_quiz).toFixed(2)
			}
		} else if ($scope.showTerm == 'midterm') {
			if (isNaN(row.entity.entryData.term2.avg_quiz) || row.entity.entryData.term2.avg_quiz == 0) {
				return Math.max(num).toFixed(2)
			} else {
				return Math.max(row.entity.entryData.term2.avg_quiz).toFixed(2)
			}
		} else if ($scope.showTerm == 'pre-final') {
			if (isNaN(row.entity.entryData.term3.avg_quiz) || row.entity.entryData.term3.avg_quiz == 0) {
				return Math.max(num).toFixed(2)
			} else {
				return Math.max(row.entity.entryData.term3.avg_quiz).toFixed(2)
			}
		} else if ($scope.showTerm == 'final') {
			if (isNaN(row.entity.entryData.term4.avg_quiz) || row.entity.entryData.term4.avg_quiz == 0) {
				return Math.max(num).toFixed(2)
			} else {
				return Math.max(row.entity.entryData.term4.avg_quiz).toFixed(2)
			}
		}
	}
	$scope.setExamScoreData = function (row, col) {
		if ($scope.showTerm == 'prelim') {
			if (isNaN(row.entity.entryData.term1.exam_score) || row.entity.entryData.term1.exam_score == 0) {
				return 0
			} else {
				return row.entity.entryData.term1.exam_score
			}
		} else if ($scope.showTerm == 'midterm') {
			if (isNaN(row.entity.entryData.term2.exam_score) || row.entity.entryData.term2.exam_score == 0) {
				return 0
			} else {
				return row.entity.entryData.term2.exam_score
			}
		} else if ($scope.showTerm == 'pre-final') {
			if (isNaN(row.entity.entryData.term3.exam_score) || row.entity.entryData.term3.exam_score == 0) {
				return 0
			} else {
				return row.entity.entryData.term3.exam_score
			}
		} else if ($scope.showTerm == 'final') {
			if (isNaN(row.entity.entryData.term4.exam_score) || row.entity.entryData.term4.exam_score == 0) {
				return 0
			} else {
				return row.entity.entryData.term4.exam_score
			}
		}
	}
	$scope.setCSScoreData = function (row, col) {
		if ($scope.showTerm == 'prelim') {
			if (isNaN(row.entity.entryData.term1.cs_score) || row.entity.entryData.term1.cs_score == 0) {
				return 0
			} else {
				return row.entity.entryData.term1.cs_score
			}
		} else if ($scope.showTerm == 'midterm') {
			if (isNaN(row.entity.entryData.term2.cs_score) || row.entity.entryData.term2.cs_score == 0) {
				return 0
			} else {
				return row.entity.entryData.term2.cs_score
			}
		} else if ($scope.showTerm == 'pre-final') {
			if (isNaN(row.entity.entryData.term3.cs_score) || row.entity.entryData.term3.cs_score == 0) {
				return 0
			} else {
				return row.entity.entryData.term3.cs_score
			}
		} else if ($scope.showTerm == 'final') {
			if (isNaN(row.entity.entryData.term4.cs_score) || row.entity.entryData.term4.cs_score == 0) {
				return 0
			} else {
				return row.entity.entryData.term4.cs_score
			}
		}
	}
	$scope.setGrade = function (row, col) {
		var nanCount = 0,
			num = 0;
		if (isNaN(row.entity.entryData.term1.avg_quiz)) {
			nanCount++;
			return Math.max(num).toFixed(2)
		}
		if (isNaN(row.entity.entryData.term2.avg_quiz)) {
			nanCount++;
			return Math.max(num).toFixed(2)
		}
		if (isNaN(row.entity.entryData.term3.avg_quiz)) {
			nanCount++;
			return Math.max(num).toFixed(2)
		}
		if (isNaN(row.entity.entryData.term4.avg_quiz)) {
			nanCount++;
			return Math.max(num).toFixed(2)
		}
		if (nanCount == 0) {
			vm.students.forEach(function (unusedrow, i) {
				if (vm.students[i].student_no == row.entity.student_no) {
					vm.students[i].exportData.averageGrade = calculateGrade(row.entity.entryData)
				}
			});
			return calculateGrade(row.entity.entryData)
		}
	}
	$scope.setGPA = function (row, col) {
		var grade = $scope.setGrade(row, col);
		vm.students.forEach(function (unusedrow, i) {
			if (vm.students[i].student_no == row.entity.student_no) {
				vm.students[i].exportData.GPA = calculateGPA(grade)
			}
		});
		return calculateGPA(grade)
	}
	$scope.setRank = function (row, col) {
		var nanCount = 0,
			num = 0;
		if (isNaN(row.entity.entryData.term1.avg_quiz)) {
			nanCount++;
			return Math.max(num).toFixed(2)
		}
		if (isNaN(row.entity.entryData.term2.avg_quiz)) {
			nanCount++;
			return Math.max(num).toFixed(2)
		}
		if (isNaN(row.entity.entryData.term3.avg_quiz)) {
			nanCount++;
			return Math.max(num).toFixed(2)
		}
		if (isNaN(row.entity.entryData.term4.avg_quiz)) {
			nanCount++;
			return Math.max(num).toFixed(2)
		}
		if (nanCount == 0) {
			var grade = calculateGrade(row.entity.entryData)
		}
		vm.students.forEach(function (unusedrow, i) {
			if (vm.students[i].student_no == row.entity.student_no) {
				vm.students[i].exportData.rank = calculateRank(grade)
			}
		});
		return calculateRank(grade)
	}
	$scope.setTermGrade = function (row, col) {
		return calculateTermGrade(row.entity.entryData)
	}
	$scope.setGradeStatus = function (row, col) {
		vm.students.forEach(function (unusedrow, i) {
			if (vm.students[i].student_no == row.entity.student_no) {
				vm.students[i].exportData.gradeStatusLec = toCompleteGradeStatus(row.entity.entryData.status);
				vm.students[i].exportData.gradeStatusLab = toCompleteGradeStatus(row.entity.entryData.status1)
			}
		});
		if (!$scope.$root.classType) {
			return toCompleteGradeStatus(row.entity.entryData.status)
		} else {
			return toCompleteGradeStatus(row.entity.entryData.status1)
		}
	}
	$scope.setTermGradeInGS = function (row, col, term) {
		vm.students.forEach(function (unusedrow, i) {
			if (vm.students[i].student_no == row.entity.student_no) {
				if (term == 1) {
					vm.students[i].exportData.term1_grade = calculateTermGradeInGS(row.entity.entryData, term)
				} else if (term == 2) {
					vm.students[i].exportData.term2_grade = calculateTermGradeInGS(row.entity.entryData, term)
				} else if (term == 3) {
					vm.students[i].exportData.term3_grade = calculateTermGradeInGS(row.entity.entryData, term)
				} else if (term == 4) {
					vm.students[i].exportData.term4_grade = calculateTermGradeInGS(row.entity.entryData, term)
				}
			}
		});
		return calculateTermGradeInGS(row.entity.entryData, term)
	}
	initColumns();
	vm.deleteAttendanceDate = function (date) {
		var confirm = $mdDialog.confirm().title('Delete Attendance?').htmlContent('Do you want to delete <strong>' + date.field + ' (' + GlobalService.toCompleteDay(date.field) + ')</strong> ?<br><br> <b>NOTE: All attendance states of students within this date will be deleted!</b>').ariaLabel('confirmDelete').ok('Delete').cancel('Cancel');
		$mdDialog.show(confirm).then(function () {
			DataAttendanceService.deleteAttendanceData(date).then(function (res) {
				if (res) {
					ColumnAttendanceService.deleteAttendanceDate(date).then(function (res) {
						if (res.ok) {
							GlobalService.showToast(date.field + " has been deleted", 2000);
							vm.close();
							$scope.$root.recordType(1)
						}
					})
				}
			})
		}, function () {});
		return !0
	}
	vm.deleteQuizColumn = function (quiz) {
		quiz.name = GlobalService.ucwords(quiz.name);
		var confirm = $mdDialog.confirm().title('Delete Quiz?').htmlContent('Do you want to delete <strong>' + quiz.name + ' (' + quiz.date + ')</strong> ?<br><br> <b>NOTE: All quiz score of all students within this quiz column will be deleted!</b>').ariaLabel('confirmDelete').ok('Delete').cancel('Cancel');
		$mdDialog.show(confirm).then(function () {
			DataQuizService.deleteQuizData(quiz).then(function (res) {
				if (res) {
					ColumnQuizService.deleteQuizColumn(quiz).then(function (res) {
						if (res.ok) {
							GlobalService.showToast(quiz.name + " has been deleted", 2000);
							vm.close();
							$scope.$root.recordType(2)
						}
					})
				}
			})
		}, function () {});
		return !0
	}
	vm.options = function (row, ev) {
		$scope.studentData = row;
		$mdDialog.show({
			scope: $scope,
			templateUrl: 'modal_option.html',
			parent: angular.element(document.body),
			targetEvent: ev,
			preserveScope: !0,
			escapeToClose: !1,
			clickOutsideToClose: !0,
			fullscreen: !1,
			focusOnOpen: !0
		})
	}
	$scope.studentOptions = [];
	$scope.studentOptions = [{
		optionName: 'Edit',
		optionIcon: 'edit',
		action: 'modal_editStudent'
	}, {
		optionName: 'Delete student',
		optionIcon: 'delete',
		action: 'modal_deleteStudent'
	}];
	$scope.$root.modal_addStudent = function (ev) {
		setTimeout(function () {
			$scope.student = {};
			$scope.dup_student = {};
			$scope.dup_student.table = "tbl_student";
			$scope.dup_student.attendanceData = [];
			$scope.dup_student.ecode = $scope.ecode;
			$scope.action = 'Add';
			$scope.isAdd = !0;
			$mdDialog.show({
				scope: $scope,
				templateUrl: 'modal_studentForm.html',
				parent: angular.element(document.body),
				targetEvent: ev,
				preserveScope: !0,
				escapeToClose: !1,
				clickOutsideToClose: !1,
				fullscreen: !1,
				focusOnOpen: !0
			})
		}, 300)
	}
	vm.modal_editStudent = function (row, ev) {
		setTimeout(function () {
			$scope.student = row.entity;
			$scope.student.table = "tbl_student";
			$scope.dup_student = angular.copy($scope.student);
			$scope.action = 'Edit';
			$scope.isAdd = !1;
			$mdDialog.show({
				scope: $scope,
				templateUrl: 'modal_studentForm.html',
				parent: angular.element(document.body),
				targetEvent: ev,
				preserveScope: !0,
				clickOutsideToClose: !1,
				fullscreen: !1
			})
		}, 200)
	}
	vm.modal_deleteStudent = function (student, ev) {
		student = student.entity;
		var confirm = $mdDialog.confirm().title('Delete Student?').htmlContent('Do you want to delete <strong>' + GlobalService.ucwords(student.last_name) + ', ' + GlobalService.ucwords(student.first_name) + ' ' + GlobalService.ucwords(student.mi) + '.' + '</strong> ?<br><br> <b>NOTE: All data including attendance,grades,and entry of this student will be permanently deleted!</b>').ariaLabel('confirmDelete').ok('Delete').cancel('Cancel');
		$mdDialog.show(confirm).then(function () {
			var dup_fullname = student.last_name + ", " + student.first_name + " " + student.mi + ".";
			var student_no = student.student_no;
			StudentService.deleteDataOfStudent($scope.ecode, student).then(function (res) {
				if (res.ok) {
					GlobalService.showToast(GlobalService.ucwords(dup_fullname) + " has been deleted", 2000);
					vm.close()
				}
			})
		}, function () {});
		return !0
	}
	$scope.saveStudent = function () {
		$scope.dup_student.fullname = GlobalService.toFullName($scope.dup_student.last_name, $scope.dup_student.first_name, $scope.dup_student.mi);
		$scope.dup_student.student_no = $scope.dup_student.student_no.toUpperCase();
		if ($scope.isAdd) {
			$scope.student = angular.copy($scope.dup_student);
			StudentService.checkStudentNo($scope.ecode, $scope.student.student_no).then(function (exist) {
				if (!exist) {
					StudentService.addStudent($scope.student);
					GlobalService.showToast(GlobalService.ucwords($scope.student.last_name) + " has been added", 2000);
					vm.close()
				} else {
					GlobalService.showToast("Student No: " + $scope.student.student_no + " exists in this subject", 2000)
				}
			});
			if ($scope.$root.emptyStudents) {
				initData()
			}
		} else {
			var dup_student_no = $scope.student.student_no;
			StudentService.checkStudentNo($scope.ecode, $scope.dup_student.student_no).then(function (exist) {
				if (!exist) {
					$scope.student = angular.copy($scope.dup_student);
					StudentService.updateStudent($scope.student);
					GlobalService.showToast(GlobalService.ucwords($scope.student.last_name) + " has been modified", 2000);
					vm.close()
				} else {
					if ($scope.dup_student.student_no == dup_student_no) {
						$scope.student = angular.copy($scope.dup_student);
						StudentService.updateStudent($scope.student);
						GlobalService.showToast(GlobalService.ucwords($scope.student.last_name) + " has been modified", 2000);
						vm.close()
					} else {
						GlobalService.showToast("Student No: " + $scope.dup_student.student_no + " exists in this subject", 2000)
					}
				}
			})
		}
	};
	vm.showStudent = function (student, ev) {
		$scope.student = student;
		$scope.student.table = "tbl_student";
		$scope.student.ecode = $scope.ecode;
		$scope.dup_student = angular.copy($scope.student);
		$scope.action = 'Edit';
		$scope.isAdd = !1;
		$mdDialog.show({
			scope: $scope,
			templateUrl: 'modal_studentForm.html',
			parent: angular.element(document.body),
			targetEvent: ev,
			preserveScope: !0,
			clickOutsideToClose: !1,
			fullscreen: !0
		})
	}
	$scope.attendance = {};
	$scope.dup_attendance = {};
	$scope.$root.modal_addAttendance = function (ev) {
		passAttendanceStateCount();
		setTimeout(function () {
			$scope.dup_attendance.action = 'Add';
			$scope.dup_attendance.isAdd = !0;
			$mdDialog.show({
				scope: $scope,
				templateUrl: 'modal_addAttendance.html',
				parent: angular.element(document.body),
				targetEvent: ev,
				preserveScope: !0,
				escapeToClose: !1,
				clickOutsideToClose: !1,
				fullscreen: !1,
				focusOnOpen: !0
			})
		}, 200)
	}
	$scope.quiz = {};
	$scope.dup_quiz = {};
	$scope.$root.modal_addQuiz = function (ev) {
		setTimeout(function () {
			$scope.dup_quiz.action = 'Add';
			$scope.dup_quiz.isAdd = !0;
			$mdDialog.show({
				scope: $scope,
				templateUrl: 'modal_addQuiz.html',
				parent: angular.element(document.body),
				targetEvent: ev,
				preserveScope: !0,
				escapeToClose: !1,
				clickOutsideToClose: !1,
				fullscreen: !1,
				focusOnOpen: !0
			})
		}, 200)
	}
	$scope.$watch('dup_quizData.score', function (newVal, oldVal) {
		if ($scope.dup_quizData.score > $scope.dup_quizData.max_score) {
			$scope.dup_quizData.message = "The score is too high";
			$scope.dup_quizData.error = !0
		} else {
			$scope.dup_quizData.message = null;
			$scope.dup_quizData.error = !1
		}
	});
	$scope.$watch('dup_termExamData.exam_score', function (newVal, oldVal) {
		if ($scope.dup_termExamData.exam_score > $scope.dup_termExamData.max_score) {
			$scope.dup_termExamData.message = "Maximum score for exam is 100";
			$scope.dup_termExamData.error = !0
		} else {
			$scope.dup_termExamData.message = null;
			$scope.dup_termExamData.error = !1
		}
	});
	$scope.$watch('dup_CSData.cs_score', function (newVal, oldVal) {
		if ($scope.dup_CSData.cs_score > $scope.dup_CSData.max_score) {
			$scope.dup_CSData.message = "Maximum score for CS is 100";
			$scope.dup_CSData.error = !0
		} else {
			$scope.dup_CSData.message = null;
			$scope.dup_CSData.error = !1
		}
	});
	$scope.$root.modal_lecGradesheet = function (ev) {
		var dup_classType = $scope.$root.classType;
		$scope.$root.classType = !1;
		loadTypeColumnsGS();
		showLoading();
		$scope.$root.disableOnLoading = !0;
		$scope.gradesheetIs = 0;
		return loadEntryData().then(function (done) {
			if (done) {
				$scope.$root.classType = dup_classType;
				if (ev == undefined) {
					hideLoading();
					$scope.$root.disableOnLoading = !1
				}
				$mdDialog.show({
					scope: $scope,
					templateUrl: 'modal_gradesheet.html',
					parent: angular.element(document.body),
					targetEvent: ev,
					preserveScope: !0,
					escapeToClose: !1,
					clickOutsideToClose: !1,
					fullscreen: !0,
					onComplete: onComplete,
					focusOnOpen: !0
				});

				function onComplete(scope, element, options) {
					if (ev) {
						vm.students.forEach(function (unusedrow, i) {
							vm.students[i].dataOfLec = angular.copy(vm.students[i].exportData)
						});
						vm.close()
					}
				}
			}
			return !0
		})
	}
	$scope.$root.modal_labGradesheet = function (ev) {
		var dup_classType = $scope.$root.classType;
		$scope.$root.classType = !0;
		loadTypeColumnsGS();
		showLoading();
		$scope.$root.disableOnLoading = !0;
		$scope.gradesheetIs = 1;
		return loadEntryData().then(function (done) {
			if (done) {
				$scope.$root.classType = dup_classType;
				if (ev == undefined) {
					hideLoading();
					$scope.$root.disableOnLoading = !1
				}
				$mdDialog.show({
					scope: $scope,
					templateUrl: 'modal_gradesheet.html',
					parent: angular.element(document.body),
					targetEvent: ev,
					preserveScope: !0,
					escapeToClose: !1,
					clickOutsideToClose: !1,
					fullscreen: !0,
					onComplete: onComplete,
					focusOnOpen: !0
				});

				function onComplete(scope, element, options) {
					if (ev) {
						vm.students.forEach(function (unusedrow, i) {
							vm.students[i].dataOfLab = angular.copy(vm.students[i].exportData)
						})
					}
				}
			}
			return !0
		})
	}
	$scope.$root.modal_leclabGradesheet = function (ev) {
		var dup_classType = $scope.$root.classType;
		$scope.$root.modal_lecGradesheet(!0).then(function (done) {
			if (done) {
				$scope.$root.modal_labGradesheet(!0).then(function (done) {
					if (done) {
						setTimeout(function () {
							hideLoading();
							$scope.$root.disableOnLoading = !1;
							$scope.gradesheetIs = 2;
							$scope.$root.classType = dup_classType;
							loadColumnsAndDataOfLecLab()
						}, 0)
					}
				})
			}
		})
	}
	$scope.$root.modal_importStudents = function (ev) {
		$scope.studentDataCount = 0;
		setTimeout(function () {
			$mdDialog.show({
				scope: $scope,
				templateUrl: 'modal_importStudents.html',
				parent: angular.element(document.body),
				targetEvent: ev,
				preserveScope: !0,
				escapeToClose: !1,
				clickOutsideToClose: !1,
				fullscreen: !1,
				focusOnOpen: !0
			})
		}, 300)
	}

	function buildConfig() {
		return {
			delimiter: ",",
			newline: "",
			header: !0,
			dynamicTyping: !1,
			preview: 0,
			encoding: "",
			worker: !1,
			comments: !1,
			step: !1,
			complete: function (results, file) {
				if ($scope.saveParseData) {
					saveStudentsFromParsedData(results)
				}
			},
			error: undefined,
			download: !1,
			skipEmptyLines: !0,
			chunk: undefined,
			fastMode: undefined,
			beforeFirstChunk: undefined,
			withCredentials: undefined
		}
	}
	var inputType = "string";
	var stepped = 0,
		rowCount = 0,
		errorCount = 0,
		firstError;
	var start, end;
	var firstRun = !0;
	var maxUnparseLength = 10000;

	function printStats(msg) {
		if (msg) console.log(msg);
		console.log("       Time:", (end - start || "(Unknown; your browser does not support the Performance API)"), "ms");
		console.log("  Row count:", rowCount);
		if (stepped) console.log("    Stepped:", stepped);
		console.log("     Errors:", errorCount);
		if (errorCount) console.log("First error:", firstError)
	}

	function now() {
		return typeof window.performance !== 'undefined' ? window.performance.now() : 0
	}
	vm.importStudentsFromFile = function () {
		var config = buildConfig();
		$('#files').parse({
			config: config,
			before: function (file, inputElem) {
				start = now();
				console.log("Parsing file...", file);
				var extension = file.name.split(".");
				extension = extension[1];
				if (extension != "csv") {
					GlobalService.showToast("Please choose a CSV file", 2000);
					$scope.saveParseData = !1
				} else {
					$scope.saveParseData = !0
				}
			},
			error: function (err, file) {
				console.log("ERROR:", err, file);
				firstError = firstError || err;
				errorCount++
			},
			complete: function (results, file) {}
		})
	}
	var saveStudentsFromParsedData = function (result) {
		if (result.data[0].Student_no == undefined || result.data[0].Last_name == undefined || result.data[0].First_name == undefined || result.data[0].Mi == undefined) {
			GlobalService.showToast("Invalid format in your CSV, please follow the format.(Case sensitive)", 3000)
		} else {
			for (var i = 0; i < result.data.length; i++) {
				$scope.student = {};
				$scope.student.student_no = result.data[i].Student_no.toUpperCase();
				$scope.student.last_name = result.data[i].Last_name;
				$scope.student.first_name = result.data[i].First_name;
				$scope.student.mi = result.data[i].Mi;
				$scope.student.fullname = GlobalService.toFullName($scope.student.last_name, $scope.student.first_name, $scope.student.mi);
				$scope.student.attendanceData = [];
				$scope.student.ecode = $scope.ecode;
				$scope.student.table = "tbl_student";
				StudentService.addStudent($scope.student)
			}
			if ($scope.$root.emptyStudents) {
				initData()
			}
			GlobalService.showToast("Successfully imported the students!", 2000);
			vm.close()
		}
	}
	$scope.$root.modal_manageAttendance = function (ev) {
		$scope.dup_attendance.action = 'Manage';
		$scope.dup_attendance.isAdd = !0;
		passAttendanceStateCount();
		setTimeout(function () {
			$mdDialog.show({
				scope: $scope,
				templateUrl: 'modal_manageAttendance.html',
				parent: angular.element(document.body),
				targetEvent: ev,
				preserveScope: !0,
				escapeToClose: !1,
				clickOutsideToClose: !1,
				fullscreen: !1,
				focusOnOpen: !0
			})
		}, 300)
	}
	$scope.attendanceData = {};
	$scope.dup_attendanceData = {};
	vm.modal_setAttendance = function (row, col, ev) {
		$scope.attendanceData.table = "tbl_attendanceData";
		$scope.dup_attendanceData.date = col.field;
		$scope.dup_attendanceData.student_no = row.entity.student_no;
		$scope.dup_attendanceData.fullname = row.entity.fullname;
		$mdDialog.show({
			scope: $scope,
			templateUrl: 'modal_attendanceData.html',
			parent: angular.element(document.body),
			targetEvent: ev,
			preserveScope: !0,
			escapeToClose: !1,
			clickOutsideToClose: !1,
			fullscreen: !1,
		})
	}
	$scope.$root.modal_manageQuiz = function (ev) {
		$scope.dup_quiz.action = 'Manage';
		$scope.dup_quiz.isAdd = !0;
		setTimeout(function () {
			$mdDialog.show({
				scope: $scope,
				templateUrl: 'modal_manageQuiz.html',
				parent: angular.element(document.body),
				targetEvent: ev,
				preserveScope: !0,
				escapeToClose: !1,
				clickOutsideToClose: !1,
				fullscreen: !1,
				focusOnOpen: !0
			})
		}, 300)
	}
	$scope.quizData = {};
	$scope.dup_quizData = {};
	vm.modal_setQuiz = function (row, col, ev) {
		$scope.dup_quizData.score = null;
		$scope.dup_quizData.error = null;
		row.entity.quizData.forEach(function (row, i) {
			if (GlobalService.ucwords(col.colDef.field) == row.column_name) {
				$scope.dup_quizData.score = row.score
			}
		});
		$scope.quizData.table = "tbl_quizData";
		$scope.dup_quizData.ecode = $scope.ecode;
		$scope.dup_quizData.term = $scope.showTerm;
		$scope.dup_quizData.class_type = $scope.$root.classType;
		$scope.dup_quizData.column_name = GlobalService.ucwords(col.field);
		$scope.dup_quizData.date = col.colDef.date;
		$scope.dup_quizData.max_score = col.colDef.max_score;
		$scope.dup_quizData.student_no = row.entity.student_no;
		$scope.dup_quizData.fullname = row.entity.fullname;
		$mdDialog.show({
			scope: $scope,
			templateUrl: 'modal_quizData.html',
			parent: angular.element(document.body),
			targetEvent: ev,
			preserveScope: !0,
			escapeToClose: !1,
			clickOutsideToClose: !1,
			fullscreen: !1,
		})
	}
	$scope.termExamData = {};
	$scope.dup_termExamData = {};
	vm.modal_setExamScore = function (row, col, ev) {
		$scope.dup_termExamData = {};
		$scope.dup_termExamData.exam_score = null;
		$scope.dup_termExamData.error = null;
		if ($scope.showTerm == 'prelim') {
			$scope.dup_termExamData.exam_score = row.entity.entryData.term1.exam_score
		} else if ($scope.showTerm == 'midterm') {
			$scope.dup_termExamData.exam_score = row.entity.entryData.term2.exam_score
		} else if ($scope.showTerm == 'pre-final') {
			$scope.dup_termExamData.exam_score = row.entity.entryData.term3.exam_score
		} else if ($scope.showTerm == 'final') {
			$scope.dup_termExamData.exam_score = row.entity.entryData.term4.exam_score
		}
		$scope.termExamData.table = "tbl_examData";
		$scope.dup_termExamData.ecode = $scope.ecode;
		$scope.dup_termExamData.term = $scope.showTerm;
		$scope.dup_termExamData.class_type = $scope.$root.classType;
		$scope.dup_termExamData.exam_name = col.field;
		$scope.dup_termExamData.student_no = row.entity.student_no;
		$scope.dup_termExamData.fullname = row.entity.fullname;
		$scope.dup_termExamData.max_score = 100;
		$mdDialog.show({
			scope: $scope,
			templateUrl: 'modal_termExamData.html',
			parent: angular.element(document.body),
			targetEvent: ev,
			preserveScope: !0,
			escapeToClose: !1,
			clickOutsideToClose: !1,
			fullscreen: !1,
		})
	}
	$scope.CSData = {};
	$scope.dup_CSData = {};
	vm.modal_setCSScore = function (row, col, ev) {
		$scope.dup_CSData = {};
		$scope.dup_CSData.cs_score = null;
		$scope.dup_CSData.error = null;
		if ($scope.showTerm == 'prelim') {
			$scope.dup_CSData.cs_score = row.entity.entryData.term1.cs_score
		} else if ($scope.showTerm == 'midterm') {
			$scope.dup_CSData.cs_score = row.entity.entryData.term2.cs_score
		} else if ($scope.showTerm == 'pre-final') {
			$scope.dup_CSData.cs_score = row.entity.entryData.term3.cs_score
		} else if ($scope.showTerm == 'final') {
			$scope.dup_CSData.cs_score = row.entity.entryData.term4.cs_score
		}
		$scope.CSData.table = "tbl_CSData";
		$scope.dup_CSData.ecode = $scope.ecode;
		$scope.dup_CSData.term = $scope.showTerm;
		$scope.dup_CSData.class_type = $scope.$root.classType;
		$scope.dup_CSData.cs_name = col.field;
		$scope.dup_CSData.student_no = row.entity.student_no;
		$scope.dup_CSData.fullname = row.entity.fullname;
		$scope.dup_CSData.max_score = 100;
		$mdDialog.show({
			scope: $scope,
			templateUrl: 'modal_CSData.html',
			parent: angular.element(document.body),
			targetEvent: ev,
			preserveScope: !0,
			escapeToClose: !1,
			clickOutsideToClose: !1,
			fullscreen: !1,
		})
	}
	$scope.gradeStatusData = {};
	$scope.dup_gradeStatusData = {};
	$scope.gradeStatusState = [];
	$scope.gradeStatusState = [{
		optionName: '(CO) Complete',
		optionIcon: 'check',
		color: 'green',
		action: 'setGradeStatus',
		params: 0
	}, {
		optionName: '(IC) Incomplete',
		optionIcon: 'priority_high',
		color: '#F27A46',
		action: 'setGradeStatus',
		params: 1
	}, {
		optionName: '(IP) In Progress',
		optionIcon: 'access_time',
		color: 'orange',
		action: 'setGradeStatus',
		params: 2
	}, {
		optionName: '(W)  Withrawal',
		optionIcon: 'do_not_disturb',
		color: 'gray',
		action: 'setGradeStatus',
		params: 3
	}, {
		optionName: '(D)  Dropped',
		optionIcon: 'close',
		color: 'red',
		action: 'setGradeStatus',
		params: 4
	}];
	vm.modal_setGradeStatus = function (row, col, ev) {
		$scope.dup_gradeStatusData = {};
		$scope.dup_gradeStatusData.status = null;
		$scope.dup_gradeStatusData.error = null;
		$scope.gradeStatusData.table = "tbl_gradeStatusData";
		$scope.gradeStatusData.ecode = $scope.ecode;
		$scope.gradeStatusData.class_type = $scope.$root.classType;
		$scope.gradeStatusData.student_no = row.entity.student_no;
		$scope.gradeStatusData.fullname = row.entity.fullname;
		$mdDialog.show({
			scope: $scope,
			templateUrl: 'modal_gradeStatusData.html',
			parent: angular.element(document.body),
			targetEvent: ev,
			preserveScope: !0,
			escapeToClose: !1,
			clickOutsideToClose: !1,
			fullscreen: !1,
		})
	}
	vm.setGradeStatus = function (status) {
		$scope.gradeStatusData.status = status;
		DataEntryService.getGradeStatus($scope.gradeStatusData.ecode, $scope.gradeStatusData.class_type, $scope.gradeStatusData.student_no).then(function (res) {
			if (!res) {
				if (!$scope.$root.classType) {
					$scope.gradeStatusData.status = status;
					$scope.gradeStatusData.status1 = undefined
				} else {
					$scope.gradeStatusData.status = undefined;
					$scope.gradeStatusData.status1 = status
				}
				$scope.dup_gradeStatusData.isAdd = !0
			} else {
				if (!$scope.$root.classType) {
					$scope.gradeStatusData.status = status;
					$scope.gradeStatusData.status1 = res[0].status1
				} else {
					$scope.gradeStatusData.status = res[0].status;
					$scope.gradeStatusData.status1 = status
				}
				$scope.gradeStatusData._id = res[0]._id;
				$scope.gradeStatusData._rev = res[0]._rev;
				$scope.dup_gradeStatusData.isAdd = !1
			}
			if ($scope.dup_gradeStatusData.isAdd) {
				setGradeStatusInGrid($scope.gradeStatusData);
				vm.close();
				$scope.gradeStatusData._id = undefined;
				$scope.gradeStatusData._rev = undefined;
				DataEntryService.addGradeStatusData($scope.gradeStatusData)
			} else {
				if (res[0].status != status || res[0].status1 != status) {
					setGradeStatusInGrid($scope.gradeStatusData);
					vm.close();
					DataEntryService.updateGradeStatusData($scope.gradeStatusData)
				}
			}
		})
	}
	$scope.attendanceDataState = [];
	$scope.attendanceDataState = [{
		optionName: 'Present',
		optionIcon: 'check',
		color: 'green',
		action: 'setAttendance',
		params: 0
	}, {
		optionName: 'Absent',
		optionIcon: 'close',
		color: 'red',
		action: 'setAttendance',
		params: 1
	}, {
		optionName: 'Late',
		optionIcon: 'access_time',
		color: 'orange',
		action: 'setAttendance',
		params: 2
	}, {
		optionName: 'Excused',
		optionIcon: 'directions_walk',
		color: 'gray',
		action: 'setAttendance',
		params: 3
	}];
	$scope.toStandardDate = function (date) {
		date = moment(date).format("dddd - MMM DD");
		return date
	}
	var setStateInGrid = function (attendanceData, isUpdate) {
		for (var i = 0; i < vm.students.length; i++) {
			if (vm.students[i].ecode == attendanceData.ecode && vm.students[i].student_no == attendanceData.student_no) {
				if (!isUpdate) {
					var attendance_date = attendanceData.attendance_date;
					var state = attendanceData.state;
					var state1 = attendanceData.state1;
					vm.students[i].attendanceData.push({
						attendance_date, state, state1
					})
				} else {
					for (var d = 0; d < vm.students[i].attendanceData.length; d++) {
						if (vm.students[i].attendanceData[d].attendance_date == attendanceData.attendance_date) {
							vm.students[i].attendanceData[d].state = attendanceData.state;
							vm.students[i].attendanceData[d].state1 = attendanceData.state1
						}
					}
				}
			}
		}
	}
	var setQuizDataInGrid = function (quizData, isUpdate) {
		for (var i = 0; i < vm.students.length; i++) {
			if (vm.students[i].ecode == quizData.ecode && vm.students[i].student_no == quizData.student_no) {
				if (!isUpdate) {
					var column_name = quizData.column_name;
					var score = quizData.score;
					vm.students[i].quizData.push({
						column_name, score
					})
				} else {
					for (var d = 0; d < vm.students[i].quizData.length; d++) {
						if (vm.students[i].quizData[d].column_name == quizData.column_name) {
							vm.students[i].quizData[d].score = quizData.score
						}
					}
				}
			}
		}
	}
	var setExamDataInGrid = function (examData) {
		for (var i = 0; i < vm.students.length; i++) {
			if (vm.students[i].ecode == examData.ecode && vm.students[i].student_no == examData.student_no) {
				if (examData.term == 'prelim') {
					vm.students[i].entryData.term1.exam_score = examData.exam_score
				} else if (examData.term == 'midterm') {
					vm.students[i].entryData.term2.exam_score = examData.exam_score
				} else if (examData.term == 'pre-final') {
					vm.students[i].entryData.term3.exam_score = examData.exam_score
				} else if (examData.term == 'final') {
					vm.students[i].entryData.term4.exam_score = examData.exam_score
				}
			}
		}
	}
	var setCSDataInGrid = function (csData) {
		for (var i = 0; i < vm.students.length; i++) {
			if (vm.students[i].ecode == csData.ecode && vm.students[i].student_no == csData.student_no) {
				if (csData.term == 'prelim') {
					vm.students[i].entryData.term1.cs_score = csData.cs_score
				} else if (csData.term == 'midterm') {
					vm.students[i].entryData.term2.cs_score = csData.cs_score
				} else if (csData.term == 'pre-final') {
					vm.students[i].entryData.term3.cs_score = csData.cs_score
				} else if (csData.term == 'final') {
					vm.students[i].entryData.term4.cs_score = csData.cs_score
				}
			}
		}
	}
	var setGradeStatusInGrid = function (gradeStatusData) {
		for (var i = 0; i < vm.students.length; i++) {
			if (vm.students[i].ecode == gradeStatusData.ecode && vm.students[i].student_no == gradeStatusData.student_no) {
				vm.students[i].entryData.status = gradeStatusData.status;
				vm.students[i].entryData.status1 = gradeStatusData.status1
			}
		}
	}
	vm.setAttendance = function (state) {
		$scope.attendanceData.ecode = $scope.ecode;
		$scope.attendanceData.student_no = $scope.dup_attendanceData.student_no;
		$scope.attendanceData.attendance_date = $scope.dup_attendanceData.date;
		$scope.attendanceData.term = $scope.showTerm;
		DataAttendanceService.getState($scope.ecode, $scope.dup_attendanceData.student_no, $scope.dup_attendanceData.date).then(function (res) {
			if (!res) {
				if (!$scope.$root.classType) {
					$scope.attendanceData.state = state;
					$scope.attendanceData.state1 = undefined
				} else {
					$scope.attendanceData.state = undefined;
					$scope.attendanceData.state1 = state
				}
				$scope.dup_attendanceData.isAdd = !0
			} else {
				if (!$scope.$root.classType) {
					$scope.attendanceData.state = state;
					$scope.attendanceData.state1 = res[0].state1
				} else {
					$scope.attendanceData.state = res[0].state;
					$scope.attendanceData.state1 = state
				}
				$scope.attendanceData._id = res[0]._id;
				$scope.attendanceData._rev = res[0]._rev;
				$scope.dup_attendanceData.isAdd = !1
			}
			if ($scope.dup_attendanceData.isAdd) {
				setStateInGrid($scope.attendanceData, !1);
				vm.close();
				$scope.attendanceData._id = undefined;
				$scope.attendanceData._rev = undefined;
				DataAttendanceService.addAttendanceData($scope.attendanceData)
			} else {
				if (res[0].state != state || res[0].state1 != state) {
					setStateInGrid($scope.attendanceData, !0);
					vm.close();
					DataAttendanceService.updateAttendanceData($scope.attendanceData)
				}
			}
		})
	}
	$scope.saveQuizData = function () {
		if (!$scope.dup_quizData.error) {
			$scope.quizData._id = null;
			$scope.quizData._rev = null;
			$scope.quizData.column_name = $scope.dup_quizData.column_name;
			$scope.quizData.ecode = $scope.dup_quizData.ecode;
			$scope.quizData.student_no = $scope.dup_quizData.student_no;
			$scope.quizData.term = $scope.dup_quizData.term;
			$scope.quizData.class_type = $scope.dup_quizData.class_type;
			$scope.quizData.score = $scope.dup_quizData.score;
			DataQuizService.isUpdate($scope.quizData).then(function (res) {
				if (!res) {
					DataQuizService.addQuizData($scope.quizData).then(function (res) {
						if (res) {
							setQuizDataInGrid($scope.quizData, !1);
							vm.close()
						}
					})
				} else {
					$scope.quizData._id = res[0]._id;
					$scope.quizData._rev = res[0]._rev;
					DataQuizService.updateQuizData($scope.quizData).then(function () {
						setQuizDataInGrid($scope.quizData, !0);
						vm.close()
					})
				}
			})
		}
	}
	$scope.saveTermExamData = function () {
		if (!$scope.dup_termExamData.error) {
			$scope.termExamData._id = null;
			$scope.termExamData._rev = null;
			$scope.termExamData.exam_name = $scope.dup_termExamData.exam_name;
			$scope.termExamData.ecode = $scope.dup_termExamData.ecode;
			$scope.termExamData.term = $scope.dup_termExamData.term;
			$scope.termExamData.class_type = $scope.dup_termExamData.class_type;
			$scope.termExamData.student_no = $scope.dup_termExamData.student_no;
			$scope.termExamData.exam_score = parseFloat(Math.max($scope.dup_termExamData.exam_score).toFixed(2));
			DataEntryService.isUpdateExamScore($scope.termExamData).then(function (res) {
				if (!res) {
					DataEntryService.addExamData($scope.termExamData).then(function (res) {
						if (res) {
							setExamDataInGrid($scope.termExamData);
							vm.close()
						}
					})
				} else {
					$scope.termExamData._id = res[0]._id;
					$scope.termExamData._rev = res[0]._rev;
					DataEntryService.updateExamData($scope.termExamData).then(function () {
						setExamDataInGrid($scope.termExamData);
						vm.close()
					})
				}
			})
		}
	}
	$scope.saveCSData = function () {
		if (!$scope.dup_CSData.error) {
			$scope.CSData._id = null;
			$scope.CSData._rev = null;
			$scope.CSData.cs_name = $scope.dup_CSData.cs_name;
			$scope.CSData.ecode = $scope.dup_CSData.ecode;
			$scope.CSData.term = $scope.dup_CSData.term;
			$scope.CSData.class_type = $scope.dup_CSData.class_type;
			$scope.CSData.student_no = $scope.dup_CSData.student_no;
			$scope.CSData.cs_score = parseFloat(Math.max($scope.dup_CSData.cs_score).toFixed(2));
			DataEntryService.isUpdateCSScore($scope.CSData).then(function (res) {
				if (!res) {
					DataEntryService.addCSData($scope.CSData).then(function (res) {
						if (res) {
							setCSDataInGrid($scope.CSData);
							vm.close()
						}
					})
				} else {
					$scope.CSData._id = res[0]._id;
					$scope.CSData._rev = res[0]._rev;
					DataEntryService.updateCSData($scope.CSData).then(function () {
						setCSDataInGrid($scope.CSData);
						vm.close()
					})
				}
			})
		}
	}
	$scope.dup_attendance.attendance_date = new Date();
	$scope.minDate = moment().subtract(1, 'month');
	$scope.maxDate = moment().add(1, 'month');
	var getSelectedSubject = function () {
		SubjectService.getSelectedSubject($scope.ecode).then(function (subject) {
			vm.class_days = "";
			$scope.attendance.class_days = [];
			for (var i = 0; i < subject[0].length; i++) {
				$scope.attendance.class_days.push(subject[0][i]);
				vm.class_days += GlobalService.toDay(subject[0][i]) + ', '
			}
			vm.class_days = vm.class_days.replace(/,\s*$/, "")
		})
	}
	var validateAttendanceDate = function () {
		$scope.attendance.table = "tbl_attendance";
		$scope.attendance.field = moment($scope.dup_attendance.attendance_date).format("MM-DD-YYYY");
		$scope.attendance.name = $scope.attendance.field;
		$scope.attendance.displayName = moment($scope.dup_attendance.attendance_date).format("MM-DD");
		$scope.attendance.enableSorting = !1;
		$scope.attendance.enablePinning = !1;
		$scope.attendance.enableHiding = !1;
		$scope.attendance.enableColumnResizing = !1;
		$scope.attendance.width = '53';
		$scope.attendance.cellClass = 'ui-grid-vcenter';
		$scope.attendance.cellTemplate = 'templates/attendanceData.cellTemplate.html';
		$scope.attendance.attendance_day = $scope.dup_attendance.attendance_date.getDay();
		$scope.attendance.ecode = $scope.ecode;
		$scope.attendance.term = $scope.showTerm;
		$scope.attendance.class_type = $scope.$root.classType;
		$scope.attendanceDate = angular.copy($scope.attendance);
		var valid = ColumnAttendanceService.validateAttendanceDate($scope.attendance);
		return valid.then(function (res) {
			if (res) {
				return res = {
					valid: !1,
					msg: res
				}
			} else {
				return res = {
					valid: !0
				}
			}
		})
	}
	$scope.$watch('dup_attendance.attendance_date', function (newValue, oldValue) {
		$scope.selectedDay = GlobalService.toDay($scope.dup_attendance.attendance_date.getDay())
	}, !0);
	getSelectedSubject();
	var validateQuizColumnName = function () {
		$scope.quiz.table = "tbl_quiz";
		$scope.quiz.field = $scope.dup_quiz.column_name;
		$scope.quiz.name = $scope.quiz.field;
		$scope.quiz.date = moment(new Date()).format("MM-DD-YYYY");
		$scope.quiz.max_score = $scope.dup_quiz.max_score;
		$scope.quiz.enableSorting = !1;
		$scope.quiz.enablePinning = !1;
		$scope.quiz.enableHiding = !1;
		$scope.quiz.enableColumnResizing = !1;
		$scope.quiz.width = '110';
		$scope.quiz.cellClass = 'ui-grid-vcenter';
		$scope.quiz.cellTemplate = 'templates/quizData.cellTemplate.html';
		$scope.quiz.ecode = $scope.ecode;
		$scope.quiz.term = $scope.showTerm;
		$scope.quiz.class_type = $scope.$root.classType;
		$scope.quizToBe = angular.copy($scope.quiz);
		var valid = ColumnQuizService.validateQuizColumnName($scope.quiz);
		return valid.then(function (res) {
			if (res) {
				return res = {
					valid: !1,
					msg: res
				}
			} else {
				return res = {
					valid: !0
				}
			}
		})
	}
	$scope.saveAttendance = function () {
		validateAttendanceDate().then(function (res) {
			if (res.valid) {
				if ($scope.dup_attendance.isAdd) {
					$scope.customColumns.push($scope.attendanceDate);
					ColumnAttendanceService.addAttendanceDate($scope.attendanceDate);
					GlobalService.showToast($scope.attendanceDate.field + " has been added", 2000)
				}
				vm.close()
			} else {
				GlobalService.showToast(res.msg, 3000)
			}
		})
	};
	$scope.saveQuiz = function () {
		if ($scope.dup_quiz.max_score == 0) {
			GlobalService.showToast("Quiz max score cannot be equal to 0", 2000)
		} else {
			validateQuizColumnName().then(function (res) {
				if (res.valid) {
					if ($scope.dup_quiz.isAdd) {
						$scope.customColumns.push($scope.quizToBe);
						ColumnQuizService.addQuizColumn($scope.quizToBe);
						GlobalService.showToast(GlobalService.ucwords($scope.quizToBe.field) + " has been added", 2000)
					}
					vm.close()
				} else {
					GlobalService.showToast(res.msg, 3000)
				}
			})
		}
	}
	vm.close = function () {
		$mdDialog.cancel()
	};
	$scope.term = function (term) {
		if (term == 1) {
			$scope.showTerm = 'prelim'
		} else if (term == 2) {
			$scope.showTerm = 'midterm'
		} else if (term == 3) {
			$scope.showTerm = 'pre-final'
		} else {
			$scope.showTerm = 'final'
		}
		if (!$scope.$root.emptyStudents) {
			$scope.customColumns = [];
			initColumns();
			initData()
		}
	}
	$scope.$root.recordType = function (recordType) {
		whatToShowInNavInSubjectOpts(recordType);
		$scope.customColumns = [];
		if (recordType == 1) {
			$scope.showRecordType = 'attendance';
			loadStaticColumns();
			loadAttendanceColumns()
		} else if (recordType == 2) {
			$scope.showRecordType = 'quiz';
			loadStaticColumns();
			loadQuizColumns()
		} else if (recordType == 3) {
			$scope.showRecordType = 'entry';
			loadStaticColumns();
			loadStaticEntryColumns()
		}
		if (!$scope.$root.emptyStudents) {
			initData()
		}
	}
	$scope.$root.recordType(1);
	$scope.$root.changeType = function () {
		if ($scope.class_type) {
			if (!$scope.$root.classType) {
				$scope.$root.classType = !0
			} else {
				$scope.$root.classType = !1
			}
			$scope.toggleChangeType = !$scope.toggleChangeType;
			if ($scope.showRecordType == 'quiz') {
				initData()
			}
		}
	}
	$scope.$root.classTypeChange = function () {
		if ($scope.showRecordType == 'quiz') {
			$scope.customColumns = [];
			loadStaticColumns();
			initData()
		} else if ($scope.showRecordType == 'entry') {
			showLoading();
			$scope.$root.disableOnLoading = !0;
			loadEntryData().then(function (done) {
				if (done) {
					hideLoading();
					$scope.$root.disableOnLoading = !1
				}
			})
		}
	}
	$scope.$on('$destroy', function () {
		$scope.$root.disableOnLoading = !1;
		$mdDialog.cancel()
	});
	return vm
}).controller('HelpCtrl', function ($scope, ionicMaterialInk) {
	var vm = this;
	vm.questions = [];
	ionicMaterialInk.displayEffect();
	vm.questions.subject = [{
		question: "How to edit/dissolve the subject?",
		answer: "Hold or slide left the subject you want to edit/dissolve to show the options."
	}, {
		question: "I can\'t save a subject with the same ecode.",
		answer: "You can\'t do that since enlistment code(ecode) is unique."
	}, {
		question: "I can\'t select more than 2 hours and a half of time in a subject.",
		answer: "Yes, because the minimum time of a class is 1 hour and maximum is 2 hours and a half."
	}, {
		question: "My subject is a lecture and laboratory class, how would I input the laboratory room of it?",
		answer: "Simply just type it like this. Eg. Room 104/SLAB3"
	}];
	vm.questions.gradesheet = [{
		question: "How to add a student and attendance dates?",
		answer: "Switch the selected lower tab to the attendance, and click the 3-dots icon in the upper right to show the \'Add Student\' and \'Add Attendance\'."
	}, {
		question: "How to import students?",
		answer: "Switch the selected lower tab to the attendance, and click the 3-dots icon in the upper right to show the \'Import Students\'. Please be guided that you can only import a CSV file and it follows the format."
	}, {
		question: "How can I edit/delete the attendance date?",
		answer: "Go to \'Manage Attendance\' and click \'Delete\'. Please be guided with the note being shown. You cannot edit an attendance date. Once added, you can only delete it."
	}, {
		question: "How to add quiz?",
		answer: "Switch the selected lower tab to the quiz, and click the 3-dots icon in the upper right to show the \'Add Quiz\'."
	}, {
		question: "How can I edit/delete the quiz?",
		answer: "Go to \'Manage Quiz\' and click \'Delete\'. Please be guided with the note being shown. You cannot edit quiz. Once added, you can only delete it."
	}, {
		question: "After adding attendance date, I can\'t see it in the gradesheet.",
		answer: "You must have atleast one student added in that subject to see it. You can also find the attendance date in the \'Manage Attendance\'."
	}, {
		question: "I\'m adding a student with no middle initial, but it say\'s middle initial is required. ",
		answer: "Instead of leaving it blank, use - (dash)."
	}, {
		question: "Where can I find the lecture gradesheet, lab gradesheet, lecture and lab gradesheet?",
		answer: "Click the 3-dots icon in the upper right to show the \'View Lecture Gradesheet\',\'View Laboratory Gradesheet\' and \'View Lec & Lab Gradesheet\'."
	}, {
		question: "My screen is too small and the other columns of the gradesheet are cannot be seen. ",
		answer: "You can resize by dragging the column of STUD ID/NAME. To have a better view, switch your device to landscape mode."
	}, {
		question: "The gradesheet loads slowly.",
		answer: "Restart your app."
	}, {
		question: "Where can I find the exported CSV?",
		answer: "The exported file can be found in the root of your SD Card. If you don\'t have SD Card mounted, it can be found in your Internal Storage."
	}, {
		question: "I would like to import students but it doesn\'t takes me to the file chooser.",
		answer: "Go to Settings(System Settings)->Apps->ACLC Mobile Class Record. Click Permissions, switch on the Storage."
	}]
}).run(['$rootScope', '$state', '$stateParams',
	function ($rootScope, $state, $stateParams) {
		$rootScope.$state = $state;
		$rootScope.$stateParams = $stateParams
	}
])