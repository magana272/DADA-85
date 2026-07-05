import { describe, it, expect } from 'vitest'
import {
    createEngine,
    unaryCommand,
    constantCommand,
    INITIAL_STATE,
    type CalcState,
} from '../src/components/calculator/engine'


const engine = createEngine({
    operations: {
        '+': (x, y) => x + y,
        '^': (x, y) => Math.pow(x, y),
    },
    commands: {
        '√': unaryCommand(Math.sqrt),
        'π': constantCommand(Math.PI),
    },
})

function type(...symbols: string[]): CalcState {
    return symbols.reduce((state, symbol) => engine.input(state, symbol), INITIAL_STATE)
}

describe('engine extension', () => {
    it('supports custom binary operations: 2 ^ 10 = 1024', () => {
        expect(type('2', '^', '1', '0', '=').left).toBe('1024')
    })

    it('supports unary commands: 9 √ shows 3', () => {
        expect(type('9', '√').left).toBe('3')
    })

    it('applies unary commands to the operand being typed: 1 + 9 √ = 4', () => {
        expect(type('1', '+', '9', '√', '=').left).toBe('4')
    })

    it('supports constants: π inserts its value (formatted)', () => {
        expect(type('π').left).toBe('3.14159265359')
    })

    it('formats unary results: √2 rounds to 12 significant digits', () => {
        expect(type('2', '√').left).toBe('1.41421356237')
    })

    it('built-in keys still work alongside extensions', () => {
        expect(type('7', '+', '3', '=').left).toBe('10')
    })
})
