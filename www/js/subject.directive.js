(function () {
	app.directive('ngLastRepeat', function ($timeout) {
		return {
			restrict: 'A',
			link: function (scope, element, attr) {
				if (scope.$last === !0) {
					$timeout(function () {
						scope.$emit('ngLastRepeat' + (attr.ngLastRepeat ? '.' + attr.ngLastRepeat : ''))
					})
				}
			}
		}
	})
}())