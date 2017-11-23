/**
 * Created by k186 on 2017/11/17.
 * Name:
 * GitHub:
 * Email: k1868548@gmail.com
 */

/**
 * options
 *
 * startView @year{1} month{2} day{3} hour:min{4}
 * maxView
 * minView
 * initDate
 * startDate
 * endDate
 * language
 * format
 * container
 * minuteRange
 * hourList
 * id
 * */

import moment from 'moment'
import $ from 'jquery'
import "babel-polyfill";


class PdDatePicker {
  constructor(id, options) {
    this.id = null;
    this.options = {};
    this.data = {};
    this.View = null;
    this.currentView = null;
    this.isShow = false;
    this.isPick = false;
    _fn.initOptions.call(this, id, options);
    _fn.initData.call(this);
    _fn.initRenderData.call(this);
    _fn.renderDom.call(this);
    _fn.isShow.call(this);
  }

  on(event, callback) {
    if (EVENTS_TYPE.indexOf(event) < 0) {
      return;
    }
    if (event == 'change' && events[event]) {
      callback();
      return;
    }
    events[event] = events[event] || $.Callbacks();
    events[event].add(callback);
  }

  fire(event, param) {
    if (EVENTS_TYPE.indexOf(event) < 0) {
      return;
    }
    events[event] = events[event] || $.Callbacks();
    events[event].fire(param);
  }

  hide() {
    if (!this.isShow) return;
    $(`div[pd-item=pdDatePicker${this.id}]`).css('display', 'none');
    $('#' + this.options.containerId).css('position', '');
    let result = {};
    if (this.isPick) {
      result = this.data.tempDate;
      this.isPick = false;
    } else {
      result = this.data.orDate;
    }
    this.data.orDate = this.data.tempDate = result;
    this.currentView = this.options.startView;
    _fn.initRenderData.call(this);
    _fn.renderByView.call(this);
    $('#' + this.id).val(result.format(this.options.format));
    this.fire('change', result);
  }

  show() {
    $(`div[pd-item^=pdDatePicker]`).css('display', 'none');
    $(`div[pd-item=pdDatePicker${this.id}]`).css('display', 'block');
    $('#' + this.options.containerId).css('position', 'relative');
    _fn.getPosition.call(this);
  }

  destroy() {
    this.View.remove();
  }

  /* getDateValue */

  getDate(dateStr) {
    if (dateStr) {
      return {
        year: moment(dateStr).get('year'),
        month: moment(dateStr).get('month'),  // 0 to 11
        day: moment(dateStr).get('date'),
        hour: moment(dateStr).get('hour'),
        minute: moment(dateStr).get('minute'),
        second: moment(dateStr).get('second')
      }
    } else {
      return {
        year: moment().get('year'),
        month: moment().get('month'),  // 0 to 11
        day: moment().get('date'),
        hour: moment().get('hour'),
        minute: moment().get('minute'),
        second: moment().get('second')
      }
    }
  }
}

class pdWheelItem {
  constructor(options) {
    this.container = null;
    this.dataList = null;
    this.value = null;
    this.init(options);
    $(document.body).bind('click', _fn.output)
  }

  init(options) {
    //todo 判断options
    this.container = options.container;
    this.dataList = options.dataList;
    this.value = options.value;
    this.View = null;
    this.render();
    this.bindEvt();
  }

  on(event, callback) {
    this.View.bind(event, function () {
      callback(arguments)
    })
  }

  bindEvt() {
    let that = this
    that.View.bind('mousedown', (e) => {
      that.start(e);
    })
  }

  start(e) {
    let that = this;
    if (e.button == 0) {//判断是否点击鼠标左键
      console.log('mousedown');
      /*
       * clientX和clientY代表鼠标当前的横纵坐标
       * offset()该方法返回的对象包含两个整型属性：top 和 left，以像素计。此方法只对可见元素有效。
       * bind()绑定事件，同样unbind解绑定，此效果的实现最后必须要解绑定，否则鼠标松开后拖拽效果依然存在
       * getX获取当前鼠标横坐标和对象离屏幕左侧距离之差（也就是left）值，
       * getY和getX同样道理，这两个差值就是鼠标相对于对象的定位，因为拖拽后鼠标和拖拽对象的相对位置是不变的
       */
      that.startY = e.clientY;
      that.startTime = new Date().getTime();
      //movemove事件必须绑定到$(document)上，鼠标移动是在整个屏幕上的
      $(document.body).bind("mousemove", (e) => {
        e.stopPropagation();
        e.preventDefault();
        that.move(e);
      });
      //此处的$(document)可以改为obj
      $(document.body).bind("mouseup", (e) => {
        e.stopPropagation();
        e.preventDefault();
        that.stop(e);
      });

    }
    return false;//阻止默认事件或冒泡
  }

  move(e) {
    let that = this;
    //e.clientY
    let distance = e.clientY - that.startY;
    that.setCss('move', distance);
    return false;//阻止默认事件或冒泡
  }

  stop(e) {
    let that = this;
    let nowTime = new Date().getTime();
    let distance = e.clientY - that.startY;
    let range = nowTime - that.startTime;
    let a = 0.05;
    let time = 1000;
    if (range < 300) {
      distance = distance + distance * range * a;
      time += a * range;
    }
    that.setCss('stop', distance, time);
    //解绑定，这一步很必要，前面有解释
    $(document.body).unbind("mousemove");
    $(document.body).unbind("mouseup");
  }

  render() {
    let that = this;
    let item = $(TEMPLATE_ITEM).clone().attr('pd-item', 'wheel');
    let checkList = '';
    let wheelList = '';
    for (let i = 0; i < that.dataList.length; i++) {
      checkList += `<div class="check-div">${that.dataList[i]}</div>`
      wheelList += `<div class="wheel-div">${that.dataList[i]}</div>`
    }
    item.find('.check-list').html(checkList);
    item.find('.wheel').html(checkList);
    this.View = item;
    this.container.append(that.View);
    that.setCss();
  }

  setCss(type, distance, time) {
    let that = this;
    let total = Math.ceil(that.dataList.length * 40);
    let index = 0;
    let lastMove = Number(that.View.attr('lastMove'));
    let thisMove = '';

    if (type === 'move') {
      thisMove = lastMove + distance;
      if (thisMove > 0 || thisMove < -(total - 40)) {
        //缓冲长度
        if (thisMove > 0) {
          thisMove = 10;
        }
        if (thisMove < -(total - 40)) {
          thisMove = -(total - 20);
        }
        that.View.find('.check-list').css('transition', 'transform 1000ms cubic-bezier(0.19, 1, 0.22, 1)');
        that.View.find('.wheel').css('transition', 'transform 1000ms cubic-bezier(0.19, 1, 0.22, 1)');
      } else {
        that.View.find('.check-list').css('transition', '');
        that.View.find('.wheel').css('transition', '');
      }
      that.View.find('.check-list').css('transform', `translateY(${thisMove}px)`);
      that.View.find('.wheel').css('transform', `translateY(${thisMove}px)`);
    }
    if (type === 'stop') {
      thisMove = lastMove + distance;
      // 取整
      if (thisMove > 0) {
        thisMove = 0;
      }
      if (thisMove < -(total - 40)) {
        thisMove = -(total - 40);
      }
      thisMove = Math.ceil(thisMove / 40) * 40;
      that.View.find('.check-list').css('transition', `transform ${time}ms cubic-bezier(0.19, 1, 0.22, 1)`);
      that.View.find('.wheel').css('transition', `transform ${time}ms cubic-bezier(0.19, 1, 0.22, 1)`);
      that.View.find('.check-list').css('transform', `translateY(${thisMove}px)`);
      that.View.find('.wheel').css('transform', `translateY(${thisMove}px)`);
      that.View.attr('lastMove', thisMove);
      that.View.trigger('change', Math.abs(that.dataList[Math.abs(Math.ceil(thisMove / 40))]))
    }
    if (!type) {
      for (let i = 0; i < that.dataList.length; i++) {
        if (that.dataList[i] == that.value) {
          index = i;
          break;
        }
      }
      that.View.attr('lastMove', -(index * 40));
      that.View.find('.check-list').css('transform', `translateY(${ -(index * 40)}px)`);
      that.View.find('.wheel').css('transform', `translateY(${ -(index * 40)}px)`);
    }
  }
}

/* private */
const _fn = {
  /*getPosition*/
  getPosition() {
    let divs = document.getElementsByTagName("div");
    let max = 0;
    for (let i = 0; i < divs.length; i++) {
      max = Math.max(max, divs[i].style.zIndex || 0);
    }
    let isContainer = !!this.options.containerId;
    let dom = $('#' + this.id);
    let picker = $(`div[pd-item=pdDatePicker${this.id}]`);
    let domOffset = dom.offset();
    let domHeight = dom.outerHeight();
    let domWidth = dom.outerWidth();
    let pickerWidth = picker.outerWidth();
    let pickerHeight = picker.outerHeight();
    let windowWidth = $(document.body).width();
    let right = 0;
    let top = 0;
    let left = 0;
    let symbo = 'left'
    if (pickerWidth + domOffset.left > windowWidth) {
      right = 0;
      symbo = 'right'
    } else {
      left = domOffset.left;
    }
    top = domOffset.top + domHeight + 10;
    if (isContainer) {
      top = domHeight + 10;
      picker.css('top', top + 'px');
      picker.css('left', 0 + 'px');
    } else {
      if (symbo !== 'right') {
        picker.css('top', top + 'px');
        picker.css('left', left + 'px');
      } else {
        picker.css('top', top + 'px');
        picker.css('right', right + 'px');
      }
    }

  },
  /*isShow*/
  isShow() {
    let input = $('#' + this.id);
    this.View.on('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    $(document.body).bind('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.hide();
      this.isShow = false;
    });
    input.on('click', (e) => {
      e.stopPropagation();
      this.show();
      this.isShow = true;
    });
    //this.hide();
  },
  /*init*/
  initOptions(id, options) {
    if (!id) {
      console.warn(_fn.logger('need a unique dom id'));
      return false
    }
    this.id = id;
    //reg options
    if (!(options.startView >= OPTIONS.maxView && options.startView <= OPTIONS.minView)) {
      options.startView = 3
    }
    if (options.maxView < 1 || options.maxView > 4) {
      options.maxView = 1
    }
    if (options.minView < 1 || options.minView > 4) {
      options.minView = 4
    }
    if (!moment(options.initDate).isValid()) {
      options.initDate = moment()
    }
    if (!moment(options.startDate).isValid()) {
      options.startDate = null;
    }
    if (!moment(options.endDate).isValid()) {
      options.endDate = null;
    }
    if (options.language !== 'cn' || options.language !== 'en') {
      options.language = 'cn'
    }
    if (options.minuteRange >= 60) {
      options.minuteRange = 1
    }
    if ($('#' + options.containerId).length == 0) {
      options.containerId = null
    }
    if (typeof options.hourList !== Array) {
      options.hourList = null
    }
    for (let key in OPTIONS) {
      this.options[key] = options[key] ? options[key] : OPTIONS[key];
    }
    this.currentView = this.options.startView;
  },
  /*initData*/
  initData() {
    let that = this;
    let date = '';
    if (that.options.forceFormat) {
      date = $('#' + that.id).val();
    } else {
      date = that.options.initDate;
    }
    /* 初始化数据 */
    let myDate = moment(date);
    that.data.orDate = myDate;
    that.data.tempDate = myDate;
    that.data.yearList = _fn.getYearList.call(that, myDate);
  },
  /*initRenderData*/
  initRenderData() {
    let that = this;
    let myDate = moment(that.data.tempDate);
    that.data.monthList = Array.from({length: 12}, (value, index) => index);
    that.data.weekList = Array.from({length: 7}, (value, index) => index);
    that.data.dayList = _fn.getDayList.call(that, myDate);
    that.data.hourList = _fn.getHourList.call(that);
    that.data.minuteList = _fn.getMinuteList.call(that);
    that.data.secondList = Array.from({length: 60}, (value, index) => index);
  },
  /*renderDom*/
  renderDom() {
    let that = this;
    $(document.body).find(`div[pd-itme=pdDatePicker${that.id}]`).remove();
    let box = $(TEMPLATE_BOX).clone().attr('pd-item', 'pdDatePicker' + that.id);
    that.View && that.View.remove();
    that.View = box;
    that.View.css('display', 'none');
    //todo
    _fn.renderByView.call(that);
    if (this.options.containerId) {
      $('#' + this.options.containerId).append(that.View);
    } else {
      $('body').append(that.View);
    }

    console.log(that)
  },
  renderYear() {
    let that = this;
    let tempDate = that.data.tempDate;
    /*year*/
    let yearBox = $(TEMPLATE_YEAR_MONTH).clone().attr('pd-item', 'year');
    /*year render*/
    yearBox.find('.pd-date-picker-title').html(that.data.yearList[0] + ' - ' + that.data.yearList[that.data.yearList.length - 1]);
    let yearListStr = '';
    for (let i = 0; i < that.data.yearList.length; i++) {
      let year = that.data.yearList[i];
      if (i === 0) {
        yearListStr += `<li class="prev${_fn.regDate.call(that, year, 'year') ? '' : ' disabled'} ${_fn.isActive.call(that, year, 'year', 'prev') ? ' active' : ''}"><div>${year}</div></li>`
      } else if (i === that.data.yearList.length - 1) {
        yearListStr += `<li class="next${_fn.regDate.call(that, year, 'year') ? '' : ' disabled'} ${_fn.isActive.call(that, year, 'year', 'next') ? ' active' : ''}"><div>${year}</div></li>`
      } else {
        yearListStr += `<li class="${_fn.regDate.call(that, year, 'year') ? '' : ' disabled'} ${_fn.isActive.call(that, year, 'year') ? ' active' : ''}"><div>${year}</div></li>`
      }
    }
    yearBox.find('.yearmonthbox>ul').html(yearListStr);
    that.View.find('div[pd-item=year]').remove();
    that.View.append(yearBox);
    _fn.bindEvt.call(that, 'year');
  },
  renderMonth() {
    let that = this;
    let tempDate = that.data.tempDate;
    /*month*/
    let monthBox = $(TEMPLATE_YEAR_MONTH).clone().attr('pd-item', 'month');
    /*month render*/
    monthBox.find('.pd-date-picker-title').html(tempDate.format('YYYY-MM'));
    let monthListStr = '';
    for (let i = 0; i < that.data.monthList.length; i++) {
      let month = that.data.monthList[i];
      let monthValue = month + 1 < 10 ? '0' + (month + 1) : (month + 1);
      let monthStr = Language[that.options.language].month[month];
      if (i === 0) {
        if (_fn.regDate.call(that, monthValue, 'month')) {
          monthListStr += `<li class="prev ${_fn.isActive.call(that, monthValue, 'month') ? ' active' : ''}"><div data-value="${monthValue}">${monthStr}</div></li>`
        } else {
          monthListStr += `<li class="prev disabled ${_fn.isActive.call(that, monthValue, 'month') ? ' active' : ''}"><div  data-value="${monthValue}">${monthStr}</div></li>`
        }
      } else if (i === that.data.yearList.length - 1) {
        if (_fn.regDate.call(that, monthValue, 'month')) {
          monthListStr += `<li class="next ${_fn.isActive.call(that, monthValue, 'month') ? ' active' : ''}"><div  data-value="${monthValue}">${monthStr}</div></li>`
        } else {
          monthListStr += `<li class="next disabled ${_fn.isActive.call(that, monthValue, 'month') ? ' active' : ''}"><div  data-value="${monthValue}">${monthStr}</div></li>`
        }
      } else {
        if (_fn.regDate.call(that, monthValue, 'month')) {
          monthListStr += `<li class="${_fn.isActive.call(that, monthValue, 'month') ? ' active' : ''}"><div  data-value="${monthValue}">${monthStr}</div></li>`
        } else {
          monthListStr += `<li class="disabled ${_fn.isActive.call(that, monthValue, 'month') ? ' active' : ''}"><div  data-value="${monthValue}">${monthStr}</div></li>`
        }
      }
    }
    monthBox.find('.yearmonthbox>ul').html(monthListStr);
    that.View.find('div[pd-item=month]').remove();
    that.View.append(monthBox);
    _fn.bindEvt.call(that, 'month');
  },
  renderDay() {
    let that = this;
    let tempDate = that.data.tempDate;
    /*day*/
    let dayBox = $(TEMPLATE_DAY).clone().attr('pd-item', 'day');
    /*day render*/
    dayBox.find('.pd-date-picker-title').html(tempDate.format('YYYY-MM-DD'));
    let dayListStr = '';
    for (let i = 0; i < that.data.dayList.length; i++) {
      let day = that.data.dayList[i];
      let dayValue = day.value < 10 ? '0' + day.value : day.value;
      if (day.previousMonthDay) {
        if (_fn.regDate.call(that, dayValue, 'day', 'prev')) {
          dayListStr += `<li class="prev${_fn.isActive.call(that, dayValue, 'day', 'prev') ? ' active' : ''}"><div  data-value="${dayValue}">${dayValue}</div></li>`
        } else {
          dayListStr += `<li class="prev disabled${_fn.isActive.call(that, dayValue, 'day', 'prev') ? ' active' : ''}"><div data-value="${dayValue}">${dayValue}</div></li>`
        }
      } else if (day.currentMonth) {
        if (_fn.regDate.call(that, dayValue, 'day')) {
          dayListStr += `<li class="${_fn.isActive.call(that, dayValue, 'day') ? ' active' : ''}"><div data-value="${dayValue}">${dayValue}</div></li>`
        } else {
          dayListStr += `<li class="disabled ${_fn.isActive.call(that, dayValue, 'day') ? ' active' : ''}"><div data-value="${dayValue}">${dayValue}</div></li>`
        }
      } else if (day.nextMonthDay) {
        if (_fn.regDate.call(that, dayValue, 'day', 'next')) {
          dayListStr += `<li class="next${_fn.isActive.call(that, dayValue, 'day', 'next') ? ' active' : ''}"><div data-value="${dayValue}">${dayValue}</div></li>`
        } else {
          dayListStr += `<li class="next disabled ${_fn.isActive.call(that, dayValue, 'day', 'next') ? ' active' : ''}"><div data-value="${dayValue}">${dayValue}</div></li>`
        }

      }
    }
    let weekListStr = '';
    for (let i = 0; i < that.data.weekList.length; i++) {
      let week = Language[that.options.language].week[that.data.weekList[i]];
      weekListStr += `<li>${week}</li>`
    }
    dayBox.find('.title').html(weekListStr);
    dayBox.find('.daybox>ul').html(dayListStr);
    that.View.find('div[pd-item=day]').remove();
    that.View.append(dayBox);
    _fn.bindEvt.call(that, 'day');
  },
  renderHour() {
    let that = this;
    let tempDate = that.data.tempDate;
    let date = that.getDate(tempDate);
    /*hour*/
    let hourBox = $(TEMPLATE_WHEEL).clone().attr('pd-item', 'hour');
    /*hour render*/
    let hourWheel = new pdWheelItem({
      container: hourBox.find('.hourbox'),
      dataList: that.data.hourList,
      value: tempDate.format('HH')
    });
    let minuteWheel = new pdWheelItem({
      container: hourBox.find('.hourbox'),
      dataList: that.data.minuteList,
      value: tempDate.format('mm')
    });
    hourWheel.on('change', (argArr) => {
      _fn.pickDate.call(that, 'hour', argArr[1]);
      _fn.setHourTitle.call(that);
    });
    minuteWheel.on('change', (argArr) => {
      _fn.pickDate.call(that, 'minute', argArr[1]);
      _fn.setHourTitle.call(that);
    });
    if (that.options.format.indexOf('mm') > -1) {
      let secondWheel = new pdWheelItem({
        container: hourBox.find('.hourbox'),
        dataList: Array.from({length: 60}, (value, index) => index),
        value: tempDate.format('ss')
      });
      secondWheel.on('change', (argArr) => {
        _fn.pickDate.call(that, 'second', argArr[1]);
        _fn.setHourTitle.call(that);
      });
    }
    that.View.find('div[pd-item=hour]').remove();
    that.View.append(hourBox);
    _fn.setHourTitle.call(that);
    _fn.bindEvt.call(that, 'hour');
  },
  /*set HourTitle*/
  setHourTitle() {
    let that = this;
    let title = that.View.find('div[pd-item=hour]').find('.pd-date-picker-title');
    if (that.options.minView === that.options.maxView === 4) {
      title.html(that.data.tempDate.format('HH:mm:ss'))
    } else {
      title.html(that.data.tempDate.format('YYYY-MM-DD HH:mm:ss'))
    }
  },
  /*changeView*/
  changeView() {
    let that = this;
    let yearBox = that.View.find('div[pd-item=year]');
    let monthBox = that.View.find('div[pd-item=month]');
    let dayBox = that.View.find('div[pd-item=day]');
    let hourBox = that.View.find('div[pd-item=hour]');

    if (that.currentView < that.options.maxView) {
      that.currentView = that.options.maxView
    }
    if (that.currentView > that.options.minView) {
      that.currentView = that.options.minView
    }

    if (that.currentView === 1) {
      yearBox.css('display', 'block');
      monthBox.css('display', 'none');
      dayBox.css('display', 'none');
      hourBox.css('display', 'none');
    }
    if (that.currentView === 2) {
      yearBox.css('display', 'none');
      monthBox.css('display', 'block');
      dayBox.css('display', 'none');
      hourBox.css('display', 'none');
    }
    if (that.currentView === 3) {
      yearBox.css('display', 'none');
      monthBox.css('display', 'none');
      dayBox.css('display', 'block');
      hourBox.css('display', 'none');
    }
    if (that.currentView === 4) {
      yearBox.css('display', 'none');
      monthBox.css('display', 'none');
      dayBox.css('display', 'none');
      hourBox.css('display', 'block');
    }
  },
  /*bindEvt*/
  bindEvt(type) {
    let that = this;
    let yearBox = that.View.find('div[pd-item=year]');
    let monthBox = that.View.find('div[pd-item=month]');
    let dayBox = that.View.find('div[pd-item=day]');
    let hourBox = that.View.find('div[pd-item=hour]');

    /*bind*/
    if (type === 'year') {
      yearBox.find('.E_left').on('click', (e) => {
        e.stopPropagation();
        _fn.prevEvt.call(that, 'year');
      });
      yearBox.find('.E_right').on('click', (e) => {
        e.stopPropagation();
        _fn.nextEvt.call(that, 'year');
      });
      yearBox.find('.E_pick>li').on('click', (e) => {
        let currentTarget = $(e.currentTarget);
        if (currentTarget.hasClass('disabled')) {
          return false
        }
        let prevOrNext = null;
        if (currentTarget.hasClass('next')) {
          prevOrNext = 'next'
        }
        if (currentTarget.hasClass('prev')) {
          prevOrNext = 'prev'
        }
        let value = $(e.currentTarget).find('div').html();
        e.stopPropagation();
        _fn.pickDate.call(that, 'year', value, prevOrNext);
      });
    }
    if (type === 'month') {
      monthBox.find('.E_left').on('click', (e) => {
        e.stopPropagation();
        _fn.prevEvt.call(that, 'month');
      });
      monthBox.find('.E_right').on('click', (e) => {
        e.stopPropagation();
        _fn.nextEvt.call(that, 'month');
      });
      monthBox.find('.E_pick>li').on('click', (e) => {
        if ($(e.currentTarget).hasClass('disabled')) {
          return false
        }
        let value = $(e.currentTarget).find('div').attr('data-value');
        e.stopPropagation();
        _fn.pickDate.call(that, 'month', value);
      });
      monthBox.find('.E_view').on('click', (e) => {
        e.stopPropagation();
        that.currentView = 1;
        _fn.changeView.call(that)
      });
    }
    if (type === 'day') {
      dayBox.find('.E_left').on('click', (e) => {
        e.stopPropagation();
        _fn.prevEvt.call(that, 'day');
      });
      dayBox.find('.E_right').on('click', (e) => {
        e.stopPropagation();
        _fn.nextEvt.call(that, 'day');
      });
      dayBox.find('.E_pick>li').on('click', (e) => {
        if ($(e.currentTarget).hasClass('disabled')) {
          return false
        }
        let nextOrPrev = null;
        if ($(e.currentTarget).hasClass('prev')) {
          nextOrPrev = 'prev'
        }
        if ($(e.currentTarget).hasClass('next')) {
          nextOrPrev = 'next'
        }
        let value = $(e.currentTarget).find('div').attr('data-value');
        e.stopPropagation();
        _fn.pickDate.call(that, 'day', value, nextOrPrev);
      });
      dayBox.find('.E_view').on('click', (e) => {
        e.stopPropagation();
        that.currentView = 2;
        _fn.changeView.call(that)
      });
    }
    if (type === 'hour') {
      hourBox.find('.E_view').on('click', (e) => {
        e.stopPropagation();
        that.currentView = 3;
        _fn.changeView.call(that)
      });
    }
  },
  /*regDate*/
  regDate(tempDate, type, nextOrPrev) {
    tempDate = Number(tempDate);
    let that = this;
    let temp = that.getDate(that.data.tempDate);
    let year = temp.year;
    let month = temp.month;
    let day = temp.day;
    let startDate = that.options.startDate;
    let endDate = that.options.endDate;
    let result = false;
    if (type === 'year') {
      if (startDate && endDate) {
        result = moment(startDate).get('year') <= tempDate && moment(endDate).get('year') >= tempDate
      }
      if (startDate && !endDate) {
        result = moment(startDate).get('year') <= tempDate
      }
      if (!startDate && endDate) {
        result = moment(endDate).get('year') >= tempDate
      }
      if (!startDate && !endDate) {
        result = true
      }
    }
    if (type === 'month') {
      let monthStr = year + '-' + (tempDate < 10 ? '0' + tempDate : tempDate);
      if (startDate && endDate) {
        result = moment(startDate).format('YYYY-MM') <= monthStr && moment(endDate).format('YYYY-MM') >= monthStr
      }
      if (startDate && !endDate) {
        result = moment(startDate).format('YYYY-MM') <= monthStr
      }
      if (!startDate && endDate) {
        result = moment(endDate).format('YYYY-MM') >= monthStr
      }
      if (!startDate && !endDate) {
        result = true
      }
    }
    if (type === 'day') {
      let dayStr = '';
      if (nextOrPrev === 'prev') {
        dayStr = year + '-' + (month < 10 ? '0' + month : month + '-' + (tempDate < 10 ? '0' + tempDate : tempDate));
      }
      if (nextOrPrev === 'next') {
        dayStr = year + '-' + (month + 2 < 10 ? '0' + (month + 2) : month + 2) + '-' + (tempDate < 10 ? '0' + tempDate : tempDate);
      }
      if (!nextOrPrev) {
        dayStr = year + '-' + (month + 1 < 10 ? '0' + (month + 1) : month + 1) + '-' + (tempDate < 10 ? '0' + tempDate : tempDate);
      }

      if (startDate && endDate) {
        result = moment(startDate).format('YYYY-MM-DD') <= dayStr && moment(endDate).format('YYYY-MM-DD') >= dayStr
      }
      if (startDate && !endDate) {
        result = moment(startDate).format('YYYY-MM-DD') <= dayStr
      }
      if (!startDate && endDate) {
        result = moment(endDate).format('YYYY-MM-DD') >= dayStr
      }
      if (!startDate && !endDate) {
        result = true
      }
    }
    return result
  },
  /*isActive*/
  isActive(dateStr, type, nextOrPrev) {
    dateStr = Number(dateStr)
    let that = this;
    let result = false;
    let temp = that.getDate(that.data.tempDate);
    let year = temp.year;
    let month = temp.month;
    let day = temp.day;
    if (type === 'year') {
      result = dateStr == that.data.orDate.format('YYYY');
    }
    if (type === 'month') {
      let temp1 = year + '-' + (dateStr < 10 ? '0' + dateStr : dateStr);
      result = moment(temp1).format('YYYY-MM') === that.data.orDate.format('YYYY-MM');
    }
    if (type === 'day') {
      let temp2 = '';
      if (nextOrPrev === 'prev') {
        temp2 = year + '-' + (month < 10 ? '0' + month : month ) + '-' + (dateStr < 10 ? '0' + dateStr : dateStr);
      }
      if (nextOrPrev === 'next') {
        temp2 = year + '-' + (month + 2 < 10 ? '0' + (month + 2) : month + 2) + '-' + (dateStr < 10 ? '0' + dateStr : dateStr);
      }
      if (!nextOrPrev) {
        temp2 = year + '-' + (month + 1 < 10 ? '0' + (month + 1) : month + 1) + '-' + (dateStr < 10 ? '0' + dateStr : dateStr);
      }
      result = moment(temp2).format('YYYY-MM-DD') === that.data.orDate.format('YYYY-MM-DD');
    }
    return result
  },
  /*getYearList*/
  getYearList(momentObj) {
    let that = this;
    /*moment(str) will not support try moment(str,format)*/
    let startDate = moment(momentObj, 'YYYY-MM-DD').subtract(5, 'y').get('year');
    let arr = [];
    for (let i = 0; i < 12; i++) {
      arr.push(startDate + i);
    }
    return arr
  },
  /*getDayList*/
  getDayList(momentObj) {
    let tmpYear = moment(momentObj).get('year');
    let tmpMonth = moment(momentObj).get('month');

    /* get currentMonthLenght */
    let currentMonthLength = new Date(tmpYear, tmpMonth + 1, 0).getDate();
    /* get currentMonth day */
    let daylist = Array.from({length: currentMonthLength}, (value, index) => {
      return {
        currentMonth: true,
        value: index + 1
      }
    });
    /* get previous day */
    let currentMonthStartDay = new Date(tmpYear, tmpMonth, 1).getDay();
    let previousMotnhLength = new Date(tmpYear, tmpMonth, 0).getDate();
    for (let i = 0; i < currentMonthStartDay; i++) {
      daylist = [{previousMonthDay: true, value: previousMotnhLength - i}].concat(daylist)
    }
    /* get nex day */
    for (let i = daylist.length, day = 1; i < 42; i++, day++) {
      daylist[daylist.length] = {nextMonthDay: true, value: day}
    }
    return daylist
  },
  /*getHourList*/
  getHourList() {
    if (this.options.hourList) {
      let temp = [];
      for (let i = 0; i < this.options.hourList.length; i++) {
        let result = this.options.hourList[i];
        result = Number(result);
        result = result < 10 ? '0' + result : result;
        temp.push(result)
      }
      return temp;
    } else {
      return Array.from({length: 24}, (value, index) => index < 10 ? '0' + index : index)
    }
  },
  /*getMinuteList*/
  getMinuteList() {
    /*all 60*/
    let len = Math.ceil(60 / this.options.minuteRange);
    return Array.from({length: len}, (value, index) => {
      if (index === 0) {
        return '00'
      } else {
        let result = index * this.options.minuteRange;
        return result < 10 ? '0' + result : result
      }
    })
  },
  /*nextEvt*/
  nextEvt(type) {
    let that = this;
    let date = that.getDate(that.data.tempDate);
    let year = date.year;
    let month = date.month;
    let day = date.day;
    let hour = date.hour;
    let minute = date.minute;
    if (type === 'year') {
      let start = that.data.yearList[that.data.yearList.length - 1];
      that.data.yearList = Array.from({length: 12}, (value, index) => start + index);
      that.currentView = 1;
    }
    if (type === 'month') {
      year++;
      that.data.tempDate = moment(that.data.tempDate, that.options.format).year(year);
      that.currentView = 2;
    }
    if (type === 'day') {
      month++;
      if (month > 11) {
        month = 0;
        year++
      }
      that.data.tempDate = moment(that.data.tempDate, that.options.format).year(year).month(month);
      that.data.dayList = _fn.getDayList.call(that, that.data.tempDate);
      that.currentView = 3;
    }
    _fn.renderByView.call(that);
  },
  /*prevEvt*/
  prevEvt(type) {
    let that = this;
    let date = that.getDate(that.data.tempDate);
    let year = date.year;
    let month = date.month;
    let day = date.day;
    if (type === 'year') {
      let start = that.data.yearList[0] - 11;
      that.data.yearList = Array.from({length: 12}, (value, index) => start + index);
      that.currentView = 1;
    }
    if (type === 'month') {
      year--;
      that.data.tempDate = moment(that.data.tempDate, that.options.format).year(year);
      that.currentView = 2;
    }
    if (type === 'day') {
      month--;
      if (month < 0) {
        month = 11;
        year--;
      }
      that.data.tempDate = moment(that.data.tempDate, that.options.format).year(year).month(month);
      that.data.dayList = _fn.getDayList.call(that, that.data.tempDate);
      that.currentView = 3;
    }
    _fn.renderByView.call(that);
  },
  /*pickDate*/
  pickDate(type, value, nextOrPrev) {
    console.log('pick');
    console.log(value);
    this.isPick = true;
    value = Number(value);
    let that = this;
    let date = that.getDate(that.data.tempDate);
    let year = date.year;
    let month = date.month;
    let day = date.day;
    let hour = date.hour;
    let minute = date.minute;
    let second =  date.second;
    let needInitData = false;
    let shouldFire = false;
    //判断是否要自动关闭 options.minView =1 2 3 的时候 自动关闭
    if (that.options.minView === that.currentView && that.options.minView !== 4) {
      shouldFire = true;
    }
    if (type === 'year') {
      year = value;
      if (nextOrPrev) {
        if (nextOrPrev === 'next') {
          that.data.yearList = Array.from({length: 12}, (value, index) => year + index);
        } else {
          that.data.yearList = Array.from({length: 12}, (value, index) => year - 11 + index);
        }
        needInitData = true
      }
      that.currentView = 2;
    }
    if (type === 'month') {
      month = value - 1;
      that.currentView = 3;
    }
    if (type === 'day') {
      day = value;
      if (nextOrPrev === 'next') {
        month++;
        if (month > 11) {
          month = 0;
          year++
        }
      }
      if (nextOrPrev === 'prev') {
        month--;
        if (month < 0) {
          month = 11;
          year--;
        }
      }
      if (!nextOrPrev) {

      }
      if (nextOrPrev) {
        needInitData = true;
      }
      that.currentView = 4;
    }
    if (type === 'hour') {
      hour = value;
    }
    if (type === 'minute') {
      minute = value;
    }
    if (type === 'second') {
      second = value;
    }
    that.data.tempDate = moment(that.data.tempDate, that.options.format).year(year).month(month).date(day).hour(hour).minute(minute).second(second);
    if (needInitData) {
      that.data.dayList = _fn.getDayList.call(that, that.data.tempDate)
    }
    if (shouldFire) {
      this.hide()
    } else {
      if (type !== 'hour' && type !== 'minute' && type !== 'second') {
        _fn.renderByView.call(that);
      }
    }
  },
  /*prefix*/
  logger(msg) {
    return 'PdDatePicker: ' + msg
  },
  renderByView() {
    let that = this;
    _fn.renderYear.call(that);
    _fn.renderMonth.call(that);
    _fn.renderDay.call(that);
    _fn.renderHour.call(that);
    _fn.changeView.call(that);
  }


};
export default PdDatePicker;
/*支持jQ链式调用*/
$.fn.PdDatePicker = function (option) {
  let id = this.prop('id');
  return new PdDatePicker(id, option);
};


const OPTIONS = {
  startView: 3,
  maxView: 1,
  minView: 4,
  initDate: moment(),
  startDate: null,
  endDate: null,
  language: 'cn',
  format: 'YYYY-MM-DD',
  minuteRange: 1,
  containerId: null,
  hourList: null,
  autoClose: true
};

const Language = {
  cn: {
    week: {0: '日', 1: '一', 2: '二', 3: '三', 4: '四', 5: '五', 6: '六'},
    month: {
      0: '一月',
      1: '二月',
      2: '三月',
      3: '四月',
      4: '五月',
      5: '六月',
      6: '七月',
      7: '八月',
      8: '九月',
      9: '十月',
      10: '十一月',
      11: '十二月'
    }
  },
  en: {
    week: {0: 'Su', 1: 'Mo', 2: 'Tu', 3: 'We', 4: 'Th', 5: 'Fr', 6: 'Sa'},
    month: {
      0: 'JAN',
      1: 'FEB',
      2: 'MAR',
      3: 'APR',
      4: 'MAY',
      5: 'JUN',
      6: 'JUL',
      7: 'AUG',
      8: 'SEP',
      9: 'OCT',
      10: 'NOV',
      11: 'DEC'
    }
  }
};

const TEMPLATE_BOX = ['<div class="pd-date-picker"></div>'].join("");
const TEMPLATE_YEAR_MONTH = ['<div class="pd-date-picker-bigbox">',
  '        <div class="pd-date-picker-title-box">',
  '            <div class="pd-date-picker-btn pd-iconfont E_left icon-arrow-left"></div>',
  '            <div class="pd-date-picker-title E_view"></div>',
  '            <div class="pd-date-picker-btn pd-iconfont E_right icon-arrow-right"></div>',
  '        </div>',
  '        <div class="pd-date-picker-date-box">',
  '            <div class="yearmonthbox">',
  '                <ul class="E_pick">',
  '                </ul>',
  '            </div>',
  '        </div>',
  '    </div>'].join("");

const TEMPLATE_DAY = ['<div class="pd-date-picker-bigbox">',
  '        <div class="pd-date-picker-title-box">',
  '            <div class="pd-date-picker-btn pd-iconfont E_left icon-arrow-left"></div>',
  '            <div class="pd-date-picker-title E_view"></div>',
  '            <div class="pd-date-picker-btn pd-iconfont E_right icon-arrow-right"></div>',
  '        </div>',
  '        <div class="pd-date-picker-date-box">',
  '            <ul class="title">',
  '            </ul>',
  '            <div class="daybox">',
  '                <ul class="E_pick">',
  '                </ul>',
  '            </div>',
  '        </div>',
  '    </div>'].join("");

const TEMPLATE_WHEEL = ['<div class="pd-date-picker-box">',
  '            <div class="pd-date-picker-title-box">',
  '                <div class="pd-date-picker-title E_view"></div>',
  '            </div>',
  '            <div class="pd-date-picker-date-box">',
  '                <div class="hourbox">',
  '                </div>',
  '            </div>',
  '        </div>'].join("");

const TEMPLATE_ITEM = ['<div class="item">',
  '                        <div class="check-line"></div>',
  '                        <div class="check">',
  '                            <div class="check-list">',
  '                            </div>',
  '                        </div>',
  '                        <div class="wheel">',
  '                        </div>',
  '                    </div>'].join("");

const EVENTS_TYPE = ['change'];
let events = {};
