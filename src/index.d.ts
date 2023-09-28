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
