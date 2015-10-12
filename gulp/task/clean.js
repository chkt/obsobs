import _gulp from 'gulp';

import _del from 'del';



_gulp.task('clean', done => {
	_del('dist/**/*.js')
		.then(done.bind(null, undefined));
});