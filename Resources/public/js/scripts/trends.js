var Trends;
Trends = {
  nb_weeks: 5,
  list_programs: {},
  init: function() {
    var args = {};
    API.query(
      'GET',
      'trends/' + this.nb_weeks + '.json',
      args,
      function(datas){
        console.log('scripts/trends.js', 'trends datas', datas);
        console.log('scripts/trends.js', 'datas.program.weeks', datas.program.weeks);
        for (i in datas.program.weeks) {
          for (k in datas.program.weeks[i]) {
            if (typeof this.list_programs == 'undefined') {
              this.list_programs = new Object();
              this.list_programs[k] = datas.program.weeks[i][k].titre;
            } else if (typeof this.list_programs[k] == 'undefined') {
              this.list_programs[k] = datas.program.weeks[i][k].titre;
            }
          }
        }
        console.log('scripts/trends.js', 'list_programs', this.list_programs);
      }
    );
  },
  draw: function(){
    var r_programs = Raphael('holder');
    var abs_programs = [];
    var ord_programs = [];
    var lines = r_programs.linechart(0,0,300,220,abs_programs,ord_programs)
  }
}

$(document).ready(function(){
  Trends.init();

});