import fs from 'fs';
import Path from 'path';

/**
 * Check if a path exists and is a file
 * @param path Path to check
 */
export function pathIsFile(path: string): boolean {
    return fs.existsSync(path) && fs.statSync(path).isFile();
}

/**
 * Check if a directory exists and is a file
 * @param path Path to check
 */
export function pathIsDirectory(path: string): boolean {
    return fs.existsSync(path) && fs.statSync(path).isDirectory();
}

/**
 * List the files in a directory.
 * Throws an exception if path is not a directory.
 * 
 * @param path Path to directory
 */
export function getDirectoryContents(path: string): string[] {
    if (pathIsDirectory(path)) {
        return fs.readdirSync(path);
    } else {
        throw new Error(`Attempting to list files in directory that does not exist or is not a directory: '${path}'`);
    }
}

/**
 * Reads the contents of a file as a UTF-8 string.
 * Throws an exception if path is not a file.
 * 
 * @param path Path to file
 */
export function readFile(path: string): string {
    if (pathIsFile(path)) {
        return fs.readFileSync(path, 'utf-8');
    } else {
        throw new Error(`Attempting to read file that does not exist or is not a file: '${path}'`);
    }
}

/**
 * Writes a file as UTF-8.
 * Throws an exception if path is not a file.
 * 
 * @param path Path to file
 * @param content File contents
 * @param createPaths If true, directory tree will be created up to the file
 */
export function writeFile(path: string, content: string, createPaths?: boolean): void {
    if (createPaths) {
        const directory: string = Path.dirname(path);
        fs.mkdirSync(directory, { recursive: true });
    }

    return fs.writeFileSync(path, content, 'utf-8');
}

/**
 * Scans a list of paths to extract all HTML files.
 * Paths can be any mix of files or directories.
 * Directories will be recursively searched
 * 
 * @param paths List of paths to search
 * @param basePath If specified, all paths will be resolved relative to basePath
 */
export function expandPagePaths(paths: string[], basePath?: string): string[] {
    const outPages: string[] = [];

    for (const rawPath of paths) {
        expandPagePath(rawPath, basePath, outPages);
    }

    return outPages;
}

function expandPagePath(pagePath: string, basePath: string | undefined, outPaths: string[]): void {
    const realPath = basePath != undefined ? Path.resolve(basePath, pagePath) : Path.resolve(pagePath);

    // directories need to be reciursively searched
    if (pathIsDirectory(realPath)) {
        for (const subFile of getDirectoryContents(realPath)) {
            const subFilePath = Path.join(pagePath, subFile);

            // recurse with each directory content
            expandPagePath(subFilePath, basePath, outPaths);
        }
    }

    // HTML are added directly
    if (pathIsFile(realPath) && realPath.toLowerCase().endsWith('.html')) {
        outPaths.push(pagePath);
    }

    // other file types (such as links) are currently skipped
}