'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

  var pkgjson = require('./package.json');
   
  var config = {
    pkg: pkgjson,
    app: 'app',
    dist: 'dist'
  }

  // see time used to load
  require('time-grunt')(grunt);

  // load the tasks
 require('load-grunt-tasks')(grunt);
  
  grunt.initConfig({
    
    config: config,
    pkg: config.pkg,
    bower: grunt.file.readJSON('./.bowerrc'),

    // cleanup of all the things
    clean: {   
      dev: {
        src: '.tmp'
      },
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= config.dist %>/*'
          ]
        }]
      },
    },

    //insert css & js
    injector: {
      scss: {
        options: {
          transform: function(filePath) {
            filePath = filePath.replace('/app/styles/', '');
            
            return '@import \'' + filePath + '\';';
          },
          starttag: '// injector',
          endtag: '// endinjector',
        },
        files: {
          '<%= config.app %>/styles/app.scss': [
            '<%= config.app %>/styles/**/*.scss',
            '!<%= config.app %>/styles/app.scss',
            '!<%= config.app %>/styles/framework/'
          ],
        }
      },
      
      scripts: {
        options: {
          transform: function(filePath) {
            filePath = filePath.replace('/.tmp/', '')
            
            return 'script(src="/' + filePath + '")';
          },
          starttag: '//- injector',
          endtag: '//- endinjector',
        },
        files: {
          '<%= config.app %>/views/scripts.jade': [
            '.tmp/scripts/**/*.js',
            '!.tmp/scripts/app.js'
          ]
        }
      }
    },
 
    // coffee to js
    coffee: {
      options: {
        sourceMap: true,
        sourceRoot: ''
      },
      site: {
        files: [{
          expand: true,
          cwd: '<%= config.app %>/scripts',
          src: '**/*.coffee',
          dest: '.tmp/scripts',
          ext: '.js'
        }]
      }
    },

    //jade to html
    jade: {
      compile: {
        options: {
          pretty: true,
          data: {
            debug: false
          }
        },
        files: [{
          expand: true,
          cwd: '.tmp/views',
          src: [ '**/*.jade' ],
          dest: '.tmp/html',
          ext: '.html'
        }]
      }
    },

    // sass to css
    sass: {
      site: {
        options: {
          loadPath: '<%= config.app %>/styles',
          compass: false
        },
        files: {
          '.tmp/styles/app.css' : '<%= config.app %>/styles/app.scss'
        }
      }
    },

    //image min
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.app %>/assets/images',
          src: '{,*/}*.{png,jpg,jpeg,gif}',
          dest: '.tmp/images'
        }]
      }
    },

    //svg min
    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.app %>/assets/images',
          src: '{,*/}*.svg',
          dest: '.tmp/images'
        }]
      }
    },
    
    // run some tasks in parallel to speed up the build process
    concurrent: {
      dev: [
        'coffee',
        'sass',
      ],

      dist: [
        'coffee',
        // 'jade',
        'sass',
        'imagemin',
        'svgmin'
      ],
    },

    //insert bower components
    wiredep: {
      site: {
        src: [
          '<%= config.app %>/views/scripts.jade',
          '<%= config.app %>/views/header.jade'
        ],

        options: {
          ignorePath: /(\.\.\/)*/,
          bowerJson: require('./bower.json'),
          fileTypes: {
            jade: {
              replace: {
                css: 'link(rel=\'stylesheet\', href=\'/{{filePath}}\')',
                js: 'script(src=\'/{{filePath}}\')'
              }
            }
          }
        }
      },
    },

    // css autoprefix
    autoprefixer: {
      options: {
        browsers: ['last 2 versions', 'ie 8', 'ie 9']
      },
      site: {
        files: [{
          expand: true,
          cwd: '.tmp/styles',
          src: '{,*/}*.css',
          dest: '.tmp/styles'
        }]
      }
    },

    //connect server
    express: { 
      dev: {
        options: {
          script: 'app.js',
          debug: true
        }
      }
    }, 

    // open browsers 
    open: {
      dev: {
        url: 'http://localhost:9000'
      },
    },

    // watch changes
    watch: {
      
      coffee: {
        files: ['<%= config.app %>/**/*.coffee'],
        tasks: ['newer:coffee', 'injector:scripts']
      },

      stylesheets: {
        files: '<%= config.app %>/**/*.scss',
        tasks: [ 'injector:scss', 'sass', 'autoprefixer' ]
      },

      jade: {
        files: ['<%= config.app %>/**/*.jade'],
        tasks: ['jade']
      },

      gruntfile: {
        files: ['Gruntfile.js']
      },
      
      livereload: {
        files: [
        '.tmp/**/*.css',
        '.tmp/**/*.html',
        '.tmp/**/*.js',
        '<%= config.app %>/assets/images/{,*//*}*.{png,jpg,jpeg,gif,webp,svg}'
        ],
        options: {
          livereload: true
        }
      },

      express: {
        files: [
          'app.js'
        ],
        tasks: ['express:dev', 'wait'],
        options: {
          livereload: true,
          nospawn: true
        }
      },
    },

    // copy over
    copy: {

      jade: {
          expand: true,
          dot: true,
          cwd: '<%= config.app %>/views',
          dest: '.tmp/views',
           src: '{,*/}*.jade'
      },
      
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= config.app %>/',
          dest: '<%= config.dist %>',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            'CNAME',
            'assets/fonts/**/*.*',
            'assets/images/**/*.*'
          ]
        }, {
          expand: true,
          cwd: '.tmp/styles/',
          dest: '<%= config.dist %>/styles',
          src: '*.min.css'
        },
         {
          expand: true,
          cwd: '.tmp/scripts/',
          dest: '<%= config.dist %>/scripts',
          src: '*.min.js'
        },

        {
          expand: true,
          cwd: '.tmp/html/',
          dest: '<%= config.dist %>/',
          src: [
            '**/*.html',
            '!partials/**/*.html',
            '!header.html',
            '!footer.html',
            '!nav.html',
            '!scripts.html'
          ]
        }]
      }
    },

    // prep call for usemin (target all html files)
    useminPrepare: {
      jade: [
          '.tmp/views/header.jade',  '.tmp/views/scripts.jade' 
      ],
          options: {
        dest: '.tmp/'
    }
    },

    // final call for usemin (target all html files)
    usemin: {
      jade: [
          '.tmp/views/header.jade', '.tmp/views/scripts.jade'
      ],
      
      options: {
          dirs: ['.tmp/'],
          basedir: '.tmp/',
          patterns: {
            jade: require('usemin-patterns').jade
          },
      }
    },

    // revision a specific set of static files, this can be
    // extended to do more files and images too
    filerev: {
      files: {
          src: [
              'dist/styles/*.min.css',
              'dist/scripts/*.min.js'
          ],
      }
    },

    'gh-pages': {
      options: {
        base: 'dist'
      },
      src: ['**/*']
    }
  });

  // Used for delaying livereload until after server has restarted
  grunt.registerTask('wait', function () {
    grunt.log.ok('Waiting for server reload...');

    var done = this.async();

    setTimeout(function () {
      grunt.log.writeln('Done waiting!');
      done();
    }, 500);
  });

  grunt.registerTask('dev', function(target) {
    grunt.task.run([
      'clean:dev',
      'injector:scss', 
      'concurrent:dev', 
      'injector',
      'wiredep', 
      'autoprefixer', 
      'express:dev', 
      'wait',
      'open',
      'watch'
    ]);
  });

  grunt.registerTask('dist', function(target) {
    grunt.task.run([
      'clean:dist', 
      'injector:scss', 
      'concurrent:dist',
      'injector',
      'wiredep', 
      'autoprefixer',
      'copy:jade',
      'useminPrepare',
      'concat',
      'uglify',
      'cssmin',
      // 'filerev',
      'usemin',
      'jade',
      'copy:dist',
      'gh-pages'
    ]);
  });
};