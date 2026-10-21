import {afterEach, expect, it, vi} from 'vitest';
import {createUuid} from '../../src/helpers/createUuid';

const uuidPattern = /^[0-9a-f]{12}4[0-9a-f]{3}[89ab][0-9a-f]{15}$/;

afterEach(() => vi.unstubAllGlobals());

it('uses randomUUID when available and removes its hyphens', () => {
    const randomUUID = vi.fn(() => '01234567-89ab-4cde-8fab-0123456789ab');
    const getRandomValues = vi.fn();
    vi.stubGlobal('crypto', {randomUUID, getRandomValues});

    const id = createUuid();

    expect(id).toBe('0123456789ab4cde8fab0123456789ab');
    expect(id).toMatch(uuidPattern);
    expect(randomUUID).toHaveBeenCalledOnce();
    expect(getRandomValues).not.toHaveBeenCalled();
});

it.each([
    [0, '00000000000040008000000000000000'],
    [255, 'ffffffffffff4fffbfffffffffffffff'],
] as const)(
    'uses random bytes %i without randomUUID, preserving UUID v4 bits and padding',
    (byte, expected) => {
        const getRandomValues = vi.fn((bytes: Uint8Array) => bytes.fill(byte));
        vi.stubGlobal('crypto', {getRandomValues});

        const id = createUuid();

        expect(id).toBe(expected);
        expect(id).toMatch(uuidPattern);
        expect(getRandomValues).toHaveBeenCalledOnce();
    },
);
