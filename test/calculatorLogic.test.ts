import { describe, it, expect } from 'vitest'
import { appendDigit, popDigit, negate, createEngine, INITIAL_STATE, type CalcState } from '../src/components/calculator/engine'
import { BASIC_OPERATIONS } from '../src/features/BasicCalculator/config'

const { evaluate } = createEngine({ operations: BASIC_OPERATIONS })

function state(overrides: Partial<CalcState>): CalcState {
    return { ...INITIAL_STATE, ...overrides }
}

describe('appendDigit', () => {
    it('appends a digit to an existing number', () => {
        expect(appendDigit('12', '3')).toBe('123')
    })

    it('replaces a lone leading zero instead of producing "05"', () => {
        expect(appendDigit('0', '5')).toBe('5')
    })

    it('does not stack zeros: 0 then 0 stays "0"', () => {
        expect(appendDigit('0', '0')).toBe('0')
    })

    it('starts a decimal from zero as "0."', () => {
        expect(appendDigit('0', '.')).toBe('0.')
    })

    it('ignores a second decimal point', () => {
        expect(appendDigit('5.2', '.')).toBe('5.2')
    })

    it('allows digits after the decimal point', () => {
        expect(appendDigit('0.', '5')).toBe('0.5')
    })

    it('replaces a negated leading zero: "-0" then 5 should be "-5"', () => {
        expect(appendDigit('-0', '5')).toBe('-5')
    })
})

describe('popDigit', () => {
    it('removes the last digit', () => {
        expect(popDigit('123')).toBe('12')
    })

    it('returns "0" when the last digit is deleted', () => {
        expect(popDigit('5')).toBe('0')
    })

    it('stays at "0" when deleting from "0"', () => {
        expect(popDigit('0')).toBe('0')
    })

    it('handles empty string without crashing', () => {
        expect(popDigit('')).toBe('0')
    })
    it('deleting the only digit of a negative number returns "0", not "-"', () => {
        expect(popDigit('-5')).toBe('0')
    })
})

describe('negate', () => {
    it('negates a positive number', () => {
        expect(negate('5')).toBe('-5')
    })

    it('un-negates a negative number', () => {
        expect(negate('-5')).toBe('5')
    })

    it('round-trips: negate twice is identity', () => {
        expect(negate(negate('12.5'))).toBe('12.5')
    })

    it('negating zero shows "-0" (matches iOS behavior)', () => {
        expect(negate('0')).toBe('-0')
    })
})

describe('evaluate', () => {
    it('adds', () => {
        expect(evaluate(state({ left: '7', operator: '+', right: '3' }))).toBe('10')
    })

    it('subtracts into negative results', () => {
        expect(evaluate(state({ left: '3', operator: '-', right: '10' }))).toBe('-7')
    })

    it('multiplies (the "x" key)', () => {
        expect(evaluate(state({ left: '6', operator: 'x', right: '7' }))).toBe('42')
    })

    it('divides', () => {
        expect(evaluate(state({ left: '8', operator: '/', right: '2' }))).toBe('4')
    })

    it('takes modulo (the "%" key)', () => {
        expect(evaluate(state({ left: '7', operator: '%', right: '3' }))).toBe('1')
    })

    it('works with negative operands', () => {
        expect(evaluate(state({ left: '-5', operator: '+', right: '3' }))).toBe('-2')
    })

    it('works with decimal operands', () => {
        expect(evaluate(state({ left: '1.5', operator: 'x', right: '2' }))).toBe('3')
    })

    it('returns left unchanged when there is no operator', () => {
        expect(evaluate(state({ left: '5', operator: null, right: '3' }))).toBe('5')
    })

    it('returns left unchanged when the right operand was never typed', () => {
        expect(evaluate(state({ left: '5', operator: '+', right: null }))).toBe('5')
    })

    it('shows "Error" for division by zero', () => {
        expect(evaluate(state({ left: '5', operator: '/', right: '0' }))).toBe('Error')
    })

    it('shows "Error" for modulo by zero', () => {
        expect(evaluate(state({ left: '5', operator: '%', right: '0' }))).toBe('Error')
    })

    it('rounds away floating-point noise: 0.1 + 0.2 = 0.3', () => {
        expect(evaluate(state({ left: '0.1', operator: '+', right: '0.2' }))).toBe('0.3')
    })

    it('rounds long fractions to 12 significant digits', () => {
        expect(evaluate(state({ left: '1', operator: '/', right: '3' }))).toBe('0.333333333333')
    })

    it('does not corrupt large integers when rounding', () => {
        expect(evaluate(state({ left: '9999999999999', operator: '+', right: '0' }))).toBe('9999999999999')
    })
})

describe('parseOperand / formatResult overrides', () => {
    const roman = createEngine({
        operations: { '+': (x, y) => x + y },
        parseOperand: (value) => value === 'X' ? 10 : parseFloat(value),
        formatResult: (value) => value === 20 ? 'XX' : String(value),
    })

    it('routes evaluation through the configured parser and formatter', () => {
        expect(roman.evaluate(state({ left: 'X', operator: '+', right: 'X' }))).toBe('XX')
    })
})
