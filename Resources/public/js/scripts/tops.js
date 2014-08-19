var Tops;
Tops = {
  init: function(){
    Tops.getTops();
  },
  getTops: function(type,args) {
    var type = typeof type != 'undefined' ? '/' + type : '';
    var args = typeof args != 'undefined' ? args : {};
    API.query(
      'GET',
      'top' + type + '.json',
      args,
      function(datas){
        Tops.setList(type,datas);
      }
    );
  },
  setList: function(type,datas) {
    switch (type) {
      case '/program':
        var list_programs = datas.program;
        Tops.draw(type,list_programs);
        break;
      case '/channel':
        var list_channels = datas.channel;
        Tops.draw(type,list_channels);
        break;
      case '/person':
        var list_persons = datas.person;
        Tops.draw(type,list_persons);
        break;
      default:
        var list_programs = datas.program;
        console.log('scripts/tops.js', type, 'list_programs', list_programs);
        var list_channels = datas.channel;
        console.log('scripts/tops.js', type, 'list_channels', list_channels);
        var list_persons = datas.person;
        console.log('scripts/tops.js', type, 'list_persons', list_channels);
        Tops.draw('/program',list_programs);
        Tops.draw('/channel',list_channels);
        Tops.draw('/person',list_persons);
    }
  },
  draw: function(type,list,callback) {
    var type = type.replace('/','');
    console.log('scripts/tops', 'draw', 'type', type);
    var list_length = Object.keys(list).length;
    var values = [];
    var legends = [];
    for (var i = 0; i < list_length; i++) {
      values[i] = list[i].nb;
      legends[i] = list[i].titre;
    }
    console.log('scripts/tops', 'draw', 'values', values);
    console.log('scripts/tops', 'draw', 'legends', legends);
    var r = Raphael('tops-'+type);
    fin = function () {
      this.flag = r.popup(this.bar.x, this.bar.y, this.bar.value || "0").insertBefore(this);
    },
    fout = function () {
      this.flag.animate({opacity: 0}, 300, function () {this.remove();});
    },
    r.barchart(10,10,600,250,values,{}).hover(fin,fout);
    var columns = $('#tops-'+type+' svg rect');
    for (var i = 0; i < columns.length; i++) {
      $(columns[i]).attr('rel','tooltip');
      $(columns[i]).attr('data-placement','bottom');
      $(columns[i]).attr('data-title',legends[i]);
    }
  }
}

$(document).ready(function(){
  Tops.init();
  $('body').tooltip({
    selector: '[rel=tooltip]',
    container: 'body'
  });

});