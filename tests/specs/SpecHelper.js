beforeEach(function () {
    this.addMatchers({
        toInclude: function (expected) {
            var failed;

            for (var i in expected) {
                if (expected.hasOwnProperty(i) && !this.actual.hasOwnProperty(i)) {
                    failed = [i, expected[i]];
                    break;
                }
            }

            if (undefined !== failed) {
                this.message = 'Failed asserting that array includes element "' + failed[0] + ' => ' + failed[1] + '"';

                return false;
            }

            return true;
        },

        toIntersectWith: function (expected) {
            function pp(rect) {
                return "rect(" + (rect.start || {}).x + "," + (rect.start || {}).y + "," + (rect.stop || {}).x + "," + (rect.stop || {}).y + ")";
            }
            this.message = function () {
                return "Expected " + pp(this.actual) + (this.isNot ? " not " : "") + "to" + " intersect with " + pp(expected) + ".";
            }
            var result = this.actual.intersects(expected);
            if (result) {
                return true;
            }
            return false;
        }
    });
});