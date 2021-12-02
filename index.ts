import fs from 'fs';
import style from 'chalk';

const count = +process.argv[2];

Array.from(
	count
		? { length: count }
		: [
			'g₁(m, n) = |m - n|',
			'g₂(a) = sg(a)',
			'g₃(n) = 5 + n'
		]
).forEach((desc = '\b', num) => {
	num += 1;
	console.log(style.gray('==>'), style.cyan(desc), style.gray(`(${num})`))

	const rules = fs
		.readFileSync(`./files/rule2_${num}.txt`, { encoding: 'utf8' })
		.split('\n')
		.map((s) => s.replace(/\s*\/\/.*/, '').trim())
		.filter(Boolean)
		.map((s) => s
			.split('->')
			.map((s) => s
				.trim()
				.split(/\s+/)!
			)// as [[string, string], [string, string, string]]
		)
		// console.log(rules);
		.reduce((accum, [[sc, vc], [newsc, newvc, move]]) => {
			accum[sc] ??= {};
			if (vc in accum[sc]) {
				throw new Error(`double ${vc}`);
			}
			accum[sc][vc] = { newsc, newvc, move };
			return accum;
		}, {} as Record<
			string,
			Record<
				string,
				Record<'newsc' | 'newvc' | 'move', string>
			>
		>);

	const tests = fs
		.readFileSync(`./files/exam2_${num}.txt`, { encoding: 'utf8' })
		.split('\n')
		.map((s) => s.replace(/\s*\/\/.*/, '').trim())
		.filter(Boolean)
		.map((s) => s
			.split('->')
			.map((s) => s.trim())
		) as [string, string][];

	let globalOk = true;

	const exitIvent = () => {
		if (!globalOk) {
			console.log(style.red('FIND FATAL'));
			console.log(rules);
			process.exitCode = 1;
		} else {
			console.log(style.green('ALL OKEY'));
		}
	};

	process.on('exit', exitIvent);

	globalOk = tests.reduce<boolean>((status, [test, res]) => {
		const start = Date.now();

		const length = 100;
		let pos = length;
		const arr = Array.from({ length }, () => '').concat(...test.split(''));
		let sc = '01';
		process.stdout.write(style.gray('input: ') + test + '; ');
		while (sc !== '.') {
			if (Date.now() - start > 100) {
				console.log(style.red('timeout - meybe inf loop'));
				return false;
			}

			const rule = rules[sc][arr[pos] || '"'];
			if (!rule) {
				console.log({
					ans: arr.join('').replace(/^"+|"+$/g, ''),
					pos: pos - arr.findIndex((v) => v && v !== '"'),
					sc,
					rule,
				});
				console.log(style.red('not found rule'));
				return false;
			}
			sc = rule.newsc;
			arr[pos] = rule.newvc;
			switch (rule.move) {
				case 'R':
					pos += 1;
					break;
				case 'L':
					pos -= 1;
					break;
				default: if (sc !== '.') {
					console.log(style.red(`undefined type rule.move: "${rule.move}"`));
					return false;
				}
			}
		}
		const ans = arr.join('').replace(/^"+|"+$/g, '');
		const isOk = ans === res && arr.findIndex((v) => v && v !== '"') === pos;
		console.log(
			isOk ? style.green('ok:') : style.red('FATAL:'),
			[test, ans, res, pos - arr.findIndex((v) => v && v !== '"')]
		);
		return status && isOk;
	}, true);

	exitIvent();
	process.off('exit', exitIvent);
});
