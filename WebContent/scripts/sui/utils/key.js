/**
 * 按键编码对照。
 */
mini.Keyboard = {
    Left: 37,
    Top: 38,
    Right: 39,
    Bottom: 40,

    PageUp: 33,
    PageDown: 34,
    End: 35,
    Home: 36,

    Enter: 13,
    ESC: 27,
    Space: 32,
    Tab: 9,
    Del: 46,

    F1: 112,
    F2: 113,
    F3: 114,
    F4: 115,
    F5: 116,
    F6: 117,
    F7: 118,
    F8: 119,
    F9: 120,
    F10: 121,
    F11: 122,
    F12: 123
};

mini.MouseButton = {
    Left: 0,
    Middle: 1,
    Right: 2
}
if (isIE && !isIE9) {
    mini.MouseButton = {
        Left: 1,
        Middle: 4,
        Right: 2
    }
}