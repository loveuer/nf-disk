export function CanPreview(filename: string) {
    const fs = filename.split(".")
    switch (fs[fs.length - 1].toLowerCase()) {
        case "jpg":
            return "image/jpg"
        case "jpeg":
            return "image/jpg"
        case "png":
            return "image/png"
        default:
            return ""
    }
}