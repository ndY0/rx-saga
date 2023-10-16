import { defineConfig } from 'tsup';

export default defineConfig({
    entry: [
        'src/bus/command.bus.interface.ts',
        'src/error/error.interface.ts',
        'src/observable/saga-observable.ts',
        'src/operators/index.ts'
    ],
    format: ['cjs', 'esm'],
    outDir: 'lib',
    splitting: false,
    dts: true,
    sourcemap: true,
    clean: true
})