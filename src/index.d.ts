declare namespace regexUtil {
    export type processReplace = (args: any[], replaceString: string) => string;
    export type doReplace = (input: string, matchRegex: RegExp, replaceString: string) => string;
    export interface SubstitutionEntity {
        matchRegex: RegExp;
        replaceString: string;
    }
    export type Many<T> = T | T[]
    export type doMultiReplace = (input: string, ...subs: Array<Many<SubstitutionEntity>>) => string;
}

export const XRegExp: any;
export const processReplace: regexUtil.processReplace;
export const doReplace: regexUtil.doReplace;
export const doMultiReplace: regexUtil.doMultiReplace;