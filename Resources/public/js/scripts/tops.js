var Tops;
Tops = {
  init: function(){
    Tops.getTops('program');
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
  draw: function(type,list) {
    var type = type.replace('/','');
    console.log('scripts/tops', 'draw', 'type', type);
    var list_length = Object.keys(list).length;
    var values = [];
    var legends = [];
    for (var i = 0; i < list_length; i++) {
      values[i] = list[i].nb;
      /*legends[i] = list[i].titre;*/
    }
    console.log('scripts/tops', 'draw', 'values', values);
    var r = Raphael('tops-'+type);
    fin = function () {
      /*for (var i = this.bars.length; i--;) {
        legends.push(this.bars[i].value || "0");
      }*/
      this.flag = r.popup(this.bar.x, this.bar.y, this.bar.value || "0").insertBefore(this);
    },
    fout = function () {
      this.flag.animate({opacity: 0}, 300, function () {this.remove();});
    },
    r.barchart(10,10,600,250,values,{}).hover(fin,fout);
  }
}

$(document).ready(function(){
  Tops.init();
});