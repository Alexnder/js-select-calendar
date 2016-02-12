(function() {
  "use strict";

  // Check conflicts
  if (typeof window.ClassCalendar != "undefined") {
    return console.error("ClassCalendar already defined");
  }

  // Current date
  var CurrentDate = new Date();
  CurrentDate.setHours(0, 0, 0, 0);

  function ClassCalendar(id, monthId, year, month) {
    this.calendarNode = document.getElementById(id);
    this.calendarTitleNode = document.getElementById(monthId);
    this.month = month;
    this.year = year;
  }

  ClassCalendar.monthsFull = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  ClassCalendar.months = [ 'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  ClassCalendar.dateStart = null;
  ClassCalendar.dateEnd = null;
  ClassCalendar.calendars = [];
  ClassCalendar.currentDate = CurrentDate;

  ClassCalendar.prototype.createCalendar = function() {
    this.render();
    this.setTitle();
    this.attachEvents();
  };

  // Alx: Hello old govnocode
  ClassCalendar.prototype.render = function() {
    var mon = this.month - 1; // месяцы в JS идут от 0 до 11, а не от 1 до 12
    var d = new Date(this.year, mon);

    var table = '<table><tr><th>S</th><th>M</th><th>T</th><th>W</th><th>T</th><th>F</th><th>S</th></tr><tr>';

    // заполнить первый ряд от понедельника
    // и до дня, с которого начинается месяц
    // * * * | 1  2  3  4
    for (var i = 0; i < d.getDay(); i++) {
      table += '<td></td>';
    }

    // ячейки календаря с датами
    while (d.getMonth() == mon) {
      var linkTag = '<a id="' + ClassCalendar.createDateId(d) + '" href="#">' + d.getDate() + '</a>';

      var cellClass = "";

      if (ClassCalendar.compareDates(d, ClassCalendar.currentDate) === 0) {
        cellClass = "curdate";
      } else if (d < ClassCalendar.currentDate) {
        cellClass = "past";
      } else if (ClassCalendar.dateStart && ClassCalendar.dateEnd) {
        if (ClassCalendar.compareDates(d, ClassCalendar.dateStart) >= 0 && ClassCalendar.compareDates(d, ClassCalendar.dateEnd) <= 0) {
          cellClass = "select";
        }
      } else if (ClassCalendar.dateStart && ClassCalendar.compareDates(d, ClassCalendar.dateStart) === 0) {
        cellClass = "select";
      }

      // Append cell
      var openCellTag = '<td' + (cellClass ? ' class="'+cellClass+'"' : "") + '>';
      table += openCellTag + linkTag + '</td>';

      if (d.getDay() % 7 == 6) { // вс, последний день - перевод строки
        table += '</tr><tr>';
      }

      d.setDate(d.getDate()+1);
    }

    // добить таблицу пустыми ячейками, если нужно
    if (d.getDay() != 0) {
      for (var i=d.getDay(); i<7; i++) {
        table += '<td></td>';
      }
    }

    // закрыть таблицу
    table += '</tr></table>';

    // только одно присваивание innerHTML
    this.calendarNode.innerHTML = table;
  };

  ClassCalendar.prototype.nextMonth = function() {
    if (this.month >= 12) {
      this.month = 1;
      this.year +=1;
    } else {
      this.month +=1;
    }
    this.createCalendar();
  };

  ClassCalendar.prototype.prevMonth = function() {
    if (this.month <= 1) {
      this.month = 12;
      this.year -=1;
    } else {
      this.month -=1;
    }
    this.createCalendar();
  };

  ClassCalendar.prototype.nextYear = function() {
    this.year +=1;
    this.createCalendar();
  };

  ClassCalendar.prototype.prevYear = function() {
    this.year -=1;
    this.createCalendar();
  };

  ClassCalendar.prototype.getInfo = function() {
    return {
      Id: this.id,
      Month: this.month,
      Year:this.year
    };
  };

  ClassCalendar.prototype.setTitle = function() {
    this.calendarTitleNode.innerHTML = ClassCalendar.monthsFull[this.month - 1] + " " + this.year;
  };

  ClassCalendar.prototype.getDateFromDay = function(day) {
    if (typeof day == "string") {
      day = parseInt(day);
    }

    var date = new Date(this.year, this.month - 1, day);
    return date;
  };

  ClassCalendar.prototype.selectDay = function(day) {
    var date = this.getDateFromDay(day);

    if (ClassCalendar.dateStart && ClassCalendar.dateEnd) {
      ClassCalendar.dateStart = date;
      ClassCalendar.dateEnd = null;
    } else if (ClassCalendar.dateStart) {
      ClassCalendar.dateEnd = date;

      // Check that start later then end
      if (ClassCalendar.compareDates(ClassCalendar.dateStart, ClassCalendar.dateEnd) > 0) {
        ClassCalendar.dateEnd = ClassCalendar.dateStart;
        ClassCalendar.dateStart = date;
      }
    } else {
      ClassCalendar.dateStart = date;
    }

    ClassCalendar.refresh();

    if (typeof ClassCalendar.callbackSelectDay === "function") {
      ClassCalendar.callbackSelectDay(ClassCalendar.dateStart, ClassCalendar.dateEnd);
    }
  };

  ClassCalendar.prototype.attachEvents = function() {
    var calendar = this;

    // Click event
    $(this.calendarNode).find("a").click(function(event) {
      event.preventDefault();

      var eventCell = $(this).closest('td');
      if (eventCell.is(".past, .event, .curdate")) {
        eventCell.addClass("error");
        setTimeout(function() {
          eventCell.removeClass("error");
        }, 400);
        return;
      }

      // Event date
      calendar.selectDay($(this).text());
    });

    // Hover event
    var hoverInAction = false;
    $(this.calendarNode).find("a").hover(function() {

      // Pass if all selected
      if (ClassCalendar.dateEnd) {
        hoverInAction = false;
        return;
      }

      var eventCell = $(this).closest('td');
      if (eventCell.is(".past, .event, .curdate")) {
        return;
      }
      hoverInAction = true;
      var hoverDateEnd = calendar.getDateFromDay($(this).text());

      // Event date highlight
      ClassCalendar.highlight(ClassCalendar.dateStart, hoverDateEnd);
    });

    // Hover our from calendar
    $(this.calendarNode).hover(function() {
      // nothing
    }, function() {
      if (hoverInAction) {
        ClassCalendar.refresh();
        hoverInAction = false;
      }
    });
  };

  /**
   * Add new calendar
   */
  ClassCalendar.addCalendar = function(id, titleId, monthOffset) {
    monthOffset = monthOffset || 0;
    var month =  ClassCalendar.currentDate.getMonth() + 1;
    var year = ClassCalendar.currentDate.getFullYear();

    var calendar = new ClassCalendar(id, titleId, year, month);

    if (monthOffset < 0) {
      calendar.prevMonth();
    } else if (monthOffset > 0) {
      calendar.nextMonth();
    } else {
      calendar.createCalendar();
    }

    ClassCalendar.calendars.push(calendar);
  };

  ClassCalendar.nextMonth = function() {
    ClassCalendar.calendars.forEach(function(calendar) {
      calendar.nextMonth();
    });
  };

  ClassCalendar.prevMonth = function () {
    ClassCalendar.calendars.forEach(function(calendar) {
      calendar.prevMonth();
    });
  };

  ClassCalendar.nextYear = function () {
    ClassCalendar.calendars.forEach(function(calendar) {
      calendar.nextYear();
    });
  };

  ClassCalendar.prevYear = function () {
    ClassCalendar.calendars.forEach(function(calendar) {
      calendar.prevYear();
    });
  };

  ClassCalendar.refresh = function () {
    ClassCalendar.calendars.forEach(function(calendar) {
      calendar.createCalendar();
    });
  };

  ClassCalendar.highlight = function (dateStart, dateEnd) {

    $(".select").removeClass("select");

    if (!dateStart || !dateEnd) {
      return;
    }

    // Swap if Start bigger then End
    if (dateStart > dateEnd) {
      var tmp = dateStart;
      dateStart = dateEnd;
      dateEnd = tmp;
    }

    var oneDay = new Date(dateStart);

    // Defence of stack overflow
    for (var i = 0; i < 1000 && oneDay <= dateEnd; i++) {
      var id = "#" + ClassCalendar.createDateId(oneDay);
      $(id).closest("td").addClass("select");
      // Next day
      oneDay.setDate(oneDay.getDate() + 1);
    }

    if (typeof ClassCalendar.callbackHighlight === "function") {
      ClassCalendar.callbackHighlight(dateStart, dateEnd);
    }
  };

  ClassCalendar.createDateId = function(date) {
    return "date_" + date.getMonth() + "_" + date.getDate() + "_" + date.getFullYear();
  };

  ClassCalendar.formatDate = function(date) {
    return date.getMonth() + "/" + date.getDate() + "/" + date.getFullYear();
  };

  ClassCalendar.dayBetweenDates = function(date1, date2) {
    var oneDay = new Date(date1);
    var count = 0;

    while (oneDay < date2) {
      count++;
      oneDay.setDate(oneDay.getDate() + 1);
    }

    return count;
  };

  ClassCalendar.isWeekend = function(date) {
    return date.getDay() >= 5 || date.getDay() === 0;
  };

  ClassCalendar.isWorkweek = function(date) {
    return date.getDay() > 0 && date.getDay() < 5;
  };

  ClassCalendar.compareDates = function(date1, date2) {
    if (date1.getFullYear() != date2.getFullYear()) {
      return date1.getFullYear() - date2.getFullYear();
    }
    if (date1.getMonth() != date2.getMonth()) {
      return date1.getMonth() - date2.getMonth();
    }
    return date1.getDate() - date2.getDate();
  };

  window.ClassCalendar = ClassCalendar;

})();