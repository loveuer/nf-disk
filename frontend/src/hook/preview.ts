export function CanPreview(filename: string) {
    const fs = filename.split(".")
    switch (fs[fs.length - 1].toLowerCase()) {
        case "jpg":
            return "image/jpg"
        case "jpeg":
            return "image/jpg"
        case "png":
            return "image/png"
        case "json":
            return "application/json"
        case "go":
            return "application/go"
        case "js":
            return "application/javascript"
        case "css":
            return "text/css"
        case "html":
            return "text/html"
        case "txt":
            return "text/plain"
        default:
            return ""
    }
}