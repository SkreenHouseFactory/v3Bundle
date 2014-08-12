var Trends;
Trends = {
  nb_weeks: 10,
  list_programs: [],
  list_persons: [],
  list_categories: [],
  list_channels: [],
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
  getList: function(type,datas,nb_weeks){
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
        }
      }
    }
    Trends.getCoord(type,weeks,list,nb_weeks);
  },
  getCoord: function(type,weeks,list,nb_weeks){
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
    Trends.draw(type,list,nb_weeks);
  },
  draw: function(type,list,nb_weeks){
    var type = type.replace('/','').replace('/','');
    console.log('scripts/trends', 'draw', 'type', type);
    var list_length = Object.keys(list).length;
    console.log('scripts/trends', 'draw', 'list length', list_length);
    var x_axis = [];
    var i = 0;
    for (k in list) {
      x_axis[i] = [];
      for (var j = 0; j < nb_weeks; j++) {
        x_axis[i][j] = j+1;
      };
      i++;
    }
    console.log('scripts/trends', 'draw', 'x_axis complete', x_axis);
    var y_axis = [];
    var i = 0;
    for (k in list) {
      y_axis[i] = [];
      for (var j = 0; j < list[k].length; j++) {
        y_axis[i][j] = list[k][j];
      }
      i++;
    }
    console.log('scripts/trends', 'draw', 'y_axis complete', y_axis);
    var r = Raphael(type);
    var lines = r.linechart(30, 30, 450, 120, x_axis, y_axis, {
      axis: '0 0 1 1'
    });
  }
}

$(document).ready(function(){
  Trends.init();
});