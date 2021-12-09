// import style from 'chalk';
// import fs from 'fs';

const style = (_class: string, text: string) => `<span class="${_class}">${text}</span>`;

// const { COUNT } = process.env;
// const DEBAG = !!process.env.DEBAG;
// const TIMEOUT = +(process.env.TIMEOUT ?? 100);
// const smallNum = ['₀₁₂₃₄₅₆₇₈₉'];
// const minusOp = '∸';

// Array.from(
// 	COUNT
// 		? { length: +COUNT }
// 		: [
// 			'g₁(m, n) = |m - n|',
// 			'g₂(m) = sg(m)',
// 			'g₃(m) = 5 + m',
// 		],
// ).forEach((desc = '\b', num) => {
// 	num += 1;
// console.log(style('gray', '==>'), style('cyan', desc), style('gray', `(${num})`));

// eslint-disable-next-line no-unused-vars
// interface Window {
// 	runTest: (
// 		rule: string,
// 		test: string,
// 		print: (...mes: string[]) => void,
// 		opt?: { TIMEOUT?: number }
// 	) => Promise<boolean>;
// }

// eslint-disable-next-line no-undef
const runTest = async (
	allRule: string,
	allTests: string,
	print: (...mes: string[]) => void,
	{ TIMEOUT = 100, START = '01', STOP = '.' } = {},
) => {
	// console.log({ TIMEOUT, START, STOP });
	print(style('info', ' Start test '));
	try {
		const rules = allRule
			.split(/\r?\n/)
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

		const tests = allTests
			.split(/\r?\n/)
			.map((s) => s.replace(/\s*\/\/.*/, '').trim())
			.filter(Boolean)
			.map((s) => s
				.split('->')
				.map((ss) => ss.trim())) as [string, string][];

		const globalOk = await tests.reduce<Promise<boolean>>(
			(prStatus, [test, res]) => prStatus.then((status) => {
				const start = Date.now();

				const length = 100;
				let pos = length;
				const arr = Array.from({ length }, () => '').concat(...test.split(''));
				let sc = START;
				while (sc !== STOP) {
					if (Date.now() - start > TIMEOUT) {
						throw new Error(' Timeout - meybe inf loop ');
					}

					const rule = rules[sc]?.[arr[pos] || '"'] ?? null;
					if (!rule) {
						print(
							style('red', 'fail:'),
							'[',
							`${test},`,
							`${res},`,
							`${style('red', `${arr.join('').replace(/^"+|"+$/g, '')}`)},`,
							`${style('orange', `${pos - arr.findIndex((v) => v && v !== '"')}`)},`,
							'status:', `${sc},`,
							'rule:', style('bold', 'null'),
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
						case '.': break;
						default: if (sc !== STOP) {
							print(style('red', ` Undefined type rule.move: "${rule.move}" `));
							return false;
						}
					}
				}
				const ans = arr.join('').replace(/^"+|"+$/g, '');
				const isOk = ans === res && arr.findIndex((v) => v && v !== '"') === pos;
				print(
					isOk ? style('local-ok', 'ok:') : style('local-fail', 'FAIL:'),
					`[ ${[test, res, ans, pos - arr.findIndex((v) => v && v !== '"')].join(', ')} ]`,
				);
				return status && isOk;
			}), new Promise<boolean>((res) => res(true)),
		);

		if (!globalOk) {
			print(style('fail', ' FIND FAIL '));
		} else {
			print(style('okey', ' ALL OKEY '));
			return true;
		}
	} catch (e: any) {
		print(style('fatal-fail', e?.message?.toString() || ' ??? '));
	}
	return false;
};

// eslint-disable-next-line import/prefer-default-export
export { runTest };
