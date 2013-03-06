suite('ical/period', function() {

  var start, end, duration;

  setup(function() {
    start = ICAL.Time.fromString("1970-01-02T03:04:05Z");
    end = ICAL.Time.fromString("1970-01-02T03:04:05Z");
    duration = ICAL.Duration.fromString("PT3H2M1S");
  });

  suite('#fromString', function() {
    var assertions = {};

    function verify(string, data) {
      var key;
      test('parse: "' + string + '"', function() {
        var subject = ICAL.Period.fromString(string);

        if ('start' in data) {
          assert.instanceOf(subject.start, ICAL.Time);
          assert.hasProperties(
            subject.start,
            data.start,
            'start property'
          );
        }

        if ('end' in data) {
          assert.instanceOf(subject.end, ICAL.Time);
          assert.hasProperties(
            subject.end,
            data.end,
            'end property'
          );
        }

        if ('duration' in data) {
          if (data['duration']) {
            assert.instanceOf(subject.duration, ICAL.Duration);
            assert.hasProperties(
              subject.duration,
              data.duration,
              'duration property'
            );
          } else {
            assert.isNull(subject.duration);
          }
        }

        if ('calculated_duration' in data) {
          var dur = subject.getDuration();

          if ('duration' in data && data.duration) {
            assert.hasProperties(dur, data.duration, 'duration matches calculated');
          } 
          assert.hasProperties(dur, data.calculated_duration);
        }
      });
    }

    function verifyFail(testname, string, errorParam) {
      test('invalid input "' + string + '"', function() {
        assert.throws(function() {
          ICAL.Period.fromString(string);
        }, errorParam);
      });
    }

    verifyFail('missing slash', '1997-01-01T18:30:20Z1997-01-02T07:00:00Z', /Invalid string value/);
    verifyFail('invalid start date', 'some time before/1997-01-02T07:00:00Z', /invalid date-time value/);
    verifyFail('invalid end param', '1997-01-02T07:00:00Z/some time after', /invalid date-time value/);
    verifyFail('invalid end param that might be a duration', '1997-01-02T07:00:00Z/Psome time after', /invalid duration value/);

    verify('1997-01-01T18:30:20Z/1997-01-02T07:00:00Z', {
      start: {
        year: 1997,
        month: 1,
        day: 1,
        hour: 18,
        minute: 30,
        second: 20
      },

      end: {
        year: 1997,
        month: 1,
        day: 2,
        hour: 07
      },

      duration: null,
      calculated_duration: {
        isNegative: false,
        hours: 12,
        minutes: 29,
        seconds: 40
      }
    });

    verify('1997-01-01T18:00:00Z/PT5H30M', {
      start: {
        year: 1997,
        month: 1,
        day: 1,
        hour: 18
      },

      duration: {
        isNegative: false,
        hours: 5,
        minutes: 30
      },
      calculated_duration: {
        isNegative: false,
        hours: 5,
        minutes: 30
      }
    });

  });

  suite('#fromData', function() {
    test('empty object', function() {
      assert.throws(function() {
        ICAL.Period.fromData();
      }, /must be initialized/);
    });

    test('valid start,end', function() {
      var subject = ICAL.Period.fromData({
        start: start,
        end: end
      });

      assert.hasProperties(subject.start, start, 'start date');
      assert.hasProperties(subject.end, end, 'end date');
      assert.isNull(subject.duration);
    });
    test('valid start,duration', function() {
      var subject = ICAL.Period.fromData({
        start: start,
        duration: duration,
      });

      assert.hasProperties(subject.start, start, 'start date');
      assert.isNull(subject.end);
      assert.hasProperties(subject.duration, duration, 'duration');
    });
    test('start,end and duration', function() {
      assert.throws(function() {
        var subject = ICAL.Period.fromData({
          start: start,
          end: end,
          duration: duration
        });
      }, /cannot accept both end and duration/);
    });

    test('invalid start value', function() {
      assert.throws(function() {
        var subject = ICAL.Period.fromData({
          start: '1970-01-02T03:04:05Z',
          end: end
        });
      }, /start must be an instance/);
    });
    test('invalid end value', function() {
      assert.throws(function() {
        var subject = ICAL.Period.fromData({
          start: start,
          end: '1970-01-02T03:04:05Z'
        });
      }, /end must be an instance/);
    });
    test('invalid duration value', function() {
      assert.throws(function() {
        var subject = ICAL.Period.fromData({
          start: start,
          duration: 'PT1S'
        });
      }, /duration must be an instance/);
    });
  });

  suite('#toString', function() {
    test('start,end', function() {
        var subject = ICAL.Period.fromData({
          start: start,
          end: end
        });
        assert.equal(subject.toString(), '1970-01-02T03:04:05Z/1970-01-02T03:04:05Z');
    });
    test('start,duration', function() {
        var subject = ICAL.Period.fromData({
          start: start,
          duration: duration
        });
        assert.equal(subject.toString(), '1970-01-02T03:04:05Z/PT3H2M1S');
    });
  });
});