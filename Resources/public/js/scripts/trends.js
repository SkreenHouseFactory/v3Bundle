var Trends;
Trends = {
  init: function() {
    Trends.getTrends();
  },
  getTrends: function(type,args,nb_weeks) {
    var type = typeof type != 'undefined' ? '/' + type + '/' : '/';
    var nb_weeks = typeof nb_weeks != 'undefined' ? nb_weeks : '5';
    var args = typeof args != 'undefined' ? {format: args} : {};
    API.query(
      'GET',
      'trends' + type + nb_weeks + '.json',
      args,
      function(datas){
        if (type == '/') {
          Trends.getList('/program/',datas,nb_weeks);
          Trends.getList('/person/',datas,nb_weeks);
          Trends.getList('/category/',datas,nb_weeks);
          Trends.getList('/channel/',datas,nb_weeks);
        } else {
          Trends.getList(type,datas,nb_weeks);
        }
      }
    );
  },
  getList: function(type,datas,nb_weeks) {
    switch (type) {
      case '/program/':
        var weeks = datas.program.weeks;
        break;
      case '/person/':
        var weeks = datas.person.weeks;
        break;
      case '/category/':
        var weeks = datas.category.weeks;
        break;
      case '/channel/':
        var weeks = datas.channel.weeks;
        break;
    }
    console.log('scripts/trends.js', 'trends datas', type, weeks);
    var list = [];
    for (i in weeks) {
      for (k in weeks[i]) {
        if (typeof list[k] == 'undefined') {
          list[k] = [];
          list[k]['titre'] = weeks[i][k].titre;
          list[k]['id'] = weeks[i][k].id;
        }
      }
    }
    Trends.getCoord(type,weeks,list,nb_weeks);
  },
  getCoord: function(type,weeks,list,nb_weeks) {
    // console.log('scripts/trends.js', 'trends', type, 'list without Coords', list);
    for (k in list) {
      for (i in weeks) {
        if (typeof weeks[i][k] != 'undefined') {
          list[k][i] = weeks[i][k].nb;
        } else {
          list[k][i] = 0;
        }
      }
    }
    console.log('scripts/trends.js', 'trends list', type, 'list with Coords', list);
    var list_length = Object.keys(list).length;
    console.log('scripts/trends', 'getCoord', type, 'list length', list_length);
    if (list_length < 6) {
      Trends.draw(type,list,nb_weeks);
    } else {
      Trends.refineList(type,list,nb_weeks);
    }
  },
  refineList: function(type,list,nb_weeks) {
    var list_scored = [];
    list_scored = list;
    for (k in list_scored) {
      list_scored[k]['score'] = 0;
      for (var i = 0; i < list_scored[k].length; i++) {
        list_scored[k]['score'] += parseInt(list_scored[k][i]);
      };
    }
    console.log('scripts/trends.js', 'trends list', type, 'list with Score', list_scored);
    function compareDESC (homeA,homeB) {
      return parseInt(homeB['score']) - parseInt(homeA['score']);
    }
    var list_sorted = [];
    list_sorted = list_scored.sort(compareDESC);
    console.log('scripts/trends.js', 'trends list', type, 'list with Score - sorted', list_sorted);
    var list_trimmed = [];
    var i = 0;
    while (i < 5) {
      list_trimmed[list_sorted[i]['id']] = list_sorted[i];
      i++;
    }
    console.log('scripts/trends.js', 'trends list def', type, 'list def with Score - sorted and trimmed', list_trimmed);
    Trends.draw(type,list_trimmed,nb_weeks);
  },
  draw: function(type,list,nb_weeks) {
    var type = type.replace('/','').replace('/','');
    console.log('scripts/trends', 'draw', 'type', type);
    var x_axis = [];
    var i = 0;
    for (k in list) {
      x_axis[i] = [];
      for (var j = 0; j < nb_weeks; j++) {
        x_axis[i][j] = j;
      };
      i++;
    }
    console.log('scripts/trends', 'draw', 'x_axis complete', x_axis);
    var y_axis = [];
    var i = 0;
    for (k in list) {
      y_axis[i] = [];
      for (var j = 0; j < list[k].length; j++) {
        y_axis[i][j] = parseInt(list[k][j]*5);
      }
      i++;
    }
    console.log('scripts/trends', 'draw', 'y_axis complete not reversed', y_axis);
    for (var i = 0; i < y_axis.length; i++) {
      y_axis[i].reverse();
    };
    console.log('scripts/trends', 'draw', 'y_axis complete and reversed for timeline logic - from left, most ancient, to right, most recent', y_axis);
    TimeOut = setTimeout(function(){
      UI.removeLoader($('#trends-'+type));
      var date = new Date();
      var year_current = date.getFullYear();
      var months = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
      var month_current = months[date.getMonth()];
      var day_current = date.getDate();
      if (day_current == 1) {
        day_current = '1er';
      }
      var current_date = day_current + ' ' + month_current + ' ' + year_current; 
      console.log('scripts/trends','draw','current date', current_date);
      var nb_days = 7*nb_weeks;
      var last_date = new Date();
      last_date.setDate(date.getDate() - nb_days);
      var year_last = last_date.getFullYear();
      var month_last = months[last_date.getMonth()];
      var day_last = last_date.getDate();
      if (day_last == 1) {
        day_last = '1er';
      }
      var last_date_toshow = day_last + ' ' + month_last + ' ' + year_last;
      console.log('scripts/trends','draw','last date', last_date_toshow);
      var r = Raphael('trends-'+type, 320, 250);
      var lines = r.linechart(10, 10, 300, 200, x_axis, y_axis, {
        width: 4,
        smooth: true,
        symbol: 'circle'
      });
      var legends = [];
      for (k in list) {
        legends.push(list[k]['titre']);
      }
      console.log('legends', legends);
      $('#trends-'+type+' svg circle').attr('r',7);
      var circleseries = $('#trends-'+type+' svg circle');
      for (var i = 0; i < circleseries.length; i++) {
        for (var j = 0; j < legends.length; j++) {
          if (Math.floor(i / nb_weeks) == j) {
            $(circleseries[i]).attr('rel','tooltip');
            $(circleseries[i]).attr('data-placement','bottom');
            $(circleseries[i]).attr('data-title',legends[j]);
          }
        }
      }
      var txtattr = { font: "10px sans-serif" };
      r.text(40, 225, last_date_toshow).attr(txtattr);
      r.text(280, 225, current_date).attr(txtattr);
    },2000);
  }
}

$(document).ready(function(){
  Trends.init();

  $(document).on('click','.trends-container button', function(){
    $('.trends-container button').removeClass('active');
    $(this).addClass('active');
    $('#trends-program svg').remove();
    UI.appendLoader($('#trends-program'));
    if ($(this).data('trends') == 'all') {
      Trends.getTrends('program');
    } else {
      Trends.getTrends('program',$(this).data('trends'));
    }
  });

});