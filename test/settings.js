describe('html2pdf', function () {
  describe('settings', function () {
    describe('default settings', function () {
      var worker = html2pdf();
      var template = html2pdf.Worker.template;

      for (var key in template) {
        it(key + ' should begin with its default value', function () {
          // Use eql (a deep equal) to compare objects.
          expect(worker[key]).to.eql(template[key]);
        });
      }
    });

    // Sample settings to test with.
    var settings = {
      src: document.createElement('div'),
      container: document.createElement('div'),
      overlay: document.createElement('div'),
      canvas: document.createElement('canvas'),
      img: document.createElement('img'),
      pdf: 'REPLACE WITH NEW JSPDF',
      // Omitting pageSize because of unique behaviour.
      // pageSize: { 'width': 595.28, 'height': 841.89, 'unit': 'pt', 'k': 1 },
      filename: 'test.pdf',
      margin: [1,2,3,4],
      image: { type: 'png', quality: 1.0 },
      enableLinks: false,
      html2canvas: {test: 1},
      jsPDF: {test: 1},
      miscOpt: 1
    };

    describe('changing settings (batch)', function () {
      var worker = html2pdf().set(settings);
      for (var key in settings) {
        (function closure(key) {
          it(key + ' should be set to ' + settings[key], function () {
            return worker.get(key).then(function (val) {
              expect(val).to.eql(settings[key]);
            });
          });
        })(key);
      }
    });

    describe('changing settings (individual)', function () {
      var worker = html2pdf();
      for (var key in settings) {
        (function closure(key) {
          it(key + ' should be set to ' + settings[key], function () {
            var setting = {};
            setting[key] = settings[key];
            return worker.set(setting).get(key).then(function (val) {
              expect(val).to.eql(settings[key]);
            });
          });
        })(key);
      }
    });
  });
});
