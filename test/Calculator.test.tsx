import { describe, it, expect } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Calculator from '../src/features/BasicCalculator/BasicCalculator'

function display(): string {
    return screen.getByRole('status').textContent ?? ''
}

async function press(...keys: string[]) {
    const user = userEvent.setup()
    for (const key of keys) {
        await user.click(screen.getByRole('button', { name: key }))
    }
}

describe('Calculator', () => {
    it('starts at 0', () => {
        render(<Calculator />)
        expect(display()).toBe('0')
    })

    it('computes 7 + 3 = 10', async () => {
        render(<Calculator />)
        await press('7', '+', '3', '=')
        expect(display()).toBe('10')
    })

    it('computes 6 x 7 = 42', async () => {
        render(<Calculator />)
        await press('6', 'x', '7', '=')
        expect(display()).toBe('42')
    })

    it('computes 8 / 2 = 4', async () => {
        render(<Calculator />)
        await press('8', '/', '2', '=')
        expect(display()).toBe('4')
    })

    it('shows the running operation after equals', async () => {
        render(<Calculator />)
        await press('7', '+', '3', '=')
        expect(screen.getByText('7+3')).toBeInTheDocument()
    })

    it('builds multi-digit operands', async () => {
        render(<Calculator />)
        await press('1', '2', '+', '3', '4', '=')
        expect(display()).toBe('46')
    })

    it('chains operations left to right: 2 + 3 x 4 = 20', async () => {
        render(<Calculator />)
        await press('2', '+', '3', 'x', '4', '=')
        expect(display()).toBe('20')
    })

    it('shows the left operand while the operator is pending', async () => {
        render(<Calculator />)
        await press('5', '+')
        expect(display()).toBe('5')
    })

    it('handles decimal input: 0.5 + 0.5 = 1', async () => {
        render(<Calculator />)
        await press('.', '5', '+', '.', '5', '=')
        expect(display()).toBe('1')
    })

    it('pressing a second operator replaces the first: 5 + then x acts as 5 x', async () => {
        render(<Calculator />)
        await press('5', '+', 'x', '3', '=')
        expect(display()).toBe('15')
    })

    it('equals with nothing pending leaves the display alone', async () => {
        render(<Calculator />)
        await press('5', '=')
        expect(display()).toBe('5')
    })

    it('toggles sign with +/-', async () => {
        render(<Calculator />)
        await press('5', '+/-')
        expect(display()).toBe('-5')
        await press('+/-')
        expect(display()).toBe('5')
    })

    it('uses the negated value in the math: 5 +/- + 8 = 3', async () => {
        render(<Calculator />)
        await press('5', '+/-', '+', '8', '=')
        expect(display()).toBe('3')
    })

    describe('backspace', () => {
        it('deletes the last digit', async () => {
            render(<Calculator />)
            await press('1', '2', '3', '<-')
            expect(display()).toBe('12')
        })

        it('returns to 0 when the last digit is deleted', async () => {
            render(<Calculator />)
            await press('5', '<-')
            expect(display()).toBe('0')
        })

        it('deletes from the right operand, not the left', async () => {
            render(<Calculator />)
            await press('5', '+', '7', '8', '<-')
            expect(display()).toBe('7')
        })

        // BUG: popDigit("-5") leaves a bare "-" on screen; any following
        // calculation is NaN.
        it('deleting the only digit of a negative number shows 0, not "-"', async () => {
            render(<Calculator />)
            await press('5', '+/-', '<-')
            expect(display()).toBe('0')
        })

        it('becomes AC after equals and clears everything', async () => {
            render(<Calculator />)
            await press('7', '+', '3', '=')
            // after a result, the backspace key relabels to AC
            await press('AC')
            expect(display()).toBe('0')
        })
    })

    describe('starting fresh after equals', () => {
        it('typing a digit after = starts a new number', async () => {
            render(<Calculator />)
            await press('7', '+', '3', '=', '2')
            expect(display()).toBe('2')
        })
    })

    describe('sign toggle while entering the right operand', () => {
        it('5 + +/- 3 = gives 2 (negation applies to the operand being typed)', async () => {
            render(<Calculator />)
            await press('5', '+', '+/-', '3', '=')
            expect(display()).toBe('2')
        })
    })

    describe('negated zero', () => {
        it('typing 5 on "-0" shows "-5", not "-05"', async () => {
            render(<Calculator />)
            await press('+/-', '5')
            expect(display()).toBe('-5')
        })
    })

    describe('the blank filler button', () => {
        it('clicking the blank button does not corrupt the display', async () => {
            render(<Calculator />)
            const user = userEvent.setup()
            const blank = screen.getAllByRole('button').find((b) => b.textContent?.trim() === '')
            expect(blank).toBeDefined()
            await user.click(blank!)
            expect(display()).toBe('0')
        })
    })

    describe('sign toggle on an already-typed right operand', () => {
        it('5 + 3 +/- = gives 2 (the 3 is negated, not discarded)', async () => {
            render(<Calculator />)
            await press('5', '+', '3', '+/-', '=')
            expect(display()).toBe('2')
        })
    })

    describe('error handling', () => {
        it('shows Error for division by zero, then recovers on new input', async () => {
            render(<Calculator />)
            await press('5', '/', '0', '=')
            expect(display()).toBe('Error')
            await press('2')
            expect(display()).toBe('2')
        })
    })

    describe('operator feedback', () => {
        it('highlights the pending operator, even while typing the right operand', async () => {
            render(<Calculator />)
            await press('5', '+')
            expect(screen.getByRole('button', { name: '+' })).toHaveClass('btn-active')
            await press('3')
            expect(screen.getByRole('button', { name: '+' })).toHaveClass('btn-active')
        })

        it('removes the highlight once equals resolves the operation', async () => {
            render(<Calculator />)
            await press('5', '+', '3', '=')
            expect(screen.getByRole('button', { name: '+' })).not.toHaveClass('btn-active')
        })

        it('moves the highlight when the operator is switched', async () => {
            render(<Calculator />)
            await press('5', '+', 'x')
            expect(screen.getByRole('button', { name: 'x' })).toHaveClass('btn-active')
            expect(screen.getByRole('button', { name: '+' })).not.toHaveClass('btn-active')
        })

        it('shows the pending operation above the display', async () => {
            render(<Calculator />)
            await press('5', '+')
            expect(screen.getByText('5 +')).toBeInTheDocument()
        })
    })

    describe('physical keyboard', () => {
        it('types digits and operators: 7 + 3 Enter shows 10', () => {
            render(<Calculator />)
            for (const key of ['7', '+', '3', 'Enter']) {
                fireEvent.keyDown(window, { key })
            }
            expect(display()).toBe('10')
        })

        it('maps * to the x key: 6 * 7 Enter shows 42', () => {
            render(<Calculator />)
            for (const key of ['6', '*', '7', 'Enter']) {
                fireEvent.keyDown(window, { key })
            }
            expect(display()).toBe('42')
        })

        it('Backspace deletes the last digit', () => {
            render(<Calculator />)
            fireEvent.keyDown(window, { key: '1' })
            fireEvent.keyDown(window, { key: '2' })
            fireEvent.keyDown(window, { key: 'Backspace' })
            expect(display()).toBe('1')
        })

        it('Escape clears everything', () => {
            render(<Calculator />)
            fireEvent.keyDown(window, { key: '5' })
            fireEvent.keyDown(window, { key: 'Escape' })
            expect(display()).toBe('0')
        })

        it('ignores keys pressed with a modifier held', () => {
            render(<Calculator />)
            fireEvent.keyDown(window, { key: '7', ctrlKey: true })
            expect(display()).toBe('0')
        })

        it('ignores keys that are not on the keypad', () => {
            render(<Calculator />)
            fireEvent.keyDown(window, { key: 'q' })
            expect(display()).toBe('0')
        })
    })
})
