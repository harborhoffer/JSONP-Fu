/*
 * This is a Node.JS script that will automatically generate
 * a documentation template to make your life a lot easier.
 *
 * The way it works is, it loads the plugin and eval's the plugin code,
 * then looks at the API object returned and converts the object into XML.
 *
 * It will automatically check each JS file in the /lib directory
 * and create a documentation template for it *only if one doesn't exist yet*
 *
 * Usage: node autogen_docs.js
 */
 
var fs = require('fs'),
	jsonpfu,
	libs = {},
	script = {
		include: function () { },
		remove: function () { },
		include_lib: function () { },
		jsonp_query: function () { }
	},
	lib_dir = '../lib/',
	apis = '../docs/APIs/',
	window = {},
	document = {
		getElementById: function () { },
		getElementsByName: function () { },
		getElementsByTagName: function () { },
		createElement: function () { }
	};
	
jsonpfu = {
	extend: function (name, lib) {
		libs[name] = lib.call(this, {}, script);
	}
};

(function () {
	var generate = function (file) {
		var	code = fs.readFileSync(lib_dir + file + '.js', 'utf8'),
			md = "";
		
		try{
			eval(code);
			console.log("=> Finished:\t" + file);
		} catch (err) {
			console.log("=> Failed:\t" + file);
			console.log("=> Reason:\t" + err);
			
			return;
		}
		
		md += "<h1>" + file + " API Reference</h1>\n";
		md += "Documentation generated: " + date('F j, Y g:ia') + "\n";
		md += OBJtoMarkdown(libs[file]);
		
		try {
			fs.statSync(apis + file);
		} catch (err) {
			fs.mkdirSync(apis + file, 0775);
		}
		
		fs.writeFileSync(apis + file + '/README.md', md, 'utf8');
	},
	
	OBJtoXML = function (obj, d) {
		d = (d) ? d : 0;
		var rString = "\n";
		var pad = "";
		for (var i = 0; i < d; i++) {
			pad += "\t";
		}
		if (typeof obj === "object") {
			if (obj.constructor.toString().indexOf("Array") !== -1) {
				for (i = 0; i < obj.length; i++) {
					rString += pad + "<item>" + obj[i] + "</item>\n";
				}
				rString = rString.substr(0, rString.length - 1)
			}
			else {
				for (i in obj) {
					if (typeof obj[i] === 'function') {
						rString += ((rString === "\n") ? "" : "\n") + 
							pad + '<endpoint name="' + i + '">' +
							((typeof obj[i] === "object") ? "\n" + pad : "") + 
							"</endpoint>"; 
					} else {
						var val = OBJtoXML(obj[i], d + 1);
						if (!val) return false;
						rString += ((rString === "\n") ? "" : "\n") + 
							pad + '<category name="' + i + '">' + val + 
							((typeof obj[i] === "object") ? "\n" + pad : "") + 
							"</category>\n";
					}
				}
			}
		}
		else if (typeof obj === "string") {
			rString = obj;
		}
		else if (obj.toString) {
			rString = obj.toString();
		}
		else {
			return false;
		}
		return rString;
	},
	
	OBJtoMarkdown = function (obj, d) {
		d = (d) ? d : 0;
		var rString = "\n";
		var pad = "";
		for (var i = 1; i < d; i++) {
			pad += "\t";
		}
		if (typeof obj === "object") {
			if (obj.constructor.toString().indexOf("Array") !== -1) {
				for (i = 0; i < obj.length; i++) {
					rString += pad + "<h" + (d+2) + ">" + obj[i] + "</h" + (d+2) + ">\n";
				}
				rString = rString.substr(0, rString.length - 1)
			}
			else {
				for (i in obj) {
					if (typeof obj[i] === 'function') {
						rString += pad + '* ' + i + "\n"; 
					} else {
						var val = OBJtoMarkdown(obj[i], d + 1);
						if (!val) return false;
						rString += ((rString === "\n") ? "" : "\n") + 
							pad + '<h' + (d+2) + '>' + i + "</h" + (d+2) + ">\n" + val;
					}
				}
			}
		}
		else if (typeof obj === "string") {
			rString = obj;
		}
		else if (obj.toString) {
			rString = obj.toString();
		}
		else {
			return false;
		}

		return rString;
	};
	
	fs.readdir('../lib/', function (err, files) {
		var i, file_info, file;
		
		for (i in files) {
			file_info = files[i].split('.');
			if (file_info[file_info.length - 1] !== 'js') {
				continue;
			}
			
			file = file_info[0];
			
			try {
				fs.readFileSync(apis + file + '/README.md');
				console.log("Skipping:\t" + file);
			} catch (err) {
				console.log("Generating:\t" + file);
				generate(file);
			}
		}
	});
}());

function date(format, timestamp) {
    // http://kevin.vanzonneveld.net
    // +   original by: Carlos R. L. Rodrigues (http://www.jsfromhell.com)
    // +      parts by: Peter-Paul Koch (http://www.quirksmode.org/js/beat.html)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: MeEtc (http://yass.meetcweb.com)
    // +   improved by: Brad Touesnard
    // +   improved by: Tim Wiel
    // +   improved by: Bryan Elliott
    //
    // +   improved by: Brett Zamir (http://brett-zamir.me)
    // +   improved by: David Randall
    // +      input by: Brett Zamir (http://brett-zamir.me)
    // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Brett Zamir (http://brett-zamir.me)
    // +   improved by: Brett Zamir (http://brett-zamir.me)
    // +   improved by: Theriault
    // +  derived from: gettimeofday
    // +      input by: majak
    // +   bugfixed by: majak
    // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      input by: Alex
    // +   bugfixed by: Brett Zamir (http://brett-zamir.me)
    // +   improved by: Theriault
    // +   improved by: Brett Zamir (http://brett-zamir.me)
    // +   improved by: Theriault
    // +   improved by: Thomas Beaucourt (http://www.webapp.fr)
    // +   improved by: JT
    // +   improved by: Theriault
    // +   improved by: Rafał Kukawski (http://blog.kukawski.pl)
    // %        note 1: Uses global: php_js to store the default timezone
    // %        note 2: Although the function potentially allows timezone info (see notes), it currently does not set
    // %        note 2: per a timezone specified by date_default_timezone_set(). Implementers might use
    // %        note 2: this.php_js.currentTimezoneOffset and this.php_js.currentTimezoneDST set by that function
    // %        note 2: in order to adjust the dates in this function (or our other date functions!) accordingly
    // *     example 1: date('H:m:s \\m \\i\\s \\m\\o\\n\\t\\h', 1062402400);
    // *     returns 1: '09:09:40 m is month'
    // *     example 2: date('F j, Y, g:i a', 1062462400);
    // *     returns 2: 'September 2, 2003, 2:26 am'
    // *     example 3: date('Y W o', 1062462400);
    // *     returns 3: '2003 36 2003'
    // *     example 4: x = date('Y m d', (new Date()).getTime()/1000); 
    // *     example 4: (x+'').length == 10 // 2009 01 09
    // *     returns 4: true
    // *     example 5: date('W', 1104534000);
    // *     returns 5: '53'
    // *     example 6: date('B t', 1104534000);
    // *     returns 6: '999 31'
    // *     example 7: date('W U', 1293750000.82); // 2010-12-31
    // *     returns 7: '52 1293750000'
    // *     example 8: date('W', 1293836400); // 2011-01-01
    // *     returns 8: '52'
    // *     example 9: date('W Y-m-d', 1293974054); // 2011-01-02
    // *     returns 9: '52 2011-01-02'
    var that = this,
        jsdate, f, formatChr = /\\?([a-z])/gi, formatChrCb,
        // Keep this here (works, but for code commented-out
        // below for file size reasons)
        //, tal= [],
        _pad = function (n, c) {
            if ((n = n + "").length < c) {
                return new Array((++c) - n.length).join("0") + n;
            } else {
                return n;
            }
        },
        txt_words = ["Sun", "Mon", "Tues", "Wednes", "Thurs", "Fri", "Satur",
        "January", "February", "March", "April", "May", "June", "July",
        "August", "September", "October", "November", "December"],
        txt_ordin = {
            1: "st",
            2: "nd",
            3: "rd",
            21: "st", 
            22: "nd",
            23: "rd",
            31: "st"
        };
    formatChrCb = function (t, s) {
        return f[t] ? f[t]() : s;
    };
    f = {
    // Day
        d: function () { // Day of month w/leading 0; 01..31
            return _pad(f.j(), 2);
        },
        D: function () { // Shorthand day name; Mon...Sun
            return f.l().slice(0, 3);
        },
        j: function () { // Day of month; 1..31
            return jsdate.getDate();
        },
        l: function () { // Full day name; Monday...Sunday
            return txt_words[f.w()] + 'day';
        },
        N: function () { // ISO-8601 day of week; 1[Mon]..7[Sun]
            return f.w() || 7;
        },
        S: function () { // Ordinal suffix for day of month; st, nd, rd, th
            return txt_ordin[f.j()] || 'th';
        },
        w: function () { // Day of week; 0[Sun]..6[Sat]
            return jsdate.getDay();
        },
        z: function () { // Day of year; 0..365
            var a = new Date(f.Y(), f.n() - 1, f.j()),
                b = new Date(f.Y(), 0, 1);
            return Math.round((a - b) / 864e5) + 1;
        },

    // Week
        W: function () { // ISO-8601 week number
            var a = new Date(f.Y(), f.n() - 1, f.j() - f.N() + 3),
                b = new Date(a.getFullYear(), 0, 4);
            return 1 + Math.round((a - b) / 864e5 / 7);
        },

    // Month
        F: function () { // Full month name; January...December
            return txt_words[6 + f.n()];
        },
        m: function () { // Month w/leading 0; 01...12
            return _pad(f.n(), 2);
        },
        M: function () { // Shorthand month name; Jan...Dec
            return f.F().slice(0, 3);
        },
        n: function () { // Month; 1...12
            return jsdate.getMonth() + 1;
        },
        t: function () { // Days in month; 28...31
            return (new Date(f.Y(), f.n(), 0)).getDate();
        },

    // Year
        L: function () { // Is leap year?; 0 or 1
            return new Date(f.Y(), 1, 29).getMonth() === 1 | 0;
        },
        o: function () { // ISO-8601 year
            var n = f.n(), W = f.W(), Y = f.Y();
            return Y + (n === 12 && W < 9 ? -1 : n === 1 && W > 9);
        },
        Y: function () { // Full year; e.g. 1980...2010
            return jsdate.getFullYear();
        },
        y: function () { // Last two digits of year; 00...99
            return (f.Y() + "").slice(-2);
        },

    // Time
        a: function () { // am or pm
            return jsdate.getHours() > 11 ? "pm" : "am";
        },
        A: function () { // AM or PM
            return f.a().toUpperCase();
        },
        B: function () { // Swatch Internet time; 000..999
            var H = jsdate.getUTCHours() * 36e2, // Hours
                i = jsdate.getUTCMinutes() * 60, // Minutes
                s = jsdate.getUTCSeconds(); // Seconds
            return _pad(Math.floor((H + i + s + 36e2) / 86.4) % 1e3, 3);
        },
        g: function () { // 12-Hours; 1..12
            return f.G() % 12 || 12;
        },
        G: function () { // 24-Hours; 0..23
            return jsdate.getHours();
        },
        h: function () { // 12-Hours w/leading 0; 01..12
            return _pad(f.g(), 2);
        },
        H: function () { // 24-Hours w/leading 0; 00..23
            return _pad(f.G(), 2);
        },
        i: function () { // Minutes w/leading 0; 00..59
            return _pad(jsdate.getMinutes(), 2);
        },
        s: function () { // Seconds w/leading 0; 00..59
            return _pad(jsdate.getSeconds(), 2);
        },
        u: function () { // Microseconds; 000000-999000
            return _pad(jsdate.getMilliseconds() * 1000, 6);
        },

    // Timezone
        e: function () { // Timezone identifier; e.g. Atlantic/Azores, ...
// The following works, but requires inclusion of the very large
// timezone_abbreviations_list() function.
/*              return this.date_default_timezone_get();
*/
            throw 'Not supported (see source code of date() for timezone on how to add support)';
        },
        I: function () { // DST observed?; 0 or 1
            // Compares Jan 1 minus Jan 1 UTC to Jul 1 minus Jul 1 UTC.
            // If they are not equal, then DST is observed.
            var a = new Date(f.Y(), 0), // Jan 1
                c = Date.UTC(f.Y(), 0), // Jan 1 UTC
                b = new Date(f.Y(), 6), // Jul 1
                d = Date.UTC(f.Y(), 6); // Jul 1 UTC
            return 0 + ((a - c) !== (b - d));
        },
        O: function () { // Difference to GMT in hour format; e.g. +0200
            var a = jsdate.getTimezoneOffset();
            return (a > 0 ? "-" : "+") + _pad(Math.abs(a / 60 * 100), 4);
        },
        P: function () { // Difference to GMT w/colon; e.g. +02:00
            var O = f.O();
            return (O.substr(0, 3) + ":" + O.substr(3, 2));
        },
        T: function () { // Timezone abbreviation; e.g. EST, MDT, ...
// The following works, but requires inclusion of the very
// large timezone_abbreviations_list() function.
/*              var abbr = '', i = 0, os = 0, default = 0;
            if (!tal.length) {
                tal = that.timezone_abbreviations_list();
            }
            if (that.php_js && that.php_js.default_timezone) {
                default = that.php_js.default_timezone;
                for (abbr in tal) {
                    for (i=0; i < tal[abbr].length; i++) {
                        if (tal[abbr][i].timezone_id === default) {
                            return abbr.toUpperCase();
                        }
                    }
                }
            }
            for (abbr in tal) {
                for (i = 0; i < tal[abbr].length; i++) {
                    os = -jsdate.getTimezoneOffset() * 60;
                    if (tal[abbr][i].offset === os) {
                        return abbr.toUpperCase();
                    }
                }
            }
*/
            return 'UTC';
        },
        Z: function () { // Timezone offset in seconds (-43200...50400)
            return -jsdate.getTimezoneOffset() * 60;
        },

    // Full Date/Time
        c: function () { // ISO-8601 date.
            return 'Y-m-d\\Th:i:sP'.replace(formatChr, formatChrCb);
        },
        r: function () { // RFC 2822
            return 'D, d M Y H:i:s O'.replace(formatChr, formatChrCb);
        },
        U: function () { // Seconds since UNIX epoch
            return jsdate.getTime() / 1000 | 0;
        }
    };
    this.date = function (format, timestamp) {
        that = this;
        jsdate = (
            (typeof timestamp === 'undefined') ? new Date() : // Not provided
            (timestamp instanceof Date) ? new Date(timestamp) : // JS Date()
            new Date(timestamp * 1000) // UNIX timestamp (auto-convert to int)
        );
        return format.replace(formatChr, formatChrCb);
    };
    return this.date(format, timestamp);
}
