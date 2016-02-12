# js-select-calendar

## Sample html

  <div class="calendar_conteiner">
    <div class="nav_month_block">
      <span class="nav_month_bnt prev">previous</span>
      <span class="nav_month_bnt next">next</span>
    </div>
    <section class="calendar_block">
      <div class="calendar_inside">
        <span id="month1" class="month">December</span>
        <div id="calendar1" class="calendar"></div>
      </div>
    </section>
    <section class="calendar_block">
      <div class="calendar_inside">
        <span id="month2" class="month">January</span>
        <div id="calendar2" class="calendar"></div>
      </div>
    </section>
    <section class="calendar_block">
      <div class="calendar_inside">
        <span id="month3" class="month">February</span>
        <div id="calendar3" class="calendar"></div>
      </div>
    </section>
  </div>

## Sample js

  ClassCalendar.addCalendar("calendar1", "month1", -1);
  ClassCalendar.addCalendar("calendar2", "month2");
  ClassCalendar.addCalendar("calendar3", "month3", 1);

  $(".nav_month_block .next").click(function(event) {
    event.preventDefault();
    ClassCalendar.nextMonth();
  });

  $(".nav_month_block .prev").click(function(event) {
    event.preventDefault();
    ClassCalendar.prevMonth();
  });

  ClassCalendar.callbackSelectDay = ClassCalendar.callbackHighlight = function(dateStart, dateEnd) {
    // dateStart, dateEnd - Date objects
  };