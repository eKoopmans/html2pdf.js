describe('html2pdf', function () {
  describe('creation', function () {
    it('should exist', function () {
      expect(html2pdf).to.exist;
    });

    it('should produce a thenable object', function () {
      expect(html2pdf().then).to.be.a('function');
      expect((new html2pdf.Worker).then).to.be.a('function');
    });
  });

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
    src: document.body,
    container: document.createElement('div'),
    overlay: document.createElement('div'),
    canvas: document.createElement('canvas'),
    img: document.createElement('img'),
    pdf: 'REPLACE WITH NEW JSPDF',
    pageSize: 'a4',
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
      it(key + ' should be set to ' + settings[key], function () {
        worker = worker.get(key).then(function (val) {
          expect(val.to.eql(settings[key]));
        });
      });
    }
  });

  describe('changing settings (individual)', function () {
    var worker = html2pdf();
    for (var key in settings) {
      it(key + ' should be set to ' + settings[key], function () {
        worker = worker.set({key: settings[key]}).get(key).then(function (val) {
          expect(val.to.eql(settings[key]));
        });
      });
    }
  });

  describe('changing settings (individual with delay)', function () {
    var delay = function () {
      return new Promise(function (resolve, reject) {
        setTimeout(resolve, 2000);
      });
    }

    var worker = html2pdf().then(delay);
    for (var key in settings) {
      it(key + ' should be set to ' + settings[key], function () {
        worker = worker.set({key: settings[key]}).get(key).then(function (val) {
          expect(val.to.eql(settings[key]));
        });
      });
    }
  });

  describe('changing settings 2', function () {
    it('should set immediately', function () {
      var worker = html2pdf().set(settings).get('filename').then(function (val) {
        expect(val).to.eql(settings[key]);
      });
    });
  });
});
