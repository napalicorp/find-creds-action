const core = require('@actions/core');
const github = require('@actions/github');
const path = require('path');
const fs = require('fs');

try {
    console.log("Starting credentials scanner");
    const pathToSearch = core.getInput('pathToSearch');
    console.log(`Path to search=${pathToSearch}`);
    const fileTypes = core.getInput('fileTypes');
    console.log(`Fle types=${fileTypes}`);
    const payload = JSON.stringify(github.context.payload, undefined, 2);
    console.log(`Payload: ${payload}`);

    //searchFilesInDirectory(pathToSearch, "[a-z0-9\/+]{40}", fileTypes);
    searchFilesInDirectory("C:\\work\\pd\\github\\napali-eshop", "(\"|')[a-z0-9\/+]{40}(\"|')", ".json");
    //searchFilesInDirectory("C:\\work\\pd\\github\\napali-eshop", "[a-z0-9\/+]{40}", ".json");
} catch (error) {
    core.setFailed(error.message);
}

function searchFilesInDirectory(dir, filter, ext) {
    if (!fs.existsSync(dir)) {
        console.log(`Specified directory: ${dir} does not exist`);
        core.setFailed(`Specified directory: ${dir} does not exist`);
        return;
    }

    const files = getFilesInDirectory(dir, ext);
    let foundCount = 0;

    files.forEach(file => {
        const fileContent = fs.readFileSync(file);
        //console.log(`Checking: ${file}`);
        const regex = new RegExp("(\"|')[a-z0-9\/+]{40}(\"|')", "ig");
        if (regex.test(fileContent)) {
            console.log(`Secret was found in the file: ${file}`);
            foundCount ++;
        }
    });

    if(foundCount > 0){
        core.setFailed('Found secrets in source files!');
        core.setOutput('foundSecrets', true);
    }else{
        console.log("No secrets found in the files");
        core.setOutput('foundSecrets', false);
    }
}

// Using recursion, we find every file with the desired extention, even if its deeply nested in subfolders.
function getFilesInDirectory(dir, ext) {
    if (!fs.existsSync(dir)) {
        console.log(`Specified directory: ${dir} does not exist`);
        core.setFailed(`Specified directory: ${dir} does not exist`);
        return;
    }

    let files = [];
    fs.readdirSync(dir).forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.lstatSync(filePath);

        // If we hit a directory, apply our function to that dir. If we hit a file, add it to the array of files.
        if (stat.isDirectory()) {
            const nestedFiles = getFilesInDirectory(filePath, ext);
            files = files.concat(nestedFiles);
        } else {
            //console.log(`Found: ${path.extname(file)}`);
            if (path.extname(file) === ext) {
                files.push(filePath);
            }
        }
    });

    return files;
}