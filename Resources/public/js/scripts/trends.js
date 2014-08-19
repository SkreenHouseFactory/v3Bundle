var Trends;
Trends = {
  nb_weeks: 5,
  init: function() {
    Trends.getTrends();
  },
  getTrends: function(type,nb_weeks,args) {
    var type = typeof type != 'undefined' ? '/' + type + '/' : '/';
    var nb_weeks = typeof nb_weeks != 'undefined' ? nb_weeks : this.nb_weeks;
    var args = typeof args != 'undefined' ? args : {};
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
    console.log('scripts/trends', 'draw', 'y_axis complete', y_axis);
    var r = Raphael('trends-'+type);
    var lines = r.linechart(30, 30, 450, 250, x_axis, y_axis, {
      width: 4,
      smooth: true
    });
    var legends = [];
    for (k in list) {
      legends.push(list[k]['titre']);
    }
    console.log('legends', legends);

    var lineseries = $('#trends-'+type+' svg path');
    for (var i = 0; i < lineseries.length; i++) {
      $(lineseries[i]).attr('rel','tooltip');
      $(lineseries[i]).attr('data-placement','right');
      $(lineseries[i]).attr('data-title',legends[i]);
    }
  }
}

$(document).ready(function(){
  Trends.init();
});