var app = angular.module('myApp', ['ionic', 'ngCordova', 'ngCordova.plugins.file', 'app.controllers', 'ngMaterial', 'ngSanitize', 'angular-bind-html-compile', 'ionic-material', 'ngMdIcons', 'ionMdInput', 'ionic-native-transitions', 'ui.grid', 'ui.grid.pinning', 'ui.grid.cellNav', 'ui.grid.autoResize', 'ui.grid.resizeColumns', 'ui.grid.exporter', 'ui.grid.importer', 'ionic-multiselect', 'ui.router', 'ngMessages', 'rcForm', 'ngAnimate', 'material.svgAssetsCache', 'ngMaterialDatePicker']).run(function ($ionicPlatform) {
	$ionicPlatform.ready(function () {
		if (window.cordova && window.cordova.plugins.Keyboard) {
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(!0)
		}
		if (window.StatusBar) {
			StatusBar.styleDefault()
		}
		document.addEventListener('deviceready', function () {
			try {
				navigator.splashscreen.hide()
			} catch (e) {}
		}, !1)
	})
}).config(function ($ionicNativeTransitionsProvider) {
	$ionicNativeTransitionsProvider.setDefaultOptions({
		duration: 400,
		slowdownfactor: 4,
		iosdelay: -1,
		androiddelay: -1,
		winphonedelay: -1,
		fixedPixelsTop: 0,
		fixedPixelsBottom: 0,
		triggerTransitionEvent: '$ionicView.afterEnter',
		backInOppositeDirection: !1
	})
}).config(function ($ionicNativeTransitionsProvider) {
	$ionicNativeTransitionsProvider.setDefaultTransition({
		type: 'slide',
		direction: 'left'
	})
}).config(function ($ionicNativeTransitionsProvider) {
	$ionicNativeTransitionsProvider.setDefaultBackTransition({
		type: 'slide',
		direction: 'right'
	})
}).config(function ($ionicConfigProvider) {
	$ionicConfigProvider.scrolling.jsScrolling(!1)
}).config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
	$ionicConfigProvider.views.maxCache(0);
	$urlRouterProvider.otherwise("/login");
	$stateProvider.state('app', {
		cache: !0,
		url: "/app",
		abstract: !0,
		templateUrl: 'templates/menu.html',
		controller: 'AppCtrl'
	}).state('login', {
		cache: !1,
		url: '/login',
		templateUrl: 'templates/login.html',
		controller: 'LoginCtrl'
	}).state("app.home", {
		cache: !1,
		url: "/home",
		views: {
			'menuContent': {
				templateUrl: "templates/home.html",
				controller: "HomeCtrl as vm"
			}
		}
	}).state("app.subject", {
		cache: !1,
		url: "/subject",
		views: {
			'menuContent': {
				templateUrl: "templates/subject.html",
				controller: "SubjectCtrl as vm"
			}
		}
	}).state("app.setting", {
		cache: !1,
		url: "/setting",
		views: {
			'menuContent': {
				templateUrl: "templates/setting.html",
				controller: "SettingCtrl as vm"
			}
		}
	}).state("app.help", {
		cache: !1,
		url: "/help",
		views: {
			'menuContent': {
				templateUrl: "templates/help.html",
				controller: "HelpCtrl as vm"
			}
		}
	}).state("app.help_subjects", {
		cache: !1,
		url: "/help_subjects",
		views: {
			'menuContent': {
				templateUrl: "templates/help.subjects.html",
				controller: "HelpCtrl as vm"
			}
		}
	}).state("app.help_gradesheet", {
		cache: !1,
		url: "/help_gradesheet",
		views: {
			'menuContent': {
				templateUrl: "templates/help.gradesheet.html",
				controller: "HelpCtrl as vm"
			}
		}
	}).state("app.in-subject", {
		cache: !1,
		url: "/subject/:ecode/:subject_title/:class_type",
		views: {
			'menuContent': {
				templateUrl: "templates/in-subject.html",
				controller: "InSubjectCtrl as vm"
			}
		}
	})
})