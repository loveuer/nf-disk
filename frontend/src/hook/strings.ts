export function TrimSuffix(str: string, suffix: string) {
    if (str.lastIndexOf(suffix) === str.length - suffix.length) {
        return str.substring(0, str.length - suffix.length);
    }
    return str;
}

export function GetBaseFileName(fullPath: string) {
    return fullPath.replace(/.*[\/\\]/, '');
}
