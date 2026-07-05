import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProgrammerCalculator from '../src/features/ProgrammerCalculator/ProgrammerCalculator'

function display(): string {
    return screen.getByRole('status').textContent ?? ''
}

async function press(...keys: string[]) {
    const user = userEvent.setup()
    for (const key of keys) {
        await user.click(screen.getByRole('button', { name: key }))
    }
}

describe('ProgrammerCalculator', () => {
    it('starts at 0 in decimal', () => {
        render(<ProgrammerCalculator />)
        expect(display()).toBe('0')
    })

    describe('base switching', () => {
        it('converts 255 across DEC -> HEX -> BIN -> DEC', async () => {
            render(<ProgrammerCalculator />)
            await press('2', '5', '5', 'HEX')
            expect(display()).toBe('FF')
            await press('BIN')
            expect(display()).toBe('11111111')
            await press('DEC')
            expect(display()).toBe('255')
        })

        it('converts a pending right operand too', async () => {
            render(<ProgrammerCalculator />)
            await press('2', '5', '5', 'AND', '1', '5', 'HEX')
            expect(display()).toBe('F')
            await press('=')
            expect(display()).toBe('F')
        })

        it('highlights the active base', async () => {
            render(<ProgrammerCalculator />)
            expect(screen.getByRole('button', { name: 'DEC' })).toHaveClass('btn-active')
            await press('HEX')
            expect(screen.getByRole('button', { name: 'HEX' })).toHaveClass('btn-active')
            expect(screen.getByRole('button', { name: 'DEC' })).not.toHaveClass('btn-active')
        })
    })

    describe('bitwise operations', () => {
        it('computes F0 OR F = FF in hex', async () => {
            render(<ProgrammerCalculator />)
            await press('HEX', 'F', '0', 'OR', 'F', '=')
            expect(display()).toBe('FF')
        })

        it('computes 12 AND 10 = 8 in decimal', async () => {
            render(<ProgrammerCalculator />)
            await press('1', '2', 'AND', '1', '0', '=')
            expect(display()).toBe('8')
        })

        it('computes 1 XOR 3 = 2 in decimal', async () => {
            render(<ProgrammerCalculator />)
            await press('1', 'XOR', '3', '=')
            expect(display()).toBe('2')
        })

        it('shifts in binary: 1 << 100 (binary 4) = 10000', async () => {
            render(<ProgrammerCalculator />)
            await press('BIN', '1', '<<', '1', '0', '0', '=')
            expect(display()).toBe('10000')
        })

        it('shifts right: 16 >> 2 = 4 in decimal', async () => {
            render(<ProgrammerCalculator />)
            await press('1', '6', '>>', '2', '=')
            expect(display()).toBe('4')
        })
    })

    describe('negative numbers', () => {
        it('shows sign-magnitude hex and survives base switches', async () => {
            render(<ProgrammerCalculator />)
            await press('2', '5', '5', 'HEX', '+/-')
            expect(display()).toBe('-FF')
            await press('DEC')
            expect(display()).toBe('-255')
        })
    })

    describe('base-dependent keys', () => {
        it('disables 2-9 and A-F in binary mode', async () => {
            render(<ProgrammerCalculator />)
            await press('BIN')
            expect(screen.getByRole('button', { name: '9' })).toBeDisabled()
            expect(screen.getByRole('button', { name: 'A' })).toBeDisabled()
            expect(screen.getByRole('button', { name: '1' })).toBeEnabled()
        })

        it('disables A-F in decimal mode but not in hex', async () => {
            render(<ProgrammerCalculator />)
            expect(screen.getByRole('button', { name: 'A' })).toBeDisabled()
            await press('HEX')
            expect(screen.getByRole('button', { name: 'A' })).toBeEnabled()
        })
    })

    describe('AC', () => {
        it('clears the value but preserves the chosen base', async () => {
            render(<ProgrammerCalculator />)
            await press('HEX', 'F', 'AC')
            expect(display()).toBe('0')
            await press('A')
            expect(display()).toBe('A')
        })
    })
})
