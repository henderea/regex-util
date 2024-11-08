/*
Patterns:
Uses built-in JavaScript regular expression support. Only indexed capture groups are supported.

Replacement String:
    The replacement string supports some special match group syntax:

        Basic Syntax:
            ${1}        insert capture group 1
            ${1|2}      insert capture group 1, or if that didn't match, insert capture group 2; the | syntax can be
                        used in all other syntax setups

        Ternary Syntax:
            ${1?a:b}    insert either 'a' or 'b', depending on if capture group 1 matched anything; a and b can be
                        empty, and can contain any characters other than : and }
            ${1?a}      insert 'a' if capture group 1 matched anything, or insert nothing if it did nto match

        Fallback Syntax:
            ${1:-a}     insert capture group 1, or if that didn't match, insert 'a'

        Substring Syntax:
            ${1:1}      insert capture group 1, starting at index 1
            ${1:1:2}    insert capture group 1, starting at index 1, with a length of 2

        Character Case Modification Syntax:
            ${1^}       insert capture group 1, with the first character converted to uppercase
            ${1,}       insert capture group 1, with the first character converted to lowercase
            ${1^^}      insert capture group 1, with the entire capture group converted to uppercase
            ${1,,}      insert capture group 1, with the entire capture group converted to lowercase
            ${1^,}      insert capture group 1, with the first character converted to uppercase and the rest of the
                        capture group converted to lowercase
            ${1,^}      insert capture group 1, with the first character converted to lowercase and the rest of the
                        capture group converted to uppercase
            ${1^,+}     insert capture group 1, with the first character OF EACH WORD converted to uppercase and the
                        rest OF EACH WORD converted to lowercase; the + modifier can be used on any case modification
                        form, but cannot be combined with the - modifier
            ${1^,-}     insert capture group 1, with the first character OF THE FIRST WORD converted to uppercase and
                        the rest OF THE FIRST WORD converted to lowercase (the remainder of the capture group will be
                        added un-altered); the - modifier can be used on any case modification form, but cannot be
                        combined with the + modifier

    Syntax notes:
        • You can nest a replacement string match group syntax in any constant.
        • You can use the character case modification syntax with any other syntax setups. The case modification syntax goes
          immediately after the capture group number(s) from the basic syntax.
        • The + and - character case modification syntax modifiers determine "words" by sections of non-whitespace separated by
          whitespace. They will not alter the whitespace itself.

        Examples:
            ${1?${2}${3}}             insert capture group 2 if group 1 was matched, or group 3 if it didn't
            ${1^^?${2}${3}}           insert capture group 2 if group 1 was matched, or group 3 if it didn't. either
                                      way, make the entire string uppercase
            ${1?${2^^}${3|4,,}}       insert capture group 2 all uppercase if group 1 was matched. If capture group 1
                                      didn't match, insert group 3 (or 4 if 3 didn't match) all lowercase
            ${1:-${2}}                same as ${1|2}
            ${1:${2?1:2}:${2?3:2}}    insert a substring of capture group 1; if capture group 2 matched, the substring
                                      will be 3 characters starting at index 1; if capture group 2 did not match, the
                                      substring will be 2 characters starting at index 2
*/

declare namespace regexUtil {
    export interface SubstitutionEntity {
        matchRegex: RegExp;
        replaceString: string;
    }
    export type Many<T> = T | T[];
}

export const XRegExp: any;
export const processReplace: (args: any[], replaceString: string) => string;
export const doReplace: (input: string, matchRegex: RegExp, replaceString: string) => string;
export const doMultiReplace: (input: string, ...subs: Array<regexUtil.Many<regexUtil.SubstitutionEntity>>) => string;
