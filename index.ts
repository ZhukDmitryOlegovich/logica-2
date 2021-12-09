/* eslint-disable no-console */
import style from 'chalk';
import fs from 'fs';

const { COUNT } = process.env;
const DEBAG = !!process.env.DEBAG;
const TIMEOUT = +(process.env.TIMEOUT ?? 100);
// const smallNum = ['₀₁₂₃₄₅₆₇₈₉'];
// const minusOp = '∸';

Array.from(
	COUNT
		? { length: +COUNT }
		: [
			'g₁(m, n) = |m - n|',
			'g₂(m) = sg(m)',
			'g₃(m) = 5 + m',
		],
).forEach((desc = '\b', num) => {
	num += 1;
	console.log(style.gray('==>'), style.cyan(desc), style.gray(`(${num})`));

	let globalOk = true;

	try {
		const rules = fs
			.readFileSync(`./files/rule2_${num}.txt`, { encoding: 'utf8' })
			.split('\n')
			.map((s) => s.replace(/\s*\/\/.*/, '').trim())
			.filter(Boolean)
			.map((s) => s
				.split('->')
				.map((ss) => ss
					.trim()
					.split(/\s+/)!))
			.reduce((accum, [[sc, vc], [newsc, newvc, move]]) => {
				accum[sc] ??= {};
				if (vc in accum[sc]) {
					throw new Error(`Find a double transition: ${sc} ${vc}`);
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
				.map((ss) => ss.trim())) as [string, string][];

		globalOk = tests.reduce<boolean>((status, [test, res]) => {
			const start = Date.now();

			const length = 100;
			let pos = length;
			const arr = Array.from({ length }, () => '').concat(...test.split(''));
			let sc = '01';
			// process.stdout.write(style.gray('input: ') + test + '; ');
			while (sc !== '.') {
				if (Date.now() - start > TIMEOUT) {
					throw new Error('timeout - meybe inf loop');
				}

				const rule = rules[sc]?.[arr[pos] || '"'] ?? null;
				if (!rule) {
					console.log(
						style.red('fail:'),
						'[',
						`${style.green(`'${test}'`)},`,
						`${style.green(`'${res}'`)},`,
						`${style.red(`'${arr.join('').replace(/^"+|"+$/g, '')}'`)},`,
						`${style.yellow(pos - arr.findIndex((v) => v && v !== '"'))},`,
						'status:', `${style.green(`'${sc}'`)},`,
						'rule:', style.bold('null'),
						']',
					);
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
				isOk ? style.green('ok:') : style.red('FAIL:'),
				[test, res, ans, pos - arr.findIndex((v) => v && v !== '"')],
			);
			return status && isOk;
		}, true);

		if (!globalOk) {
			console.log(style.red('FIND FAIL'));
			if (DEBAG) {
				console.log(rules);
			}
			process.exitCode = 1;
		} else {
			console.log(style.green('ALL OKEY'));
		}
	} catch ({ message }) {
		console.log(style.red(message));
		globalOk = false;
	}

	process.exitCode ??= 0;
	// eslint-disable-next-line no-bitwise
	process.exitCode |= 1 - +globalOk;
});
