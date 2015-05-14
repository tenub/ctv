module.exports = function (grunt) {
  var pkg = require('./package.json');
  var fs = require('fs');

  require('load-grunt-tasks')(grunt);

  // default to show available options
  grunt.registerTask('tasks', function() {
    grunt.log.subhead('Please choose a grunt task:');
    grunt.log.ok('"grunt build" - builds assets');
    grunt.log.ok('"grunt doc" - parse comments and generate jsdoc');
  });

  grunt.registerTask('schedule', function() {
    // only retrieve schedule from api if it is older than a full day (to cut down on hammering tvrage)
    if(!grunt.file.exists('build/schedule.xml') || (grunt.file.exists('build/schedule.xml') && (new Date() - fs.statSync('build/schedule.xml').mtime) > 86400000)) {
      grunt.task.run('remotefile:schedule');
    }

    grunt.task.run('convert');
  });

  grunt.registerTask('normalize', function() {
    // read in schedule in json format
    var json = grunt.file.readJSON('build/schedule.json');

    // convert all show objects to show arrays
    for(var i=0, l=json.schedule.DAY.length; i<l; i++) {
      if(json.schedule.DAY[i].time.constructor !== Array) {
        json.schedule.DAY[i].time = [json.schedule.DAY[i].time];
      }
      for(var j=0, ll=json.schedule.DAY[i].time.length; j<ll; j++) {
        if(json.schedule.DAY[i].time[j].show.constructor !== Array) {
          json.schedule.DAY[i].time[j].show = [json.schedule.DAY[i].time[j].show];
        }
      }
    }

    // overwrite previous file with modified json data
    grunt.file.write('build/schedule.json', JSON.stringify(json, null, 2));
  });

  grunt.registerTask('build', function() {
    grunt.task.run('clean');

    if(!grunt.file.exists('build/schedule.xml')) {
      grunt.log.error('please run "grunt schedule" first');
    } else {
      grunt.task.run('normalize');
    }

    grunt.task.run(['sass', 'csslint:lax', 'jshint', 'concat', 'autoprefixer', 'copy:js', 'cleanempty', 'cssmin:css', 'uglify', 'copy:images', 'copy:html', 'copy:json', 'replace']);
  });

  grunt.registerTask('default', 'tasks');
  grunt.registerTask('doc', 'jsdoc:all');
  grunt.registerTask('lint', 'jshint');

  grunt.initConfig({
    clean: {
      all: ['build/**/*', '!build/schedule.*', 'dist']
    },
    remotefile: {
      schedule: {
        url: 'http://services.tvrage.com/feeds/fullschedule.php?country=US',
        dest: 'build/schedule.xml'
      }
    },
    convert: {
      options: {
        explicitArray: false,
      },
      xml2json: {
        src: ['build/schedule.xml'],
        dest: 'build/schedule.json'
      }
    },
    sass: {
      dist: {
        files: [{
          expand: true,
          cwd: 'src/assets/scss',
          src: ['*.scss'],
          dest: 'build/assets/css',
          ext: '.css'
        }]
      }
    },
    csslint: {
      strict: {
        options: {
          'import': 2
        },
        src: ['src/**/*.css']
      },
      lax: {
        options: {
          'adjoining-classes': false,
          'box-sizing': false,
          'box-model': false,
          'floats': false,
          'font-sizes': false,
          'ids': false,
          'import': false,
          'known-properties': false,
          'outline-none': false,
          'overqualified-elements': false,
          'qualified-headings': false,
          'unique-headings': false,
          'universal-selector': false,
          'unqualified-attributes': false
        },
        src: ['src/**/*.css']
      }
    },
    jshint: {
      all: [
        'Gruntfile.js',
        'src/js/**/*.js',
        '!src/js/lib/**/*.js'
      ]
    },
    jsdoc: {
      dist: {
        src: ['src/**/*.js'],
        options: {
          destination: 'doc'
        }
      }
    },
    concat: {
      css: {
        src: ['build/assets/css/*.css'],
        dest: 'build/assets/css/main.css'
      }
    },
    autoprefixer: {
      no_dest: {
        src: 'build/assets/css/main.css'
      }
    },
    cleanempty: {
      dist: {
        options: {
          files: false,
        },
        src: ['build/**/*', 'dist/**/*']
      },
    },
    cssmin: {
      css: {
        files: [{
          expand: true,
          cwd: 'build/assets/css',
          src: ['main.css'],
          dest: 'dist/assets/css',
          ext: '.min.css'
        }]
      }
    },
    uglify: {
      options: {
        compress: {
          drop_console: true
        },
        mangle: false
      },
      js: {
        files: [{
          expand: true,
          cwd: 'build/assets/js',
          src: '**/*.js',
          dest: 'dist/assets/js',
          ext: '.min.js'
        }]
      }
    },
    copy: {
      images: {
        files: [
          {
            expand: true,
            flatten: true,
            src: 'src/assets/img/*',
            dest: 'dist/assets/img'
          },
          {
            expand: true,
            flatten: true,
            src: 'src/assets/img/*',
            dest: 'build/assets/img/'
          }
        ]
      },
      html: {
        files: [
          {
            expand: true,
            flatten: true,
            src: 'src/*.htm*',
            dest: 'build',
          },
          {
            expand: true,
            flatten: true,
            src: 'src/*.htm*',
            dest: 'dist'
          }
        ]
      },
      js: {
        files: [
          {
            expand: true,
            flatten: true,
            src: 'src/assets/js/**/*.js',
            dest: 'build/assets/js'
          }
        ]
      },
      json: {
        files: [
          {
            expand: true,
            flatten: true,
            src: 'build/**/*.json',
            dest: 'dist'
          }
        ]
      },
      tmpl: {
        files: [
          {
            expand: true,
            flatten: true,
            src: 'src/assets/js/tmpl/*.tpl.html',
            dest: 'build/assets/js/tmpl'
          }
        ]
      }
    },
    replace: {
      dist: {
        options: {
          patterns: [
            {
              match: /<script src="([^"]+)\.js"><\/script>/g,
              replacement: '<script src="$1.min.js"><\/script>'
            },
            {
              match: /<link rel="stylesheet" href="([^"]+)\.css" ?\/?>/g,
              replacement: '<link rel="stylesheet" href="$1.min.css"/>'
            }
          ]
        },
        files: [{
          expand: true,
          flatten: true,
          src: ['dist/*.htm*'],
          dest: 'dist'
        }]
      }
    }
  });
};