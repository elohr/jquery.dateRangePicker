# Date Range Picker

Date Range Picker is a jQuery plugin to easily create UI elements that simplify the selection of date ranges. It also works on mobile or touch enabled devices. It uses jquery plugin [jquery.finger](http://ngryman.sh/jquery.finger/) to handle touch events.

## Setup

Add the .js and .css files to your site. Copy the calendar-icon.png file to the same folder as the .css file.

```html
<link rel="stylesheet" href="css/dateRangePicker.css"/>
<script src="js/jquery.finger.min.js"></script>
<script src="js/jquery.dateRangePicker.min.js"></script>
```

## Basic Usage

Easily create a date range selector. Just define an input element of type text, and create a DateRangePicker from it using jQuery. startDate and endDate are the only required fields.

### HTML
```html
<input type="text" id="calendar-1"/>
```

### js
```js
$('#calendar-1').DateRangePicker({
    startDate: '2012-05-13',
    endDate: '2014-12-31'
});
```

## Examples, Demo and Documentation
For more examples and documentation go to [elohr.me](http://elohr.me/jquery-date-range-picker.html)