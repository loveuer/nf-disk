export function HumanSize(size: number) {
    const units = ["B", "KB", "MB", "GB", "TB"]
    let i = 0
    while (size >= 1024 && i < units.length - 1) {
        size /= 1024
        i++
    }
    return `${size.toFixed(2)} ${units[i]}`
}