/*
 * jquery.dateRangePicker
 * https://elohr.me/
 *
 * Copyright (c) 2014 elohr
 * Licensed under the MIT license.
 */

function DateRangePicker(element, options) {
    'use strict';

    var d = {
    	customLanguage: false,

    	initialElement: undefined,
    	untilElement: undefined,
		specificDaysDoubleClickTimeout: undefined,

		shiftKeyIsPressed: false,
		controlKeyIsPressed: false,
		isMouseDown: false,

		lastMonthDoubleClicked: undefined,

		months: [],

		initialMonthPosition: {
			left: 0,
			top: 0
		},

		specificDaysSelected: 0,

		// DOM Elements
		dateRangeElement:window.jQuery('<div/>', {
            class: 'drp-element'
        }),

        dateRangeElementFrom:window.jQuery('<span/>', {
            class: 'drp-from'
        }),

        dateRangeElementSeparator:window.jQuery('<span/>', {
            class: 'drp-separator'
        }),

        dateRangeElementTo:window.jQuery('<span/>', {
            class: 'drp-to'
        }),

		overlay: window.jQuery('<div/>', {
            class: 'drp-overlay'
        }),

        dailyPopup: window.jQuery('<div/>', {
            class: 'drp-daily-popup'
        }),

        mainPopup: window.jQuery('<div/>', {
            class: 'drp-popup'
        }),

		activeMonthsWrapper: window.jQuery('<div/>', {
            class: 'drp-active'
        }),

        selectedDateContainer: window.jQuery('<div />', {
        	class: 'drp-selected-date'
        }),

        selectedDateForm: window.jQuery('<form />'),

        fromDateSpan: window.jQuery('<span />', {
        	class: 'drp-from-date'
        }),
        
        toDateSpan: window.jQuery('<span />', {
        	class: 'drp-to-date'
        }),

        rangeSeparator: window.jQuery('<span />', {
        	class: 'drp-date-range-separator'
        }),

        fromDateHiddenField: window.jQuery('<input />', {
        	type: 'hidden'
        }),

        toDateHiddenField: window.jQuery('<input />', {
        	type: 'hidden'
        }),

		// Month Names
		monthShortNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
		monthShortNamesSpanish: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],

		monthLongNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
		monthLongNamesSpanish: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],

		// Weekday Names
		dayShortNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
		dayShortNamesSpanish: ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],

		dayLongNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
		dayLongNamesSpanish: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],

		// Preset Ranges
		today: 'today',
		tomorrow: 'tomorrow',
		yesterday: 'yesterday',

		thisWeek: 'this week',
		thisMonth: 'this month',
		thisYear: 'this year',
		lastYear: 'last year',

		todaySpanish: 'hoy',
		tomorrowSpanish: 'mañana',
		yesterdaySpanish: 'ayer',

		thisWeekSpanish: 'esta semana',
		thisMonthSpanish: 'este mes',
		thisYearSpanish: 'este año',
		lastYearSpanish: 'año pasado',

		init: function() {
			var daysInMonthContainer,
				dateParts,
				addingYear, startDateYear, endDateYear, yearContainer;

			$(element).after(d.dateRangeElement);

			if(options.customClass) {
				d.dateRangeElement.addClass(options.customClass);
			}

			if(options.width) {
				d.dateRangeElement.css('width', options.width);
			}

			d.dateRangeElement.append('<div></div>');
			d.dateRangeElement.children().append(d.dateRangeElementFrom, [d.dateRangeElementSeparator, d.dateRangeElementTo]);
			$(element).hide();

			if(options.customClass) {
				$(element).addClass(options.customClass);
			}

			// Add elements to dailyPopup
			d.dailyPopup.append('<div class="drp-days-in-month"></div>');
			daysInMonthContainer = d.dailyPopup.children();

			// If the week starts on Monday and is not a custom language then reorder weekdays
			// If it is a custom language then we expect that days are already in the correct order
			if(options.startWeekOnMonday && !d.customLanguage) {
				options.dayShortNames = [options.dayShortNames[1], options.dayShortNames[2], options.dayShortNames[3], options.dayShortNames[4], options.dayShortNames[5], options.dayShortNames[6], options.dayShortNames[0]]
				options.dayLongNames = [options.dayLongNames[1], options.dayLongNames[2], options.dayLongNames[3], options.dayLongNames[4], options.dayLongNames[5], options.dayLongNames[6], options.dayLongNames[0]]
			}

			for (var i = options.dayShortNames.length - 1; i >= 0; i--) {
				daysInMonthContainer.prepend('<span class="drp-day-title">' + options.dayShortNames[i].substring(0, 1) + '</div>');
			}

			d.dailyPopup.append('<div class="drp-days-detail"></div>');

			// Add elements to mainPopup
			d.mainPopup.append('<div class="drp-standard-dates">' +
				                '<span class="drp-option drp-o1">' + options.today + '</span>' +
				                '<span class="drp-option drp-o2">' + options.thisWeek + '</span>' +
				                '<span class="drp-option drp-o3">' + options.thisMonth + '</span>' +
				                '<span class="drp-option drp-o4">' + options.thisYear + '</span>' +
				                '<span class="drp-option drp-o5">' + options.lastYear + '</span>' +
				            '</div>');

			// Check if dates are dates or strings
			if(typeof options.startDate == "string") { // Expected format is YYYY-MM-DD
				dateParts = options.startDate.split('-');
				options.startDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
				addingYear = parseInt(dateParts[0]);
				startDateYear = parseInt(dateParts[0]);
			}

			if(typeof options.endDate == "string") { // Expected format is YYYY-MM-DD
				dateParts = options.endDate.split('-');
				options.endDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
				endDateYear = parseInt(dateParts[0]);
			}

			// Add year containers
			while(addingYear <= endDateYear) {
				d.mainPopup.append('<div class="drp-year"></div>');
				yearContainer = d.mainPopup.children(':last');

				if(addingYear === startDateYear) {
					for (var i = 0; i <= 11; i++) {
						if(i < options.startDate.getMonth()) {
							yearContainer.append('<div class="drp-month-empty">&nbsp;</div>');
						} else {
							yearContainer.append(d.createMonthElement(addingYear, i + 1, options.monthShortNames[i]));
							d.months.push(yearContainer.children(':last')[0]);
							$(d.months[d.months.length - 1])
								.on('mousedown touchstart', d.monthMouseDown)
								.on('mouseover drag', d.monthMouseOver)
								.on('doubletap', d.monthDoubleClick);
						}
					}
				}

				if(addingYear === endDateYear) {
					for (var i = options.endDate.getMonth(); i >= 0; i--) {
						yearContainer.prepend(d.createMonthElement(addingYear, i + 1, options.monthShortNames[i]));
						d.months.push(yearContainer.children(':first')[0]);
						$(d.months[d.months.length - 1])
							.on('mousedown touchstart', d.monthMouseDown)
							.on('mouseover drag', d.monthMouseOver)
							.on('doubletap', d.monthDoubleClick);
					}
				}

				if(addingYear !== startDateYear && addingYear !== endDateYear) {
					for (var i = 11; i >= 0; i--) {
						yearContainer.prepend(d.createMonthElement(addingYear, i + 1, options.monthShortNames[i]));
						d.months.push(yearContainer.children(':first')[0]);
						$(d.months[d.months.length - 1])
							.on('mousedown touchstart', d.monthMouseDown)
							.on('mouseover drag', d.monthMouseOver)
							.on('doubletap', d.monthDoubleClick);
					}
				}

				yearContainer.prepend('<div class="drp-year-value">' + addingYear + '</div>');
				yearContainer.children(':first').click(d.yearClick);
				addingYear += 1;
			}

			d.fromDateSpan.text(options.selectDateText);
			d.toDateSpan.text(options.selectDateText);
			d.rangeSeparator.text(options.toText);

			d.selectedDateForm.append(d.fromDateSpan);
			d.selectedDateForm.append(d.rangeSeparator);
			d.selectedDateForm.append(d.toDateSpan);
			d.selectedDateContainer.append(d.selectedDateForm);
			d.mainPopup.append(d.selectedDateContainer);

			d.fromDateHiddenField.attr('name', options.fromDateHiddenFieldName);
			d.toDateHiddenField.attr('name', options.toDateHiddenFieldName);

			// Events
			d.overlay.click(d.close);
			d.fromDateSpan.click(d.fromDateClicked);
			d.toDateSpan.click(d.toDateClicked);
			d.dailyPopup.children(':last').on('click', '.drp-day-select', d.dayClick);
			d.mainPopup.children(':first').children().click(d.predefinedOptionClick);

			// Append elements to DOM
			$(document.body).append(d.overlay, [d.dailyPopup, d.mainPopup]);
			$(element).after(d.fromDateHiddenField);
			$(element).after(d.toDateHiddenField);

			options.initialized();
		},

		open: function() {
			var fromDateText = d.fromDateSpan.text(),
				toDateText = d.toDateSpan.text(),
				fromDate = d.parseToDate(fromDateText);

			d.overlay.show();

			d.mainPopup.show().css({
			    left: ($(window).width() - d.mainPopup.outerWidth()) / 2,
			    top: d.dateRangeElement.offset().top + 24
			});

			d.dailyPopup.show().css({
			    left: ($(window).width() - d.dailyPopup.outerWidth()) / 2,
			    top: d.dateRangeElement.offset().top + 24
			});

			if(d.initialElement) {
				d.makeSelection(d.untilElement, d.initialElement);
			}

			d.fromDateSpan.text(fromDateText);
			d.toDateSpan.text(toDateText);

			if(fromDate) {
				d.excludeMonthPartsFromStartDate(fromDate.split('-')[2]);
				d.excludeMonthPartsFromEndDate(d.parseToDate(toDateText).split('-')[2]);
			}

			options.popupOpened();
		},

		close: function() {
			if(d.fromDateSpan.text() !== options.selectDateText && d.toDateSpan.text() !== options.selectDateText) {
				d.dateRangeElementFrom.text(d.fromDateSpan.text());
				d.dateRangeElementSeparator.text(options.toText);
				d.dateRangeElementTo.text(d.toDateSpan.text());

				d.fromDateHiddenField.val(d.parseToDate(d.fromDateSpan.text()));
				d.toDateHiddenField.val(d.parseToDate(d.toDateSpan.text()));
			} else {
				d.dateRangeElementFrom.text('');
				d.dateRangeElementSeparator.text('');
				d.dateRangeElementTo.text('');
			}

			d.overlay.hide();
			d.mainPopup.hide();
			d.dailyPopup.hide();

			d.clearSelection();
			options.popupClosed();
		},

		fillTextBoxes: function() {
			var datePartsInitial,
				datePartsFinal,
				date;

			if($('.drp-hovering').length === 0) {
				datePartsInitial = $('.drp-active:first').children(':first').attr('data-value').split('-');
				date = new Date(datePartsInitial[0], parseInt(datePartsInitial[1]) - 1, datePartsInitial[2]);

				if(date < options.startDate) {
					datePartsInitial[0] = options.startDate.getFullYear();
					datePartsInitial[1] = options.startDate.getMonth() + 1;
					datePartsInitial[2] = options.startDate.getDate();
				}

				d.fromDateSpan.text(d.parseToString(datePartsInitial[0] + '-' + datePartsInitial[1] + '-' + datePartsInitial[2]));

				datePartsFinal = $('.drp-active:last').children(':last').attr('data-value').split('-');
				date = new Date(datePartsFinal[0], parseInt(datePartsFinal[1]), 0);

				if(date > options.endDate) {
					datePartsFinal[0] = options.endDate.getFullYear();
					datePartsFinal[1] = options.endDate.getMonth() + 1;
					datePartsFinal[2] = options.endDate.getDate();

					d.toDateSpan.text(d.parseToString(datePartsFinal[0] + '-' + datePartsFinal[1] + '-' + datePartsFinal[2]));
				} else {
					d.toDateSpan.text(d.parseToString(datePartsFinal[0] + '-' + datePartsFinal[1] + '-0'));
				}
			}
		},

		createMonthElement: function(year, month, monthName) {
			return '<div class="drp-month" data-value="' + year + '-' + month + '-1">' +
		        '<div class="drp-status">' +
		            '<div class="drp-status1"></div>' +
		            '<div class="drp-status2"></div>' +
		            '<div class="drp-status3"></div>' +
		            '<div class="drp-status4"></div>' +
		        '</div>' + monthName +
		    '</div>';
		},

		clearSelection: function(keepExcludedDays) {
			if(d.dailyPopup.hasClass('drp-daily-popup-show')) {
				d.hideDailyPopup();
			}

			if(keepExcludedDays === undefined || keepExcludedDays === null || keepExcludedDays === false) {
				$('.drp-exclude').removeClass('drp-exclude');
				d.specificDaysSelected = 0;
			}

			d.lastMonthDoubleClicked = null;
			$('.drp-hovering').removeClass('drp-hovering');

			$('.drp-current-preset-pick').removeClass('drp-current-preset-pick');
			$('.drp-active').children().unwrap();
			$('.drp-status').removeClass('drp-active-status');
			$('.drp-initial').removeClass('drp-initial');
		},

		fromDateClicked: function() {
			var t = $(this),
				text = t.text();

			options.fromDateClicked();
			d.clearSelection();

			t.hide();
			t.after('<input type="text" class="drp-textbox" />');
			t.next().val(text).focus().select().on('keydown', function(e) {
				var newText,
					newDate;

				if(e.which === 9 || e.which === 13 || e.which === 27) {
					e.preventDefault();

					if(e.which !== 27) {
						newText = $(this).val();

						if(newText.trim().length > 0) {
							newDate = d.parseToDate(newText);

							if(newDate !== null) {
								t.text(d.parseToString(newDate));
							}
						}
					}

					$(this).remove();
					t.show();

					if(d.checkEndIsAfterStart()) {
						d.markMonthSelection();
					}
				}
			}).on('blur', function() {
				var newText,
					newDate;

				newText = $(this).val();

				if(newText.trim().length > 0) {
					newDate = d.parseToDate(newText);

					if(newDate !== null) {
						t.text(d.parseToString(newDate));
					}
				}

				$(this).remove();
				t.show();

				if(d.checkEndIsAfterStart()) {
					d.markMonthSelection();
					options.fromDateEnteredManually();
				}
			});
		},

		toDateClicked: function() {
			var t = $(this),
				text = t.text();

			d.clearSelection();
			options.toDateClicked();

			t.hide();
			t.after('<input type="text" class="drp-textbox" />');
			t.next().val(text).focus().select().on('keydown', function(e) {
				var newText,
					newDate;

				if(e.which === 9 || e.which === 13 || e.which === 27) {
					e.preventDefault();

					if(e.which !== 27) {
						newText = $(this).val();

						if(newText.trim().length > 0) {
							newDate = d.parseToDate(newText, true);

							if(newDate !== null) {
								t.text(d.parseToString(newDate));
							}
						}
					}

					$(this).remove();
					t.show();

					if(d.checkEndIsAfterStart()) {
						d.markMonthSelection();
					}
				}
			}).on('blur', function() {
				var newText,
					newDate;

				newText = $(this).val();

				if(newText.trim().length > 0) {
					newDate = d.parseToDate(newText, true);

					if(newDate !== null) {
						t.text(d.parseToString(newDate));
					}
				}

				$(this).remove();
				t.show();

				if(d.checkEndIsAfterStart()) {
					d.markMonthSelection();
					options.toDateEnteredManually();
				}
			});
		},

		markMonthSelection: function() {
			var fromDateText = d.fromDateSpan.text(),
				toDateText = d.toDateSpan.text(),
				datePartsInitial = d.parseToDate(fromDateText).split('-'),
				datePartsFinal = d.parseToDate(toDateText).split('-'),
				start = d.findMonthDOMElement(datePartsInitial),
				end = d.findMonthDOMElement(datePartsFinal);

			if(start && end && fromDateText !== options.selectDateText && toDateText !== options.selectDateText) {
				d.makeSelection(end, start);
				d.fromDateSpan.text(fromDateText);
				d.toDateSpan.text(toDateText);
				d.excludeMonthPartsFromStartDate(datePartsInitial[2]);
				d.excludeMonthPartsFromEndDate(datePartsFinal[2]);
			}
		},

		findMonthDOMElement: function(dateParts) {
			var m;

			d.mainPopup.find('.drp-year-value').each(function() {
				if($(this).text() == dateParts[0]) { // Year
					$(this).nextAll('.drp-month').each(function() {
						if($(this).text() == options.monthShortNames[parseInt(dateParts[1]) - 1]) { // Month
							m = $(this);
							return false;
						}
					});
					
					return false;
				}
			});

			return m;
		},

		checkEndIsAfterStart: function() {
			var datePartsInitial = d.parseToDate(d.fromDateSpan.text()).split('-'),
				datePartsFinal = d.parseToDate(d.toDateSpan.text()).split('-');

			if(d.toDateSpan.text() !== options.selectDateText && new Date(datePartsInitial[0], parseInt(datePartsInitial[1]) - 1, datePartsInitial[2]) > new Date(datePartsFinal[0], parseInt(datePartsFinal[1]) - 1, datePartsFinal[2])) {
				d.fromDateSpan.text(options.selectDateText).removeClass('drp-hovering');
				d.toDateSpan.text(options.selectDateText).removeClass('drp-hovering');
				d.clearSelection();

				alert(options.wrongDateRangeMessage);
				return false;
			}

			return true;
		},

		parseToString: function(date) {
			var dateParts = date.split('-'),
				m = parseInt(dateParts[1]),
				d = parseInt(dateParts[2]),
				dateForLastDay = new Date(dateParts[0], m - 1, d);

			if(d === 0) {
				dateForLastDay = new Date(dateParts[0], m, d);
			}

			return options.monthShortNames[m - 1] + ' ' + dateForLastDay.getDate() + ', ' + dateParts[0];
		},

		checkDateRange: function(date) {
			if(date < options.startDate) {
				return options.startDate;
			} else if(date > options.endDate) {
				return options.endDate;
			} else {
				return date;
			}
		},

		parseToDate: function(dateString, showLastDayOfMonth) {
			var dateParts = dateString.split(/[\s,]+/),
				year, month, day,
				weekDayNum, monthNum,
				dateForLastDay, returnString, date;

			dateParts[0] = dateParts[0].toTitleCase();

			if(dateParts.length === 3) {
				// Month
				for (var i = options.monthShortNames.length - 1; i >= 0; i--) {
					if(dateParts[0].startsWith(options.monthShortNames[i])) {
						month = i + 1;
						break;
					}
				}

				// Day
				day = dateParts[1];

				// Year
				year = dateParts[2];
			} else if(dateParts.length === 2) {
				// Month
				for (var i = options.monthShortNames.length - 1; i >= 0; i--) {
					if(dateParts[0].startsWith(options.monthShortNames[i])) {
						month = i + 1;
						break;
					}
				}

				// Year
				year = dateParts[1];

				// Day
				if(showLastDayOfMonth) {
					dateForLastDay = new Date(year, month, 0);
					day = dateForLastDay.getDate();
				} else {
					day = 1;
				}
			} else {
				dateParts[0] = dateParts[0].replace('-', '/');
				date = new Date(dateParts[0]);

				if(date.isValidDate()) {
					year = date.getFullYear();
					month = date.getMonth() + 1;
					day = date.getDate();
				} else {
					// Parse things as today, tomorrow, yesterday, (days of week), (month names)
					date = new Date();

					if(options.today.toLowerCase().startsWith(dateParts[0].toLowerCase())) {
						year = date.getFullYear();
						month = date.getMonth() + 1;
						day = date.getDate();
					} else if(options.tomorrow.toLowerCase().startsWith(dateParts[0].toLowerCase())) {
						date = date.addDays(1);
						year = date.getFullYear();
						month = date.getMonth() + 1;
						day = date.getDate();
					} else if(options.yesterday.toLowerCase().startsWith(dateParts[0].toLowerCase())) {
						date = date.addDays(-1);
						year = date.getFullYear();
						month = date.getMonth() + 1;
						day = date.getDate();
					} else { // check days of week and then month names
						for (var i = options.dayLongNames.length - 1; i >= 0; i--) {
							if(options.dayLongNames[i].toLowerCase().startsWith(dateParts[0].toLowerCase())) {
								weekDayNum = i;
								break;
							}
						}

						if(weekDayNum !== undefined) {
							if(weekDayNum < date.getDay()) {
								date = date.addDays(weekDayNum - date.getDay());
							} else {
								date = date.addDays(-((date.getDay() + 6) - weekDayNum));
							}

							year = date.getFullYear();
							month = date.getMonth() + 1;
							day = date.getDate();
						} else {
							for (var i = options.monthLongNames.length - 1; i >= 0; i--) {
								if(options.monthLongNames[i].toLowerCase().startsWith(dateParts[0].toLowerCase())) {
									monthNum = i;
									break;
								}
							}

							if(monthNum !== undefined) {
								if(monthNum < date.getMonth()) {
									date = date.addMonths(monthNum - date.getMonth());
								} else if(monthNum > date.getMonth()) {
									date = date.addMonths(-((date.getMonth() + 12) - monthNum));
								}

								year = date.getFullYear();
								month = date.getMonth() + 1;
								if(showLastDayOfMonth) {
									dateForLastDay = new Date(year, month, 0);
									day = dateForLastDay.getDate();
								} else {
									day = 1;
								}
							}
						}
					}
				}
			}

			if(year !== undefined) {
				returnString = year + '-' + month + '-' + day;
				console.log(returnString);
				date = new Date(returnString);

				if(d.checkDateRange(date) !== date) {
					date = d.checkDateRange(date);
					returnString = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
				}

				if(date.isValidDate()) {
					return returnString;
				} else {
					return null;
				}
			} else {
				return null;
			}	
		},

		makeSelection: function(untilElement, initialElement, keepExcludedDays) {
			var yearContainer,
				untilElementPosition;

			d.clearSelection(keepExcludedDays);

			if(initialElement) {
				d.initialElement = initialElement;
				d.initialElement.addClass('drp-initial');

				d.initialMonthPosition = {
					left: $(initialElement).position().left,
					top: $(initialElement).position().top
				};
			}

			yearContainer = d.initialElement.parent();

			d.untilElement = untilElement;

			untilElementPosition = {
				left: $(d.untilElement).position().left,
				top: $(d.untilElement).position().top,
			};

			if(untilElementPosition.top === d.initialMonthPosition.top) {
				if(untilElementPosition.left > d.initialMonthPosition.left) {
					d.initialElement.nextUntil(untilElement, '.drp-month').andSelf().add(untilElement).wrapAll(d.activeMonthsWrapper).children('.drp-status').addClass('drp-active-status');
				} else if(untilElementPosition.left < d.initialMonthPosition.left) {
					d.initialElement.prevUntil(untilElement, '.drp-month').andSelf().add(untilElement).wrapAll(d.activeMonthsWrapper).children('.drp-status').addClass('drp-active-status');
				} else {
					d.initialElement.wrap(d.activeMonthsWrapper).children('.drp-status').addClass('drp-active-status');
				}
			} else {
				// Check from which year is the selected month
				if(untilElementPosition.top > d.initialMonthPosition.top) {
					d.initialElement.nextAll('.drp-month').andSelf().wrapAll(d.activeMonthsWrapper).children('.drp-status').addClass('drp-active-status');
					yearContainer = yearContainer.next('.drp-year');

					while(yearContainer.has(untilElement).length === 0) {
						yearContainer.children('.drp-month').wrapAll(d.activeMonthsWrapper).children('.drp-status').addClass('drp-active-status');
						yearContainer = yearContainer.next('.drp-year');
					}

					untilElement.prevAll('.drp-month').andSelf().wrapAll(d.activeMonthsWrapper).children('.drp-status').addClass('drp-active-status');
				} else if(untilElementPosition.top < d.initialMonthPosition.top) {
					d.initialElement.prevAll('.drp-month').andSelf().wrapAll(d.activeMonthsWrapper).children('.drp-status').addClass('drp-active-status');
					yearContainer = yearContainer.prev('.drp-year');

					while(yearContainer.has(untilElement).length === 0) {
						yearContainer.children('.drp-month').wrapAll(d.activeMonthsWrapper).children('.drp-status').addClass('drp-active-status');
						yearContainer = yearContainer.prev('.drp-year');
					}

					untilElement.nextAll('.drp-month').andSelf().wrapAll(d.activeMonthsWrapper).children('.drp-status').addClass('drp-active-status');
				}
			}

			if(keepExcludedDays === undefined || keepExcludedDays === null || keepExcludedDays === false) {
				d.fillTextBoxes();
			}
		},

		predefinedOptionClick: function() {
			var t = $(this),
				text = t.text(),
				date = new Date(),
				start, end;

			d.clearSelection();

			if(text === options.today) {
				date = d.checkDateRange(date);

				for (var i = d.months.length - 1; i >= 0; i--) {
					if($(d.months[i]).attr('data-value') === date.getFullYear() + '-' + (date.getMonth() + 1) + '-1') {
						d.makeSelection($(d.months[i]), $(d.months[i]));
						$(d.months[i]).children(':first').children().addClass('drp-exclude');
						break;
					}
				}

				d.fromDateSpan.text(d.parseToString(date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()));
				d.toDateSpan.text(d.parseToString(date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()));
			} else if(text === options.thisWeek) {
				date = date.addDays(-date.getDay());

				if(options.startWeekOnMonday) {
					date = date.addDays(1);
				}

				date = d.checkDateRange(date);

				for (var i = d.months.length - 1; i >= 0; i--) {
					if($(d.months[i]).attr('data-value') === date.getFullYear() + '-' + (date.getMonth() + 1) + '-1') {
						start = $(d.months[i]);
						break;
					}
				}

				date = date.addDays(6);

				if(options.startWeekOnMonday) {
					date = date.addDays(1);
				}

				date = d.checkDateRange(date);

				for (var i = d.months.length - 1; i >= 0; i--) {
					if($(d.months[i]).attr('data-value') === date.getFullYear() + '-' + (date.getMonth() + 1) + '-1') {
						end = $(d.months[i]);
						break;
					}
				}

				d.makeSelection(end, start);

				date = new Date();
				date = date.addDays(-date.getDay());

				if(options.startWeekOnMonday) {
					date = date.addDays(1);
				}

				date = d.checkDateRange(date);

				d.fromDateSpan.text(d.parseToString(date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()));

				d.excludeMonthPartsFromStartDate(date.getDate());

				date = new Date();
				date = date.addDays(-date.getDay());
				date = date.addDays(6);

				if(options.startWeekOnMonday) {
					date = date.addDays(1);
				}

				date = d.checkDateRange(date);

				d.toDateSpan.text(d.parseToString(date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()));

				d.excludeMonthPartsFromEndDate(date.getDate());
			} else if(text === options.thisMonth) {
				for (var i = d.months.length - 1; i >= 0; i--) {
					if($(d.months[i]).attr('data-value') === date.getFullYear() + '-' + (date.getMonth() + 1) + '-1') {
						d.makeSelection($(d.months[i]), $(d.months[i]));
						break;
					}
				}
			} else if(text === options.thisYear) {
				$(this).parent().parent().find('.drp-year-value').each(function() {
					if($(this).text() == date.getFullYear()) {
						$(this).click();
						return false;
					}
				});
			} else if(text === options.lastYear) {
				$(this).parent().parent().find('.drp-year-value').each(function() {
					if($(this).text() == date.getFullYear() - 1) {
						$(this).click();
						return false;
					}
				});
			}

			t.addClass('drp-current-preset-pick');
			options.presetDateSet();

			if(options.autoCloseOnPresetSelect) {
				d.close();
			}
		},

		monthMouseDown: function(e) {
			var timeout = 0,
				t = $(this);

			d.isMouseDown = true;
			$('.drp-current-preset-pick').removeClass('drp-current-preset-pick');
			
			clearTimeout(d.specificDaysDoubleClickTimeout);
			d.specificDaysDoubleClickTimeout = setTimeout(function() {
				d.specificDaysSelected = 0;
				$('.drp-exclude').removeClass('drp-exclude');

				if($('.drp-hovering').length > 0) {
					$('.drp-hovering').removeClass('drp-hovering');
					d.makeSelection(t, t);
				}
			}, 500);

			if(d.shiftKeyIsPressed && d.initialElement !== undefined) {
				d.makeSelection(t);
			} else if(d.initialElement === undefined || (
							d.initialElement !== undefined && (!t.hasClass('drp-initial') || d.initialElement.siblings().length > 0)
						)
					) {
				if($('.drp-hovering').length === 0) {
					d.makeSelection(t, t);
				}
			}
		},

		monthMouseOver: function(e) {
			var targetPosition,
				checkingElement,
				monthWidth, monthHeight;

			if (e.type === 'drag') {
				e.preventDefault();
				
				targetPosition = {
					x: $(this).offset().left,
					y: $(this).offset().top
				};

				monthWidth = $(this).outerWidth();
				monthHeight = $(this).outerHeight();
				checkingElement = $(this).parent();

				if(e.y - targetPosition.y <= -20) {
					if(checkingElement.prev('.drp-month').length === 0) {
						checkingElement = checkingElement.parent().prev().children('.drp-month:last');
					} else {
						checkingElement = checkingElement.prev('.drp-month');
					}

					targetPosition = {
						x: checkingElement.offset().left,
						y: checkingElement.offset().top
					};

					while(checkingElement.length > 0) {
						if(e.x >= targetPosition.x && e.x <= targetPosition.x + monthWidth &&
							e.y >= targetPosition.y && e.y <= targetPosition.y + monthHeight) {
							break;
						}

						if(checkingElement.prev('.drp-month').length === 0) {
							checkingElement = checkingElement.parent().prev().children('.drp-month:last');
						} else {
							checkingElement = checkingElement.prev('.drp-month');
						}

						targetPosition = {
							x: checkingElement.offset().left,
							y: checkingElement.offset().top
						};
					}
				} else if(e.y - targetPosition.y >= 20) {
					if(checkingElement.next('.drp-month').length === 0) {
						checkingElement = checkingElement.parent().next().children('.drp-month:last');
					} else {
						checkingElement = checkingElement.next('.drp-month');
					}

					targetPosition = {
						x: checkingElement.offset().left,
						y: checkingElement.offset().top
					};

					while(checkingElement.length > 0) {
						if(e.x >= targetPosition.x && e.x <= targetPosition.x + monthWidth &&
							e.y >= targetPosition.y && e.y <= targetPosition.y + monthHeight) {
							break;
						}

						if(checkingElement.next('.drp-month').length === 0) {
							checkingElement = checkingElement.parent().next().children('.drp-month:last');
						} else {
							checkingElement = checkingElement.next('.drp-month');
						}

						targetPosition = {
							x: checkingElement.offset().left,
							y: checkingElement.offset().top
						};
					}
				} else if(e.x > targetPosition.x) {
					if(checkingElement.next('.drp-month').length === 0) {
						checkingElement = checkingElement.parent().next().children('.drp-month:last');
					} else {
						checkingElement = checkingElement.next('.drp-month');
					}

					targetPosition = {
						x: checkingElement.offset().left,
						y: checkingElement.offset().top
					};

					while(checkingElement.length > 0) {
						if(e.x >= targetPosition.x && e.x <= targetPosition.x + monthWidth &&
							e.y >= targetPosition.y && e.y <= targetPosition.y + monthHeight) {
							break;
						}

						if(checkingElement.next('.drp-month').length === 0) {
							checkingElement = checkingElement.parent().next().children('.drp-month:last');
						} else {
							checkingElement = checkingElement.next('.drp-month');
						}

						targetPosition = {
							x: checkingElement.offset().left,
							y: checkingElement.offset().top
						};
					}
				} else {
					if(checkingElement.prev('.drp-month').length === 0) {
						checkingElement = checkingElement.parent().prev().children('.drp-month:last');
					} else {
						checkingElement = checkingElement.prev('.drp-month');
					}

					targetPosition = {
						x: checkingElement.offset().left,
						y: checkingElement.offset().top
					};

					while(checkingElement.length > 0) {
						if(e.x >= targetPosition.x && e.x <= targetPosition.x + monthWidth &&
							e.y >= targetPosition.y && e.y <= targetPosition.y + monthHeight) {
							break;
						}

						if(checkingElement.prev('.drp-month').length === 0) {
							checkingElement = checkingElement.parent().prev().children('.drp-month:last');
						} else {
							checkingElement = checkingElement.prev('.drp-month');
						}

						targetPosition = {
							x: checkingElement.offset().left,
							y: checkingElement.offset().top
						};
					}
				}

				d.makeSelection(checkingElement);
				options.dragging();
			} else if(d.isMouseDown) {
				d.makeSelection($(this));
				options.dragging();
			}
		},

		monthDoubleClick: function(e) {
			var dateOfInitialElement = $(this).attr('data-value'),
				dateParts = dateOfInitialElement.split('-'),
				firstDayOfSelectedMonth = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, 1),
				lastDayOfSelectedMonth = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]), 0),
				monthPositionTop = $(this).position().top,
				currentActiveSelection,
				currentYearContainer,
				daysToExclude;
			
			clearTimeout(d.specificDaysDoubleClickTimeout);

			options.doubleClickedMonth();

			if((d.specificDaysSelected === 0 ||d.lastMonthDoubleClicked === undefined || d.lastMonthDoubleClicked === null || monthPositionTop > d.initialMonthPosition.top + 1) || (monthPositionTop === d.initialMonthPosition.top && $(this).position().left > d.initialMonthPosition.left)) {
				d.lastMonthDoubleClicked = $(this);

				if($('.drp-hovering').length === 0) {
					d.fromDateSpan.text(options.selectDateText).addClass('drp-hovering');
					d.toDateSpan.text('');
				} else {
					if(d.specificDaysSelected > 0) {
						d.makeSelection($(this), null, true);
					} else {
						d.makeSelection($(this), $(this));
					}
				}

				if(d.dailyPopup.hasClass('drp-daily-popup-show')) {
					d.hideDailyPopup();
				}

				$('.drp-day').remove();

				currentActiveSelection = $(this).parent();
				currentYearContainer = currentActiveSelection.parent('.drp-year');

				if(currentYearContainer.length > 0 && currentYearContainer.prev('.drp-year').length === 0 && currentActiveSelection.prev('.drp-month').length === 0) { // If it is the first month of the first year
					daysToExclude = options.startDate.getDate();

					for (var i = lastDayOfSelectedMonth.getDate(); i >= 1; i--) {
						if(i < daysToExclude) {
							d.dailyPopup.children('.drp-days-detail').prepend('<span class="drp-day">&nbsp;</span>');
						} else {
							d.dailyPopup.children('.drp-days-detail').prepend('<span class="drp-day drp-day-select">' + i + '</span>');
						}
					}
				} else if(currentYearContainer.length > 0 && currentYearContainer.next('.drp-year').length === 0 && currentActiveSelection.next('.drp-month').length === 0) { // If it is the last month of the last year
					daysToExclude = options.endDate.getDate();

					for (var i = lastDayOfSelectedMonth.getDate(); i >= 1; i--) {
						if(i > daysToExclude) {
							d.dailyPopup.children('.drp-days-detail').prepend('<span class="drp-day">&nbsp;</span>');
						} else {
							d.dailyPopup.children('.drp-days-detail').prepend('<span class="drp-day drp-day-select">' + i + '</span>');
						}
					}
				} else {
					for (var i = lastDayOfSelectedMonth.getDate(); i >= 1; i--) {
						d.dailyPopup.children('.drp-days-detail').prepend('<span class="drp-day drp-day-select">' + i + '</span>');
					}
				}

				for (var i = firstDayOfSelectedMonth.getDay() - 1; i >= 0; i--) {
					d.dailyPopup.children('.drp-days-detail').prepend('<span class="drp-day">&nbsp;</span>');
				}

				d.dailyPopup.addClass('drp-daily-popup-show').css('top', d.mainPopup.position().top + d.mainPopup.outerHeight() + 5);
			} else {
				alert(options.wrongDateRangeMessage);
			}
		},

		yearClick: function() {
			d.hideDailyPopup();
			$('.drp-active').children().unwrap();
			$('.drp-status').removeClass('drp-active-status');

			d.initialElement = $(this).siblings('.drp-month:first');
			
			d.initialMonthPosition = {
				left: d.initialElement.position().left,
				top: d.initialElement.position().top
			};
			
			d.initialElement.addClass('drp-initial');

			d.makeSelection($(this).siblings('.drp-month:last'));
			options.yearClicked();
		},

		excludeMonthPartsFromStartDate: function(day) {
			$('.drp-active:first').children(':first').children(':first').children().each(function(i) {
				if(31/3 < day/i && day > 1) {
					$(this).addClass('drp-exclude');
				}
			});
		},

		excludeMonthPartsFromEndDate: function(day) {
			$('.drp-active:last').children(':last').children(':first').children().each(function(i) {
				if(31/3 > day/i && day < 28) {
					$(this).addClass('drp-exclude');
				}
			});
		},

		dayClick: function() {
			var day = $(this).text(),
				datePartsInitial, datePartsFinal;

			if(d.specificDaysSelected === 0) {
				$('.drp-exclude').removeClass('drp-exclude');
			}

			d.specificDaysSelected += 1;

			if(d.specificDaysSelected > 1) {
				d.specificDaysSelected = 0;
			}

			if(d.specificDaysSelected === 1) {
				datePartsInitial = $('.drp-active:first').children(':first').attr('data-value').split('-');
				d.fromDateSpan.text(d.parseToString(datePartsInitial[0] + '-' + datePartsInitial[1] + '-' + day));
				d.excludeMonthPartsFromStartDate(day);

				d.fromDateSpan.removeClass('drp-hovering');
				d.toDateSpan.text(options.selectDateText).addClass('drp-hovering');
			} else {
				datePartsFinal = $('.drp-active:last').children(':last').attr('data-value').split('-');

				// If initial date is after end date, then just select initial date in both
				datePartsInitial = d.parseToDate(d.fromDateSpan.text()).split('-');
				d.toDateSpan.text(d.parseToString(datePartsFinal[0] + '-' + datePartsFinal[1] + '-' + day));
				d.excludeMonthPartsFromEndDate(day);

				d.toDateSpan.removeClass('drp-hovering');
				d.hideDailyPopup();

				d.checkEndIsAfterStart();
			}

			options.clickedSpecificDay();
		},

		hideDailyPopup: function() {
			d.dailyPopup.removeClass('drp-daily-popup-show').css('top', d.mainPopup.position().top);
		},

		kill: function() {
		}
    };

    if(options.dayShortNames !== null && options.dayShortNames != undefined) {
    	d.customLanguage = true;
    }

    // Options
    options = options || {};

    // Required
    options.startDate = options.startDate; // either a date object or string in format YYYY-MM-DD
    options.endDate = options.endDate; // either a date object or string in format YYYY-MM-DD

    // Optional
    options.fromDateHiddenFieldName = options.fromDateHiddenFieldName || 'from-date';
    options.toDateHiddenFieldName = options.toDateHiddenFieldName || 'to-date';
    options.language = options.language || 'english';
    options.selectDateText = options.selectDateText || (options.language === 'english' ? 'Select Date' : 'Fecha');
	options.toText = options.toText || (options.language === 'english' ? 'to' : 'a');
    options.startWeekOnMonday = options.startWeekOnMonday || false;
    options.customClass = options.customClass;
    options.width = options.width;
    options.wrongDateRangeMessage = options.wrongDateRangeMessage || (options.language === 'english' ? 'Oops! Please select a valid date range. End date needs to be after (or same as) start date.' : 'Por favor seleccione un rango de fechas válido. La fecha de termino debe ser igual o mayor a la fecha de inicio.');
    options.autoCloseOnPresetSelect = options.autoCloseOnPresetSelect || false;

    options.today = options.today || (options.language === 'english' ? d.today : d.todaySpanish);
    options.tomorrow = options.tomorrow || (options.language === 'english' ? d.tomorrow : d.tomorrowSpanish);
    options.yesterday = options.yesterday || (options.language === 'english' ? d.yesterday : d.yesterdaySpanish);

    options.thisWeek = options.thisWeek || (options.language === 'english' ? d.thisWeek : d.thisWeekSpanish);
    options.thisMonth = options.thisMonth || (options.language === 'english' ? d.thisMonth : d.thisMonthSpanish);
    options.thisYear = options.thisYear || (options.language === 'english' ? d.thisYear : d.thisYearSpanish);
    options.lastYear = options.lastYear || (options.language === 'english' ? d.lastYear : d.lastYearSpanish);

    options.monthShortNames = options.monthShortNames || (options.language === 'english' ? d.monthShortNames : d.monthShortNamesSpanish);
    options.monthLongNames = options.monthLongNames || (options.language === 'english' ? d.monthLongNames : d.monthLongNamesSpanish);
    options.dayShortNames = options.dayShortNames || (options.language === 'english' ? d.dayShortNames : d.dayShortNamesSpanish);
    options.dayLongNames = options.dayLongNames || (options.language === 'english' ? d.dayLongNames : d.dayLongNamesSpanish);

    // Custom Event Callbacks
    options.initialized = options.initialized || function() {};
    options.popupOpened = options.popupOpened || function() {};
    options.popupClosed = options.popupClosed || function() {};
    options.presetDateSet = options.presetDateSet || function() {};
    options.yearClicked = options.yearClicked || function() {};
    options.dragging = options.dragging || function() {};
    options.clickedSpecificDay = options.clickedSpecificDay || function() {};
    options.doubleClickedMonth = options.doubleClickedMonth || function() {};
    options.fromDateClicked = options.fromDateClicked || function() {};
    options.fromDateEnteredManually = options.fromDateEnteredManually || function() {};
    options.toDateClicked = options.toDateClicked || function() {};
    options.toDateEnteredManually = options.toDateEnteredManually || function() {};

    // Setup event capturing
    var events = {
    	handleEvent: function(event) {
    	    switch (event.type) {
    	        case 'click': this.click(event); break;
    	    }
    	},

    	click: function(event) {
    	    d.open();
    	}
    };

    $(document).keydown(function(e) {
    	if(e.which === 16) {
    		d.shiftKeyIsPressed = true;
    	} else if(e.which === 17) {
    		d.controlKeyIsPressed = true;
    	}
    }).keyup(function(e) {
    	if(e.which === 16) {
    		d.shiftKeyIsPressed = false;
    	} else if(e.which === 17) {
    		d.controlKeyIsPressed = false;
    	}
    });

    $(document).mouseup(function() {
    	d.isMouseDown = false;
    });

    if(typeof String.prototype.startsWith != 'function') {
    	String.prototype.startsWith = function(str){
    		return this.slice(0, str.length) == str;
    	};
    }

    if(typeof String.prototype.toTitleCase != 'function') {
    	String.prototype.toTitleCase = function() {
    	    return this.replace(/\w\S*/g, function(txt) {
    	    	return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    	    });
    	};
    }

    if(typeof Date.prototype.addDays != 'function') {
    	Date.prototype.addDays = function(days) {
    	    var dat = new Date(this.valueOf());
    	    dat.setDate(dat.getDate() + days);
    	    return dat;
    	};
    }

    if(typeof Date.prototype.addMonths != 'function') {
    	Date.prototype.addMonths = function(months) {
    	    var dat = new Date(this.valueOf());
    	    dat.setMonth(dat.getMonth() + months);
    	    return dat;
    	};
    }

    if(typeof Date.prototype.isValidDate != 'function') {
    	Date.prototype.isValidDate = function() {
    		if(Object.prototype.toString.call(this) !== "[object Date]") {
    			return false;
    		}

    		return !isNaN(this.getTime());
    	}
    }

    // TODO: palabras en otros idiomas

    d.init();
    d.dateRangeElement[0].addEventListener('click', events, false);

    return {
    	kill: d.kill,

    	startDateVal: function() {
    		return (d.dateRangeElementFrom.text().length > 0 ? d.parseToDate(d.fromDateSpan.text()) : null);
    	},

    	endDateVal: function() {
    		return (d.dateRangeElementFrom.text().length > 0 ? d.parseToDate(d.toDateSpan.text()) : null);
    	},

    	open: function() {
    		d.open();
    	},

    	close: function() {
    		d.close();
    	}
    };
}

if (window.jQuery) {
    (function($) {
        var pluginName = 'DateRangePicker';

        var methods = {
            init: function(options) {
                return this.each(function() {
                    var $this = $(this);
                    var data = $this.data(pluginName);
                    
                    // If the plugin hasn't been initialized yet
                    if (!data){
                        var settings = {
                        };

                        if(options) {
                            $.extend(true, settings, options);
                        }

                        $this.data(pluginName, new DateRangePicker($(this)[0], settings));
                    }
                });
            }
        };

        $.fn[pluginName] = function( method ) {
            if (methods[method]) {
                return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
            } else if ( typeof method === 'object' || !method ) {
                return methods.init.apply( this, arguments );
            } else {
                $.error( 'Method ' + method + ' does not exist in jQuery.' + pluginName );
            }
        };
    })(window.jQuery);
}